#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ "$(git branch --show-current)" != "main" ]]; then
  echo "当前不在 main，请先完成分支审核再同步。" >&2
  exit 1
fi
npm test
# Stage only the application allowlist, never browser data or exported notes.
git add -- .gitignore AGENTS.md README.md USAGE.md PROJECT.md CHANGELOG.md index.html app.js app.css package.json package-lock.json test-*.cjs scripts/sync.sh .github/workflows/check.yml assets/workbench-icon.png
if ! git diff --cached --quiet; then
  git commit -m "${1:-Update content workbench}"
fi
git push origin main
