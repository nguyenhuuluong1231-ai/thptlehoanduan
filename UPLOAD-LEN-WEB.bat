@echo off
chcp 65001 >nul
title Upload Code len tuvantamlihocduonglehoan.com
cd /d "%~dp0"
node scripts/upload-cpanel.mjs
echo.
pause
