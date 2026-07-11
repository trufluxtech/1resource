#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/backend"
python3 -m venv .venv || python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
