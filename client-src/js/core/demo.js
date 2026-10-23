// Chế độ demo: chạy nguyên bộ REST API (thư mục shared/) ngay trong trình duyệt.
// Dữ liệu lưu ở localStorage của người xem; nhiều tab đồng bộ qua BroadcastChannel.
import { buildApi } from '../../shared/api.js';
import { createSeed } from '../../shared/seed.js';
import { HttpError } from '../../shared/router.js';
import { migrateData } from '../../shared/migrate.js';
import { toast } from './ui.js';
import { argon2idRaw } from '../../shared/crypto/argon2.js';
import { createPasswordHasher, DEMO_PARAMS } from '../../shared/crypto/password.js';

const DB_KEY = 'lh_demo_db_v2', SECRET_KEY = 'lh_demo_secret';
const enc = new TextEncoder();
const hex = (buf) => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
const b64u = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = (s) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));
const ls = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); return true; } catch { return false; } }, del(k) { try { localStorage.removeItem(k); } catch { /* bỏ qua */ } } };
const randHex = (n) => { const a = new Uint8Array(n); crypto.getRandomValues(a); return hex(a); };

let SECRET = ls.get(SECRET_KEY);
if (!SECRET) { SECRET = randHex(32); ls.set(SECRET_KEY, SECRET); }

const keyCache = new Map();
async function hmacHex(key, msg) {
  let k = keyCache.get(key);
  if (!k) { k = await crypto.subtle.importKey('raw', enc.encode(SECRET + '|' + key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']); keyCache.set(key, k); }
  return hex(await crypto.subtle.sign('HMAC', k, enc.encode(String(msg))));
}
const sha = async (s) => hex(await crypto.subtle.digest('SHA-256', enc.encode(s)));

// Argon2id thật ngay trong trình duyệt (tham số nhẹ hơn máy chủ để không treo giao diện bản xem trước).
const { hashPassword, verifyPassword, needsRehash } = createPasswordHasher({
  raw: (a) => argon2idRaw(a), params: DEMO_PARAMS, randomBytes: (n) => crypto.getRandomValues(new Uint8Array(n)),
  legacyVerify: async (pw, stored) => { if (!stored?.startsWith('demo$')) return false; const [, salt, h] = stored.split('$'); return (await sha(salt + pw)) === h; }, // hash demo kiểu cũ (SHA-256) từ phiên bản trước
});
const cryptoProvider = {
  hashPassword, verifyPassword, needsRehash,
  async signToken(payload, ttl) { const body = b64u(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttl })); return `${body}.${await hmacHex('token', body)}`; },
  async verifyToken(t) { if (typeof t !== 'string' || !t.includes('.')) return null; const [body, sig] = t.split('.'); if (sig !== await hmacHex('token', body)) return null; try { const p = JSON.parse(unb64u(body)); return p.exp * 1000 > Date.now() ? p : null; } catch { return null; } },
  hmac: hmacHex,
  async randomToken() { return randHex(18); },
};

let warned = false;
const db = {
  data: null, timer: null,
  save() { clearTimeout(this.timer); this.timer = setTimeout(() => this.flush(), 200); },
  async flush() {
    clearTimeout(this.timer);
    if (!ls.set(DB_KEY, JSON.stringify(this.data)) && !warned) { warned = true; toast('Bộ nhớ trình duyệt đã đầy, dữ liệu demo chỉ được giữ trong phiên này.', 'warn', 6000); }
  },
  async reseed() { this.data = await createSeed(cryptoProvider, { logo: 'assets/logo-mark.svg' }); await this.flush(); },
};

const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('lh-demo') : null;
const listeners = [];
let tokenGetter = () => null, currentUser = null;
async function refreshUser() { const p = await cryptoProvider.verifyToken(tokenGetter()); currentUser = p ? db.data.users.find(u => u.id === p.sub) : null; }
const matches = (t) => currentUser && (t.all || (t.userId && t.userId === currentUser.id) || (t.classId && currentUser.classId === t.classId) || (t.role === 'staff' && currentUser.role !== 'student') || (t.role && t.role !== 'staff' && currentUser.role === t.role));
async function deliver(event, data, target) { await refreshUser(); if (matches(target)) listeners.forEach(cb => cb(event, data)); }
function emit(event, data, target = { all: true }) {
  const payload = JSON.parse(JSON.stringify(data));
  setTimeout(() => deliver(event, payload, target), 0);
  channel?.postMessage({ event, data: payload, target });
}
channel && (channel.onmessage = (m) => deliver(m.data.event, m.data.data, m.data.target));
addEventListener('storage', (e) => { if (e.key === DB_KEY && e.newValue) { try { db.data = JSON.parse(e.newValue); } catch { /* bỏ qua */ } } });

const api = buildApi();
const ctx = { db, crypto: cryptoProvider, emit, mode: 'demo', llm: null, reseed: () => db.reseed(),
  // Bản xem trước: tệp đính kèm giữ dạng data URL trong bộ nhớ trình duyệt nên giới hạn nhỏ hơn máy chủ thật.
  async storeUpload({ data }) {
    const size = Math.round((data.length - data.indexOf(',') - 1) * 0.75);
    if (size > 3 * 1024 * 1024) throw new HttpError(413, 'Bản xem trước chỉ nhận tệp tối đa 3 MB. Trên máy chủ thật giới hạn là 25 MB.');
    return { url: data, size };
  },
  async storeFile(v) { if (typeof v === 'string' && (/^data:image\/(jpeg|png|webp|gif);base64,/.test(v) || /^(assets|uploads)\//.test(v))) return v; throw new HttpError(400, 'Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF.'); } };

// AI thật trong bản xem trước: dùng Claude của chính người xem (khả năng “sample” của trang artifact), nếu có.
// Trên máy chủ Node.js, AI được cấu hình bằng khóa API trong .env (xem shared/ai/providers.js).
const STOP_CODES = ['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed'];
(async () => {
  try {
    const sample = typeof window !== 'undefined' && window.claude?.use ? await window.claude.use('sample') : null;
    if (!sample) return;
    const llm = async ({ system, messages, purpose }) => {
      const turns = [{ role: 'user', content: `${system}\n\n(Hết phần hướng dẫn hệ thống.)` }, ...messages];
      const opts = { modelTier: 'quick' };
      if (purpose !== 'scam') opts.cache = false;
      try { return (await sample(turns, opts)).text; } catch (e) {
        if (STOP_CODES.includes(e?.code)) ctx.llm = null;
        throw new Error(e?.code || 'sample_error');
      }
    };
    ctx.llm = Object.assign(llm, { provider: 'claude', model: 'claude', label: 'Claude · bản xem trước' });
  } catch { /* không có AI: dùng bộ luật */ }
})();

export async function init() {
  if (!crypto?.subtle) throw new Error('Trình duyệt không hỗ trợ Web Crypto.');
  const raw = ls.get(DB_KEY);
  if (raw) { try { db.data = JSON.parse(raw); if (migrateData(db.data)) await db.flush(); } catch { db.data = null; } }
  if (!db.data) await db.reseed();
}

export async function handle(req) {
  await new Promise(r => setTimeout(r, 60 + Math.random() * 90));
  if (req.body && typeof req.body === 'object' && !req.body.device) req.body.device = (navigator.userAgent || '').slice(0, 120);
  const out = await api.handle(req, ctx);
  if (out.raw) return out;
  return { status: out.status, body: out.body === undefined ? undefined : JSON.parse(JSON.stringify(out.body)), rotatedToken: out.rotatedToken };
}

export function subscribe(cb, getToken) { tokenGetter = getToken; listeners.push(cb); }
