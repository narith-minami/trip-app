// wrangler.jsonc の vars/bindings は `wrangler types` (worker-configuration.d.ts) が
// グローバルな `Env` を生成する。ここでは `wrangler secret put` で登録するシークレットのみを
// 宣言マージで追加する。
interface Env {
  GITHUB_TOKEN: string;
  WEBHOOK_SECRET: string;
  KIMI_API_KEY: string;
  OPENROUTER_API_KEY: string;
}
