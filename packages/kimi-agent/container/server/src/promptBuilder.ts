import type { RunTaskRequest } from "./types.js";

/**
 * Issue本文の長さに上限を設ける。
 * Kimi K2.7 Codeは256Kコンテキストだが、Issue本文自体が極端に長いケース
 * (誤って大量のログを貼り付けた等)を弾くための安全弁。
 */
const MAX_ISSUE_BODY_LENGTH = 20_000;

/**
 * OpenHands headlessモードに渡す `-t` オプション用のプロンプト文字列を構築する。
 *
 * 設計方針:
 *  - Issueのタイトル・本文をそのまま伝える(過度な要約や書き換えはしない)
 *  - 実装の制約(コードスタイル、テスト実行、PR作成)を明示的に指示する
 *  - 実装が困難な場合の振る舞いも明示し、意図しない大改造を防ぐ
 */
export function buildPrompt(req: RunTaskRequest): string {
  const truncatedBody = truncateIssueBody(req.issueBody);

  return `以下のGitHub Issueを実装してください。

# Issue番号
#${req.issueNumber}

# タイトル
${req.issueTitle}

# 本文
${truncatedBody}

# 制約
- 既存のコードスタイル・アーキテクチャに従うこと
- 変更に関連するテストがあれば実行し、通過することを確認すること
- 新しいテストが必要な場合は追加すること
- 変更が完了したら、新しいブランチにpushし、GitHub CLI (gh pr create) または GitHub API を用いて
  Pull Requestを作成すること
- Pull Requestの本文には "Closes #${req.issueNumber}" を含めること
- Issueの内容が曖昧、または実装に必要な情報が不足している場合は、
  無理に実装を進めず、その理由をコメントとして残すこと
- リポジトリのmainブランチに直接pushしないこと(必ず新規ブランチ経由)
`;
}

function truncateIssueBody(body: string): string {
  if (body.length <= MAX_ISSUE_BODY_LENGTH) return body;
  return (
    body.slice(0, MAX_ISSUE_BODY_LENGTH) +
    "\n\n[...本文が長いため以降省略されました。必要に応じてリポジトリ内の関連ファイルを確認してください。]"
  );
}
