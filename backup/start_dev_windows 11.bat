@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  py start_dev.py
) else (
  python start_dev.py
)
pause
