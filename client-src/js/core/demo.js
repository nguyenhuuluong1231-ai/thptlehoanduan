// Chế độ demo / cPanel PHP-Sync: chạy nguyên bộ REST API (thư mục shared/) ngay trong trình duyệt.
// Nếu máy chủ có sync.php (cPanel LiteSpeed/Apache), tự động đồng bộ cơ sở dữ liệu thật (1.517 tài khoản)
// và lưu tệp đính kèm trực tiếp trên máy chủ hosting; nếu không có thì lưu ở localStorage của trình duyệt.
import { buildApi } from '../../shared/api.js';
import { createSeed } from '../../shared/seed.js';
import { HttpError } from '../../shared/router.js';
import { migrateData } from '../../shared/migrate.js';
import { toast, apiBase } from './ui.js';
import { argon2idRaw } from '../../shared/crypto/argon2.js';
import { createPasswordHasher, DEMO_PARAMS } from '../../shared/crypto/password.js';
import { createLlm } from '../../shared/ai/providers.js';

if (typeof window !== 'undefined' && !window.process) window.process = { env: {} };

const DB_KEY = 'lh_demo_db_v2', SECRET_KEY = 'lh_demo_secret';
const enc = new TextEncoder();
const hex = (buf) => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
const b64u = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = (s) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));
const ls = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); return true; } catch { return false; } }, del(k) { try { localStorage.removeItem(k); } catch { /* bỏ qua */ } } };
const randHex = (n) => { const a = new Uint8Array(n); crypto.getRandomValues(a); return hex(a); };
const syncUrl = (qs = '') => { const u = 'sync.php' + (qs ? `?${qs}` : ''); return apiBase() ? `${apiBase()}/${u}` : u; };

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

let warned = false, remoteSync = false, remoteMtime = 0, pollTimer = null;
const db = {
  data: null, timer: null,
  save() { clearTimeout(this.timer); this.timer = setTimeout(() => this.flush(), 180); },
  async flush() {
    clearTimeout(this.timer);
    if (remoteSync) {
      try {
        const r = await fetch(syncUrl('action=save'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ data: this.data }) });
        if (r.ok) { const j = await r.json(); if (j?.mtime) remoteMtime = j.mtime; }
      } catch { /* bỏ qua lỗi mạng tạm thời */ }
      ls.set(DB_KEY, JSON.stringify(this.data));
      return;
    }
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

async function uploadToRemote({ name, type, data }) {
  const r = await fetch(syncUrl('action=upload'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: name || 'image.jpg', type: type || '', data }) });
  const j = await r.json().catch(() => null);
  if (!r.ok || !j?.ok) throw new HttpError(r.status || 500, j?.error || 'Không thể tải tệp lên máy chủ.');
  return { url: j.url, size: j.size };
}

function makeLlm(c = {}) {
  if (!c.provider || c.provider === 'off') return null;
  return createLlm({ AI_PROVIDER: c.provider === 'custom' ? 'openai' : c.provider, AI_API_KEY: c.apiKey || '', AI_MODEL: c.model || '', AI_BASE_URL: c.baseUrl || '' });
}

const api = buildApi();
const ctx = { db, crypto: cryptoProvider, emit, mode: 'demo', llm: null, makeLlm,
  reloadLlm() { const c = db.data?.aiConfig; this.llm = (c?.provider && c.provider !== 'off') ? makeLlm(c) : null; return this.llm; },
  lanUrls: () => (typeof location !== 'undefined' ? [location.origin] : []),
  reseed: () => db.reseed(),
  async storeUpload({ name, type, data }) {
    if (remoteSync) return uploadToRemote({ name, type, data });
    const size = Math.round((data.length - data.indexOf(',') - 1) * 0.75);
    if (size > 3 * 1024 * 1024) throw new HttpError(413, 'Bản xem trước chỉ nhận tệp tối đa 3 MB. Trên máy chủ thật giới hạn là 25 MB.');
    return { url: data, size };
  },
  async storeFile(v) {
    if (typeof v === 'string' && /^(assets|uploads)\//.test(v)) return v;
    if (typeof v === 'string' && /^data:image\/(jpeg|png|webp|gif);base64,/.test(v)) {
      if (remoteSync) return (await uploadToRemote({ name: 'image.jpg', data: v })).url;
      return v;
    }
    throw new HttpError(400, 'Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF.');
  } };

// AI thật trong bản xem trước: dùng Claude của chính người xem (khả năng “sample” của trang artifact), nếu có.
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

function startPolling() {
  if (pollTimer || typeof window === 'undefined') return;
  pollTimer = setInterval(async () => {
    if (!remoteSync || db.timer) return;
    try {
      const r = await fetch(syncUrl(`action=poll&mtime=${remoteMtime}`), { cache: 'no-store' });
      if (!r.ok) return;
      const j = await r.json();
      if (j?.changed && j?.data?.users) {
        remoteMtime = j.mtime || remoteMtime;
        db.data = j.data;
        deliver('data:changed', {}, { all: true });
        deliver('sync', {}, { all: true });
      }
    } catch { /* bỏ qua */ }
  }, 4000);
}

export async function init() {
  if (!crypto?.subtle) throw new Error('Trình duyệt không hỗ trợ Web Crypto.');
  try {
    const r = await fetch(syncUrl('action=load'), { cache: 'no-store', headers: { accept: 'application/json' } });
    if (r.ok && (r.headers.get('content-type') || '').includes('json')) {
      const j = await r.json();
      if (j?.secret) { SECRET = j.secret; keyCache.clear(); ls.set(SECRET_KEY, SECRET); }
      if (j?.ok && j?.data?.users) {
        remoteSync = true;
        ctx.mode = 'server';
        remoteMtime = j.mtime || 0;
        db.data = j.data;
        if (migrateData(db.data)) await db.flush();
        ctx.reloadLlm();
        startPolling();
        return;
      }
    }
  } catch { /* không có sync.php: dùng localStorage */ }
  const raw = ls.get(DB_KEY);
  if (raw) { try { db.data = JSON.parse(raw); if (migrateData(db.data)) await db.flush(); } catch { db.data = null; } }
  if (!db.data) await db.reseed();
}

export async function handle(req) {
  await new Promise(r => setTimeout(r, remoteSync ? 10 : (60 + Math.random() * 90)));
  if (req.body && typeof req.body === 'object' && !req.body.device) req.body.device = (navigator.userAgent || '').slice(0, 120);
  const out = await api.handle(req, ctx);
  if (out.raw) return out;
  return { status: out.status, body: out.body === undefined ? undefined : JSON.parse(JSON.stringify(out.body)), rotatedToken: out.rotatedToken };
}

export const isRemote = () => remoteSync;
export function subscribe(cb, getToken) { tokenGetter = getToken; listeners.push(cb); }
