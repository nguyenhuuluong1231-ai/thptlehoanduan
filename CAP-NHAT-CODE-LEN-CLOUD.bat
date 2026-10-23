@echo off
chcp 65001 >nul
title Day Code len GitHub: nguyenhuuluong1231-ai/thptlehoanduan
cd /d "%~dp0"
node scripts/push-github.mjs
echo.
pause
