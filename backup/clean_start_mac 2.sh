#!/bin/bash
set -e
cd "$(dirname "$0")"
echo "Cleaning old Python virtual environment and frontend dependencies..."
rm -rf backend/.venv
rm -rf frontend/node_modules frontend/package-lock.json
echo "Starting Truflux Resource Bank..."
python3 start_dev.py
