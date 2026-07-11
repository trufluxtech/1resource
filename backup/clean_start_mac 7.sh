#!/bin/bash
set -e
cd "$(dirname "$0")"
echo "Cleaning Python and Node local dependencies..."
rm -rf backend/.venv frontend/node_modules frontend/package-lock.json
npm config set registry https://registry.npmjs.org/ >/dev/null 2>&1 || true

if [ -x "/opt/homebrew/bin/python3.12" ]; then
  echo "Using Homebrew Python 3.12"
  TRUFLUX_PYTHON=/opt/homebrew/bin/python3.12 python3 start_dev.py
elif [ -x "/usr/local/bin/python3.12" ]; then
  echo "Using Homebrew Python 3.12"
  TRUFLUX_PYTHON=/usr/local/bin/python3.12 python3 start_dev.py
else
  echo "Homebrew Python 3.12 not found. Using detected python3."
  echo "If venv creation fails, run: brew install python@3.12"
  python3 start_dev.py
fi
