// Theo dõi phiên đăng nhập phía máy chủ.
// Mỗi token mang một mã phiên (jti) duy nhất. Mã này đổi sang giá trị MỚI sau mỗi ROTATE_SEC giây
// sử dụng — chuỗi token cũ bị thu hồi ngay khi token mới được phát ra — nên nếu một token bị lộ
// (chặn được qua mạng, lưu lại trong log…), nó chỉ còn dùng được trong một khoảng thời gian ngắn
// trước khi bị vô hiệu bởi lượt đổi token tiếp theo của chính người dùng thật, hạn chế việc phát lại / dò (spam).
// Phiên cũng tự hết hạn nếu không hoạt động quá IDLE_SEC, và không bao giờ vượt quá hạn tuyệt đối (abs)
// được quyết định khi đăng nhập (ghi nhớ đăng nhập: 30 ngày, không ghi nhớ: 1 ngày).
export const ROTATE_SEC = 5 * 60;
export const IDLE_SEC = 5 * 60;
// Khoảng đệm ngắn sau khi một token bị đổi sang token mới: trong khoảng này, một yêu cầu khác vẫn
// còn mang token CŨ (vd. nhiều API gọi cùng lúc lúc tải trang, chạy song song với lượt đổi token)
// được trỏ sang phiên MỚI thay vì bị coi là hết hạn — xem supersededBy()/dropSession() dưới đây.
export const ROTATE_GRACE_SEC = 120;

// Bộ nhớ trong tiến trình: lưu các phiên đang hoạt động và danh sách jti đã chủ động đăng xuất.
const sessions = new Map(); // jti -> { userId, v, abs, issuedAt, lastSeen, device }
// jti cũ (vừa bị đổi token) -> { newJti, expiresAt }. Chỉ tồn tại trong ROTATE_GRACE_SEC giây.
const superseded = new Map();
const revoked = new Set();

function sweepSuperseded() {
  const now = Date.now() / 1000;
  for (const [jti, entry] of superseded) if (now > entry.expiresAt) superseded.delete(jti);
}

export function putSession(jti, info) {
  revoked.delete(jti);
  sessions.set(jti, { ...info, issuedAt: info.issuedAt ?? Date.now() / 1000, lastSeen: Date.now() / 1000 });
}
export function getSession(jti) { return sessions.get(jti) || null; }
export function isRevoked(jti) { return revoked.has(jti); }
export function touchSession(jti) { const s = sessions.get(jti); if (s) s.lastSeen = Date.now() / 1000; return s; }
// supersedingJti: khi có — jti cũ này vừa được đổi sang token mới (supersedingJti), nên trong
// ROTATE_GRACE_SEC giây tới, supersededBy(jti) sẽ trả về jti mới đó. Khi không có — phiên bị thu hồi
// thật (đăng xuất/hết hạn), không trỏ sang đâu cả.
export function dropSession(jti, supersedingJti) {
  sessions.delete(jti);
  if (supersedingJti) {
    superseded.set(jti, { newJti: supersedingJti, expiresAt: Date.now() / 1000 + ROTATE_GRACE_SEC });
    sweepSuperseded();
  } else {
    superseded.delete(jti);
    if (jti) revoked.add(jti);
  }
}
// Trả về jti mới nếu "jti" vừa được đổi token trong ROTATE_GRACE_SEC giây gần đây; ngược lại trả về null.
export function supersededBy(jti) {
  let cur = jti, depth = 0;
  const now = Date.now() / 1000;
  while (depth++ < 8) {
    const entry = superseded.get(cur);
    if (!entry) break;
    if (now > entry.expiresAt) { superseded.delete(cur); break; }
    cur = entry.newJti;
  }
  return cur !== jti ? cur : null;
}
export function dropAllForUser(userId) { for (const [id, s] of sessions) if (s.userId === userId) sessions.delete(id); }
export function listForUser(userId) {
  return [...sessions.entries()].filter(([, s]) => s.userId === userId).sort((a, b) => b[1].lastSeen - a[1].lastSeen).map(([jti, s]) => ({ jti, device: s.device || '', issuedAt: s.issuedAt, lastSeen: s.lastSeen, current: false }));
}
export function sessionValid(s) {
  if (!s) return false;
  const now = Date.now() / 1000;
  if (s.noIdle) return now <= s.abs;
  return now <= s.abs && now - s.lastSeen <= IDLE_SEC;
}
export function needsRotation(s) { return Date.now() / 1000 - s.issuedAt >= ROTATE_SEC; }

// Dùng cho bản xem trước/demo trong trình duyệt (client-src/js/core/demo.js): mỗi lần chuyển trang
// (vd. trang đăng nhập → app.html) là một lần nạp lại toàn bộ trang, nên bộ nhớ "sessions" ở trên bị
// xoá sạch — phải lưu/khôi phục qua localStorage để phiên đăng nhập không bị mất ngay khi chuyển trang.
// Máy chủ Node.js thật (server.js) không bao giờ gọi hai hàm này nên hành vi của nó không đổi.
export function snapshotSessions() { return [...sessions.entries()]; }
export function restoreSessions(entries) { if (Array.isArray(entries)) for (const [jti, info] of entries) if (jti && info) sessions.set(jti, info); }
