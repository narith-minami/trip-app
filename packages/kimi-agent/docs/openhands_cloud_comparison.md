# OpenHands Cloud 調査・本基盤との比較

作成日: 2026-07-04

---

## 1. OpenHands Cloudとは

OpenHands（旧OpenDevin）が提供する、OSS版OpenHandsのホスト型SaaS版。自己ホスト不要でOpenHandsエージェントを利用できる。同じOpenHandsという名前だが、**本プロジェクトが使っているのはOSS版（自己ホスト、MIT License）であり、OpenHands Cloudとは別物**である点がまず前提として重要。

公式サイト: https://www.openhands.dev/pricing
ドキュメント: https://docs.openhands.dev/openhands/usage/cloud/openhands-cloud

### 提供形態は3種類

| 形態 | 説明 |
|---|---|
| Open Source（Local） | 完全無料、自己ホスト、MIT License。本プロジェクトが使っているのはこちら |
| Individual（Cloud） | 個人向けSaaS、無料枠あり |
| Enterprise（SaaS or Self-hosted） | 組織向け、カスタム料金 |

---

## 2. 料金・プラン詳細

公式料金ページ（https://www.openhands.dev/pricing）から取得した最新の比較表。

| 項目 | Open Source | Individual | Enterprise |
|---|---|---|---|
| 料金 | 無料 | 無料 | 要問い合わせ |
| デプロイ形態 | ローカル自己ホスト | SaaS | SaaS または自己ホスト（VPC） |
| ユーザー数 | 1 | 1 | 無制限 |
| **1日あたりの最大会話数** | **無制限** | **10** | **無制限** |
| LLMキー | 自分のキーを使用 | 自分のキー、またはOpenHands提供モデルを原価課金 | 同左 |
| Web GUI / CLI / Git連携 | ○ | ○ | ○ |
| Jira / Slack連携 | ✕ | ○ | ○ |
| Cloud API（自動化・スクリプト用） | ✕ | ○ | ○ |
| SAML/SSO | ✕ | ✕ | ○ |
| チーム課金・RBAC | ✕ | ✕ | ○ |

**Individual（無料枠）の決定的な制約は「1日10会話まで」**。1つのIssue解決を1会話とみなすと、**個人開発でのIssue駆動運用ですら、活発な日には上限に達する可能性がある**。

補足として、Pro Subscription（$20/月）という言及が別ページ（docs.openhands.dev）にあり、これはランタイム計算コストをカバーしつつBYOKや無マークアップのLLM利用を可能にするプランとされている。ただし公式料金ページのプラン名（Individual/Enterprise）とは表記が一部異なっており、料金体系が過渡期にある可能性がある点は留意する。
参照: https://docs.openhands.dev/openhands/usage/cloud/pro-subscription

---

## 3. Issue駆動の自動化機能（本プロジェクトと直接比較する部分）

OpenHandsには公式の「GitHub Actions Resolver」が存在し、`fix-me`ラベルを付けると自動的にIssueを解決してPRを作成する仕組みがすでに用意されている。

参照: https://docs.openhands.dev/openhands/usage/run-openhands/github-action

### 動作フロー

1. 対象リポジトリに`.github/workflows/openhands-resolver.yml`を配置（OpenHands公式が提供するワークフローテンプレートを呼び出す形）
2. Issueに`fix-me`ラベルを付与、または`@openhands-agent`から始まるコメントを投稿
3. GitHub Actions経由でOpenHands Resolverが起動し、Issueを解決してPRを作成
4. PRへのフィードバックも同様に`fix-me`ラベルやコメントで追加対応を依頼できる

設定例（実際のワークフロー抜粋）:
```yaml
jobs:
  call-openhands-resolver:
    if: |
      ${{ github.event.label.name == 'fix-me' || ... }}
    uses: All-Hands-AI/OpenHands/.github/workflows/openhands-resolver.yml@main
    with:
      macro: ${{ vars.OPENHANDS_MACRO || '@openhands-agent' }}
      max_iterations: 50
    secrets:
      PAT_TOKEN: ${{ secrets.PAT_TOKEN }}
      LLM_MODEL: ${{ secrets.LLM_MODEL }}
      LLM_API_KEY: ${{ secrets.LLM_API_KEY }}
      LLM_BASE_URL: ${{ secrets.LLM_BASE_URL }}
```

**この時点で重要な事実**: OpenHands公式のIssueリゾルバーは**GitHub Actions前提**である。本プロジェクトが最初から「GitHub Actionsを使わずクラウド型で」という要件を掲げていたのは、まさにこの公式Resolverの構成を意図的に避けた選択だったことになる。

### Cloud版でのGitHub連携

OpenHands Cloudでは、GitHubリポジトリへのアクセスを許可すると、Web UIやAPIから同様にIssueラベル・コメントでの起動が可能。Cloud上で会話（conversation）としてタスクが管理され、進捗をCloud UIで追跡できる。
参照: https://docs.openhands.dev/openhands/usage/cloud/github-installation

---

## 4. アーキテクチャ・運用面の特徴

- OpenHands CloudのGitHub Resolver起動は、Cloud側のインフラ（サンドボックス、会話管理基盤）に依存する。会話数の急増時は**古い会話が自動的に一時停止（pause）される**仕様があり、これはAPIユーザーにとって「静かに古いタスクが止まる」という予期しない挙動になりうる、という指摘がコミュニティのissueで報告されている。
参照: https://github.com/OpenHands/OpenHands/issues/13126

- OpenHands Cloudでは「Automations」という、Webhook・スケジュール実行等をトリガーにした会話の自動起動機能が開発中（2026年3月時点でRFC段階）。GitHub、GitLab、Slack、Jira、Datadog、cronなど複数のトリガーに対応する設計が構想されている。
参照: https://github.com/OpenHands/OpenHands/issues/13275

- 複数バックエンド（ローカル、Docker、VM、Cloud、Enterprise）を横断して同じ「Agent Canvas」フロントエンドから操作できる、という統合管理の思想がある。
参照: https://github.com/OpenHands/openhands

---

## 5. 本基盤（Kimi Issue-Driven Coding Agent）との比較

| 観点 | OpenHands Cloud (Individual) | OpenHands + GitHub Actions Resolver（公式） | 本基盤（Cloudflare Containers + OpenHands OSS） |
|---|---|---|---|
| **インフラ管理** | 不要（フルマネージド） | GitHub Actions（既存インフラ活用） | 自前で構築（Cloudflare Workers/Containers） |
| **実行回数制限** | **1日10会話まで**（無料枠） | GitHub Actionsの実行時間・同時実行数の制約 | 制限なし（コンテナ課金のみ、`max_instances`で自分で調整） |
| **LLMモデルの自由度** | OpenHands提供モデル（原価）またはBYOK | BYOK（`LLM_MODEL`/`LLM_API_KEY`をSecretsで指定） | 完全に自由（プロバイダ抽象化層を実装済み、Kimi/OpenRouter等を切替可） |
| **課金モデル** | 無料枠 + 従量（原価） | GitHub Actions実行時間課金 + LLM API課金 | Cloudflare実行時間課金（月$7〜11試算） + LLM API課金 |
| **セットアップの手間** | 最小（GitHubリポジトリ連携のみ） | ワークフローファイル1つ配置するだけ | 本プロジェクト一式の構築が必要（Worker、Container、entrypoint等） |
| **カスタマイズ性** | 低い（Cloud UIの範囲内） | 中（ワークフロー設定は変更可能だが、Resolver本体はブラックボックス） | 高い（プロンプト構築、実行フロー、モデル選定ロジックすべて自分で制御） |
| **複数モデルオーケストレーションへの拡張性** | Cloud側の対応待ち（前述のAutomations機能が将来対応する可能性） | 実質不可（1ワークフロー=1モデル設定が基本） | **設計済み**（`llmProviders.ts`によるプロバイダ抽象化、Phase 5で複数モデルルーティングを計画） |
| **会話の可視性・監視** | Cloud UIで一元管理 | GitHub Actionsのログのみ | Cloudflareダッシュボード + Issueへのコメント通知（自前実装） |
| **障害時の挙動** | 古い会話が自動pauseされる（要注意） | Actions側の再試行ポリシーに依存 | 自前でエラーハンドリング済み（exitCode + logをJSON返却） |
| **個人開発での適合性** | **無料枠の1日10会話が実質的な上限**。検証段階では十分だが、本格運用では不足する可能性 | 手軽だが「GitHub Actionsを使わない」という当初要件と矛盾 | 要件（GitHub Actions不使用、低コスト、拡張性）に最も合致 |

---

## 6. 総合評価

### OpenHands Cloudを採用しなかった判断は妥当か

**妥当と考えられる。** 理由は3点:

1. **会話数上限（1日10）が、Issue駆動の自動化という用途とそもそも相性が悪い**。検証中は問題にならなくても、実運用でIssueが増えてきた際にすぐ上限に当たる可能性がある
2. **モデルの自由度**。本プロジェクトが目指す「複数モデルのオーケストレーション」は、OpenHands CloudのUI・API設計の範囲内に収まらない可能性が高く、自前でプロバイダ抽象化層を持つ本基盤の方が拡張性で優位
3. **GitHub Actions Resolverは公式に存在するが、当初の要件（GitHub Actions不使用）を満たさない**。本基盤はこの制約を踏まえてCloudflare Containersを選定しており、目的に対して一貫している

### OpenHands Cloudが有利なケース（参考）

- とにかく早く動くものが欲しく、インフラ構築の手間を一切かけたくない場合
- 個人利用で1日10会話以内に収まる、ごく小規模な検証
- チーム利用でSSO・RBAC等の統制機能が必要な場合（Enterpriseプラン）

### 本基盤の設計判断への示唆

- OpenHands公式のGitHub Actions Resolverの設定项目（`max_iterations`, `LLM_MODEL`, `LLM_API_KEY`, `LLM_BASE_URL`をSecrets経由で渡す設計）は、本基盤のconfig.toml動的生成ロジックとほぼ同じ発想であり、設計の方向性が妥当であることの裏付けになる
- OpenHands Cloudの「Automations」構想（Webhook/cron等の複数トリガーに対応する将来機能）は、本基盤がすでに志向している「複数モデル・複数トリガーのオーケストレーション」と方向性が似ている。将来的にOpenHands Cloud側がこの機能を成熟させた場合、自前基盤との機能差が縮まる可能性があるため、継続的な動向確認は価値がある

---

## 7. 参照リンク一覧

- OpenHands公式料金ページ: https://www.openhands.dev/pricing
- Pro Subscription詳細: https://docs.openhands.dev/openhands/usage/cloud/pro-subscription
- GitHub Actions Resolver公式ドキュメント: https://docs.openhands.dev/openhands/usage/run-openhands/github-action
- OpenHands Cloud GitHub連携: https://docs.openhands.dev/openhands/usage/cloud/github-installation
- Automations RFC（将来機能）: https://github.com/OpenHands/OpenHands/issues/13275
- 会話自動pause問題の指摘: https://github.com/OpenHands/OpenHands/issues/13126
- Resolver Runner提案（GitLab CI版）: https://github.com/OpenHands/OpenHands/issues/8603
- OpenHands/agent-canvas（マルチバックエンド管理UI）: https://github.com/OpenHands/openhands
- OpenHands Reviewサイト（第三者評価、料金体系の解説）: https://aixcove.com/openhands-review-2026-pricing-pros-cons-and-alternatives/
