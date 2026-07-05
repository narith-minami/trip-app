#!/bin/sh
# =============================================================================
# entrypoint.sh
# タスク実行サーバー(Node.js)を起動するだけのシンプルなエントリーポイント。
#
# v2での変更: OpenHands CLI(v1系)はデフォルトでサンドボックスコンテナを必要と
# しないため、Docker-in-Dockerの起動処理(dockerd待ち等)は不要になった。
# Cloudflare Container自体がすでに使い捨ての隔離環境であるため、
# その内部でOpenHandsを直接実行する構成とした。
# =============================================================================
set -eu

echo "[entrypoint] verifying openhands CLI is available..."
if ! command -v openhands > /dev/null 2>&1; then
  echo "[entrypoint] ERROR: openhands command not found in PATH" >&2
  exit 1
fi
echo "[entrypoint] openhands CLI found: $(openhands --version 2>&1 || echo 'version check failed')"

echo "[entrypoint] starting task server..."
exec node /app/dist/server.js
