// リクエスト/レスポンスの型定義。
// Worker側 (src/worker.ts) と合わせて更新すること。

import type { LlmProviderId } from "./llmProviders.js";

/** Workerからタスク実行サーバーへ送られるリクエストボディ */
export interface RunTaskRequest {
  /** GitHub Issue番号 */
  issueNumber: number;
  /** Issueタイトル */
  issueTitle: string;
  /** Issue本文(Markdown) */
  issueBody: string;
  /** 対象リポジトリ ("owner/repo" 形式) */
  repo: string;
  /** GitHub操作用トークン (Cloudflare Secretsから注入) */
  githubToken: string;
  /** LLM接続用APIキー (使用するプロバイダに対応するキー。Cloudflare Secretsから注入) */
  llmApiKey: string;
  /**
   * 使用するLLM接続プロバイダ。省略時はデフォルト(moonshot)を使用する。
   * 将来的な複数モデル利用・オーケストレーションのための拡張ポイント。
   */
  llmProvider?: LlmProviderId;
}

/** タスク実行結果としてWorkerへ返すレスポンスボディ */
export interface RunTaskResponse {
  /** OpenHandsプロセスの終了コード。0以外は失敗とみなす */
  exitCode: number;
  /** 実行ログ(末尾の一部。全文はコンテナログを参照) */
  log: string;
  /** 実行にかかった時間(ミリ秒) */
  durationMs: number;
  /** 実際に使用されたLLMプロバイダ(比較検証時の記録用) */
  llmProviderUsed: LlmProviderId;
}

/** リクエストボディの最低限のバリデーション */
export function isValidRunTaskRequest(body: unknown): body is RunTaskRequest {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.issueNumber === "number" &&
    typeof b.issueTitle === "string" &&
    typeof b.issueBody === "string" &&
    typeof b.repo === "string" &&
    typeof b.githubToken === "string" &&
    typeof b.llmApiKey === "string" &&
    b.repo.includes("/") &&
    (b.llmProvider === undefined || typeof b.llmProvider === "string")
  );
}
