@echo off
chcp 65001 >nul
title Cong Hoc Duong So - THPT Le Hoan
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Chua cai Node.js. Trinh duyet se mo trang tai Node.js - hay cai ban LTS roi chay lai tep nay.
  start "" https://nodejs.org/vi/download
  pause
  exit /b 1
)
echo.
echo  Dang khoi dong may chu... Trinh duyet se tu mo http://localhost:3000
echo  Dong cua so nay de tat may chu.
echo.
start "" cmd /c "timeout /t 2 >nul & start http://localhost:3000"
node server.js
pause
