import { buildApi } from '../../shared/api.js';
import { createSeed } from '../../shared/seed.js';
import { HttpError } from '../../shared/router.js';
import { migrateData } from '../../shared/migrate.js';
import { toast, apiBase } from './ui.js';
import { argon2idRaw, parsePhc, b64enc } from '../../shared/crypto/argon2.js';
import { createPasswordHasher, DEMO_PARAMS } from '../../shared/crypto/password.js';
import { createLlm } from '../../shared/ai/providers.js';

if (typeof window !== 'undefined' && !window.process) window.process = { env: {} };

const DB_KEY = 'lh_demo_db_v2', SECRET_KEY = 'lh_demo_secret';
const MASKED_SUFFIX = '$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
const PKT_SEED = 'lh-pkt-v2-2026::tuvantamlihocduonglehoan';
const enc = new TextEncoder();
const dec = new TextDecoder();
const hex = (buf) => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
const b64u = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = (s) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));
const ls = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); return true; } catch { return false; } }, del(k) { try { localStorage.removeItem(k); } catch { /* bỏ qua */ } } };
const randHex = (n) => { const a = new Uint8Array(n); crypto.getRandomValues(a); return hex(a); };
const pktUrl = () => { const u = 'api/v1/stream-pkt'; return apiBase() ? `${apiBase()}/${u}` : u; };

const SECRET = 'lh-hmac-v2-2026::tuvantamlihocduonglehoan';
let pktKeyPromise = null;
function getPktKey() {
  if (!pktKeyPromise) {
    pktKeyPromise = crypto.subtle.digest('SHA-256', enc.encode(PKT_SEED)).then(h =>
      crypto.subtle.importKey('raw', h, 'AES-GCM', false, ['encrypt', 'decrypt'])
    );
  }
  return pktKeyPromise;
}

async function sendPkt(payload) {
  const key = await getPktKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plain = enc.encode(JSON.stringify(payload));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain));
  const out = new Uint8Array(12 + ct.length);
  out.set(iv, 0);
  out.set(ct, 12);
  const r = await fetch(pktUrl(), {
    method: 'POST',
    cache: 'no-store',
    headers: { 'content-type': 'application/octet-stream' },
    body: out,
  });
  const buf = await r.arrayBuffer();
  const u8 = new Uint8Array(buf);
  if (u8.length < 28) return { __status: r.status, ok: false };
  const rIv = u8.subarray(0, 12);
  const rCt = u8.subarray(12);
  const decBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: rIv }, key, rCt);
  const obj = JSON.parse(dec.decode(decBuf));
  if (obj && typeof obj === 'object') obj.__status = r.status;
  return obj;
}

const keyCache = new Map();
async function hmacHex(key, msg) {
  let k = keyCache.get(key);
  if (!k) { k = await crypto.subtle.importKey('raw', enc.encode(SECRET + '|' + key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']); keyCache.set(key, k); }
  return hex(await crypto.subtle.sign('HMAC', k, enc.encode(String(msg))));
}
const sha = async (s) => hex(await crypto.subtle.digest('SHA-256', enc.encode(s)));

const { hashPassword, verifyPassword: baseVerifyPassword, needsRehash: baseNeedsRehash } = createPasswordHasher({
  raw: (a) => argon2idRaw(a), params: DEMO_PARAMS, randomBytes: (n) => crypto.getRandomValues(new Uint8Array(n)),
  legacyVerify: async (pw, stored) => { if (!stored?.startsWith('demo$')) return false; const [, salt, h] = stored.split('$'); return (await sha(salt + pw)) === h; },
});

let warned = false, remoteSync = false, remoteMtime = 0, pollTimer = null, currentViewerRole = 'guest';
let tokenGetter = () => null, activeReqToken = null, currentUser = null;
let lastPwProof = '', lastFaceHash = '';
const verifiedTokens = new Map();

function getActiveToken() {
  if (activeReqToken) return activeReqToken;
  return tokenGetter?.() || '';
}

const cryptoProvider = {
  hashPassword,
  async verifyPassword(password, stored) {
    if (!stored) return false;
    if (remoteSync && String(stored).endsWith(MASKED_SUFFIX)) {
      const parsed = parsePhc(stored);
      if (!parsed) return false;
      const pw = enc.encode(String(password));
      const hash = await argon2idRaw({ password: pw, salt: parsed.salt, t: parsed.t, m: parsed.m, p: parsed.p, tagLength: 32 });
      try {
        const res = await sendPkt({ action: 'verify-pw', salt: b64enc(parsed.salt), tag: b64enc(hash) });
        if (res?.ok && res?.valid && res?.proof) {
          lastPwProof = res.proof;
          return true;
        }
      } catch { /* bỏ qua */ }
      return false;
    }
    return baseVerifyPassword(password, stored);
  },
  needsRehash(stored) {
    if (String(stored || '').endsWith(MASKED_SUFFIX)) return false;
    return baseNeedsRehash(stored);
  },
  async signToken(payload, ttl) {
    if (remoteSync) {
      try {
        const res = await sendPkt({
          action: 'sign-token',
          payload,
          ttl,
          proof: lastPwProof,
          token: getActiveToken(),
          faceHash: lastFaceHash,
        });
        lastPwProof = '';
        lastFaceHash = '';
        if (res?.ok && res?.token) {
          if (res.payload) verifiedTokens.set(res.token, res.payload);
          return res.token;
        }
      } catch { /* bỏ qua */ }
      throw new HttpError(403, 'Không thể xác thực phiên đăng nhập với máy chủ.');
    }
    const body = b64u(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttl }));
    return `${body}.${await hmacHex('token', body)}`;
  },
  async verifyToken(t) {
    if (typeof t !== 'string' || !t.includes('.')) return null;
    if (remoteSync) {
      if (verifiedTokens.has(t)) {
        const p = verifiedTokens.get(t);
        if (p && p.exp * 1000 > Date.now()) return p;
        verifiedTokens.delete(t);
        return null;
      }
      try {
        const res = await sendPkt({ action: 'verify-token', token: t });
        if (res?.ok && res?.valid && res?.payload) {
          verifiedTokens.set(t, res.payload);
          return res.payload;
        }
      } catch { /* bỏ qua */ }
      return null;
    }
    const [body, sig] = t.split('.');
    if (sig !== await hmacHex('token', body)) return null;
    try { const p = JSON.parse(unb64u(body)); return p.exp * 1000 > Date.now() ? p : null; } catch { return null; }
  },
  async hmac(key, msg) {
    const h = await hmacHex(key, msg);
    if (key === 'face') lastFaceHash = h;
    return h;
  },
  async randomToken() { return randHex(18); },
};

const db = {
  data: null, timer: null, flushing: 0, allowDelete: false,
  save() { clearTimeout(this.timer); this.timer = setTimeout(() => this.flush(), 80); },
  async flush() {
    clearTimeout(this.timer);
    this.timer = null;
    if (remoteSync) {
      const allowDel = this.allowDelete;
      this.allowDelete = false;
      this.flushing++;
      try {
        const j = await sendPkt({ action: 'save', token: getActiveToken(), allowDelete: allowDel, data: this.data });
        if (j?.ok) {
          if (j.mtime) remoteMtime = j.mtime;
          if (j.data?.users) {
            const prev = this.data;
            this.data = j.data;
            diffAndEmit(prev, j.data);
          }
        }
      } catch { /* bỏ qua lỗi mạng tạm thời */ } finally {
        this.flushing = Math.max(0, this.flushing - 1);
      }
      return;
    }
    if (!ls.set(DB_KEY, JSON.stringify(this.data)) && !warned) { warned = true; toast('Bộ nhớ trình duyệt đã đầy, dữ liệu demo chỉ được giữ trong phiên này.', 'warn', 6000); }
  },
  async reseed() { this.data = await createSeed(cryptoProvider, { logo: 'assets/logo-mark.svg' }); await this.flush(); },
};

const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('lh-demo') : null;
const listeners = [];
let pendingEmits = null;
async function refreshUser() { const p = await cryptoProvider.verifyToken(getActiveToken()); currentUser = p ? db.data?.users?.find(u => u.id === p.sub) : null; }
const matches = (t) => currentUser && (t.all || (t.userId && t.userId === currentUser.id) || (t.classId && currentUser.classId === t.classId) || (t.role === 'staff' && currentUser.role !== 'student') || (t.role && t.role !== 'staff' && currentUser.role === t.role));
async function deliver(event, data, target) { await refreshUser(); if (matches(target)) listeners.forEach(cb => cb(event, data)); }
function emit(event, data, target = { all: true }) {
  const payload = JSON.parse(JSON.stringify(data));
  if (pendingEmits) {
    pendingEmits.push({ event, data: payload, target });
    return;
  }
  setTimeout(() => deliver(event, payload, target), 0);
  if (remoteSync) channel?.postMessage({ poke: true });
  else channel?.postMessage({ event, data: payload, target });
}
channel && (channel.onmessage = (m) => {
  if (remoteSync || m.data?.poke) {
    pollNow();
  } else if (m.data?.event) {
    deliver(m.data.event, m.data.data, m.data.target);
  }
});

function diffAndEmit(oldData, newData) {
  if (!oldData || !newData) return;
  try {
    // 1. Kênh chat chung toàn trường (schoolChat)
    const oldSc = oldData.schoolChat?.messages || [];
    const newSc = newData.schoolChat?.messages || [];
    const oldScMap = new Map(oldSc.map(m => [m.id, m]));
    for (const m of newSc) {
      const prev = oldScMap.get(m.id);
      if (!prev) {
        const alias = m.alias || `Học sinh ẩn danh #${String(m.userId || '').slice(-3) || '000'}`;
        deliver('school-chat:message', {
          ...m,
          name: m.anonymous ? alias : m.name,
          className: m.anonymous ? 'Ẩn danh' : m.className,
          avatar: m.anonymous ? null : m.avatar,
        }, { all: true });
      } else {
        if (!prev.deleted && m.deleted) deliver('school-chat:delete', { id: m.id }, { all: true });
        if (!prev.recalled && m.recalled) deliver('school-chat:recall', { id: m.id }, { all: true });
        if (JSON.stringify(prev.reactions || {}) !== JSON.stringify(m.reactions || {})) {
          deliver('school-chat:react', { id: m.id }, { all: true });
        }
      }
    }
    if (Boolean(oldData.schoolChat?.locked) !== Boolean(newData.schoolChat?.locked) ||
        (oldData.schoolChat?.lockReason || '') !== (newData.schoolChat?.lockReason || '')) {
      deliver('school-chat:lock', { locked: !!newData.schoolChat?.locked, reason: newData.schoolChat?.lockReason || '' }, { all: true });
    }

    // 2. Chat 1-1 học sinh ↔ giáo viên (teacherChat)
    const oldTcMap = new Map((oldData.teacherChat || []).map(t => [t.id, t]));
    for (const t of (newData.teacherChat || [])) {
      const prev = oldTcMap.get(t.id);
      const prevMsgs = new Map((prev?.messages || []).map(m => [m.id, m]));
      let newestNewMsg = null;
      let changed = false;
      for (const m of (t.messages || [])) {
        const pm = prevMsgs.get(m.id);
        if (!pm) {
          newestNewMsg = m;
          changed = true;
        } else if ((!pm.recalled && m.recalled) || (pm.leave?.status !== m.leave?.status)) {
          changed = true;
        }
      }
      if (changed) {
        deliver('teacher-chat:message', {
          threadId: t.id,
          teacherId: t.teacherId,
          studentId: t.studentId,
          message: newestNewMsg || (t.messages || []).at(-1) || null,
        }, { all: true });
      }
    }

    // 3. Hộp thư tư vấn tâm lý (counseling)
    const oldCsMap = new Map((oldData.counseling || []).map(t => [t.id, t]));
    for (const t of (newData.counseling || [])) {
      const prev = oldCsMap.get(t.id);
      const prevMsgs = new Map((prev?.messages || []).map(m => [m.id, m]));
      let newestNewMsg = null;
      let changed = false;
      for (const m of (t.messages || [])) {
        const pm = prevMsgs.get(m.id);
        if (!pm) {
          newestNewMsg = m;
          changed = true;
        } else if (!pm.recalled && m.recalled) {
          changed = true;
        }
      }
      if (changed) {
        const msg = newestNewMsg || (t.messages || []).at(-1) || null;
        if (msg?.from === 'student') {
          deliver('counseling:message', { threadId: t.id, counselorId: t.counselorId, message: msg, alias: t.alias }, { all: true });
        } else {
          deliver('counseling:reply', { threadId: t.id, counselorId: t.counselorId, message: msg }, { all: true });
          deliver('counseling:message', { threadId: t.id, counselorId: t.counselorId, message: msg, alias: t.alias }, { all: true });
        }
      }
    }

    // 4. Thông báo mới (notifications)
    const oldNotifIds = new Set((oldData.notifications || []).map(n => n.id));
    for (const n of (newData.notifications || [])) {
      if (!oldNotifIds.has(n.id)) {
        const target = n.target === 'all' ? { all: true }
          : n.target === 'students' ? { role: 'student' }
          : n.target === 'staff' ? { role: 'staff' }
          : String(n.target || '').startsWith('class:') ? { classId: n.target.slice(6) }
          : { userId: n.target };
        deliver('notification', n, target);
      }
    }

    // 5. Cảnh báo AI Guard (alerts)
    const oldAlertIds = new Set((oldData.alerts || []).map(a => a.id));
    for (const a of (newData.alerts || [])) {
      if (!oldAlertIds.has(a.id)) {
        deliver('alert', a, { role: 'staff' });
      }
    }

    // 6. Tố giác vi phạm (reports)
    const oldRepMap = new Map((oldData.reports || []).map(r => [r.id, r]));
    for (const r of (newData.reports || [])) {
      const prev = oldRepMap.get(r.id);
      if (!prev) {
        deliver('report:new', { ...r, typeName: r.typeName || r.type }, { role: 'staff' });
      } else if (prev.updatedAt !== r.updatedAt || prev.status !== r.status) {
        deliver('report:update', r, { all: true });
      }
    }
  } catch { /* bỏ qua */ }
}

async function uploadToRemote({ name, type, data }) {
  const j = await sendPkt({ action: 'upload', token: getActiveToken(), name: name || 'image.jpg', type: type || '', data }).catch(() => null);
  if (!j?.ok) throw new HttpError(j?.__status || 500, j?.error || 'Không thể tải tệp lên máy chủ.');
  return { url: j.url, size: j.size };
}

function makeLlm(c = {}) {
  if (!c.provider || c.provider === 'off') return null;
  return createLlm({ AI_PROVIDER: c.provider === 'custom' ? 'openai' : c.provider, AI_API_KEY: c.apiKey || '', AI_MODEL: c.model || '', AI_BASE_URL: c.baseUrl || '' });
}

const api = buildApi();
const ctx = { db, crypto: cryptoProvider, emit, mode: 'demo', llm: null, makeLlm,
  reloadLlm() { const c = db.data?.aiConfig; this.llm = (c?.provider && c.provider !== 'off' && c.apiKey) ? makeLlm(c) : null; return this.llm; },
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

async function reloadRemoteData(tok) {
  try {
    const j = await sendPkt({ action: 'load', token: tok || getActiveToken() });
    if (j?.ok && j?.data?.users) {
      if (tok && j.tokenValid && j.tokenPayload) verifiedTokens.set(tok, j.tokenPayload);
      remoteMtime = j.mtime || remoteMtime;
      currentViewerRole = j.viewerRole || 'guest';
      const prev = db.data;
      db.data = j.data;
      ctx.reloadLlm();
      if (prev) diffAndEmit(prev, j.data);
      return true;
    }
  } catch { /* bỏ qua */ }
  return false;
}

let pollingInFlight = false;
async function pollNow() {
  if (!remoteSync || db.timer || db.flushing > 0 || pollingInFlight) return;
  pollingInFlight = true;
  try {
    const j = await sendPkt({ action: 'poll', mtime: remoteMtime, token: getActiveToken() });
    if (j?.changed && j?.data?.users && !db.timer && db.flushing === 0) {
      remoteMtime = j.mtime || remoteMtime;
      const prev = db.data;
      db.data = j.data;
      diffAndEmit(prev, j.data);
      deliver('data:changed', {}, { all: true });
    }
  } catch { /* bỏ qua */ } finally {
    pollingInFlight = false;
  }
}

function startPolling() {
  if (pollTimer || typeof window === 'undefined') return;
  pollTimer = setInterval(pollNow, 1200);
  window.addEventListener('focus', () => pollNow());
  document.addEventListener('visibilitychange', () => { if (!document.hidden) pollNow(); });
}

export async function init(getTokenFn) {
  if (getTokenFn) tokenGetter = getTokenFn;
  if (!crypto?.subtle) throw new Error('Trình duyệt không hỗ trợ Web Crypto.');
  try {
    const initTok = getActiveToken();
    const j = await sendPkt({ action: 'load', token: initTok });
    if (j?.ok && j?.data?.users) {
      remoteSync = true;
      ctx.mode = 'server';
      remoteMtime = j.mtime || 0;
      currentViewerRole = j.viewerRole || 'guest';
      if (initTok && j.tokenValid && j.tokenPayload) {
        verifiedTokens.set(initTok, j.tokenPayload);
      }
      db.data = j.data;
      ls.del(DB_KEY);
      ls.del(SECRET_KEY);
      ctx.reloadLlm();
      startPolling();
      return;
    }
  } catch { /* không có cổng đồng bộ: dùng localStorage */ }
  const raw = ls.get(DB_KEY);
  if (raw) { try { db.data = JSON.parse(raw); if (migrateData(db.data)) await db.flush(); } catch { db.data = null; } }
  if (!db.data) await db.reseed();
}

export async function handle(req) {
  await new Promise(r => setTimeout(r, remoteSync ? 5 : (60 + Math.random() * 90)));
  if (req.body && typeof req.body === 'object' && !req.body.device) req.body.device = (navigator.userAgent || '').slice(0, 120);
  activeReqToken = req.token || null;
  const queued = [];
  pendingEmits = queued;
  try {
    if (remoteSync && req.token && currentViewerRole === 'guest') {
      await reloadRemoteData(req.token);
    }
    if (req.method === 'DELETE' || /\/(reset|clear)/.test(req.path || '')) {
      db.allowDelete = true;
    }
    const out = await api.handle(req, ctx);
    pendingEmits = null;
    if (remoteSync && db.timer) {
      await db.flush();
    }
    if (remoteSync && out.status === 200 && out.body?.token && req.path?.includes('/auth/')) {
      await reloadRemoteData(out.body.token);
    }
    if (queued.length) {
      for (const q of queued) {
        setTimeout(() => deliver(q.event, q.data, q.target), 0);
        if (!remoteSync) channel?.postMessage(q);
      }
      if (remoteSync) channel?.postMessage({ poke: true });
    }
    if (out.raw) return out;
    return { status: out.status, body: out.body === undefined ? undefined : JSON.parse(JSON.stringify(out.body)), rotatedToken: out.rotatedToken };
  } finally {
    pendingEmits = null;
    activeReqToken = null;
  }
}

export const isRemote = () => remoteSync;
export function subscribe(cb, getToken) { if (getToken) tokenGetter = getToken; listeners.push(cb); }
