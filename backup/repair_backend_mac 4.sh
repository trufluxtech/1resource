#!/bin/bash
set -e
cd "$(dirname "$0")"
echo "Repairing backend Python virtual environment and certificate settings..."
rm -rf backend/.venv
unset SSL_CERT_FILE REQUESTS_CA_BUNDLE CURL_CA_BUNDLE PIP_CERT PIP_CONFIG_FILE
if [ -x "/opt/homebrew/bin/python3.12" ]; then
  TRUFLUX_PYTHON=/opt/homebrew/bin/python3.12 python3 start_dev.py
elif [ -x "/usr/local/bin/python3.12" ]; then
  TRUFLUX_PYTHON=/usr/local/bin/python3.12 python3 start_dev.py
else
  python3 start_dev.py
fi
