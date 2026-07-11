@echo off
setlocal
cd /d "%~dp0frontend"
call npm install
set VITE_API_BASE=http://localhost:8000
call npm run dev -- --host 0.0.0.0 --port 5173
pause
