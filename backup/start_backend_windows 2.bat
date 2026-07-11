@echo off
setlocal
cd /d %~dp0\backend
where py >nul 2>nul
if %errorlevel%==0 (
  py -3 -m venv .venv
) else (
  python -m venv .venv
)
call .venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
pause
