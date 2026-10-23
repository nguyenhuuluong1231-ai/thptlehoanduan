// File khởi động tương thích với mọi phiên bản cPanel "Setup Node.js App" (Phusion Passenger / CloudLinux).
// Bạn có thể điền "app.cjs" hoặc "server.js" vào ô "Application startup file" trong cPanel.
import('./server.js').catch((err) => {
  console.error('Lỗi khởi động máy chủ trên cPanel:', err);
  process.exit(1);
});

