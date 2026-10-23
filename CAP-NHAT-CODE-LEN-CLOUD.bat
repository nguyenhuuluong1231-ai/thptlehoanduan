@echo off
chcp 65001 >nul
title Đẩy Code lên GitHub: nguyenhuuluong1231-ai/thptlehoanduan
cd /d "%~dp0"

echo ============================================================================
echo   ĐẨY MÃ NGUỒN LÊN GITHUB: nguyenhuuluong1231-ai/thptlehoanduan
echo ============================================================================
echo.

set REPO_URL=https://github.com/nguyenhuuluong1231-ai/thptlehoanduan.git

if not exist ".git" (
  git init -b main
)
git remote remove origin >nul 2>nul
git remote add origin %REPO_URL%
echo   ✓ Kho GitHub đích: %REPO_URL%

if exist "scripts\obfuscate.mjs" (
  node scripts/obfuscate.mjs
)

git config user.name "Vu Nguyen An Khang"
git config user.email "admin@tuvantamlihocduonglehoan.com"
git branch -M main
git add -A
git commit -m "Deploy Cong Hoc Duong So THPT Le Hoan" 2>nul

echo.
echo   • Đang đẩy code lên GitHub (nếu cửa sổ đăng nhập GitHub hiện lên, hãy bấm "Sign in with your browser")...
git push -u origin main --force

if %ERRORLEVEL% neq 0 (
  echo.
  echo   • Đang chuyển đổi tài khoản GitHub sang nguyenhuuluong1231-ai...
  cmdkey /delete:LegacyGeneric:target=git:https://github.com >nul 2>nul
  cmdkey /delete:git:https://github.com >nul 2>nul
  git push -u origin main --force
)

echo.
echo ============================================================================
echo   ✓ HOÀN TẤT! Kho mã nguồn: https://github.com/nguyenhuuluong1231-ai/thptlehoanduan
echo ============================================================================
pause
