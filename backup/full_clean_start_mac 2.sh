#!/bin/bash
set -e
cd "$(dirname "$0")"
echo "Full clean start: removing backend venv and frontend node_modules..."
rm -rf backend/.venv
rm -rf frontend/node_modules
rm -rf frontend/package-lock.json
rm -rf frontend/.vite
rm -rf frontend/node_modules/.vite
npm cache verify || true
npm config set registry https://registry.npmjs.org/
unset SSL_CERT_FILE REQUESTS_CA_BUNDLE CURL_CA_BUNDLE PIP_CERT PIP_CONFIG_FILE

if [ -x "/opt/homebrew/bin/python3.12" ]; then
  TRUFLUX_PYTHON=/opt/homebrew/bin/python3.12 python3 start_dev.py
elif [ -x "/usr/local/bin/python3.12" ]; then
  TRUFLUX_PYTHON=/usr/local/bin/python3.12 python3 start_dev.py
else
  python3 start_dev.py
fi
