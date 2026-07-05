/**
 * LLM接続プロバイダの抽象化。
 *
 * 現時点ではKimi K2.7 Code単体の利用だが、将来的な複数モデル利用・
 * オーケストレーションを見据え、接続先(base_url)とモデル名の書式を
 * プロバイダ単位で切り替えられるようにする。
 *
 * 新しいプロバイダやモデルを追加する場合は、このテーブルにエントリを
 * 追加するだけで、server.ts側のロジック変更は不要になる設計とする。
 */

export type LlmProviderId = "moonshot" | "openrouter";

export interface LlmProviderConfig {
  /** OpenHandsのconfig.tomlに書き込むbase_url */
  baseUrl: string;
  /** OpenHandsのconfig.tomlに書き込むmodel名(LiteLLM形式) */
  model: string;
  /** このプロバイダを人間が識別するための表示名 */
  label: string;
}

export const LLM_PROVIDERS: Record<LlmProviderId, LlmProviderConfig> = {
  moonshot: {
    baseUrl: "https://api.moonshot.ai/v1",
    model: "openai/kimi-k2.7-code",
    label: "Moonshot API (直接)",
  },
  openrouter: {
    baseUrl: "https://openrouter.ai/api/v1",
    model: "openrouter/moonshotai/kimi-k2.7-code",
    label: "OpenRouter経由",
  },
};

export const DEFAULT_LLM_PROVIDER: LlmProviderId = "moonshot";

export function isValidLlmProviderId(value: unknown): value is LlmProviderId {
  return typeof value === "string" && value in LLM_PROVIDERS;
}

export function resolveLlmProvider(providerId: string | undefined): LlmProviderConfig {
  if (providerId && isValidLlmProviderId(providerId)) {
    return LLM_PROVIDERS[providerId];
  }
  return LLM_PROVIDERS[DEFAULT_LLM_PROVIDER];
}
