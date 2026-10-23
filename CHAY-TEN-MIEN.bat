@echo off
chcp 65001 >nul
title Đưa Cổng Học Đường Số lên Tên Miền Riêng (Cloudflare Tunnel)
cd /d "%~dp0"

echo ============================================================================
echo   CỔNG HỌC ĐƯỜNG SỐ · THPT LÊ HOÀN — KẾT NỐI TÊN MIỀN KHÔNG CẦN CPANEL
echo ============================================================================
echo.
echo   [1] Chạy thử ngay với đường link HTTPS miễn phí (*.trycloudflare.com)
echo   [2] Kết nối vào TÊN MIỀN RIÊNG của bạn qua Cloudflare Tunnel Token
echo.
set /p MODE="Chọn chế độ (nhập 1 hoặc 2, mặc định 1): "
if "%MODE%"=="" set MODE=1

where cloudflared >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo.
  echo   • Đang tải công cụ Cloudflare Tunnel ^(cloudflared.exe^)...
  powershell -Command "Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile 'cloudflared.exe'"
  set CF_CMD="%~dp0cloudflared.exe"
) else (
  set CF_CMD=cloudflared
)

start "May chu THPT Le Hoan" cmd /c "node server.js"
timeout /t 2 >nul

if "%MODE%"=="2" (
  echo.
  echo   Hướng dẫn lấy Token cho tên miền riêng:
  echo   1. Vào https://one.dash.cloudflare.com ^-^> Networks ^-^> Tunnels ^-^> Create a tunnel
  echo   2. Đặt tên Tunnel ^-^> Copy mã Token
  echo   3. Ở tab Public Hostname: chọn tên miền của bạn và điền Service: http://localhost:3000
  echo.
  set /p CF_TOKEN="Dán Cloudflare Tunnel Token của bạn vào đây: "
  %CF_CMD% tunnel run --token %CF_TOKEN%
) else (
  echo.
  echo   • Đang mở đường truyền HTTPS công khai tới http://localhost:3000 ...
  %CF_CMD% tunnel --url http://localhost:3000
)
pause
