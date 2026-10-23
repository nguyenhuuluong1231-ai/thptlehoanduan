const _lhD=(s)=>{try{return decodeURIComponent(escape(atob(s)));}catch{return atob(s);}};
import { store, toast, apiBase, compressImage, readDataUrl } from './ui.js';
import * as demoMod from './demo.js';
if (typeof window !== _lhD("dW5kZWZpbmVk")) {
if (!window.process) window.process = { env: {} };
if (location.protocol === _lhD("aHR0cDo=") && ![_lhD("bG9jYWxob3N0"), _lhD("MTI3LjAuMC4x")].includes(location.hostname)) {
location.replace(_lhD("aHR0cHM6Ly8=") + location.host + location.pathname + location.search + location.hash);
}
}
let mode = null, demo = null, portal = _lhD("c3R1ZGVudA==");
const memToken = {};
const tokenKey = () => `${_lhD("bGhfdG9rZW5f")}${portal}`;
const activeKey = (p = portal) => `${_lhD("bGhfYWN0aXZlXw==")}${p}`;
const noIdleKey = (p = portal) => `${_lhD("bGhfbm9faWRsZV8=")}${p}`;
export const IDLE_TIMEOUT_MS = 5 * 60 * 1000;
export const isAppEnv = () => typeof window !== _lhD("dW5kZWZpbmVk") && (window.self !== window.top || !!window.Capacitor || window.matchMedia?.(_lhD("KGRpc3BsYXktbW9kZTogc3RhbmRhbG9uZSk=")).matches || window.matchMedia?.(_lhD("KG1heC13aWR0aDogNzYwcHgp")).matches || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '') || !!navigator.standalone || /[?&]mobile/.test(location.search));
export const isAppSession = (p = portal) => isAppEnv() || !!store.get(noIdleKey(p));
let lastTouch = 0, lastServerTouch = 0;
export const apiUrl = (p) => { const u = p.startsWith(_lhD("Lw==")) ? p.slice(1) : p; return apiBase() ? `${apiBase()}${_lhD("Lw==")}${u}` : u; };
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
try { sessionStorage.setItem(tokenKey(), token); } catch {  }
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
sessionStorage.removeItem(_lhD("bGhfcGhvbmVfc3Jj"));
} catch {  }
store.del(tokenKey());
store.del(activeKey());
store.del(noIdleKey());
store.del(_lhD("bGhfcGhvbmVfc3Jj"));
},
update(token) { if (!token) return; this.set(token, store.get(tokenKey()) !== null, isAppSession()); },
};
if (typeof window !== _lhD("dW5kZWZpbmVk")) {
const onUserActivity = () => {
const now = Date.now();
if (now - lastTouch < 3000) return;
if (!memToken[portal] && !store.get(tokenKey()) && !(() => { try { return sessionStorage.getItem(tokenKey()); } catch { return null; } })()) return;
session.touch();
if (mode === _lhD("c2VydmVy") && now - lastServerTouch > 90000) {
lastServerTouch = now;
request(_lhD("R0VU"), _lhD("YXBpL2F1dGgvbWU=")).catch(() => {});
}
};
[_lhD("cG9pbnRlcmRvd24="), _lhD("a2V5ZG93bg=="), _lhD("dG91Y2hzdGFydA=="), _lhD("c2Nyb2xs"), _lhD("d2hlZWw="), _lhD("bW91c2Vtb3Zl")].forEach(ev =>
window.addEventListener(ev, onUserActivity, { passive: true, capture: true })
);
setInterval(() => {
if (isAppSession()) return;
const tok = memToken[portal] || (() => { try { return sessionStorage.getItem(tokenKey()) || store.get(tokenKey()); } catch { return store.get(tokenKey()); } })();
if (!tok) return;
const last = Number(store.get(activeKey()) || 0);
if (last && Date.now() - last >= IDLE_TIMEOUT_MS) {
request(_lhD("UE9TVA=="), _lhD("YXBpL2F1dGgvbG9nb3V0"), {}).catch(() => {});
session.clear();
window.dispatchEvent(new CustomEvent(_lhD("YXV0aDpleHBpcmVk"), { detail: { idle: true } }));
}
}, 5000);
}
export function setPortal(p) { portal = p; }
export const getMode = () => (mode === _lhD("ZGVtbw==") && (demo?.isRemote?.() || (typeof location !== _lhD("dW5kZWZpbmVk") && location.protocol.startsWith(_lhD("aHR0cA=="))))) ? _lhD("c2VydmVy") : mode;
export async function detect() {
if (mode) return mode;
demo = demoMod;
await demo.init(() => session.token);
if (demo.isRemote()) {
registerSw();
return (mode = _lhD("ZGVtbw=="));
}
try {
const r = await fetch(apiUrl(_lhD("YXBpL2hlYWx0aA==")), { cache: _lhD("bm8tc3RvcmU="), headers: { accept: _lhD("YXBwbGljYXRpb24vanNvbg==") }, signal: AbortSignal.timeout ? AbortSignal.timeout(apiBase() ? 5000 : 5000) : undefined });
if (r.ok && (r.headers.get(_lhD("Y29udGVudC10eXBl")) || '').includes(_lhD("anNvbg=="))) { const j = await r.json(); if (j.app === _lhD("bGVob2FuLXBvcnRhbA==")) { registerSw(); return (mode = _lhD("c2VydmVy")); } }
} catch {  }
return (mode = _lhD("ZGVtbw=="));
}
function registerSw() {
try {
if (window.Capacitor || apiBase() || !(_lhD("c2VydmljZVdvcmtlcg==") in navigator)) return;
if (location.protocol !== _lhD("aHR0cHM6") && ![_lhD("bG9jYWxob3N0"), _lhD("MTI3LjAuMC4x")].includes(location.hostname)) return;
navigator.serviceWorker.register(_lhD("c3cuanM=")).catch(() => {  });
} catch {  }
}
export class ApiError extends Error { constructor(status, message, details) { super(message); this.status = status; this.details = details; } }
let channel = null;
const b64 = (buf) => {
const bytes = new Uint8Array(buf);
let binary = '';
const CHUNK = 0x2000;
for (let i = 0; i < bytes.length; i += CHUNK) binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
return btoa(binary);
};
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
async function ensureChannel() {
if (channel) return channel;
if (!(window.crypto?.subtle)) return null;
try {
const kp = await crypto.subtle.generateKey({ name: _lhD("RUNESA=="), namedCurve: _lhD("UC0yNTY=") }, true, [_lhD("ZGVyaXZlQml0cw==")]);
const rawPub = await crypto.subtle.exportKey(_lhD("cmF3"), kp.publicKey);
const res = await fetch(apiUrl(_lhD("YXBpL2hhbmRzaGFrZQ==")), { method: _lhD("UE9TVA=="), headers: { 'content-type': _lhD("YXBwbGljYXRpb24vanNvbg==") }, body: JSON.stringify({ pub: b64(rawPub) }) });
if (!res.ok) return null;
const { cid, pub } = await res.json();
const serverPubKey = await crypto.subtle.importKey(_lhD("cmF3"), unb64(pub), { name: _lhD("RUNESA=="), namedCurve: _lhD("UC0yNTY=") }, false, []);
const bits = await crypto.subtle.deriveBits({ name: _lhD("RUNESA=="), public: serverPubKey }, kp.privateKey, 256);
const hash = await crypto.subtle.digest(_lhD("U0hBLTI1Ng=="), bits);
const key = await crypto.subtle.importKey(_lhD("cmF3"), hash, _lhD("QUVTLUdDTQ=="), false, [_lhD("ZW5jcnlwdA=="), _lhD("ZGVjcnlwdA==")]);
channel = { cid, key };
} catch { channel = null; }
return channel;
}
async function encEnvelope(key, value) {
const iv = crypto.getRandomValues(new Uint8Array(12));
const data = new TextEncoder().encode(JSON.stringify(value === undefined ? null : value));
const enc = new Uint8Array(await crypto.subtle.encrypt({ name: _lhD("QUVTLUdDTQ=="), iv }, key, data));
return { iv: b64(iv), data: b64(enc.slice(0, enc.length - 16)), tag: b64(enc.slice(enc.length - 16)) };
}
async function decEnvelope(key, env) {
const combined = new Uint8Array([...unb64(env.data), ...unb64(env.tag)]);
const dec = await crypto.subtle.decrypt({ name: _lhD("QUVTLUdDTQ=="), iv: unb64(env.iv) }, key, combined);
const text = new TextDecoder().decode(dec);
return text && text !== _lhD("bnVsbA==") ? JSON.parse(text) : undefined;
}
async function request(method, path, body, _retried = false) {
await detect();
const url = path.startsWith(_lhD("Lw==")) ? path.slice(1) : path;
let status, data;
if (mode === _lhD("ZGVtbw==")) {
const [p, qs] = url.split(_lhD("Pw=="));
const out = await demo.handle({ method, path: _lhD("Lw==") + p, query: Object.fromEntries(new URLSearchParams(qs || '')), body, token: session.token });
status = out.status; data = out.raw ? out : out.body;
if (out.rotatedToken && session.token) session.update(out.rotatedToken);
} else {
let res;
const ch = await ensureChannel();
try {
const headers = { 'content-type': _lhD("YXBwbGljYXRpb24vanNvbg=="), ...(session.token ? { authorization: _lhD("QmVhcmVyIA==") + session.token } : {}), ...(ch ? { 'x-channel-id': ch.cid } : {}) };
const sendBody = ch && body !== undefined ? await encEnvelope(ch.key, body) : body;
res = await fetch(apiUrl(url), { method, headers, body: sendBody !== undefined ? JSON.stringify(sendBody) : undefined });
} catch { throw new ApiError(0, _lhD("S2jDtG5nIGvhur90IG7hu5FpIMSRxrDhu6NjIG3DoXkgY2jhu6cuIEtp4buDbSB0cmEgbeG6oW5nIHLhu5NpIHRo4butIGzhuqFpLg==")); }
status = res.status;
if (ch && res.headers.get(_lhD("eC1jaGFubmVsLWV4cGlyZWQ=")) && !_retried) {
channel = null;
return request(method, path, body, true);
}
const newToken = res.headers.get(_lhD("eC1uZXctdG9rZW4="));
if (newToken && session.token) session.update(newToken);
const ct = res.headers.get(_lhD("Y29udGVudC10eXBl")) || '';
if (ct.includes(_lhD("anNvbg=="))) {
const j = await res.json();
data = (ch && j && typeof j.iv === _lhD("c3RyaW5n") && typeof j.tag === _lhD("c3RyaW5n") && typeof j.data === _lhD("c3RyaW5n")) ? await decEnvelope(ch.key, j) : j;
} else {
data = { raw: true, blob: await res.blob(), filename: decodeURIComponent((/filename\*=UTF-8''([^;]+)/.exec(res.headers.get(_lhD("Y29udGVudC1kaXNwb3NpdGlvbg==")) || '') || [])[1] || _lhD("dGVwLXRhaS12ZQ==")) };
}
}
if (status === 401 && session.token && !path.includes(_lhD("L2F1dGgvbG9naW4="))) { session.clear(); window.dispatchEvent(new CustomEvent(_lhD("YXV0aDpleHBpcmVk"))); }
if (status < 400 && session.token) { lastServerTouch = Date.now(); session.touch(); }
if (status >= 400) throw new ApiError(status, data?.error || _lhD("Q8OzIGzhu5dpIHjhuqN5IHJhLg=="), data?.details);
return data;
}
export const api = {
get: (p) => request(_lhD("R0VU"), p),
post: (p, b = {}) => request(_lhD("UE9TVA=="), p, b),
put: (p, b = {}) => request(_lhD("UFVU"), p, b),
patch: (p, b = {}) => request(_lhD("UEFUQ0g="), p, b),
del: (p) => request(_lhD("REVMRVRF"), p),
async upload(file) {
let data;
if (/^image\/(jpeg|png|webp)$/.test(file.type) && file.size > 350 * 1024) { try { data = await compressImage(file, 1920, 0.85); } catch {  } }
if (!data) data = await readDataUrl(file);
const type = data.slice(5, data.indexOf(_lhD("Ow=="))) || file.type;
const name = data.startsWith(_lhD("ZGF0YTppbWFnZS9qcGVn")) && !/\.jpe?g$/i.test(file.name) ? file.name.replace(/\.[^.]+$/, '') + _lhD("LmpwZw==") : file.name;
return (await request(_lhD("UE9TVA=="), _lhD("YXBpL3VwbG9hZHM="), { name, type: type === _lhD("YXBwbGljYXRpb24vb2N0ZXQtc3RyZWFt") ? '' : type, data })).file;
},
async download(p, fallbackName = _lhD("ZHUtbGlldS54bHN4")) {
const out = await request(_lhD("R0VU"), p);
const blob = out?.blob || (out?.body ? new Blob([out.body], { type: out?.headers?.[_lhD("Y29udGVudC10eXBl")] || _lhD("YXBwbGljYXRpb24vb2N0ZXQtc3RyZWFt") }) : null);
if (!blob) { toast(_lhD("S2jDtG5nIHRo4buDIHThuqFvIHThu4dwIHThuqNpIHbhu4Eu"), _lhD("d2Fybg=="), 5000); return false; }
const fn = out.filename || decodeURIComponent((/filename\*=UTF-8''([^;]+)/.exec(out?.headers?.[_lhD("Y29udGVudC1kaXNwb3NpdGlvbg==")] || '') || [])[1] || '') || fallbackName;
const a = document.createElement(_lhD("YQ=="));
a.href = URL.createObjectURL(blob); a.download = fn;
document.body.appendChild(a); a.click(); a.remove();
setTimeout(() => URL.revokeObjectURL(a.href), 4000);
toast(`${_lhD("xJDDoyB4deG6pXQg")}${a.download}`, _lhD("b2s="));
return true;
},
};
export function showError(e) { toast(e?.message || _lhD("Q8OzIGzhu5dpIHjhuqN5IHJhLg=="), _lhD("YmFk"), 4800); }
const handlers = new Map();
let es = null;
export const live = {
on(event, cb) { if (!handlers.has(event)) handlers.set(event, new Set()); handlers.get(event).add(cb); return () => handlers.get(event)?.delete(cb); },
async connect() {
await detect();
if (mode === _lhD("ZGVtbw==")) { demo.subscribe((ev, data) => fire(ev, data), () => session.token); return; }
if (!session.token || es) return;
es = new EventSource(apiUrl(`${_lhD("YXBpL3N0cmVhbT90b2tlbj0=")}${encodeURIComponent(session.token)}`));
const events = [_lhD("bm90aWZpY2F0aW9u"), _lhD("YWxlcnQ="), _lhD("c2Nob29sLWNoYXQ6bWVzc2FnZQ=="), _lhD("c2Nob29sLWNoYXQ6cmVhY3Q="), _lhD("c2Nob29sLWNoYXQ6ZGVsZXRl"), _lhD("c2Nob29sLWNoYXQ6cmVjYWxs"), _lhD("c2Nob29sLWNoYXQ6bG9jaw=="), _lhD("dGVhY2hlci1jaGF0Om1lc3NhZ2U="), _lhD("Y291bnNlbGluZzptZXNzYWdl"), _lhD("Y291bnNlbGluZzpyZXBseQ=="), _lhD("cmVwb3J0Om5ldw=="), _lhD("cmVwb3J0OnVwZGF0ZQ=="), _lhD("cXVpejphdHRlbXB0"), _lhD("c3luYw=="), _lhD("c2V0dGluZ3M="), _lhD("YWk6Y29uZmln"), _lhD("ZGF0YTpjaGFuZ2Vk"), _lhD("cHJvZmlsZTp1cGRhdGU="), _lhD("cmVhZHk=")];
events.forEach(ev => es.addEventListener(ev, (m) => { try { fire(ev, JSON.parse(m.data)); } catch {  } }));
es.onopen = () => fire(_lhD("Y29ubmVjdGlvbg=="), { online: true });
es.onerror = () => fire(_lhD("Y29ubmVjdGlvbg=="), { online: false });
},
disconnect() { es?.close(); es = null; },
};
function fire(ev, data) { handlers.get(ev)?.forEach(cb => { try { cb(data); } catch (e) { console.error(e); } }); handlers.get(_lhD("Kg=="))?.forEach(cb => cb(ev, data)); }
