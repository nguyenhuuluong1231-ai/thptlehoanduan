@echo off
chcp 65001 >nul
title Kiem tra AI MiraiAPI
cd /d "%~dp0"
where node >nul 2>nul || (echo Chua cai Node.js: https://nodejs.org & pause & exit /b 1)
echo.
echo  Kiem tra ket noi AI that (MiraiAPI) tren may nay.
echo  - Bam Enter de dung cau hinh da luu tren web (Cong Giao Vien - Ket noi AI)
echo  - Hoac dan khoa API MiraiAPI (sk-...) roi bam Enter
echo.
set "KEY="
set /p "KEY=Khoa API: "
node scripts\test-ai.js %KEY%
pause
