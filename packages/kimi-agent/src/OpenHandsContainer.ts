import { Container } from "@cloudflare/containers";

/**
 * OpenHands (headless) + Kimi K2.7 Code を実行するCloudflare Container。
 * 1 Issue = 1インスタンス。docs/system_design.md 3.5参照。
 * Env型引数は省略し、`wrangler types`が生成するグローバルCloudflare.Envを使う
 * (Env <-> OpenHandsContainerの循環参照によるTS2589を避けるため)。
 */
export class OpenHandsContainer extends Container {
  defaultPort = 8080;
  sleepAfter = "15m";
}
