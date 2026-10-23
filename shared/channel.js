// Mã hóa nội dung API ở tầng ứng dụng (ECDH P-256 + AES-256-GCM), ĐỘC LẬP với HTTPS.
// Mỗi khi mở một trang, trình duyệt bắt tay một lần (POST /api/handshake) để cùng máy chủ sinh ra một
// khóa AES-256-GCM dùng chung — từ đó thân (body) của MỌI yêu cầu/phản hồi /api/* được mã hóa bằng
// khóa đó. Nhờ vậy ai mở tab Network/Sources của trình duyệt (DevTools) cũng chỉ thấy một khối dữ liệu
// đã mã hóa (iv/tag/data), không đọc được nội dung thật — kể cả khi máy chủ đang chạy HTTP thường.
//
// LƯU Ý THẬT: đây là lớp bảo vệ BỔ SUNG giúp "nhìn lướt" qua DevTools không thấy được gì, KHÔNG thay
// thế HTTPS. Việc bắt tay khóa ở đây vẫn đi qua chính kết nối hiện có — nếu kết nối đó là HTTP thường
// và có kẻ tấn công kiểm soát được đường truyền mạng (không chỉ "nhìn lướt" qua DevTools của chính máy
// mình), họ vẫn có thể bắt được bước bắt tay và giải mã. Muốn chống nghe lén thật trên đường truyền,
// cần bật HTTPS=1 (xem server.js) — hai lớp này bổ sung cho nhau, không thay thế nhau.
import crypto from 'node:crypto';

const TTL_MS = 2 * 3600 * 1000; // không hoạt động 2 giờ thì bỏ kênh — trình duyệt tự bắt tay lại
const channels = new Map(); // cid -> { key: Buffer(32), lastSeen: number }

export function startHandshake(clientPubB64) {
  let ecdh, shared;
  try {
    ecdh = crypto.createECDH('prime256v1');
    ecdh.generateKeys();
    shared = ecdh.computeSecret(Buffer.from(clientPubB64, 'base64'));
  } catch { return null; } // khóa công khai từ trình duyệt không hợp lệ
  const key = crypto.createHash('sha256').update(shared).digest();
  const cid = crypto.randomBytes(16).toString('hex');
  channels.set(cid, { key, lastSeen: Date.now() });
  if (channels.size > 20000) gc();
  return { cid, serverPub: ecdh.getPublicKey().toString('base64') };
}

function gc() { const now = Date.now(); for (const [id, c] of channels) if (now - c.lastSeen > TTL_MS) channels.delete(id); }

export function getChannelKey(cid) {
  const c = cid && channels.get(cid);
  if (!c) return null;
  if (Date.now() - c.lastSeen > TTL_MS) { channels.delete(cid); return null; }
  c.lastSeen = Date.now();
  return c.key;
}

export function encryptEnvelope(key, value) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([c.update(JSON.stringify(value === undefined ? null : value), 'utf8'), c.final()]);
  return { iv: iv.toString('base64'), tag: c.getAuthTag().toString('base64'), data: enc.toString('base64') };
}

export function decryptEnvelope(key, env) {
  if (!env || typeof env !== 'object' || typeof env.iv !== 'string' || typeof env.tag !== 'string' || typeof env.data !== 'string') throw new Error('Gói dữ liệu mã hóa không hợp lệ.');
  const d = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(env.iv, 'base64'));
  d.setAuthTag(Buffer.from(env.tag, 'base64'));
  const dec = Buffer.concat([d.update(Buffer.from(env.data, 'base64')), d.final()]);
  const text = dec.toString('utf8');
  return text && text !== 'null' ? JSON.parse(text) : undefined;
}
