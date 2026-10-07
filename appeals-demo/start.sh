#!/usr/bin/env bash
# One-command start (macOS / Linux): ./start.sh
set -e
cd "$(dirname "$0")"
if [ ! -d .venv ]; then
  echo "Creating virtual environment..."
  python3 -m venv .venv
fi
.venv/bin/python -m pip install -q --disable-pip-version-check -r requirements.txt
[ -f .env ] || { cp .env.example .env; echo "Created .env (add ANTHROPIC_API_KEY for live mode)."; }
exec .venv/bin/python run.py
