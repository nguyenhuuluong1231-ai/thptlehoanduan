@echo off
chcp 65001 >nul
title Tự động Upload Code lên tuvantamlihocduonglehoan.com
cd /d "%~dp0"
node scripts/upload-cpanel.mjs
echo.
pause

