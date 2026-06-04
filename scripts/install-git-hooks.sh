#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOOK_SRC="$ROOT/scripts/git-hooks/prepare-commit-msg"
HOOK_DST="$ROOT/.git/hooks/prepare-commit-msg"

if [ ! -d "$ROOT/.git" ]; then
  echo "Error: $ROOT is not a git repository." >&2
  exit 1
fi

cp "$HOOK_SRC" "$HOOK_DST"
chmod +x "$HOOK_DST"
echo "Installed prepare-commit-msg hook at $HOOK_DST"
