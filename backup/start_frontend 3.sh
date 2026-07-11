#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/frontend"
npm install
export VITE_API_BASE="${VITE_API_BASE:-http://localhost:8000}"
npm run dev -- --host 0.0.0.0 --port "${FRONTEND_PORT:-5173}"
