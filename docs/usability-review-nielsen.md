# UIユーザビリティレビュー — ニールセンの10ヒューリスティック

**対象**: trip-app（旅行計画アプリ）フロントエンド UI 実装
**レビュー日**: 2026-07-05
**レビュー観点**: ヤコブ・ニールセンのユーザビリティ10原則
**対象範囲**: `src/routes/`, `src/features/`, `src/components/` の UI 実装

---

## サマリー

全体として、トースト通知・ローディング表示・空状態（EmptyState）・入力補助（終了時刻の自動補完、時系列の並び替え検証）など、ユーザビリティに配慮した実装が随所に見られます。一方で、**言語・配色・確認ダイアログの一貫性の欠如**、**破壊的操作に対する保護のばらつき**、**エラーからの回復手段の不足**、**アクセシビリティ（フォーカス管理・ARIA）** に改善余地があります。

### 深刻度別の主要指摘

| 深刻度 | 指摘 | 該当箇所 |
|--------|------|----------|
| 🔴 高 | トースト・確認ダイアログが日本語/英語で混在 | `useScheduleSection.ts`, `useTripEditor.ts` |
| 🔴 高 | ログイン/サインアップ画面だけデザイン言語が異なる | `routes/login.tsx`, `routes/signup.tsx` |
| 🟠 中 | 読み込みエラー時に再試行手段がない | 各 `*Section.tsx`, `routes/trips/index.tsx` |
| 🟠 中 | ダイアログのフォーカストラップ・復帰がない | `components/ui/dialog.tsx` |
| 🟠 中 | 終了日が開始日より前でも作成できる | `CreateTripModal.tsx` |
| 🟡 低 | Tabs が ARIA タブパターン非対応 | `components/ui/tabs.tsx` |

---

## 1. システム状態の可視化 (Visibility of System Status)

**評価: 良好（一部改善余地あり）**

### 良い点
- 読み込み中は `LoadingSpinner`（ラベル付き）を全画面/セクション単位で表示（`LoadingSpinner.tsx`）。
- 変更操作は `sonner` のトーストで成否を即時フィードバック（`__root.tsx` で `<Toaster>` を設置）。
- 送信中はボタン文言が変化（「作成中...」「保存中...」）し `disabled` になる（`CreateTripModal.tsx:112`, `ScheduleItemForm.tsx:205`）。
- メモ編集は「未保存の変更があります」/「すべての変更が保存されました」で状態を明示（`MemoEditor.tsx:51`）。
- 日付ピッカーは予定のある日にドット、未設定項目のある日に「!」バッジを表示（`ScheduleSection.tsx:60-75`）。出発までのカウントダウンバッジも状態可視化に貢献（`TripHeader.tsx:189-193`）。

### 改善提案
- **Todo のトグル中に視覚的な進行表示がない**。`pendingIds` で `disabled` にはなるが（`TodoItem.tsx:28`）、チェックボックス自体にスピナー等が出ないため、通信中か失敗かがユーザーに伝わりにくい。楽観的更新かローディング表示の追加を推奨。
- **招待リンクのコピー失敗時に一切のフィードバックがない**。`catch` で `setCopied(false)` するのみ（`InviteLinkBox.tsx:31-33`）。クリップボード API が失敗した場合、ユーザーは無反応と受け取る。失敗トーストを出すべき。

---

## 2. システムと実世界の一致 (Match Between System and the Real World)

**評価: 良好**

### 良い点
- 日本語ラベルと自然な日付表現（「7月5日(土)」`TripHeader.tsx:26`、「3日後出発」）。
- 相対時刻の人間的表現（「たった今」「3時間前」「2日前」`ScheduleItemCard.tsx:12-21`）。
- イベント種別をアイコン＋色＋ラベルで実世界のメタファーに対応（ホテル🛏、食事🍴、移動✈）。
- 📍 場所、🗓️/✅ の絵文字が空状態で意味を補強。

### 改善提案
- **共有メモが等幅フォント（`font-mono`）**（`MemoEditor.tsx:48`）。旅行の共有メモは自然言語の文章が中心であり、等幅は「コード/技術的」な印象を与える。通常のサンセリフの方が実世界の「メモ帳」に近い。
- 「Todo」というタブ名だけ英語（`index.tsx:21`）。他が日本語のため「やること」等に統一すると自然。

---

## 3. ユーザーコントロールと自由 (User Control and Freedom)

**評価: 改善余地あり**

### 良い点
- モーダルにキャンセルボタン、Escape キーで閉じる（`Dialog.tsx:29-36`）。
- 詳細画面の「← 戻る」、編集の「キャンセル」で操作を取り消せる（`TripHeader.tsx`）。

### 改善提案（重要）
- **破壊的操作の確認が不統一**。
  - 旅行削除: `window.confirm`（英語）あり（`useTripEditor.ts:50`）
  - スケジュール削除: `window.confirm`（英語）あり（`useScheduleSection.ts:64`）
  - メンバー削除: `window.confirm`（日本語）あり（`MembersSection.tsx:36`）
  - **Todo 削除: 確認なし**で即削除（`TodosSection.tsx:59-69`）
  一貫した確認 UX（望ましくはアプリ内の `Dialog` による確認、かつ日本語）に揃えるべき。
- **取り消し（Undo）手段がない**。削除は即時かつ不可逆で、トーストにも「元に戻す」アクションがない。`sonner` はアクション付きトーストに対応しているため、削除系に Undo を付けると回復性が大きく向上する。
- ネイティブ `window.confirm` はアプリのデザインと乖離し、文言も英語のため、アプリ内モーダルへの統一が望ましい。

---

## 4. 一貫性と標準化 (Consistency and Standards)

**評価: 要改善（最重要領域）**

### 指摘（高深刻度）
- **トースト/確認文言の言語が混在**。
  - 日本語: Todo・メモ・メンバー・旅行作成（例: 「メモを保存しました」）
  - 英語: スケジュール（「Schedule item updated」「Failed to save schedule item」`useScheduleSection.ts:53,59` ほか）、旅行の更新/削除（「Trip updated successfully」「Are you sure you want to delete this trip?」`useTripEditor.ts:42,50`）
  同一アプリ内で言語が切り替わるのは一貫性の重大な欠如。**全て日本語に統一**すべき。
- **ログイン/サインアップ画面だけ配色・角丸が別世界**。
  - 認証画面: `bg-gray-50` / `text-gray-700` / `text-blue-600` / `rounded-lg` / `shadow-md`（`login.tsx:112-134`）
  - 本体: `bg-cream` / `text-navy`・`text-ink` / `text-coral` / `rounded-2xl`（`trips/index.tsx` ほか）
  ブランド（navy/coral/cream）から外れ、初回接触画面で別プロダクトのような印象を与える。デザインシステムに統一すべき。
- **ローディング表示が二重実装**。`routes/index.tsx:38` は `border-primary`・`text-gray-600` の独自スピナー。共通の `LoadingSpinner`（`border-coral`・`text-ink-muted`）と別物。共通コンポーネントに統一すべき。
- **角丸の粒度がバラバラ**。ボタン `rounded-2xl`、入力 `rounded-xl`、Todo/メンバー行 `rounded-lg`、カード `rounded-2xl`。トークン化して段階を定義すると統一感が出る。
- **エラー文言の色**が生の `text-red-600`（`trips/index.tsx:26` ほか）で、デザイントークン（coral/ink）と別系統。

---

## 5. エラー防止 (Error Prevention)

**評価: 良好（一部欠落）**

### 良い点
- 開始時刻入力時に終了時刻を +1 時間で自動補完（`ScheduleItemForm.tsx:91-95`）。
- 終了時刻に `min={startTime}` を設定（`ScheduleItemForm.tsx:124`）。
- 並び替え時に時刻の逆転を検知して拒否・警告（`ScheduleTimeline.tsx:68-79,188-192`）。
- Todo は空タイトルで送信ボタンを `disabled`（`TodoForm.tsx:67`）。
- スケジュールフォームは必須項目に `required` 属性（`ScheduleItemForm.tsx:106,136`）。

### 改善提案
- **旅行作成で終了日 < 開始日でも作成できる**。バリデーションは存在チェックのみ（`CreateTripModal.tsx:88`）。`endDate >= startDate` の検証と、`startDate` を `min` に設定する予防が必要。
- **CreateTripModal の必須項目に `required` 属性がない**。手動チェック＋トーストのみで、フィールド単位のインライン表示がない。ネイティブ検証やインラインエラーの併用を推奨（`ScheduleItemForm` は `required` を使っており、この点も不統一）。

---

## 6. 記憶よりも認識 (Recognition Rather Than Recall)

**評価: 良好**

### 良い点
- タブで機能が常に可視（日程/Todo/メモ/メンバー）。
- イベント種別はアイコン＋ラベルのチップ選択で、コードを覚える必要がない（`ScheduleItemForm.tsx:59-88`）。
- 日付ピッカーが旅行期間の全日程を提示し、記憶に頼らせない（`ScheduleSection.tsx`）。
- プレースホルダーが具体例を提示（「例：夏休みの旅行」「例：グランドホテル」）。
- 未登録カテゴリを `ScheduleAlerts` で明示し「何が足りないか」を認識で補助（`ScheduleAlerts.tsx`）。

### 改善提案
- Todo の担当者 `select` にラベルがない（`TodoForm.tsx:53-66`）。プレースホルダーとして「未割り当て」があるため致命的ではないが、`aria-label` を付けると支援技術での認識性が上がる。

---

## 7. 柔軟性と効率性 (Flexibility and Efficiency of Use)

**評価: 良好**

### 良い点
- スケジュールの日をまたいだコピー機能（`ScheduleCopyDialog`）。
- ドラッグ＆ドロップによる並び替え（`ScheduleTimeline.tsx`、`@dnd-kit`）。
- カレンダー編集への導線（`ScheduleSection.tsx:166-175`）。
- 終了時刻の自動補完でキー入力を削減。

### 改善提案
- 一覧が増えた場合の**検索/フィルタが Todo・旅行一覧にない**。件数が増えるとスクロール依存になる。
- キーボードショートカット（例: 新規追加、保存）は未整備。ヘビーユーザー向けの加速手段として検討余地あり。

---

## 8. 美的で最小限のデザイン (Aesthetic and Minimalist Design)

**評価: 良好**

### 良い点
- カード中心の落ち着いた配色、余白設計、情報の階層が明快。
- 詳細ヘッダーのグラデーション＋グリッドオーバーレイが上品（`TripHeader.tsx:154-169`）。
- 空状態はアイコン＋見出し＋補足＋アクションの最小構成（`EmptyState.tsx`）。

### 改善提案
- 前述の通り、認証画面のみ美的一貫性が崩れている（#4 参照）。ここを揃えるだけで全体の完成度が上がる。

---

## 9. エラーの認識・診断・回復の支援 (Help Users Recognize, Diagnose, and Recover)

**評価: 要改善**

### 指摘
- **読み込みエラーに再試行手段がない**。多くのセクションが `<p className="text-red-600">〜の読み込みに失敗しました。</p>` を出すのみで、再試行ボタンも原因の手掛かりもない（`TodosSection.tsx:72`, `MemoSection.tsx:31`, `MembersSection.tsx:50`, `ScheduleSection.tsx:159`, `trips/index.tsx:26`）。「再試行」ボタン（`refetch`）の追加を強く推奨。
- **ErrorBoundary の文言が英語**「Something went wrong」で、かつ生の `error.message` をそのまま表示（`ErrorBoundary.tsx:38-45`）。エンドユーザーには技術的すぎ、言語も不統一。日本語のわかりやすい説明＋復帰導線（再読み込み/戻る）に。
- **トーストのエラーが汎用的**（「〜に失敗しました」）で、次に何をすべきかの案内がない。ネットワーク起因か検証起因かでメッセージを出し分けると診断性が上がる。
- 招待リンクのコピー失敗が無反応（#1 と重複）。

### 良い点
- ログインの認証失敗は「メールアドレスまたはパスワードが正しくありません」と具体的（`login.tsx:104`）。この粒度を他のエラーにも展開したい。
- 詳細画面の致命的エラーには「旅行一覧に戻る」導線あり（`trips/$tripId/index.tsx:40`）。

---

## 10. ヘルプとドキュメント (Help and Documentation)

**評価: 改善余地あり**

### 良い点
- 招待リンクに補助説明「このリンクを持っている方は…参加をリクエストできます。」（`InviteLinkBox.tsx:45-47`）。
- スケジュールの未登録アラートが実質的なインラインガイダンスになっている。
- 空状態が次の一歩を促す説明を提供。

### 改善提案
- オーナー/メンバーの**権限差（何ができ、何ができないか）を説明する箇所がない**。バッジ表示のみで、権限の意味は自明でない。
- 初回利用時のオンボーディングやツールチップがない。最低限、主要操作にツールチップ/ヘルプアイコンがあると学習コストが下がる。

---

## 付録: アクセシビリティ関連（ヒューリスティックを横断）

ユーザビリティと密接に関わるため補足します。

- **Dialog のフォーカス管理が未実装**（`Dialog.tsx`）。開いた時にダイアログへフォーカス移動せず、内部でのフォーカストラップもなく、閉じた時に起点要素へ復帰しない。Escape 閉じは対応済み。キーボード/スクリーンリーダー利用者の体験改善のため、フォーカストラップと復帰の追加を推奨。
- **Tabs が ARIA タブパターン非対応**（`tabs.tsx`）。`role="tablist"/"tab"`・`aria-selected`・矢印キー移動がなく、単なるボタン列。支援技術に「タブ」として認識されない。
- **コントラスト**: グラデーション上の `text-white/70`（目的地）や `text-cream-mid`、白背景上の `text-ink-light` は、WCAG AA を満たすか要確認。
- `useEffectEvent` 未対応に伴う `onClose` 依存の再購読はコメントで認識済み（`Dialog.tsx`）。機能上の問題は小さいが、ツールチェーン更新時に解消余地。

---

## 優先度付き改善ロードマップ

**すぐ着手すべき（高）**
1. トースト・確認ダイアログ・ErrorBoundary の**文言を日本語に統一**（`useScheduleSection.ts`, `useTripEditor.ts`, `ErrorBoundary.tsx`）。
2. ログイン/サインアップを**デザインシステム（navy/coral/cream, rounded-2xl）に統一**し、`routes/index.tsx` のスピナーを共通 `LoadingSpinner` に置換。
3. **Todo 削除に確認を追加**し、破壊的操作の確認 UX をアプリ内モーダルで統一。

**次に着手（中）**
4. 各読み込みエラーに**「再試行」ボタン**（`refetch`）を追加。
5. **CreateTripModal で終了日 ≥ 開始日**を検証し、`min` で予防。
6. **Dialog のフォーカストラップ/復帰**を実装。
7. 削除系トーストに**Undo アクション**を付与。

**継続的改善（低）**
8. Tabs を ARIA タブパターン化。
9. 角丸・色トークンの粒度を整理。
10. 権限（オーナー/メンバー）の説明・ツールチップなどヘルプ導線を追加。
