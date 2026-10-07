#!/usr/bin/env bash
# One-command start (macOS / Linux): ./start.sh
set -e
cd "$(dirname "$0")"

# Find Python 3.10+ (macOS's built-in python3 is often 3.9, which is too old).
PY=""
for cand in python3.13 python3.12 python3.11 python3.10 python3; do
  if command -v "$cand" >/dev/null 2>&1 && "$cand" -c 'import sys; sys.exit(sys.version_info < (3, 10))' 2>/dev/null; then
    PY="$cand"; break
  fi
done
if [ -z "$PY" ]; then
  echo "Python 3.10 or newer is required."
  echo "Install it from https://www.python.org/downloads/ (or: brew install python), then run ./start.sh again."
  exit 1
fi

if [ -d .venv ] && ! .venv/bin/python -c 'import sys; sys.exit(sys.version_info < (3, 10))' 2>/dev/null; then
  echo "Existing .venv uses an old Python - recreating it."
  rm -rf .venv
fi
if [ ! -d .venv ]; then
  echo "Creating virtual environment with $($PY --version)..."
  "$PY" -m venv .venv
fi
.venv/bin/python -m pip install -q --disable-pip-version-check -r requirements.txt
[ -f .env ] || { cp .env.example .env; echo "Created .env (add ANTHROPIC_API_KEY for live mode)."; }
exec .venv/bin/python run.py
