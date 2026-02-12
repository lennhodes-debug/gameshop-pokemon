#!/bin/bash
set -euo pipefail

# Only run in remote (Claude Code on the web) environments
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# Install dependencies if needed
if [ -f "package.json" ] && [ ! -d "node_modules" ]; then
  npm install --prefer-offline 2>/dev/null || npm install
fi

# Ensure memory directory exists
mkdir -p /root/.claude/projects/-home-user-gameshop-pokemon/memory

# Quick project health check (non-blocking)
echo "=== Gameshop Enter Session Start ==="
echo "Branch: $(git branch --show-current 2>/dev/null || echo 'unknown')"
echo "Status: $(git status --porcelain 2>/dev/null | wc -l) uncommitted files"
echo "Products: $(node -e "console.log(require('./src/data/products.json').length)" 2>/dev/null || echo 'unknown')"
echo "==================================="
