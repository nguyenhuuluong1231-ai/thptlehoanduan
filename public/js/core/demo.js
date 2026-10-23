const _lhD=(s)=>{try{return decodeURIComponent(escape(atob(s)));}catch{return atob(s);}};
import { buildApi } from '../../shared/api.js';
import { createSeed } from '../../shared/seed.js';
import { HttpError } from '../../shared/router.js';
import { migrateData } from '../../shared/migrate.js';
import { toast } from './ui.js';
import { argon2idRaw } from '../../shared/crypto/argon2.js';
import { createPasswordHasher, DEMO_PARAMS } from '../../shared/crypto/password.js';
const DB_KEY = _lhD("bGhfZGVtb19kYl92Mg=="), SECRET_KEY = _lhD("bGhfZGVtb19zZWNyZXQ=");
const enc = new TextEncoder();
const hex = (buf) => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, _lhD("MA=="))).join('');
const b64u = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, _lhD("LQ==")).replace(/\//g, _lhD("Xw==")).replace(/=+$/, '');
const unb64u = (s) => decodeURIComponent(escape(atob(s.replace(/-/g, _lhD("Kw==")).replace(/_/g, _lhD("Lw==")))));
const ls = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); return true; } catch { return false; } }, del(k) { try { localStorage.removeItem(k); } catch {  } } };
const randHex = (n) => { const a = new Uint8Array(n); crypto.getRandomValues(a); return hex(a); };
let SECRET = ls.get(SECRET_KEY);
if (!SECRET) { SECRET = randHex(32); ls.set(SECRET_KEY, SECRET); }
const keyCache = new Map();
async function hmacHex(key, msg) {
let k = keyCache.get(key);
if (!k) { k = await crypto.subtle.importKey(_lhD("cmF3"), enc.encode(SECRET + _lhD("fA==") + key), { name: _lhD("SE1BQw=="), hash: _lhD("U0hBLTI1Ng==") }, false, [_lhD("c2lnbg==")]); keyCache.set(key, k); }
return hex(await crypto.subtle.sign(_lhD("SE1BQw=="), k, enc.encode(String(msg))));
}
const sha = async (s) => hex(await crypto.subtle.digest(_lhD("U0hBLTI1Ng=="), enc.encode(s)));
const { hashPassword, verifyPassword, needsRehash } = createPasswordHasher({
raw: (a) => argon2idRaw(a), params: DEMO_PARAMS, randomBytes: (n) => crypto.getRandomValues(new Uint8Array(n)),
legacyVerify: async (pw, stored) => { if (!stored?.startsWith(_lhD("ZGVtbyQ="))) return false; const [, salt, h] = stored.split(_lhD("JA==")); return (await sha(salt + pw)) === h; },
});
const cryptoProvider = {
hashPassword, verifyPassword, needsRehash,
async signToken(payload, ttl) { const body = b64u(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttl })); return `${body}${_lhD("Lg==")}${await hmacHex(_lhD("dG9rZW4="), body)}`; },
async verifyToken(t) { if (typeof t !== _lhD("c3RyaW5n") || !t.includes(_lhD("Lg=="))) return null; const [body, sig] = t.split(_lhD("Lg==")); if (sig !== await hmacHex(_lhD("dG9rZW4="), body)) return null; try { const p = JSON.parse(unb64u(body)); return p.exp * 1000 > Date.now() ? p : null; } catch { return null; } },
hmac: hmacHex,
async randomToken() { return randHex(18); },
};
let warned = false;
const db = {
data: null, timer: null,
save() { clearTimeout(this.timer); this.timer = setTimeout(() => this.flush(), 200); },
async flush() {
clearTimeout(this.timer);
if (!ls.set(DB_KEY, JSON.stringify(this.data)) && !warned) { warned = true; toast(_lhD("QuG7mSBuaOG7myB0csOsbmggZHV54buHdCDEkcOjIMSR4bqneSwgZOG7ryBsaeG7h3UgZGVtbyBjaOG7iSDEkcaw4bujYyBnaeG7ryB0cm9uZyBwaGnDqm4gbsOgeS4="), _lhD("d2Fybg=="), 6000); }
},
async reseed() { this.data = await createSeed(cryptoProvider, { logo: _lhD("YXNzZXRzL2xvZ28tbWFyay5zdmc=") }); await this.flush(); },
};
const channel = typeof BroadcastChannel !== _lhD("dW5kZWZpbmVk") ? new BroadcastChannel(_lhD("bGgtZGVtbw==")) : null;
const listeners = [];
let tokenGetter = () => null, currentUser = null;
async function refreshUser() { const p = await cryptoProvider.verifyToken(tokenGetter()); currentUser = p ? db.data.users.find(u => u.id === p.sub) : null; }
const matches = (t) => currentUser && (t.all || (t.userId && t.userId === currentUser.id) || (t.classId && currentUser.classId === t.classId) || (t.role === _lhD("c3RhZmY=") && currentUser.role !== _lhD("c3R1ZGVudA==")) || (t.role && t.role !== _lhD("c3RhZmY=") && currentUser.role === t.role));
async function deliver(event, data, target) { await refreshUser(); if (matches(target)) listeners.forEach(cb => cb(event, data)); }
function emit(event, data, target = { all: true }) {
const payload = JSON.parse(JSON.stringify(data));
setTimeout(() => deliver(event, payload, target), 0);
channel?.postMessage({ event, data: payload, target });
}
channel && (channel.onmessage = (m) => deliver(m.data.event, m.data.data, m.data.target));
addEventListener(_lhD("c3RvcmFnZQ=="), (e) => { if (e.key === DB_KEY && e.newValue) { try { db.data = JSON.parse(e.newValue); } catch {  } } });
const api = buildApi();
const ctx = { db, crypto: cryptoProvider, emit, mode: _lhD("ZGVtbw=="), llm: null, reseed: () => db.reseed(),
async storeUpload({ data }) {
const size = Math.round((data.length - data.indexOf(_lhD("LA==")) - 1) * 0.75);
if (size > 3 * 1024 * 1024) throw new HttpError(413, _lhD("QuG6o24geGVtIHRyxrDhu5tjIGNo4buJIG5o4bqtbiB04buHcCB04buRaSDEkWEgMyBNQi4gVHLDqm4gbcOheSBjaOG7pyB0aOG6rXQgZ2nhu5tpIGjhuqFuIGzDoCAyNSBNQi4="));
return { url: data, size };
},
async storeFile(v) { if (typeof v === _lhD("c3RyaW5n") && (/^data:image\/(jpeg|png|webp|gif);base64,/.test(v) || /^(assets|uploads)\//.test(v))) return v; throw new HttpError(400, _lhD("Q2jhu4kgaOG7lyB0cuG7oyDhuqNuaCBKUEcsIFBORywgV0VCUCBob+G6t2MgR0lGLg==")); } };
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
export async function init() {
if (!crypto?.subtle) throw new Error(_lhD("VHLDrG5oIGR1eeG7h3Qga2jDtG5nIGjhu5cgdHLhu6MgV2ViIENyeXB0by4="));
const raw = ls.get(DB_KEY);
if (raw) { try { db.data = JSON.parse(raw); if (migrateData(db.data)) await db.flush(); } catch { db.data = null; } }
if (!db.data) await db.reseed();
}
export async function handle(req) {
await new Promise(r => setTimeout(r, 60 + Math.random() * 90));
if (req.body && typeof req.body === _lhD("b2JqZWN0") && !req.body.device) req.body.device = (navigator.userAgent || '').slice(0, 120);
const out = await api.handle(req, ctx);
if (out.raw) return out;
return { status: out.status, body: out.body === undefined ? undefined : JSON.parse(JSON.stringify(out.body)), rotatedToken: out.rotatedToken };
}
export function subscribe(cb, getToken) { tokenGetter = getToken; listeners.push(cb); }
