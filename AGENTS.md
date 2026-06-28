# AGENTS.md

エージェントがコードを書いた後・PRを作る前に必ずこのチェックリストで**セルフレビュー**を実施すること。

---

## セルフレビューチェックリスト

過去のPRレビュー（#1〜#8）で繰り返し指摘された観点を優先度別に整理した表。

### 優先度: Critical / High

| # | 観点 | チェック内容 | 参照PR |
|---|------|-------------|--------|
| 1 | **フィールドクリアの可否** | オプションフィールドを <code>&#124;&#124; undefined</code> で変換していないか。空文字でのクリアを許可する場合は <code>&#124;&#124; null</code> にし、サーバー Zod スキーマも `.nullable()` を付与する | #1 |
| 2 | **useEffect によるprops→state同期** | `useEffect` で prop を state にコピーしていないか。バックグラウンド refetch でユーザーの入力が上書きされる。`dirty` フラグで保護するか「レンダー中に state を調整」パターンを使う | #1 |
| 3 | **楽観的更新のキャッシュ型** | `getQueryData` / `setQueryData` の型パラメータがAPIレスポンスの実際の形（例: `{ data: T[] }`）と一致しているか。型ミスマッチは `old.map is not a function` クラッシュを引き起こす | #5 |
| 4 | **N+1 DB クエリ** | ループ内で `await db.update(...)` を逐次実行していないか。D1 では `db.batch([...])` で1リクエストにまとめ、トランザクション原子性も得る | #5 |
| 5 | **日付文字列のタイムゾーン** | `new Date("YYYY-MM-DD")` は UTC 午前0時として解釈される。`toLocaleDateString()` を `timeZone` 未指定で呼ぶと UTC-オフセット環境で日付が1日ずれる。`{ timeZone: "UTC" }` を明示する | #7 |
| 6 | **viewport アクセシビリティ** | `user-scalable=no` をグローバルな `index.html` に追加しない（WCAG 2.1 達成基準 1.4.4 違反）。ズーム抑制はイベントスコープ内の `preventDefault` で限定的に行う | #8 |
| 7 | **脆弱なマウントガード** | `!element.innerHTML` をマウント条件に使わない。空白・改行でガードが壊れる。直接 `createRoot(el).render(...)` を呼ぶ | #2 |

### 優先度: Medium

| # | 観点 | チェック内容 | 参照PR |
|---|------|-------------|--------|
| 8 | **undefinedチェックの精度** | `if (validated.field)` はフィールドを空文字にクリアできない。`!== undefined` で明示チェックし、省略と明示的空文字を区別する | #3 |
| 9 | **DB upsert** | read → insert/update の2往復パターンはレースコンディションを招く。Drizzle の `onConflictDoUpdate` で原子的 upsert に置き換える | #3 |
| 10 | **Zodスキーマの相関バリデーション** | 日付・時刻の前後関係（`endDate >= startDate`、`endTime > startTime`）は `.refine()` でスキーマレベルに追加する | #3, #6 |
| 11 | **フォームの required 属性** | 必須入力フィールドには HTML `required` 属性を付ける（サーバーバリデーションに加えてクライアント即時フィードバック）| #3 |
| 12 | **button 内の block 要素** | `<button>` 内に `<div>` / `<h2>` / `<p>` を置くのは無効な HTML。`<span>` + `block`/`flex` クラスに置き換える | #3 |
| 13 | **アクセシビリティ属性** | Dialog: `role="dialog"` + `aria-modal="true"` + Escape キーリスナー。ラベルなし input: `aria-label` を付与 | #1, #3 |
| 14 | **影・背景の二重適用** | 親コンテナと子 Card の両方に `shadow` / `bg-white` を付けると視覚的ネストが壊れる。どちらか一方に集約する | #1 |
| 15 | **pending状態の管理** | 単一の `pendingId: string` で複数 mutation の loading 状態を管理するとレースコンディション。`Set<string>` か TanStack Query の mutation variables を使う | #1 |
| 16 | **useLayoutEffect の依存配列** | 依存配列を省略すると全レンダリングで実行される。必要な状態（例: `[pxPerMin]`）のみを依存に指定する | #8 |
| 17 | **スクロール効果の安定化** | `useEffect` でのスクロールが `items` 変化のたびに実行されると、バックグラウンド refetch でビューが飛ぶ。`useRef` で最後のスクロール基準を記録し、日付変更時のみ実行する | #6 |
| 18 | **ドラッグ操作の境界クランプ** | ドラッグでイベントが終日境界（23:50）を超えないよう、開始時刻の最大値をイベント持続時間で制限する | #6 |
| 19 | **入力のゼロ除算・NaN ガード** | 計算式の除数がゼロになりうる場合（ピンチ距離0、不正な日付文字列など）に early return / NaN チェックを追加する | #6, #8 |
| 20 | **タッチイベントのキャンセル処理** | `touchend` のクリーンアップに加え `touchcancel` も同じハンドラに登録する（システムジェスチャー割り込み対策）| #8 |
| 21 | **TanStack Router の型登録** | `createRouter` 後に `declare module "@tanstack/react-router" { interface Register { router: typeof router } }` を追加して、フック（`useParams` 等）の型推論を有効にする | #2 |
| 22 | **テストの説明精度** | テスト説明文がアサーション内容と一致しているか確認する（例: "keeps numeric values" で `0` を除外していないか）| #2 |

---

## セルフレビュー手順

PRを作る前に以下を実行し、すべてグリーンであることを確認する。

```bash
# 1. 型チェック
pnpm typecheck

# 2. フォーマット確認
pnpm format:check

# 3. Lint（Biome + ESLint + deps + doctor）
pnpm lint

# 4. テスト
pnpm test

# 5. （まとめて実行）
pnpm check
```

上記コマンドがグリーンになったら、上のチェックリストを上から順に目視確認する。
