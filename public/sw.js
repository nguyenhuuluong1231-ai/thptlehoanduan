// Service worker: cho phép cài Cổng Học Đường Số như một ứng dụng (PWA) và mở nhanh khi mạng yếu.
// - Tệp giao diện (HTML/CSS/JS/ảnh): lấy từ mạng trước, lưu bản sao để dùng khi mất mạng.
// - API, realtime, ảnh/video tải lên: luôn lấy trực tiếp từ máy chủ (không lưu đệm) để dữ liệu luôn đồng bộ.
const CACHE = 'lehoan-v83';
const SHELL = ['./', 'index.html', 'staff.html', 'app.html', 'admin.html', 'phone.html', 'css/app.css', 'assets/school_logo.png', 'assets/logo-mark.svg', 'assets/icons/icon-192.png', 'manifest.webmanifest'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => { /* bỏ qua tệp lỗi */ }));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || url.pathname.includes('/api/') || url.pathname.includes('/uploads/') || url.pathname.includes('sync.php')) return;
  e.respondWith(
    fetch(req, { cache: 'no-cache' }).then((res) => {
      if (res.ok && res.type === 'basic') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || (req.mode === 'navigate' ? caches.match('app.html') : undefined)))
  );
});
