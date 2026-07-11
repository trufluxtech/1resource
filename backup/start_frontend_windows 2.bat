@echo off
setlocal
cd /d %~dp0\frontend
npm install
npm run dev
pause
