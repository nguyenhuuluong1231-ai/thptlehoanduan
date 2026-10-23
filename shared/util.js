import { fail } from './router.js';

export const nowISO = () => new Date().toISOString();
/** Ngày theo giờ địa phương dạng YYYY-MM-DD */
export const localDate = (d = new Date()) => { d = d instanceof Date ? d : new Date(d); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

let counter = 0;
export function uid(prefix = 'ID') {
  counter = (counter + 1) % 1296;
  return `${prefix}-${Date.now().toString(36).toUpperCase()}${counter.toString(36).toUpperCase().padStart(2, '0')}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}

/** Kiểm tra & làm sạch chuỗi đầu vào */
export function str(v, name, { required = false, max = 500, min = 0 } = {}) {
  if (v === undefined || v === null) v = '';
  if (typeof v !== 'string') v = String(v);
  v = v.trim();
  if (required && !v) fail(400, `Vui lòng nhập ${name}.`);
  if (v && v.length < min) fail(400, `${cap(name)} phải có ít nhất ${min} ký tự.`);
  if (v.length > max) fail(400, `${cap(name)} không được dài quá ${max} ký tự.`);
  return v;
}
export function num(v, name, { min = -Infinity, max = Infinity, required = false } = {}) {
  if ((v === undefined || v === null || v === '') && !required) return null;
  const n = Number(v);
  if (!Number.isFinite(n)) fail(400, `${cap(name)} phải là số.`);
  if (n < min || n > max) fail(400, `${cap(name)} phải nằm trong khoảng ${min} – ${max}.`);
  return n;
}
export function oneOf(v, name, list, def) {
  if ((v === undefined || v === null || v === '') && def !== undefined) return def;
  if (!list.includes(v)) fail(400, `${cap(name)} không hợp lệ.`);
  return v;
}
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** Mã hồ sơ theo tháng, tăng dần: TG-2610-0008, BB-2610-004… */
export function nextCode(list, prefix, digits = 4) {
  const d = new Date();
  const head = `${prefix}-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}-`;
  const max = list.reduce((m, x) => (String(x.id).startsWith(head) ? Math.max(m, parseInt(String(x.id).slice(head.length)) || 0) : m), 0);
  return head + String(max + 1).padStart(digits, '0');
}

export function findOr404(list, id, what = 'dữ liệu') {
  const item = list.find(x => String(x.id) === String(id));
  if (!item) fail(404, `Không tìm thấy ${what}.`);
  return item;
}

/** Thông tin người dùng an toàn để trả về client (bỏ mật khẩu) */
export function publicUser(u) {
  if (!u) return null;
  const { passwordHash, tokenVersion, faceKeys, ...rest } = u;
  return rest;
}
export function brief(u) {
  if (!u) return null;
  return { id: u.id, name: u.name, role: u.role, className: u.className || u.title || '', avatar: u.avatar || null };
}

/** Phân trang + tìm kiếm đơn giản */
export function paginate(list, query, fields = []) {
  let out = list;
  const q = (query.q || '').toString().trim().toLowerCase();
  if (q) out = out.filter(x => fields.some(f => String(x[f] ?? '').toLowerCase().includes(q)));
  const total = out.length;
  const limit = Math.min(Math.max(parseInt(query.limit) || 200, 1), 1000);
  const page = Math.max(parseInt(query.page) || 1, 1);
  return { total, page, limit, items: out.slice((page - 1) * limit, page * limit) };
}

/** Gửi thông báo trong hệ thống. target: 'all' | 'students' | 'staff' | userId */
export function notify(ctx, target, { title, content, type = 'info', link = '' }) {
  const n = { id: uid('TB'), target, title, content, type, link, createdAt: nowISO(), readBy: [] };
  ctx.db.data.notifications.unshift(n);
  if (ctx.db.data.notifications.length > 500) ctx.db.data.notifications.length = 500;
  ctx.emit('notification', n, target === 'all' ? { all: true } : target === 'students' ? { role: 'student' } : target === 'staff' ? { role: 'staff' } : target.startsWith('class:') ? { classId: target.slice(6) } : { userId: target });
  return n;
}
export function notifVisible(n, user) {
  if (n.target === 'all') return true;
  if (n.target === 'students') return user.role === 'student';
  if (n.target === 'staff') return user.role !== 'student';
  if (n.target.startsWith('class:')) return user.classId === n.target.slice(6);
  return n.target === user.id;
}

// ---------- Bộ lọc ngôn từ ----------
const BAD_WORDS = ['đm', 'dm', 'đmm', 'dmm', 'vl', 'vcl', 'vkl', 'clgt', 'cc', 'đéo', 'deo', 'địt', 'dit', 'lồn', 'buồi', 'cặc', 'óc chó', 'mất dạy', 'thằng ngu', 'con ngu', 'đồ ngu', 'súc vật', 'chó chết', 'ngu như bò'];
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const BAD_RE = new RegExp(`(^|[^\\p{L}\\d])(${BAD_WORDS.map(esc).join('|')})(?=$|[^\\p{L}\\d])`, 'giu');
export function filterProfanity(text) {
  let hit = false;
  const clean = text.replace(BAD_RE, (m, pre, word) => { hit = true; return pre + '*'.repeat(word.length); });
  return { text: clean, flagged: hit };
}

export function initials(name = '') {
  const parts = name.replace(/^(ThS\.|TS\.|Thầy|Cô|PGS\.)\s*/i, '').trim().split(/\s+/);
  return ((parts.at(-2)?.[0] || '') + (parts.at(-1)?.[0] || '')).toUpperCase() || '?';
}

// ---------------------------------------------------------------------------
// Tệp đính kèm trong tin nhắn: ảnh, video, tài liệu
// ---------------------------------------------------------------------------
export const ATTACH_TYPES = {
  'image/jpeg': ['jpg', 'image'], 'image/png': ['png', 'image'], 'image/webp': ['webp', 'image'], 'image/gif': ['gif', 'image'],
  'video/mp4': ['mp4', 'video'], 'video/webm': ['webm', 'video'], 'video/quicktime': ['mov', 'video'], 'video/3gpp': ['3gp', 'video'],
  'audio/mpeg': ['mp3', 'audio'], 'audio/mp4': ['m4a', 'audio'], 'audio/x-m4a': ['m4a', 'audio'], 'audio/webm': ['weba', 'audio'], 'audio/ogg': ['ogg', 'audio'], 'audio/wav': ['wav', 'audio'],
  'application/pdf': ['pdf', 'file'], 'text/plain': ['txt', 'file'],
  'application/msword': ['doc', 'file'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx', 'file'],
  'application/vnd.ms-excel': ['xls', 'file'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx', 'file'],
  'application/vnd.ms-powerpoint': ['ppt', 'file'], 'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['pptx', 'file'],
  'application/zip': ['zip', 'file'], 'application/x-zip-compressed': ['zip', 'file'], 'application/vnd.rar': ['rar', 'file'], 'application/x-rar-compressed': ['rar', 'file'],
};
const EXT_TYPES = Object.fromEntries(Object.entries(ATTACH_TYPES).map(([mime, [ext]]) => [ext, mime]));
EXT_TYPES.jpeg = 'image/jpeg';

/** Đoán MIME từ tên tệp khi trình duyệt không cung cấp (thường gặp với .docx, .rar trên điện thoại). */
export function guessMime(name = '', type = '') {
  if (ATTACH_TYPES[type]) return type;
  const ext = String(name).toLowerCase().split('.').pop();
  return EXT_TYPES[ext] || type || '';
}

/** Kiểm tra danh sách tệp đính kèm gửi kèm tin nhắn (đã tải lên qua /api/uploads). */
export function cleanAttachments(list) {
  if (list == null) return [];
  if (!Array.isArray(list)) fail(400, 'Tệp đính kèm không hợp lệ.');
  if (list.length > 6) fail(400, 'Mỗi tin nhắn đính kèm tối đa 6 tệp.');
  return list.map((a) => {
    const url = String(a?.url || '');
    const okUrl = (/^uploads\/[\w.-]+$/.test(url) && !url.includes('..')) || /^data:[\w/+.-]+;base64,/.test(url);
    if (!okUrl) fail(400, 'Tệp đính kèm không hợp lệ.');
    const type = guessMime(a.name, a.type);
    const kind = ATTACH_TYPES[type]?.[1] || 'file';
    return { url, name: str(a.name, 'tên tệp', { max: 160 }) || 'tep-dinh-kem', type, kind, size: Math.max(0, Math.round(Number(a.size) || 0)) };
  });
}

/** Mô tả ngắn cho thông báo khi tin nhắn chỉ có tệp. */
export function attachSummary(atts = []) {
  if (!atts.length) return '';
  const n = { image: 0, video: 0, audio: 0, file: 0 };
  atts.forEach(a => n[a.kind] = (n[a.kind] || 0) + 1);
  return [n.image && `${n.image} ảnh`, n.video && `${n.video} video`, n.audio && `${n.audio} ghi âm`, n.file && `${n.file} tệp`].filter(Boolean).join(', ');
}

/** Tin nhắn đã thu hồi: người xem thường chỉ thấy “đã thu hồi”; người giám sát vẫn xem được nội dung gốc. */
export function scrubRecalledNotice(db, m) {
  const n = m?.notifId && db.data.notifications.find(x => x.id === m.notifId);
  if (n) n.content = 'Tin nhắn đã được thu hồi';
}
export function recallView(m, canSeeOriginal) {
  if (!m?.recalled || canSeeOriginal) return m;
  const { text, attachments, leave, guard, ...rest } = m;
  return { ...rest, text: '', attachments: [], recalled: true };
}
