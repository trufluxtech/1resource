@echo off
setlocal
cd /d "%~dp0backend"
if not exist .venv\Scripts\python.exe (
  where py >nul 2>nul
  if %errorlevel%==0 (py -m venv .venv) else (python -m venv .venv)
)
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000
pause
