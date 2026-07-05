# =============================================================================
# Kimi Issue-Driven Coding Agent — Container Image
# Cloudflare Containers上でOpenHands (headless) + Kimi K2.7 Codeを動かすための
# イメージ。
#
# === 設計変更の経緯 (v2) ===
# 当初はOpenHands V0の「Docker内にサンドボックスコンテナを作る」構造を前提に
# docker:dind-rootless ベースでDocker-in-Docker構成を組んでいたが、
# OpenHands CLI (v1系, PyPI: "openhands") はアーキテクチャが刷新されており、
# デフォルトでは "Optional isolation" の方針のもとホスト上で直接実行される
# (サンドボックスコンテナは必須ではない)。
#
# 本システムではCloudflare Containerというコンテナ自体がすでに1タスク=1回限りの
# 使い捨て隔離環境であるため、その内部でさらにDockerサンドボックスを作る必要はない
# と判断し、DinD構成を廃止した。これによりベースイメージが大幅に軽量化され、
# Cloudflare Containers側のDinD制約(rootless限定、--iptables=false等)への
# 対応も不要になった。
# =============================================================================
# Cloudflare Containersは linux/amd64 アーキテクチャを要求するため明示する。
# (Apple Silicon Mac等のarm64開発環境でも正しくビルドされるようにするため)
FROM --platform=linux/amd64 node:22-slim

# --- OS依存パッケージ ---
# Python(OpenHands本体), git(リポジトリ操作), curl(uvインストーラ), ca-certificates
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-venv \
    git \
    curl \
    ca-certificates \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# uv経由でOpenHands CLI(v1系)をインストール
# (pip install openhands-ai はレガシーV0 SDKであり非推奨のため使用しない)
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:${PATH}"
RUN uv tool install openhands --python 3.12
ENV PATH="/root/.local/share/uv/tools/openhands/bin:${PATH}"

# GitHub CLI (PR作成に使用。OpenHandsのterminalツール経由で `gh pr create` を実行する)
RUN curl -fsSL https://github.com/cli/cli/releases/latest/download/gh_2.63.0_linux_amd64.tar.gz \
    -o /tmp/gh.tar.gz \
    && tar -xzf /tmp/gh.tar.gz -C /tmp \
    && mv /tmp/gh_*/bin/gh /usr/local/bin/gh \
    && rm -rf /tmp/gh.tar.gz /tmp/gh_*

# --- タスク実行サーバー(TypeScript, ビルド済みJSを配置) ---
WORKDIR /app
COPY container/server/package.json container/server/package-lock.json* ./
RUN npm install --omit=dev
COPY container/server/dist ./dist

# entrypointスクリプト
COPY container/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# ワークスペース(OpenHandsがリポジトリをクローンする作業領域)
RUN mkdir -p /workspace

# --- 非rootユーザーで実行(セキュリティのベストプラクティス) ---
# node:slim系イメージには標準で "node" ユーザー(UID 1000)が存在する
RUN chown -R node:node /app /workspace
USER node

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
