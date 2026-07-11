#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

if ! command -v python3 >/dev/null 2>&1; then
  echo "ERROR: python3 was not found. Install Python 3.10+ and reopen Terminal."
  read -p "Press Enter to close..."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: npm was not found. Install Node.js LTS and reopen Terminal."
  read -p "Press Enter to close..."
  exit 1
fi

python3 start_dev.py
read -p "Press Enter to close..."
