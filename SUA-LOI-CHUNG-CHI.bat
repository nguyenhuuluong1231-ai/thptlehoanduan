@echo off
chcp 65001 >nul
title Sua loi anh chung chi - THPT Le Hoan
cd /d "%~dp0"
echo.
echo  Dang chay ban va loi anh chung chi...
echo  (Hay dam bao server (cua so den CHAY-WEB) da duoc DONG lai truoc khi tiep tuc)
echo.
pause
node sua-loi-chung-chi.mjs
echo.
pause
