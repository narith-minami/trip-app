import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { spawn } from "node:child_process";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { isValidRunTaskRequest, type RunTaskResponse } from "./types.js";
import { buildPrompt } from "./promptBuilder.js";
import { resolveLlmProvider, type LlmProviderId } from "./llmProviders.js";

const PORT = 8080;

// OpenHands CLI (PyPI: "openhands", v1系) の実際の仕様:
//  - LLM_MODEL/LLM_API_KEY/LLM_BASE_URL 等の環境変数はデフォルトで無視される。
//    自動化で使うには `--override-with-envs` が必須(値は永続化されない)。
//  - `--max-iterations` 等のCLIフラグは存在しない。反復回数の上限は
//    config.toml の [core] max_iterations でのみ指定できる(デフォルト500)。
//  - リポジトリのクローン先は `workdir`(spawnのcwd)としてOpenHandsに渡す。
const MAX_ITERATIONS = Number(process.env.OPENHANDS_MAX_ITERATIONS ?? "80");
const WORKSPACE_ROOT = process.env.WORKSPACE_ROOT ?? "/workspace";

// 実行ログはレスポンスに含める分を末尾のみに制限する(肥大化防止)
const LOG_TAIL_LENGTH = 4000;

const app = new Hono();

app.get("/health", (c) => c.json({ status: "ok" }));

app.post("/run-task", async (c) => {
  const body = await c.req.json().catch(() => null);

  if (!isValidRunTaskRequest(body)) {
    return c.json({ error: "invalid request body" }, 400);
  }

  const prompt = buildPrompt(body);
  const startedAt = Date.now();
  const provider = resolveLlmProvider(body.llmProvider);

  const result = await runOpenHands({
    prompt,
    issueNumber: body.issueNumber,
    repo: body.repo,
    githubToken: body.githubToken,
    llmApiKey: body.llmApiKey,
    llmProviderId: body.llmProvider,
  });

  const response: RunTaskResponse = {
    exitCode: result.exitCode,
    log: result.log.slice(-LOG_TAIL_LENGTH),
    durationMs: Date.now() - startedAt,
    llmProviderUsed: (body.llmProvider as LlmProviderId) ?? "moonshot",
  };

  // どのプロバイダで実行したかをログにも明示しておく(T2-0の比較検証で見分けやすくするため)
  console.log(
    `[server] task for issue #${body.issueNumber} finished via provider="${provider.label}" exitCode=${response.exitCode} durationMs=${response.durationMs}`
  );

  return c.json(response);
});

interface RunOpenHandsParams {
  prompt: string;
  issueNumber: number;
  repo: string;
  githubToken: string;
  llmApiKey: string;
  llmProviderId?: string;
}

interface RunOpenHandsResult {
  exitCode: number;
  log: string;
}

/**
 * config.toml を都度生成する。
 * OpenHandsは $HOME/.openhands/config.toml を読み込むため、そのパスに配置する。
 * max_iterations はCLIフラグが存在しないため、この方法でのみ制御可能。
 * (参照: OpenHands/OpenHands issue #9344 — 環境変数からの上書きは信頼できないため
 *  必ずconfig.tomlファイル経由で明示する)
 *
 * LLM接続先はプロバイダ抽象化(llmProviders.ts)経由で決定する。
 * 将来的に複数モデルを使い分ける場合も、このプロバイダテーブルへの
 * エントリ追加のみで対応できる設計とする。
 */
async function writeConfigToml(
  homeDir: string,
  llmApiKey: string,
  llmProviderId: string | undefined
): Promise<string> {
  const provider = resolveLlmProvider(llmProviderId);
  const openhandsConfigDir = join(homeDir, ".openhands");
  const configPath = join(openhandsConfigDir, "config.toml");
  const content = `
[core]
max_iterations = ${MAX_ITERATIONS}
max_budget_per_task = 0.0

[llm]
model = "${provider.model}"
base_url = "${provider.baseUrl}"
api_key = "${llmApiKey}"
`;
  await mkdir(openhandsConfigDir, { recursive: true });
  await writeFile(configPath, content, "utf-8");
  return configPath;
}

async function cloneRepo(repo: string, githubToken: string, workdir: string): Promise<void> {
  await mkdir(workdir, { recursive: true });
  const cloneUrl = `https://x-access-token:${githubToken}@github.com/${repo}.git`;

  await new Promise<void>((resolve, reject) => {
    const proc = spawn("git", ["clone", "--depth", "1", cloneUrl, workdir]);
    let stderr = "";
    proc.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`git clone failed (exit ${code}): ${stderr}`));
    });
  });
}

function runOpenHands(params: RunOpenHandsParams): Promise<RunOpenHandsResult> {
  return new Promise((resolve) => {
    void (async () => {
      let log = "";
      const workdir = join(WORKSPACE_ROOT, `issue-${params.issueNumber}`);
      const homeDir = join(WORKSPACE_ROOT, `.home-${params.issueNumber}`);

      try {
        log += `[server] cloning ${params.repo} into ${workdir}\n`;
        await cloneRepo(params.repo, params.githubToken, workdir);

        const configPath = await writeConfigToml(homeDir, params.llmApiKey, params.llmProviderId);
        log += `[server] wrote config to ${configPath}\n`;
      } catch (err) {
        log += `[server] setup failed: ${err instanceof Error ? err.message : String(err)}\n`;
        resolve({ exitCode: 1, log });
        return;
      }

      const env = {
        ...process.env,
        GITHUB_TOKEN: params.githubToken,
        // OpenHandsは $HOME/.openhands/config.toml を読むため、
        // HOMEをタスク専用ディレクトリに向けて設定をタスクごとに分離する
        HOME: homeDir,
        OPENHANDS_SUPPRESS_BANNER: "1",
      };

      const proc = spawn(
        "openhands",
        ["--headless", "--json", "--override-with-envs", "-t", params.prompt],
        { env, cwd: workdir }
      );

      proc.stdout.on("data", (chunk: Buffer) => {
        log += chunk.toString();
      });
      proc.stderr.on("data", (chunk: Buffer) => {
        // LiteLLM/Authlibの警告等がstderrに出るが失敗ではないため、ログにのみ残す
        log += chunk.toString();
      });

      proc.on("error", (err) => {
        log += `\n[server] failed to spawn openhands process: ${err.message}\n`;
        resolve({ exitCode: 1, log });
      });

      proc.on("close", (code) => {
        resolve({ exitCode: code ?? 1, log });
      });
    })();
  });
}

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`[server] task server listening on port ${info.port}`);
});


