// Lớp gọi API: tự phát hiện máy chủ Node.js; nếu không có (vd. bản xem trước tĩnh) sẽ chạy
// cùng bộ API ngay trong trình duyệt (chế độ demo, dữ liệu lưu trên máy người xem).
import { store, toast, apiBase, compressImage, readDataUrl } from './ui.js';

if (typeof window !== 'undefined') {
  if (!window.process) window.process = { env: {} };
  if (location.protocol === 'http:' && !['localhost', '127.0.0.1'].includes(location.hostname)) {
    location.replace('https://' + location.host + location.pathname + location.search + location.hash);
  }
}

let mode = null, demo = null, portal = 'student';
const memToken = {};
const tokenKey = () => `lh_token_${portal}`;
const activeKey = (p = portal) => `lh_active_${p}`;
const noIdleKey = (p = portal) => `lh_no_idle_${p}`;
export const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // Tự động đăng xuất sau 5 phút không hoạt động (chỉ áp dụng bản web máy tính)
export const isAppEnv = () => typeof window !== 'undefined' && (window.self !== window.top || !!window.Capacitor || window.matchMedia?.('(display-mode: standalone)').matches || !!navigator.standalone || /[?&]mobile/.test(location.search));
export const isAppSession = (p = portal) => isAppEnv() || !!store.get(noIdleKey(p));
let lastTouch = 0, lastServerTouch = 0;

/** Ghép địa chỉ máy chủ (khi chạy trong app điện thoại) với đường dẫn API. */
export const apiUrl = (p) => { const u = p.startsWith('/') ? p.slice(1) : p; return apiBase() ? `${apiBase()}/${u}` : u; };

export const session = {
  get token() {
    let tok = memToken[portal];
    if (!tok) {
      try { tok = sessionStorage.getItem(tokenKey()) || store.get(tokenKey()); } catch { tok = store.get(tokenKey()); }
    }
    if (!tok) return null;
    if (!isAppSession()) {
      const last = Number(store.get(activeKey()) || 0);
      if (last && Date.now() - last > IDLE_TIMEOUT_MS) {
        this.clear();
        return null;
      }
      if (!last) store.set(activeKey(), Date.now());
    }
    return tok;
  },
  set(token, remember = true, noIdle = isAppEnv()) {
    memToken[portal] = token;
    try { sessionStorage.setItem(tokenKey(), token); } catch { /* bỏ qua */ }
    if (remember || noIdle) store.set(tokenKey(), token); else store.del(tokenKey());
    if (noIdle) store.set(noIdleKey(), 1);
    lastTouch = Date.now();
    store.set(activeKey(), lastTouch);
  },
  touch() {
    const now = Date.now();
    lastTouch = now;
    store.set(activeKey(), now);
  },
  clear() {
    delete memToken[portal];
    try {
      sessionStorage.removeItem(tokenKey());
      sessionStorage.removeItem('lh_phone_src');
    } catch { /* bỏ qua */ }
    store.del(tokenKey());
    store.del(activeKey());
    store.del(noIdleKey());
    store.del('lh_phone_src');
  },
  /** Âm thầm thay bằng token mới (máy chủ tự đổi token định kỳ khi còn hoạt động) — giữ nguyên chế độ "ghi nhớ đăng nhập" đã chọn lúc trước. */
  update(token) { if (!token) return; this.set(token, store.get(tokenKey()) !== null, isAppSession()); },
};

// Theo dõi thao tác người dùng: chỉ tự động đăng xuất khi không hoạt động đủ 5 phút trên bản web máy tính (trên App không bao giờ tự đăng xuất)
if (typeof window !== 'undefined') {
  const onUserActivity = () => {
    const now = Date.now();
    if (now - lastTouch < 3000) return;
    if (!memToken[portal] && !store.get(tokenKey()) && !(() => { try { return sessionStorage.getItem(tokenKey()); } catch { return null; } })()) return;
    session.touch();
    if (mode === 'server' && now - lastServerTouch > 90000) {
      lastServerTouch = now;
      request('GET', 'api/auth/me').catch(() => {});
    }
  };
  ['pointerdown', 'keydown', 'touchstart', 'scroll', 'wheel', 'mousemove'].forEach(ev =>
    window.addEventListener(ev, onUserActivity, { passive: true, capture: true })
  );
  setInterval(() => {
    if (isAppSession()) return;
    const tok = memToken[portal] || (() => { try { return sessionStorage.getItem(tokenKey()) || store.get(tokenKey()); } catch { return store.get(tokenKey()); } })();
    if (!tok) return;
    const last = Number(store.get(activeKey()) || 0);
    if (last && Date.now() - last >= IDLE_TIMEOUT_MS) {
      request('POST', 'api/auth/logout', {}).catch(() => {});
      session.clear();
      window.dispatchEvent(new CustomEvent('auth:expired', { detail: { idle: true } }));
    }
  }, 5000);
}

export function setPortal(p) { portal = p; }
export const getMode = () => mode;

export async function detect() {
  if (mode) return mode;
  try {
    const r = await fetch(apiUrl('api/health'), { cache: 'no-store', headers: { accept: 'application/json' }, signal: AbortSignal.timeout ? AbortSignal.timeout(apiBase() ? 8000 : 15000) : undefined });
    if (r.ok && (r.headers.get('content-type') || '').includes('json')) { const j = await r.json(); if (j.app === 'lehoan-portal') { registerSw(); return (mode = 'server'); } }
  } catch { /* không có máy chủ */ }
  demo = await import('./demo.js');
  await demo.init();
  mode = 'demo';
  return mode;
}

// Cài như ứng dụng (PWA) khi chạy trên máy chủ thật qua trình duyệt (không áp dụng trong app APK)
function registerSw() {
  try {
    if (window.Capacitor || apiBase() || !('serviceWorker' in navigator)) return;
    if (location.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(location.hostname)) return;
    navigator.serviceWorker.register('sw.js').catch(() => { /* bỏ qua */ });
  } catch { /* bỏ qua */ }
}

export class ApiError extends Error { constructor(status, message, details) { super(message); this.status = status; this.details = details; } }

// ---------------------------------------------------------------------------
// Mã hóa dữ liệu API ở tầng ứng dụng (ECDH P-256 + AES-256-GCM), ĐỘC LẬP với HTTPS — xem giải thích
// đầy đủ ở shared/channel.js (phía máy chủ). Mỗi khi mở trang, trình duyệt bắt tay một lần để cùng
// máy chủ có chung một khóa, từ đó thân mọi yêu cầu/phản hồi /api/* được mã hóa — ai mở tab Network
// của trình duyệt cũng chỉ thấy một khối dữ liệu đã mã hóa, không đọc được nội dung thật.
// ---------------------------------------------------------------------------
let channel = null; // { cid, key: CryptoKey } — làm mới mỗi lần tải lại trang (không lưu lại)
const b64 = (buf) => {
  const bytes = new Uint8Array(buf);
  let binary = '';
  const CHUNK = 0x2000; // xử lý từng 8192 byte một — tránh tràn ngăn xếp khi gọi hàm với mảng lớn
  for (let i = 0; i < bytes.length; i += CHUNK) binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
  return btoa(binary);
};
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function ensureChannel() {
  if (channel) return channel;
  if (!(window.crypto?.subtle)) return null; // trình duyệt quá cũ: bỏ qua lớp này, API vẫn chạy bình thường
  try {
    const kp = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
    const rawPub = await crypto.subtle.exportKey('raw', kp.publicKey);
    const res = await fetch(apiUrl('api/handshake'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pub: b64(rawPub) }) });
    if (!res.ok) return null;
    const { cid, pub } = await res.json();
    const serverPubKey = await crypto.subtle.importKey('raw', unb64(pub), { name: 'ECDH', namedCurve: 'P-256' }, false, []);
    const bits = await crypto.subtle.deriveBits({ name: 'ECDH', public: serverPubKey }, kp.privateKey, 256);
    const hash = await crypto.subtle.digest('SHA-256', bits);
    const key = await crypto.subtle.importKey('raw', hash, 'AES-GCM', false, ['encrypt', 'decrypt']);
    channel = { cid, key };
  } catch { channel = null; }
  return channel;
}
async function encEnvelope(key, value) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(JSON.stringify(value === undefined ? null : value));
  const enc = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data));
  // Web Crypto gộp sẵn thẻ xác thực (tag) 16 byte cuối vào cùng bản mã — tách ra để khớp định dạng gói tin với máy chủ (Node tách riêng).
  return { iv: b64(iv), data: b64(enc.slice(0, enc.length - 16)), tag: b64(enc.slice(enc.length - 16)) };
}
async function decEnvelope(key, env) {
  const combined = new Uint8Array([...unb64(env.data), ...unb64(env.tag)]);
  const dec = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(env.iv) }, key, combined);
  const text = new TextDecoder().decode(dec);
  return text && text !== 'null' ? JSON.parse(text) : undefined;
}

async function request(method, path, body, _retried = false) {
  await detect();
  const url = path.startsWith('/') ? path.slice(1) : path;
  let status, data;
  if (mode === 'demo') {
    const [p, qs] = url.split('?');
    const out = await demo.handle({ method, path: '/' + p, query: Object.fromEntries(new URLSearchParams(qs || '')), body, token: session.token });
    status = out.status; data = out.raw ? out : out.body;
    if (out.rotatedToken && session.token) session.update(out.rotatedToken); // máy chủ (bản xem trước) tự đổi token định kỳ khi còn hoạt động
  } else {
    let res;
    const ch = await ensureChannel();
    try {
      const headers = { 'content-type': 'application/json', ...(session.token ? { authorization: 'Bearer ' + session.token } : {}), ...(ch ? { 'x-channel-id': ch.cid } : {}) };
      const sendBody = ch && body !== undefined ? await encEnvelope(ch.key, body) : body;
      res = await fetch(apiUrl(url), { method, headers, body: sendBody !== undefined ? JSON.stringify(sendBody) : undefined });
    } catch { throw new ApiError(0, 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.'); }
    status = res.status;
    if (ch && res.headers.get('x-channel-expired') && !_retried) { // kênh mã hóa hết hạn phía máy chủ → bắt tay lại và thử đúng 1 lần (phân biệt với lỗi 409 nghiệp vụ bình thường, vd. gửi khảo sát trùng)
      channel = null;
      return request(method, path, body, true);
    }
    const newToken = res.headers.get('x-new-token');
    if (newToken && session.token) session.update(newToken); // máy chủ tự đổi token định kỳ khi còn hoạt động để hạn chế dùng lại token cũ bị lộ
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('json')) {
      const j = await res.json();
      data = (ch && j && typeof j.iv === 'string' && typeof j.tag === 'string' && typeof j.data === 'string') ? await decEnvelope(ch.key, j) : j;
    } else {
      data = { raw: true, blob: await res.blob(), filename: decodeURIComponent((/filename\*=UTF-8''([^;]+)/.exec(res.headers.get('content-disposition') || '') || [])[1] || 'tep-tai-ve') };
    }
  }
  if (status === 401 && session.token && !path.includes('/auth/login')) { session.clear(); window.dispatchEvent(new CustomEvent('auth:expired')); }
  if (status < 400 && session.token) { lastServerTouch = Date.now(); session.touch(); }
  if (status >= 400) throw new ApiError(status, data?.error || 'Có lỗi xảy ra.', data?.details);
  return data;
}

export const api = {
  get: (p) => request('GET', p),
  post: (p, b = {}) => request('POST', p, b),
  put: (p, b = {}) => request('PUT', p, b),
  patch: (p, b = {}) => request('PATCH', p, b),
  del: (p) => request('DELETE', p),
  /** Tải lên một tệp đính kèm (ảnh được nén lại cho nhẹ trước khi gửi) → { url, name, size, type, kind } */
  async upload(file) {
    let data;
    if (/^image\/(jpeg|png|webp)$/.test(file.type) && file.size > 350 * 1024) { try { data = await compressImage(file, 1920, 0.85); } catch { /* gửi ảnh gốc */ } }
    if (!data) data = await readDataUrl(file);
    const type = data.slice(5, data.indexOf(';')) || file.type;
    const name = data.startsWith('data:image/jpeg') && !/\.jpe?g$/i.test(file.name) ? file.name.replace(/\.[^.]+$/, '') + '.jpg' : file.name;
    return (await request('POST', 'api/uploads', { name, type: type === 'application/octet-stream' ? '' : type, data })).file;
  },
  /** Tải tệp (Excel…) */
  async download(p, fallbackName = 'du-lieu.xlsx') {
    const out = await request('GET', p);
    const blob = out?.blob || (out?.body ? new Blob([out.body], { type: out?.headers?.['content-type'] || 'application/octet-stream' }) : null);
    if (!blob) { toast('Không thể tạo tệp tải về.', 'warn', 5000); return false; }
    const fn = out.filename || decodeURIComponent((/filename\*=UTF-8''([^;]+)/.exec(out?.headers?.['content-disposition'] || '') || [])[1] || '') || fallbackName;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = fn;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    toast(`Đã xuất ${a.download}`, 'ok');
    return true;
  },
};

/** Báo lỗi API cho người dùng */
export function showError(e) { toast(e?.message || 'Có lỗi xảy ra.', 'bad', 4800); }

// ---------- Realtime ----------
const handlers = new Map();
let es = null;
export const live = {
  on(event, cb) { if (!handlers.has(event)) handlers.set(event, new Set()); handlers.get(event).add(cb); return () => handlers.get(event)?.delete(cb); },
  async connect() {
    await detect();
    if (mode === 'demo') { demo.subscribe((ev, data) => fire(ev, data), () => session.token); return; }
    if (!session.token || es) return;
    es = new EventSource(apiUrl(`api/stream?token=${encodeURIComponent(session.token)}`));
    const events = ['notification', 'alert', 'school-chat:message', 'school-chat:react', 'school-chat:delete', 'school-chat:recall', 'school-chat:lock', 'teacher-chat:message', 'counseling:message', 'counseling:reply', 'report:new', 'report:update', 'quiz:attempt', 'sync', 'settings', 'ai:config', 'data:changed', 'profile:update', 'ready'];
    events.forEach(ev => es.addEventListener(ev, (m) => { try { fire(ev, JSON.parse(m.data)); } catch { /* bỏ qua */ } }));
    es.onopen = () => fire('connection', { online: true });
    es.onerror = () => fire('connection', { online: false });
  },
  disconnect() { es?.close(); es = null; },
};
function fire(ev, data) { handlers.get(ev)?.forEach(cb => { try { cb(data); } catch (e) { console.error(e); } }); handlers.get('*')?.forEach(cb => cb(ev, data)); }
