import { Hono } from "hono";
import { getContainer } from "@cloudflare/containers";

// container/server/src/types.ts の RunTaskRequest/RunTaskResponse と一致させること。
// Worker側とコンテナ側は別パッケージ(別tsconfig)のため、契約として重複定義する。
interface RunTaskRequest {
  issueNumber: number;
  issueTitle: string;
  issueBody: string;
  repo: string;
  githubToken: string;
  llmApiKey: string;
  llmProvider?: string;
}

interface RunTaskResponse {
  exitCode: number;
  log: string;
  durationMs: number;
  llmProviderUsed: string;
}

interface GitHubIssueLabeledPayload {
  action: string;
  label?: { name: string };
  issue: { number: number; title: string; body: string | null };
  repository: { full_name: string };
}

interface TaskParams {
  repo: string;
  issueNumber: number;
  issueTitle: string;
  issueBody: string;
}

const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => c.text("kimi-agent: worker running"));

app.post("/webhook/github", async (c) => {
  const rawBody = await c.req.text();
  const signature = c.req.header("X-Hub-Signature-256");

  if (!(await verifySignature(c.env.WEBHOOK_SECRET, rawBody, signature))) {
    return c.json({ error: "invalid signature" }, 401);
  }

  const event = c.req.header("X-GitHub-Event");
  const payload = JSON.parse(rawBody) as GitHubIssueLabeledPayload;

  if (event !== "issues" || payload.action !== "labeled" || payload.label?.name !== c.env.KIMI_IMPLEMENT_LABEL) {
    return c.json({ status: "ignored" }, 200);
  }

  const params: TaskParams = {
    repo: payload.repository.full_name,
    issueNumber: payload.issue.number,
    issueTitle: payload.issue.title,
    issueBody: payload.issue.body ?? "",
  };
  const containerName = `issue-${params.repo.replace("/", "-")}-${params.issueNumber}`;
  const container = getContainer(c.env.OPENHANDS_CONTAINER, containerName);

  // GitHub Webhookのタイムアウトを避けるため、即座に200を返し、
  // コンテナ呼び出し・結果待ち・失敗通知はバックグラウンドで行う。
  c.executionCtx.waitUntil(runTaskAndNotifyOnFailure(container, c.env, params));

  return c.json({ status: "accepted" }, 200);
});

async function verifySignature(
  secret: string,
  payload: string,
  signatureHeader: string | undefined
): Promise<boolean> {
  if (!signatureHeader?.startsWith("sha256=")) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const expected = `sha256=${toHex(mac)}`;

  return timingSafeEqual(expected, signatureHeader);
}

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function resolveLlmApiKey(env: Env): string {
  // LLM_PROVIDERはwrangler.jsonc varsのデフォルト値からリテラル型で推論されるが、
  // 実際の値は環境ごとの設定で変わりうるためstringとして比較する。
  return (env.LLM_PROVIDER as string) === "openrouter" ? env.OPENROUTER_API_KEY : env.KIMI_API_KEY;
}

async function runTaskAndNotifyOnFailure(
  container: ReturnType<typeof getContainer>,
  env: Env,
  params: TaskParams
): Promise<void> {
  try {
    const requestBody: RunTaskRequest = {
      issueNumber: params.issueNumber,
      issueTitle: params.issueTitle,
      issueBody: params.issueBody,
      repo: params.repo,
      githubToken: env.GITHUB_TOKEN,
      llmApiKey: resolveLlmApiKey(env),
      llmProvider: env.LLM_PROVIDER,
    };

    const response = await container.fetch(
      new Request("https://container/run-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })
    );

    if (!response.ok) {
      await notifyIssue(env, params, `タスク実行サーバーがエラーを返しました (HTTP ${response.status})`);
      return;
    }

    const result = (await response.json()) as RunTaskResponse;
    if (result.exitCode !== 0) {
      await notifyIssue(
        env,
        params,
        `OpenHandsの実行が失敗しました (exitCode=${result.exitCode})\n\n\`\`\`\n${result.log.slice(-2000)}\n\`\`\``
      );
    }
  } catch (err) {
    await notifyIssue(
      env,
      params,
      `コンテナ呼び出し中に例外が発生しました: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

async function notifyIssue(env: Env, params: TaskParams, message: string): Promise<void> {
  await fetch(`https://api.github.com/repos/${params.repo}/issues/${params.issueNumber}/comments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "kimi-agent",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ body: `[kimi-agent] ${message}` }),
  });
}

export { OpenHandsContainer } from "./OpenHandsContainer.js";
export default app;
