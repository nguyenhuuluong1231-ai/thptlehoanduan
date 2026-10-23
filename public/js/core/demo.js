const _lhD=(s)=>{try{return decodeURIComponent(escape(atob(s)));}catch{return atob(s);}};
import { buildApi } from '../../shared/api.js';
import { createSeed } from '../../shared/seed.js';
import { HttpError } from '../../shared/router.js';
import { migrateData } from '../../shared/migrate.js';
import { toast, apiBase } from './ui.js';
import { argon2idRaw, parsePhc, b64enc } from '../../shared/crypto/argon2.js';
import { createPasswordHasher, DEMO_PARAMS } from '../../shared/crypto/password.js';
import { createLlm } from '../../shared/ai/providers.js';
if (typeof window !== _lhD("dW5kZWZpbmVk") && !window.process) window.process = { env: {} };
const DB_KEY = _lhD("bGhfZGVtb19kYl92Mg=="), SECRET_KEY = _lhD("bGhfZGVtb19zZWNyZXQ=");
const MASKED_SUFFIX = _lhD("JEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUE=");
const PKT_SEED = _lhD("bGgtcGt0LXYyLTIwMjY6OnR1dmFudGFtbGlob2NkdW9uZ2xlaG9hbg==");
const enc = new TextEncoder();
const dec = new TextDecoder();
const hex = (buf) => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, _lhD("MA=="))).join('');
const b64u = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, _lhD("LQ==")).replace(/\//g, _lhD("Xw==")).replace(/=+$/, '');
const unb64u = (s) => decodeURIComponent(escape(atob(s.replace(/-/g, _lhD("Kw==")).replace(/_/g, _lhD("Lw==")))));
const ls = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); return true; } catch { return false; } }, del(k) { try { localStorage.removeItem(k); } catch {  } } };
const randHex = (n) => { const a = new Uint8Array(n); crypto.getRandomValues(a); return hex(a); };
const pktUrl = () => { const u = _lhD("YXBpL3YxL3N0cmVhbS1wa3Q="); return apiBase() ? `${apiBase()}${_lhD("Lw==")}${u}` : u; };
let SECRET = randHex(32);
let pktKeyPromise = null;
function getPktKey() {
if (!pktKeyPromise) {
pktKeyPromise = crypto.subtle.digest(_lhD("U0hBLTI1Ng=="), enc.encode(PKT_SEED)).then(h =>
crypto.subtle.importKey(_lhD("cmF3"), h, _lhD("QUVTLUdDTQ=="), false, [_lhD("ZW5jcnlwdA=="), _lhD("ZGVjcnlwdA==")])
);
}
return pktKeyPromise;
}
async function sendPkt(payload) {
const key = await getPktKey();
const iv = crypto.getRandomValues(new Uint8Array(12));
const plain = enc.encode(JSON.stringify(payload));
const ct = new Uint8Array(await crypto.subtle.encrypt({ name: _lhD("QUVTLUdDTQ=="), iv }, key, plain));
const out = new Uint8Array(12 + ct.length);
out.set(iv, 0);
out.set(ct, 12);
const r = await fetch(pktUrl(), {
method: _lhD("UE9TVA=="),
cache: _lhD("bm8tc3RvcmU="),
headers: { 'content-type': _lhD("YXBwbGljYXRpb24vb2N0ZXQtc3RyZWFt") },
body: out,
});
const buf = await r.arrayBuffer();
const u8 = new Uint8Array(buf);
if (u8.length < 28) return { __status: r.status, ok: false };
const rIv = u8.subarray(0, 12);
const rCt = u8.subarray(12);
const decBuf = await crypto.subtle.decrypt({ name: _lhD("QUVTLUdDTQ=="), iv: rIv }, key, rCt);
const obj = JSON.parse(dec.decode(decBuf));
if (obj && typeof obj === _lhD("b2JqZWN0")) obj.__status = r.status;
return obj;
}
const keyCache = new Map();
async function hmacHex(key, msg) {
let k = keyCache.get(key);
if (!k) { k = await crypto.subtle.importKey(_lhD("cmF3"), enc.encode(SECRET + _lhD("fA==") + key), { name: _lhD("SE1BQw=="), hash: _lhD("U0hBLTI1Ng==") }, false, [_lhD("c2lnbg==")]); keyCache.set(key, k); }
return hex(await crypto.subtle.sign(_lhD("SE1BQw=="), k, enc.encode(String(msg))));
}
const sha = async (s) => hex(await crypto.subtle.digest(_lhD("U0hBLTI1Ng=="), enc.encode(s)));
const { hashPassword, verifyPassword: baseVerifyPassword, needsRehash: baseNeedsRehash } = createPasswordHasher({
raw: (a) => argon2idRaw(a), params: DEMO_PARAMS, randomBytes: (n) => crypto.getRandomValues(new Uint8Array(n)),
legacyVerify: async (pw, stored) => { if (!stored?.startsWith(_lhD("ZGVtbyQ="))) return false; const [, salt, h] = stored.split(_lhD("JA==")); return (await sha(salt + pw)) === h; },
});
let warned = false, remoteSync = false, remoteMtime = 0, pollTimer = null, currentViewerRole = _lhD("Z3Vlc3Q=");
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
const res = await sendPkt({ action: _lhD("dmVyaWZ5LXB3"), salt: b64enc(parsed.salt), tag: b64enc(hash) });
if (res?.ok && res?.valid && res?.proof) {
lastPwProof = res.proof;
return true;
}
} catch {  }
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
action: _lhD("c2lnbi10b2tlbg=="),
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
} catch {  }
throw new HttpError(403, _lhD("S2jDtG5nIHRo4buDIHjDoWMgdGjhu7FjIHBoacOqbiDEkcSDbmcgbmjhuq1wIHbhu5tpIG3DoXkgY2jhu6cu"));
}
const body = b64u(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttl }));
return `${body}${_lhD("Lg==")}${await hmacHex(_lhD("dG9rZW4="), body)}`;
},
async verifyToken(t) {
if (typeof t !== _lhD("c3RyaW5n") || !t.includes(_lhD("Lg=="))) return null;
if (remoteSync) {
if (verifiedTokens.has(t)) {
const p = verifiedTokens.get(t);
if (p && p.exp * 1000 > Date.now()) return p;
verifiedTokens.delete(t);
return null;
}
try {
const res = await sendPkt({ action: _lhD("dmVyaWZ5LXRva2Vu"), token: t });
if (res?.ok && res?.valid && res?.payload) {
verifiedTokens.set(t, res.payload);
return res.payload;
}
} catch {  }
return null;
}
const [body, sig] = t.split(_lhD("Lg=="));
if (sig !== await hmacHex(_lhD("dG9rZW4="), body)) return null;
try { const p = JSON.parse(unb64u(body)); return p.exp * 1000 > Date.now() ? p : null; } catch { return null; }
},
async hmac(key, msg) {
const h = await hmacHex(key, msg);
if (key === _lhD("ZmFjZQ==")) lastFaceHash = h;
return h;
},
async randomToken() { return randHex(18); },
};
const db = {
data: null, timer: null,
save() { clearTimeout(this.timer); this.timer = setTimeout(() => this.flush(), 120); },
async flush() {
clearTimeout(this.timer);
this.timer = null;
if (remoteSync) {
try {
const j = await sendPkt({ action: _lhD("c2F2ZQ=="), token: getActiveToken(), data: this.data });
if (j?.ok && j?.mtime) remoteMtime = j.mtime;
} catch {  }
return;
}
if (!ls.set(DB_KEY, JSON.stringify(this.data)) && !warned) { warned = true; toast(_lhD("QuG7mSBuaOG7myB0csOsbmggZHV54buHdCDEkcOjIMSR4bqneSwgZOG7ryBsaeG7h3UgZGVtbyBjaOG7iSDEkcaw4bujYyBnaeG7ryB0cm9uZyBwaGnDqm4gbsOgeS4="), _lhD("d2Fybg=="), 6000); }
},
async reseed() { this.data = await createSeed(cryptoProvider, { logo: _lhD("YXNzZXRzL2xvZ28tbWFyay5zdmc=") }); await this.flush(); },
};
const channel = typeof BroadcastChannel !== _lhD("dW5kZWZpbmVk") ? new BroadcastChannel(_lhD("bGgtZGVtbw==")) : null;
const listeners = [];
async function refreshUser() { const p = await cryptoProvider.verifyToken(getActiveToken()); currentUser = p ? db.data?.users?.find(u => u.id === p.sub) : null; }
const matches = (t) => currentUser && (t.all || (t.userId && t.userId === currentUser.id) || (t.classId && currentUser.classId === t.classId) || (t.role === _lhD("c3RhZmY=") && currentUser.role !== _lhD("c3R1ZGVudA==")) || (t.role && t.role !== _lhD("c3RhZmY=") && currentUser.role === t.role));
async function deliver(event, data, target) { await refreshUser(); if (matches(target)) listeners.forEach(cb => cb(event, data)); }
function emit(event, data, target = { all: true }) {
const payload = JSON.parse(JSON.stringify(data));
setTimeout(() => deliver(event, payload, target), 0);
channel?.postMessage({ event, data: payload, target });
}
channel && (channel.onmessage = (m) => deliver(m.data.event, m.data.data, m.data.target));
async function uploadToRemote({ name, type, data }) {
const j = await sendPkt({ action: _lhD("dXBsb2Fk"), token: getActiveToken(), name: name || _lhD("aW1hZ2UuanBn"), type: type || '', data }).catch(() => null);
if (!j?.ok) throw new HttpError(j?.__status || 500, j?.error || _lhD("S2jDtG5nIHRo4buDIHThuqNpIHThu4dwIGzDqm4gbcOheSBjaOG7py4="));
return { url: j.url, size: j.size };
}
function makeLlm(c = {}) {
if (!c.provider || c.provider === _lhD("b2Zm")) return null;
return createLlm({ AI_PROVIDER: c.provider === _lhD("Y3VzdG9t") ? _lhD("b3BlbmFp") : c.provider, AI_API_KEY: c.apiKey || '', AI_MODEL: c.model || '', AI_BASE_URL: c.baseUrl || '' });
}
const api = buildApi();
const ctx = { db, crypto: cryptoProvider, emit, mode: _lhD("ZGVtbw=="), llm: null, makeLlm,
reloadLlm() { const c = db.data?.aiConfig; this.llm = (c?.provider && c.provider !== _lhD("b2Zm") && c.apiKey) ? makeLlm(c) : null; return this.llm; },
lanUrls: () => (typeof location !== _lhD("dW5kZWZpbmVk") ? [location.origin] : []),
reseed: () => db.reseed(),
async storeUpload({ name, type, data }) {
if (remoteSync) return uploadToRemote({ name, type, data });
const size = Math.round((data.length - data.indexOf(_lhD("LA==")) - 1) * 0.75);
if (size > 3 * 1024 * 1024) throw new HttpError(413, _lhD("QuG6o24geGVtIHRyxrDhu5tjIGNo4buJIG5o4bqtbiB04buHcCB04buRaSDEkWEgMyBNQi4gVHLDqm4gbcOheSBjaOG7pyB0aOG6rXQgZ2nhu5tpIGjhuqFuIGzDoCAyNSBNQi4="));
return { url: data, size };
},
async storeFile(v) {
if (typeof v === _lhD("c3RyaW5n") && /^(assets|uploads)\//.test(v)) return v;
if (typeof v === _lhD("c3RyaW5n") && /^data:image\/(jpeg|png|webp|gif);base64,/.test(v)) {
if (remoteSync) return (await uploadToRemote({ name: _lhD("aW1hZ2UuanBn"), data: v })).url;
return v;
}
throw new HttpError(400, _lhD("Q2jhu4kgaOG7lyB0cuG7oyDhuqNuaCBKUEcsIFBORywgV0VCUCBob+G6t2MgR0lGLg=="));
} };
const STOP_CODES = [_lhD("bm90X2dyYW50ZWQ="), _lhD("c2FtcGxpbmdfZGlzYWJsZWQ="), _lhD("bm90X2RlY2xhcmVk"), _lhD("Y2FwYWJpbGl0eV9kaXNhYmxlZA=="), _lhD("Y2FwYWJpbGl0eV9yZW1vdmVk")];
(async () => {
try {
const sample = typeof window !== _lhD("dW5kZWZpbmVk") && window.claude?.use ? await window.claude.use(_lhD("c2FtcGxl")) : null;
if (!sample) return;
const llm = async ({ system, messages, purpose }) => {
const turns = [{ role: _lhD("dXNlcg=="), content: `${system}${_lhD("CgooSOG6v3QgcGjhuqduIGjGsOG7m25nIGThuqtuIGjhu4cgdGjhu5FuZy4p")}` }, ...messages];
const opts = { modelTier: _lhD("cXVpY2s=") };
if (purpose !== _lhD("c2NhbQ==")) opts.cache = false;
try { return (await sample(turns, opts)).text; } catch (e) {
if (STOP_CODES.includes(e?.code)) ctx.llm = null;
throw new Error(e?.code || _lhD("c2FtcGxlX2Vycm9y"));
}
};
ctx.llm = Object.assign(llm, { provider: _lhD("Y2xhdWRl"), model: _lhD("Y2xhdWRl"), label: _lhD("Q2xhdWRlIMK3IGLhuqNuIHhlbSB0csaw4bubYw==") });
} catch {  }
})();
async function reloadRemoteData(tok) {
try {
const j = await sendPkt({ action: _lhD("bG9hZA=="), token: tok || getActiveToken() });
if (j?.ok && j?.data?.users) {
if (tok && j.tokenValid && j.tokenPayload) verifiedTokens.set(tok, j.tokenPayload);
remoteMtime = j.mtime || remoteMtime;
currentViewerRole = j.viewerRole || _lhD("Z3Vlc3Q=");
db.data = j.data;
ctx.reloadLlm();
return true;
}
} catch {  }
return false;
}
function startPolling() {
if (pollTimer || typeof window === _lhD("dW5kZWZpbmVk")) return;
pollTimer = setInterval(async () => {
if (!remoteSync || db.timer) return;
try {
const j = await sendPkt({ action: _lhD("cG9sbA=="), mtime: remoteMtime, token: getActiveToken() });
if (j?.changed && j?.data?.users) {
remoteMtime = j.mtime || remoteMtime;
db.data = j.data;
deliver(_lhD("ZGF0YTpjaGFuZ2Vk"), {}, { all: true });
deliver(_lhD("c3luYw=="), {}, { all: true });
}
} catch {  }
}, 4000);
}
export async function init(getTokenFn) {
if (getTokenFn) tokenGetter = getTokenFn;
if (!crypto?.subtle) throw new Error(_lhD("VHLDrG5oIGR1eeG7h3Qga2jDtG5nIGjhu5cgdHLhu6MgV2ViIENyeXB0by4="));
try {
const initTok = getActiveToken();
const j = await sendPkt({ action: _lhD("bG9hZA=="), token: initTok });
if (j?.ok && j?.data?.users) {
remoteSync = true;
ctx.mode = _lhD("c2VydmVy");
remoteMtime = j.mtime || 0;
currentViewerRole = j.viewerRole || _lhD("Z3Vlc3Q=");
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
} catch {  }
const raw = ls.get(DB_KEY);
if (raw) { try { db.data = JSON.parse(raw); if (migrateData(db.data)) await db.flush(); } catch { db.data = null; } }
if (!db.data) await db.reseed();
}
export async function handle(req) {
await new Promise(r => setTimeout(r, remoteSync ? 5 : (60 + Math.random() * 90)));
if (req.body && typeof req.body === _lhD("b2JqZWN0") && !req.body.device) req.body.device = (navigator.userAgent || '').slice(0, 120);
activeReqToken = req.token || null;
try {
if (remoteSync && req.token && currentViewerRole === _lhD("Z3Vlc3Q=")) {
await reloadRemoteData(req.token);
}
const out = await api.handle(req, ctx);
if (remoteSync && db.timer) {
await db.flush();
}
if (remoteSync && out.status === 200 && out.body?.token && req.path?.includes(_lhD("L2F1dGgv"))) {
await reloadRemoteData(out.body.token);
}
if (out.raw) return out;
return { status: out.status, body: out.body === undefined ? undefined : JSON.parse(JSON.stringify(out.body)), rotatedToken: out.rotatedToken };
} finally {
activeReqToken = null;
}
}
export const isRemote = () => remoteSync;
export function subscribe(cb, getToken) { if (getToken) tokenGetter = getToken; listeners.push(cb); }
