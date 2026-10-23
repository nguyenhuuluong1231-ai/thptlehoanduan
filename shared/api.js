// Lắp ráp toàn bộ REST API. Dùng chung cho server.js (Node.js) và bản demo chạy trong trình duyệt.
import { createRouter } from './router.js';
import authRoutes from './routes/auth.js';
import portalRoutes from './routes/portal.js';
import safetyRoutes from './routes/safety.js';
import engageRoutes from './routes/engage.js';
import chatRoutes from './routes/chat.js';
import adminRoutes from './routes/admin.js';

export const API_VERSION = '2.0.0';

export function buildApi() {
  const r = createRouter();
  authRoutes(r);
  portalRoutes(r);
  safetyRoutes(r);
  engageRoutes(r);
  chatRoutes(r);
  adminRoutes(r);
  r.get('/api', { group: 'Công khai', desc: 'Danh mục toàn bộ endpoint (dùng cho trang tài liệu API).' }, async () => ({
    name: 'Cổng Học Đường Số — REST API', version: API_VERSION,
    auth: 'Gửi header Authorization: Bearer <token> nhận được từ POST /api/auth/login',
    realtime: 'GET /api/stream?token=<token> (Server-Sent Events): notification, alert, school-chat:*, teacher-chat:message, counseling:*, report:*, sync, settings',
    endpoints: r.describe(),
  }));
  return r;
}
