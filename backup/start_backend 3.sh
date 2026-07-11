#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/backend"
if [ ! -x .venv/bin/python ]; then
  python3 -m venv .venv
fi
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
