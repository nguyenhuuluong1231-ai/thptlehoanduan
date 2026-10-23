const _lhD=(s)=>{try{return decodeURIComponent(escape(atob(s)));}catch{return atob(s);}};
import { icon } from './icons.js?v=mvkq4erg';
import { qrSvg } from './qr.js?v=mvkq4erg';
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': _lhD("JmFtcDs="), '<': _lhD("Jmx0Ow=="), '>': _lhD("Jmd0Ow=="), '"': _lhD("JnF1b3Q7"), "'": _lhD("JiMzOTs=") }[c]));
export const sleep = (ms) => new Promise(r => setTimeout(r, ms));
export const store = {
get(k, d = null) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {  } },
del(k) { try { localStorage.removeItem(k); } catch {  } },
};
const pad = (n) => String(n).padStart(2, _lhD("MA=="));
export const fmtDate = (iso) => { if (!iso) return _lhD("4oCU"); const d = new Date(iso); return `${pad(d.getDate())}${_lhD("Lw==")}${pad(d.getMonth() + 1)}${_lhD("Lw==")}${d.getFullYear()}`; };
export const fmtTime = (iso) => { if (!iso) return ''; const d = new Date(iso); return `${pad(d.getHours())}${_lhD("Og==")}${pad(d.getMinutes())}`; };
export const fmtDateTime = (iso) => iso ? `${fmtTime(iso)}${_lhD("IMK3IA==")}${fmtDate(iso)}` : _lhD("4oCU");
export const DAY = [_lhD("Q2jhu6cgbmjhuq10"), _lhD("VGjhu6kgSGFp"), _lhD("VGjhu6kgQmE="), _lhD("VGjhu6kgVMaw"), _lhD("VGjhu6kgTsSDbQ=="), _lhD("VGjhu6kgU8OhdQ=="), _lhD("VGjhu6kgQuG6o3k=")];
export const DAY_SHORT = [_lhD("Q04="), _lhD("VDI="), _lhD("VDM="), _lhD("VDQ="), _lhD("VDU="), _lhD("VDY="), _lhD("VDc=")];
export function ago(iso) {
if (!iso) return '';
const s = (Date.now() - new Date(iso).getTime()) / 1000;
if (s < 45) return _lhD("VuG7q2EgeG9uZw==");
if (s < 3600) return `${Math.round(s / 60)}${_lhD("IHBow7p0IHRyxrDhu5tj")}`;
if (s < 86400) return `${Math.round(s / 3600)}${_lhD("IGdp4budIHRyxrDhu5tj")}`;
if (s < 86400 * 2) return _lhD("SMO0bSBxdWE=");
if (s < 86400 * 30) return `${Math.floor(s / 86400)}${_lhD("IG5nw6B5IHRyxrDhu5tj")}`;
return fmtDate(iso);
}
export const vnd = (n) => new Intl.NumberFormat(_lhD("dmktVk4=")).format(Math.round(n || 0)) + _lhD("IMSR");
export const num = (n, d = 0) => n === null || n === undefined || Number.isNaN(n) ? _lhD("4oCU") : Number(n).toLocaleString(_lhD("dmktVk4="), { minimumFractionDigits: d, maximumFractionDigits: d });
export const greeting = () => { const h = new Date().getHours(); return h < 11 ? _lhD("Q2jDoG8gYnXhu5VpIHPDoW5n") : h < 13 ? _lhD("Q2jDoG8gYnXhu5VpIHRyxrBh") : h < 18 ? _lhD("Q2jDoG8gYnXhu5VpIGNoaeG7gXU=") : _lhD("Q2jDoG8gYnXhu5VpIHThu5Fp"); };
export const firstName = (n = '') => n.replace(/^(ThS\.|TS\.|Thầy|Cô)\s*/i, '').trim().split(/\s+/).pop();
const AV_COLORS = [_lhD("IzE3NDdjOQ=="), _lhD("IzBmOGY2Nw=="), _lhD("IzZhNGZlMA=="), _lhD("I2U4NTEzYQ=="), _lhD("IzBhODRiOA=="), _lhD("I2IwMzY3YQ=="), _lhD("I2MyN2MwZQ=="), _lhD("IzJmNmI0Zg==")];
export function avatar(u, cls = '') {
const name = u?.name || _lhD("Pw==");
const parts = name.replace(/^(ThS\.|TS\.|Thầy|Cô)\s*/i, '').trim().split(/\s+/);
const ini = ((parts.at(-2)?.[0] || '') + (parts.at(-1)?.[0] || '')).toUpperCase();
let h = 0; for (const c of (u?.id || name)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
if (u?.avatar) return `${_lhD("PHNwYW4gY2xhc3M9ImF2YXRhciA=")}${cls}${_lhD("Ij48aW1nIHNyYz0i")}${esc(u.avatar)}${_lhD("IiBhbHQ9IiIgbG9hZGluZz0ibGF6eSI+PC9zcGFuPg==")}`;
return `${_lhD("PHNwYW4gY2xhc3M9ImF2YXRhciA=")}${cls}${_lhD("IiBzdHlsZT0iYmFja2dyb3VuZDo=")}${AV_COLORS[h % AV_COLORS.length]}${_lhD("IiBhcmlhLWhpZGRlbj0idHJ1ZSI+")}${esc(ini)}${_lhD("PC9zcGFuPg==")}`;
}
export function md(text = '') {
const blocks = [];
let t = esc(text).replace(/```([\s\S]*?)```/g, (_, code) => { blocks.push(`${_lhD("PHByZT4=")}${code.replace(/^\n/, '')}${_lhD("PC9wcmU+")}`); return `${_lhD("AA==")}${blocks.length - 1}${_lhD("AA==")}`; });
t = t.replace(/\*\*(.+?)\*\*/g, _lhD("PHN0cm9uZz4kMTwvc3Ryb25nPg==")).replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, _lhD("JDE8ZW0+JDI8L2VtPg==")).replace(/`([^`]+)`/g, _lhD("PGNvZGU+JDE8L2NvZGU+"));
const lines = t.split(_lhD("Cg==")); const out = []; let list = null;
for (const line of lines) {
const ul = /^\s*[-•]\s+(.*)/.exec(line), ol = /^\s*(\d+)[.)]\s+(.*)/.exec(line);
if (ul || ol) {
const type = ul ? _lhD("dWw=") : _lhD("b2w=");
if (list !== type) { if (list) out.push(`${_lhD("PC8=")}${list}${_lhD("Pg==")}`); out.push(`${_lhD("PA==")}${type}${_lhD("Pg==")}`); list = type; }
out.push(`${_lhD("PGxpPg==")}${(ul || ol)[ul ? 1 : 2]}${_lhD("PC9saT4=")}`);
} else {
if (list) { out.push(`${_lhD("PC8=")}${list}${_lhD("Pg==")}`); list = null; }
if (line.trim()) out.push(`${_lhD("PHA+")}${line}${_lhD("PC9wPg==")}`);
}
}
if (list) out.push(`${_lhD("PC8=")}${list}${_lhD("Pg==")}`);
return out.join('').replace(/<p>\u0000(\d+)\u0000<\/p>|\u0000(\d+)\u0000/g, (_, a, b) => blocks[a ?? b]);
}
let toastHost;
export function toast(message, tone = _lhD("aW5mbw=="), ms = 3600) {
if (!toastHost) { toastHost = document.createElement(_lhD("ZGl2")); toastHost.className = _lhD("dG9hc3Rz"); toastHost.setAttribute(_lhD("cm9sZQ=="), _lhD("c3RhdHVz")); toastHost.setAttribute(_lhD("YXJpYS1saXZl"), _lhD("cG9saXRl")); document.body.appendChild(toastHost); }
const el = document.createElement(_lhD("ZGl2"));
el.className = `${_lhD("dG9hc3Qg")}${tone}`;
el.innerHTML = `${icon(tone === _lhD("b2s=") ? _lhD("Y2hlY2tDaXJjbGU=") : tone === _lhD("YmFk") ? _lhD("YWxlcnRDaXJjbGU=") : tone === _lhD("d2Fybg==") ? _lhD("YWxlcnQ=") : _lhD("aW5mbw=="))}${_lhD("PHNwYW4+")}${esc(message)}${_lhD("PC9zcGFuPg==")}`;
toastHost.appendChild(el);
setTimeout(() => { el.classList.add(_lhD("b3V0")); setTimeout(() => el.remove(), 260); }, ms);
}
export function modal({ title, sub = '', body = '', foot = '', size = '', onMount, onClose } = {}) {
const back = document.createElement(_lhD("ZGl2"));
back.className = _lhD("YmFja2Ryb3A=");
back.innerHTML = `${_lhD("PGRpdiBjbGFzcz0ibW9kYWwg")}${size}${_lhD("IiByb2xlPSJkaWFsb2ciIGFyaWEtbW9kYWw9InRydWUiIGFyaWEtbGFiZWw9Ig==")}${esc(title)}${_lhD("Ij4KICAgIDxkaXYgY2xhc3M9Im1vZGFsLWhlYWQiPjxoMz4=")}${esc(title)}${sub ? `${_lhD("PGRpdiBjbGFzcz0ic3ViIj4=")}${sub}${_lhD("PC9kaXY+")}` : ''}${_lhD("PC9oMz48YnV0dG9uIGNsYXNzPSJidG4gaWNvbiBnaG9zdCBzbSIgZGF0YS1jbG9zZSBhcmlhLWxhYmVsPSLEkMOzbmciPg==")}${icon(_lhD("eA=="))}${_lhD("PC9idXR0b24+PC9kaXY+CiAgICA8ZGl2IGNsYXNzPSJtb2RhbC1ib2R5Ij4=")}${body}${_lhD("PC9kaXY+")}${foot ? `${_lhD("PGRpdiBjbGFzcz0ibW9kYWwtZm9vdCI+")}${foot}${_lhD("PC9kaXY+")}` : ''}${_lhD("PC9kaXY+")}`;
const prevFocus = document.activeElement;
const close = (v) => { back.remove(); document.removeEventListener(_lhD("a2V5ZG93bg=="), onKey); onClose?.(v); prevFocus?.focus?.(); };
const onKey = (e) => { if (e.key === _lhD("RXNjYXBl")) close(); };
back.addEventListener(_lhD("bW91c2Vkb3du"), (e) => { if (e.target === back) close(); });
back.querySelectorAll(_lhD("W2RhdGEtY2xvc2Vd")).forEach(b => b.addEventListener(_lhD("Y2xpY2s="), () => close()));
document.addEventListener(_lhD("a2V5ZG93bg=="), onKey);
document.body.appendChild(back);
const m = back.querySelector(_lhD("Lm1vZGFs"));
onMount?.(m, close);
setTimeout(() => (m.querySelector(_lhD("W2F1dG9mb2N1c10=")) || m.querySelector(_lhD("aW5wdXQsdGV4dGFyZWEsc2VsZWN0LGJ1dHRvbjpub3QoW2RhdGEtY2xvc2VdKQ==")))?.focus(), 30);
return { el: m, close };
}
export function confirmDialog({ title = _lhD("WMOhYyBuaOG6rW4="), message = '', ok = _lhD("xJDhu5NuZyDDvQ=="), tone = '', cancel = _lhD("SOG7p3k=") } = {}) {
return new Promise((resolve) => {
let answered = false;
modal({ title, body: `${_lhD("PHAgY2xhc3M9ImluazIiPg==")}${message}${_lhD("PC9wPg==")}`, foot: `${_lhD("PGJ1dHRvbiBjbGFzcz0iYnRuIGdob3N0IiBkYXRhLWNsb3NlPg==")}${cancel}${_lhD("PC9idXR0b24+PGJ1dHRvbiBjbGFzcz0iYnRuIA==")}${tone}${_lhD("IiBkYXRhLW9rPg==")}${ok}${_lhD("PC9idXR0b24+")}`,
onMount: (m, close) => m.querySelector(_lhD("W2RhdGEtb2td")).addEventListener(_lhD("Y2xpY2s="), () => { answered = true; close(); resolve(true); }),
onClose: () => { if (!answered) resolve(false); } });
});
}
export function drawer({ title, body = '', onMount }) {
const back = document.createElement(_lhD("ZGl2")); back.className = _lhD("ZHJhd2VyLWJhY2s=");
const d = document.createElement(_lhD("YXNpZGU=")); d.className = _lhD("ZHJhd2Vy"); d.setAttribute(_lhD("cm9sZQ=="), _lhD("ZGlhbG9n")); d.setAttribute(_lhD("YXJpYS1sYWJlbA=="), title);
d.innerHTML = `${_lhD("PGRpdiBjbGFzcz0iZHJhd2VyLWhlYWQiPjxoMz4=")}${esc(title)}${_lhD("PC9oMz48YnV0dG9uIGNsYXNzPSJidG4gaWNvbiBnaG9zdCBzbSIgZGF0YS1jbG9zZSBhcmlhLWxhYmVsPSLEkMOzbmciPg==")}${icon(_lhD("eA=="))}${_lhD("PC9idXR0b24+PC9kaXY+PGRpdiBjbGFzcz0iZHJhd2VyLWJvZHkiPg==")}${body}${_lhD("PC9kaXY+")}`;
const close = () => { back.remove(); d.remove(); document.removeEventListener(_lhD("a2V5ZG93bg=="), onKey); };
const onKey = (e) => { if (e.key === _lhD("RXNjYXBl")) close(); };
back.addEventListener(_lhD("Y2xpY2s="), close); d.querySelector(_lhD("W2RhdGEtY2xvc2Vd")).addEventListener(_lhD("Y2xpY2s="), close);
document.addEventListener(_lhD("a2V5ZG93bg=="), onKey);
document.body.append(back, d);
onMount?.(d, close);
return { el: d, close };
}
export function formData(form) {
const o = {};
for (const el of form.elements) {
if (!el.name || el.disabled) continue;
if (el.type === _lhD("Y2hlY2tib3g=")) { if (form.querySelectorAll(`${_lhD("W25hbWU9Ig==")}${el.name}${_lhD("Il0=")}`).length > 1) { (o[el.name] ||= []); if (el.checked) o[el.name].push(el.value); } else o[el.name] = el.checked; }
else if (el.type === _lhD("cmFkaW8=")) { if (el.checked) o[el.name] = el.value; else if (!(el.name in o)) o[el.name] = ''; }
else o[el.name] = el.value;
}
return o;
}
export async function withBusy(btn, fn) {
if (!btn) return fn();
btn.classList.add(_lhD("bG9hZGluZw==")); btn.disabled = true;
try { return await fn(); } finally { btn.classList.remove(_lhD("bG9hZGluZw==")); btn.disabled = false; }
}
export function compressImage(file, max = 1280, quality = .82) {
return new Promise((resolve, reject) => {
if (!file.type.startsWith(_lhD("aW1hZ2Uv"))) return reject(new Error(_lhD("VnVpIGzDsm5nIGNo4buNbiB04buHcCBow6xuaCDhuqNuaC4=")));
const reader = new FileReader();
reader.onerror = () => reject(new Error(_lhD("S2jDtG5nIMSR4buNYyDEkcaw4bujYyDhuqNuaC4=")));
reader.onload = () => {
const img = new Image();
img.onload = () => {
const s = Math.min(1, max / Math.max(img.width, img.height));
const c = document.createElement(_lhD("Y2FudmFz")); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
c.getContext(_lhD("MmQ=")).drawImage(img, 0, 0, c.width, c.height);
resolve(c.toDataURL(_lhD("aW1hZ2UvanBlZw=="), quality));
};
img.onerror = () => reject(new Error(_lhD("4bqibmgga2jDtG5nIGjhu6NwIGzhu4cu")));
img.src = reader.result;
};
reader.readAsDataURL(file);
});
}
export function editAvatarModal(u, onSave) {
let imgObj = null, zoom = 1, dx = 0, dy = 0, removed = false, dirty = false;
const SIZE = 400;
return modal({
title: _lhD("Q2jhu4luaCBz4butYSDhuqNuaCDEkeG6oWkgZGnhu4du"),
sub: u?.name ? `${u.name}${u.className ? _lhD("IMK3IA==") + u.className : ''}` : '',
body: `${_lhD("PGRpdiBjbGFzcz0ic3RhY2siIHN0eWxlPSJhbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjE0cHgiPgogICAgICA8ZGl2IGlkPSJhdlN0YWdlIiBzdHlsZT0icG9zaXRpb246cmVsYXRpdmU7d2lkdGg6MjEwcHg7aGVpZ2h0OjIxMHB4O2JvcmRlci1yYWRpdXM6NTAlO292ZXJmbG93OmhpZGRlbjtib3gtc2hhZG93OjAgMCAwIDRweCB2YXIoLS1icmFuZC1zb2Z0KSx2YXIoLS1zaGFkb3ctMSk7YmFja2dyb3VuZDp2YXIoLS1zdXJmYWNlLTIpO2N1cnNvcjpncmFiO3RvdWNoLWFjdGlvbjpub25lO2Rpc3BsYXk6Z3JpZDtwbGFjZS1pdGVtczpjZW50ZXIiPgogICAgICAgIDxjYW52YXMgaWQ9ImF2Q2FudmFzIiB3aWR0aD0i")}${SIZE}${_lhD("IiBoZWlnaHQ9Ig==")}${SIZE}${_lhD("IiBzdHlsZT0id2lkdGg6MTAwJTtoZWlnaHQ6MTAwJTtkaXNwbGF5Om5vbmUiPjwvY2FudmFzPgogICAgICAgIDxkaXYgaWQ9ImF2RmFsbGJhY2siIHN0eWxlPSJkaXNwbGF5OmdyaWQ7cGxhY2UtaXRlbXM6Y2VudGVyO3dpZHRoOjEwMCU7aGVpZ2h0OjEwMCUiPg==")}${avatar({ ...u, avatar: null }, _lhD("bGc="))}${_lhD("PC9kaXY+CiAgICAgIDwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJyb3cgbm93cmFwIiBpZD0iYXZab29tUm93IiBzdHlsZT0id2lkdGg6MTAwJTttYXgtd2lkdGg6MjgwcHg7Z2FwOjEwcHgiIGhpZGRlbj4KICAgICAgICA8c3BhbiBjbGFzcz0ieHMgbXV0ZWQiPlRodSBuaOG7jzwvc3Bhbj4KICAgICAgICA8aW5wdXQgdHlwZT0icmFuZ2UiIGlkPSJhdlpvb20iIG1pbj0iMSIgbWF4PSIzIiBzdGVwPSIwLjAyIiB2YWx1ZT0iMSIgc3R5bGU9ImZsZXg6MSI+CiAgICAgICAgPHNwYW4gY2xhc3M9InhzIG11dGVkIj5QaMOzbmcgdG88L3NwYW4+CiAgICAgIDwvZGl2PgogICAgICA8c3BhbiBjbGFzcz0ieHMgbXV0ZWQiIGlkPSJhdkhpbnQiPkLhuqVtIOKAnENo4buNbiDhuqNuaOKAnSDEkeG7gyB04bqjaSDhuqNuaCBt4bubaSBob+G6t2Mga8OpbyDhuqNuaCDEkeG7gyBjxINuIGNo4buJbmgga2h1bmcgdHLDsm48L3NwYW4+CiAgICAgIDxkaXYgY2xhc3M9InJvdyIgc3R5bGU9ImdhcDo4cHg7anVzdGlmeS1jb250ZW50OmNlbnRlciI+CiAgICAgICAgPGxhYmVsIGNsYXNzPSJidG4gc29mdCBzbSIgc3R5bGU9ImN1cnNvcjpwb2ludGVyIj4=")}${icon(_lhD("Y2FtZXJh"))}${_lhD("IENo4buNbiDhuqNuaCB04burIHRoaeG6v3QgYuG7izxpbnB1dCB0eXBlPSJmaWxlIiBpZD0iYXZGaWxlIiBhY2NlcHQ9ImltYWdlLyoiIGhpZGRlbj48L2xhYmVsPgogICAgICAgIDxidXR0b24gdHlwZT0iYnV0dG9uIiBjbGFzcz0iYnRuIGdob3N0IHNtIiBpZD0iYXZSZXNldCIgaGlkZGVuPg==")}${icon(_lhD("cmVmcmVzaA=="))}${_lhD("IEPEg24gZ2nhu69hPC9idXR0b24+CiAgICAgICAgPGJ1dHRvbiB0eXBlPSJidXR0b24iIGNsYXNzPSJidG4gZ2hvc3Qgc20iIGlkPSJhdkNsZWFyIiBzdHlsZT0iY29sb3I6dmFyKC0tYmFkKSIg")}${u?.avatar ? '' : _lhD("aGlkZGVu")}${_lhD("Pg==")}${icon(_lhD("dHJhc2g="))}${_lhD("IFjDs2Eg4bqjbmg8L2J1dHRvbj4KICAgICAgPC9kaXY+CiAgICA8L2Rpdj4=")}`,
foot: `${_lhD("PGJ1dHRvbiBjbGFzcz0iYnRuIGdob3N0IiBkYXRhLWNsb3NlPkjhu6d5PC9idXR0b24+PGJ1dHRvbiBjbGFzcz0iYnRuIiBpZD0iYXZTYXZlIj4=")}${icon(_lhD("Y2hlY2s="))}${_lhD("IEzGsHUg4bqjbmggxJHhuqFpIGRp4buHbjwvYnV0dG9uPg==")}`,
onMount: (m, close) => {
const cvs = $(_lhD("I2F2Q2FudmFz"), m), ctx = cvs.getContext(_lhD("MmQ=")), fb = $(_lhD("I2F2RmFsbGJhY2s="), m);
const zRow = $(_lhD("I2F2Wm9vbVJvdw=="), m), zInp = $(_lhD("I2F2Wm9vbQ=="), m), rst = $(_lhD("I2F2UmVzZXQ="), m), clr = $(_lhD("I2F2Q2xlYXI="), m), stg = $(_lhD("I2F2U3RhZ2U="), m);
const fbSpan = fb.querySelector(_lhD("LmF2YXRhcg=="));
if (fbSpan) { fbSpan.style.width = _lhD("MTAwJQ=="); fbSpan.style.height = _lhD("MTAwJQ=="); fbSpan.style.fontSize = _lhD("My4ycmVt"); }
const clamp = () => {
if (!imgObj) return;
const base = Math.max(SIZE / imgObj.width, SIZE / imgObj.height) * zoom;
const maxX = Math.max(0, (imgObj.width * base - SIZE) / 2);
const maxY = Math.max(0, (imgObj.height * base - SIZE) / 2);
dx = Math.max(-maxX, Math.min(maxX, dx));
dy = Math.max(-maxY, Math.min(maxY, dy));
};
const paint = () => {
if (!imgObj) {
cvs.style.display = _lhD("bm9uZQ=="); fb.style.display = _lhD("Z3JpZA=="); zRow.hidden = true; rst.hidden = true;
return;
}
cvs.style.display = _lhD("YmxvY2s="); fb.style.display = _lhD("bm9uZQ=="); zRow.hidden = false; rst.hidden = (zoom === 1 && dx === 0 && dy === 0); clr.hidden = false;
clamp();
ctx.clearRect(0, 0, SIZE, SIZE);
const s = Math.max(SIZE / imgObj.width, SIZE / imgObj.height) * zoom;
const w = imgObj.width * s, h = imgObj.height * s;
ctx.drawImage(imgObj, (SIZE - w) / 2 + dx, (SIZE - h) / 2 + dy, w, h);
};
const loadSrc = (src, markDirty = false) => {
const im = new Image();
im.crossOrigin = _lhD("YW5vbnltb3Vz");
im.onload = () => { imgObj = im; zoom = 1; dx = 0; dy = 0; zInp.value = _lhD("MQ=="); removed = false; if (markDirty) dirty = true; paint(); };
im.onerror = () => toast(_lhD("S2jDtG5nIMSR4buNYyDEkcaw4bujYyB04buHcCDhuqNuaC4="), _lhD("d2Fybg=="));
im.src = src;
};
if (u?.avatar) loadSrc(fileUrl(u.avatar), false);
$(_lhD("I2F2RmlsZQ=="), m).onchange = (e) => {
const f = e.target.files?.[0]; if (!f) return;
if (!f.type.startsWith(_lhD("aW1hZ2Uv"))) return toast(_lhD("VnVpIGzDsm5nIGNo4buNbiB04buHcCBow6xuaCDhuqNuaC4="), _lhD("d2Fybg=="));
const r = new FileReader();
r.onload = () => loadSrc(r.result, true);
r.readAsDataURL(f);
e.target.value = '';
};
zInp.oninput = () => { zoom = Number(zInp.value) || 1; dirty = true; paint(); };
stg.addEventListener(_lhD("d2hlZWw="), (e) => {
if (!imgObj) return;
e.preventDefault();
zoom = Math.max(1, Math.min(3, zoom + (e.deltaY < 0 ? 0.08 : -0.08)));
zInp.value = String(zoom); dirty = true; paint();
}, { passive: false });
let drag = null;
stg.addEventListener(_lhD("cG9pbnRlcmRvd24="), (e) => {
if (!imgObj) return $(_lhD("I2F2RmlsZQ=="), m).click();
stg.setPointerCapture(e.pointerId);
drag = { x: e.clientX, y: e.clientY, dx0: dx, dy0: dy };
stg.style.cursor = _lhD("Z3JhYmJpbmc=");
});
stg.addEventListener(_lhD("cG9pbnRlcm1vdmU="), (e) => {
if (!drag || !imgObj) return;
const ratio = SIZE / stg.clientWidth;
dx = drag.dx0 + (e.clientX - drag.x) * ratio;
dy = drag.dy0 + (e.clientY - drag.y) * ratio;
dirty = true; paint();
});
const endDrag = () => { drag = null; stg.style.cursor = _lhD("Z3JhYg=="); };
stg.addEventListener(_lhD("cG9pbnRlcnVw"), endDrag);
stg.addEventListener(_lhD("cG9pbnRlcmNhbmNlbA=="), endDrag);
rst.onclick = () => { zoom = 1; dx = 0; dy = 0; zInp.value = _lhD("MQ=="); dirty = true; paint(); };
clr.onclick = () => { imgObj = null; removed = true; dirty = true; clr.hidden = true; paint(); };
$(_lhD("I2F2U2F2ZQ=="), m).onclick = () => withBusy($(_lhD("I2F2U2F2ZQ=="), m), async () => {
try {
let out;
if (removed || !imgObj) out = '';
else if (dirty) out = cvs.toDataURL(_lhD("aW1hZ2UvanBlZw=="), 0.88);
else out = cvs.toDataURL(_lhD("aW1hZ2UvanBlZw=="), 0.88);
await onSave(out);
close();
} catch (er) { toast(er?.message || _lhD("S2jDtG5nIGzGsHUgxJHGsOG7o2Mg4bqjbmggxJHhuqFpIGRp4buHbi4="), _lhD("YmFk")); }
});
},
});
}
export async function detectFace(dataUrl) {
const img = new Image();
await new Promise((res, rej) => { img.onload = res; img.onerror = () => rej(new Error(_lhD("4bqibmgga2jDtG5nIGjhu6NwIGzhu4cu"))); img.src = dataUrl; });
if (typeof FaceDetector === _lhD("ZnVuY3Rpb24=")) {
try {
const det = new FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
const faces = await det.detect(img);
return faces.length > 0;
} catch {  }
}
const max = 220;
const s = Math.min(1, max / Math.max(img.width, img.height));
const c = document.createElement(_lhD("Y2FudmFz")); c.width = Math.max(1, Math.round(img.width * s)); c.height = Math.max(1, Math.round(img.height * s));
const g = c.getContext(_lhD("MmQ=")); g.drawImage(img, 0, 0, c.width, c.height);
let data, width = c.width, height = c.height;
try { ({ data } = g.getImageData(0, 0, width, height)); } catch { return true; }
let skin = 0, total = 0;
const x0 = Math.round(width * 0.2), x1 = Math.round(width * 0.8), y0 = Math.round(height * 0.08), y1 = Math.round(height * 0.9);
for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
const i = (y * width + x) * 4;
const r = data[i], gg = data[i + 1], b = data[i + 2];
total++;
const max3 = Math.max(r, gg, b), min3 = Math.min(r, gg, b);
if (r > 60 && gg > 30 && b > 15 && max3 - min3 > 12 && Math.abs(r - gg) > 10 && r > gg + 4 && r > b) skin++;
}
return total > 0 && skin / total > 0.1;
}
export async function copyText(text) {
try { await navigator.clipboard.writeText(text); toast(_lhD("xJDDoyBzYW8gY2jDqXA="), _lhD("b2s="), 1800); }
catch { const t = document.createElement(_lhD("dGV4dGFyZWE=")); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand(_lhD("Y29weQ==")); toast(_lhD("xJDDoyBzYW8gY2jDqXA="), _lhD("b2s="), 1800); } catch { toast(_lhD("S2jDtG5nIHNhbyBjaMOpcCDEkcaw4bujYywgaMOjeSBjaOG7jW4gdsOgIHNhbyBjaMOpcCB0aOG7pyBjw7RuZy4="), _lhD("d2Fybg==")); } t.remove(); }
}
export const empty = (title, text = '', ico = _lhD("c3BhcmtsZXM="), action = '') => `${_lhD("PGRpdiBjbGFzcz0iZW1wdHkiPjxkaXYgY2xhc3M9ImFydCI+")}${icon(ico)}${_lhD("PC9kaXY+PGg0Pg==")}${esc(title)}${_lhD("PC9oND4=")}${text ? `${_lhD("PHAgY2xhc3M9InNtYWxsIj4=")}${text}${_lhD("PC9wPg==")}` : ''}${action}${_lhD("PC9kaXY+")}`;
export const skeleton = (rows = 3) => `${_lhD("PGRpdiBjbGFzcz0ibG9hZGluZy1wYWdlIj4=")}${_lhD("PGRpdiBjbGFzcz0ic2tlbCIgc3R5bGU9ImhlaWdodDoxMjBweCI+PC9kaXY+").repeat(rows)}${_lhD("PC9kaXY+")}`;
export const badge = (text, tone = '') => `${_lhD("PHNwYW4gY2xhc3M9ImJhZGdlIA==")}${tone}${_lhD("Ij4=")}${esc(text)}${_lhD("PC9zcGFuPg==")}`;
export function barChart(data, { height = 180, width = 560, max = null, unit = '', color = _lhD("dmFyKC0tYnJhbmQp"), format = (v) => v } = {}) {
const W = Math.max(280, Math.round(width)), H = height, padL = 38, padB = 26, padT = 16;
const top = max ?? Math.max(1, ...data.map(d => d.value ?? 0));
const nice = top <= 5 ? 5 : top <= 10 ? 10 : Math.ceil(top / (top > 50 ? 25 : 5)) * (top > 50 ? 25 : 5);
const bw = (W - padL - 10) / data.length;
const y = (v) => H - padB - ((v ?? 0) / nice) * (H - padB - padT);
const ticks = [0, nice / 2, nice];
return `${_lhD("PHN2ZyBjbGFzcz0iY2hhcnQiIHZpZXdCb3g9IjAgMCA=")}${W} ${H}${_lhD("IiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IkJp4buDdSDEkeG7kyBj4buZdCI+CiAgICA=")}${ticks.map(t => `${_lhD("PGxpbmUgY2xhc3M9ImdyaWQtbGluZSIgeDE9Ig==")}${padL}${_lhD("IiB4Mj0i")}${W - 6}${_lhD("IiB5MT0i")}${y(t)}${_lhD("IiB5Mj0i")}${y(t)}${_lhD("Ii8+PHRleHQgeD0i")}${padL - 8}${_lhD("IiB5PSI=")}${y(t) + 4}${_lhD("IiB0ZXh0LWFuY2hvcj0iZW5kIj4=")}${format(t)}${unit}${_lhD("PC90ZXh0Pg==")}`).join('')}
${data.map((d, i) => { const w = Math.min(bw * .6, 72), x = padL + i * bw + (bw - w) / 2, yy = y(d.value), h = H - padB - yy; return `${_lhD("PHJlY3QgeD0i")}${x.toFixed(1)}${_lhD("IiB5PSI=")}${yy.toFixed(1)}${_lhD("IiB3aWR0aD0i")}${w.toFixed(1)}${_lhD("IiBoZWlnaHQ9Ig==")}${Math.max(0, h).toFixed(1)}${_lhD("IiByeD0iNiIgZmlsbD0i")}${d.value === null ? _lhD("dmFyKC0tc3VyZmFjZS0zKQ==") : d.color || color}${_lhD("Ij48dGl0bGU+")}${esc(d.label)}${_lhD("OiA=")}${d.value ?? _lhD("4oCU")}${unit}${_lhD("PC90aXRsZT48L3JlY3Q+")}${d.value !== null && d.value !== undefined ? `${_lhD("PHRleHQgeD0i")}${(x + w / 2).toFixed(1)}${_lhD("IiB5PSI=")}${(yy - 5).toFixed(1)}${_lhD("IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBzdHlsZT0iZmlsbDp2YXIoLS1pbmstMik7Zm9udC13ZWlnaHQ6NjAwIj4=")}${format(d.value)}${_lhD("PC90ZXh0Pg==")}` : ''}${_lhD("PHRleHQgeD0i")}${(x + w / 2).toFixed(1)}${_lhD("IiB5PSI=")}${H - 8}${_lhD("IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4=")}${esc(d.label)}${_lhD("PC90ZXh0Pg==")}`; }).join('')}${_lhD("CiAgPC9zdmc+")}`;
}
export function donut(data, { size = 160, thickness = 22, center = '', sub = '' } = {}) {
const total = data.reduce((a, d) => a + d.value, 0) || 1;
const r = (size - thickness) / 2, c = 2 * Math.PI * r; let off = 0;
const arcs = data.filter(d => d.value > 0).map(d => { const len = (d.value / total) * c; const s = `${_lhD("PGNpcmNsZSByPSI=")}${r}${_lhD("IiBjeD0i")}${size / 2}${_lhD("IiBjeT0i")}${size / 2}${_lhD("IiBmaWxsPSJub25lIiBzdHJva2U9Ig==")}${d.color}${_lhD("IiBzdHJva2Utd2lkdGg9Ig==")}${thickness}${_lhD("IiBzdHJva2UtZGFzaGFycmF5PSI=")}${len.toFixed(2)} ${(c - len).toFixed(2)}${_lhD("IiBzdHJva2UtZGFzaG9mZnNldD0i")}${(-off).toFixed(2)}${_lhD("Ij48dGl0bGU+")}${esc(d.label)}${_lhD("OiA=")}${d.value}${_lhD("PC90aXRsZT48L2NpcmNsZT4=")}`; off += len; return s; }).join('');
return `${_lhD("PHN2ZyB3aWR0aD0i")}${size}${_lhD("IiBoZWlnaHQ9Ig==")}${size}${_lhD("IiB2aWV3Qm94PSIwIDAg")}${size} ${size}${_lhD("IiBzdHlsZT0ibWF4LXdpZHRoOjEwMCU7aGVpZ2h0OmF1dG8iIHJvbGU9ImltZyIgYXJpYS1sYWJlbD0iQmnhu4N1IMSR4buTIHThu7cgbOG7hyI+PGcgdHJhbnNmb3JtPSJyb3RhdGUoLTkwIA==")}${size / 2} ${size / 2}${_lhD("KSI+PGNpcmNsZSByPSI=")}${r}${_lhD("IiBjeD0i")}${size / 2}${_lhD("IiBjeT0i")}${size / 2}${_lhD("IiBmaWxsPSJub25lIiBzdHJva2U9InZhcigtLXN1cmZhY2UtMykiIHN0cm9rZS13aWR0aD0i")}${thickness}${_lhD("Ii8+")}${arcs}${_lhD("PC9nPgogICAgPHRleHQgeD0iNTAlIiB5PSI=")}${center && sub ? _lhD("NDgl") : _lhD("NTMl")}${_lhD("IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBzdHlsZT0iZm9udDo2MDAgMjJweCB2YXIoLS1mb250LWRpc3BsYXkpO2ZpbGw6dmFyKC0taW5rKSI+")}${esc(center)}${_lhD("PC90ZXh0Pg==")}${sub ? `${_lhD("PHRleHQgeD0iNTAlIiB5PSI2MiUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIHN0eWxlPSJmb250OjUwMCAxMXB4IHZhcigtLWZvbnQtYm9keSk7ZmlsbDp2YXIoLS1tdXRlZCkiPg==")}${esc(sub)}${_lhD("PC90ZXh0Pg==")}` : ''}${_lhD("PC9zdmc+")}`;
}
export function sparkline(values, { width = 120, height = 36, color = _lhD("dmFyKC0tYnJhbmQp") } = {}) {
const v = values.map(x => x ?? 0); const max = Math.max(...v, 1), min = Math.min(...v, 0);
const pts = v.map((x, i) => [(i / Math.max(1, v.length - 1)) * width, height - 4 - ((x - min) / (max - min || 1)) * (height - 8)]);
const d = pts.map((p, i) => `${i ? _lhD("TA==") : _lhD("TQ==")}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('');
return `${_lhD("PHN2ZyB3aWR0aD0i")}${width}${_lhD("IiBoZWlnaHQ9Ig==")}${height}${_lhD("IiB2aWV3Qm94PSIwIDAg")}${width} ${height}${_lhD("IiBzdHlsZT0ibWF4LXdpZHRoOjEwMCUiPjxwYXRoIGQ9Ig==")}${d}${_lhD("IEw=")}${width} ${height}${_lhD("IEwwIA==")}${height}${_lhD("WiIgZmlsbD0i")}${color}${_lhD("IiBvcGFjaXR5PSIuMTIiLz48cGF0aCBkPSI=")}${d}${_lhD("IiBmaWxsPSJub25lIiBzdHJva2U9Ig==")}${color}${_lhD("IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxjaXJjbGUgY3g9Ig==")}${pts.at(-1)[0]}${_lhD("IiBjeT0i")}${pts.at(-1)[1]}${_lhD("IiByPSIzIiBmaWxsPSI=")}${color}${_lhD("Ii8+PC9zdmc+")}`;
}
export function gauge(score, color) {
const a = Math.PI * (1 - score / 100), x = 60 + 46 * Math.cos(a), y = 60 - 46 * Math.sin(a);
return `${_lhD("PHN2ZyBjbGFzcz0iZ2F1Z2UiIHZpZXdCb3g9IjAgMCAxMjAgNzIiIHJvbGU9ImltZyIgYXJpYS1sYWJlbD0ixJBp4buDbSBy4bunaSBybyA=")}${score}${_lhD("LzEwMCI+PHBhdGggZD0iTTE0IDYwIEE0NiA0NiAwIDAgMSAxMDYgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0idmFyKC0tc3VyZmFjZS0zKSIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTE0IDYwIEE0NiA0NiAwIDAgMSA=")}${x.toFixed(1)} ${y.toFixed(1)}${_lhD("IiBmaWxsPSJub25lIiBzdHJva2U9Ig==")}${color}${_lhD("IiBzdHJva2Utd2lkdGg9IjEwIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48dGV4dCB4PSI2MCIgeT0iNTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIHN0eWxlPSJmb250OjcwMCAyMnB4IHZhcigtLWZvbnQtZGlzcGxheSk7ZmlsbDo=")}${color}${_lhD("Ij4=")}${score}${_lhD("PC90ZXh0Pjx0ZXh0IHg9IjYwIiB5PSI3MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgc3R5bGU9ImZvbnQ6NTAwIDlweCB2YXIoLS1mb250LWJvZHkpO2ZpbGw6dmFyKC0tbXV0ZWQpIj4vIDEwMCDEkWnhu4NtIHLhu6dpIHJvPC90ZXh0Pjwvc3ZnPg==")}`;
}
const CAT_ICON = { violence: _lhD("c2hpZWxkQWxlcnQ="), scam: _lhD("YWxlcnQ="), drugs: _lhD("cGlsbA=="), explosive: _lhD("Ym9tYg=="), law: _lhD("c2NhbGU="), traffic: _lhD("Y2Fy"), wellbeing: _lhD("aGVhcnRIYW5k"), school: _lhD("c2Nob29s") };
export function cover(n, tag = true) {
return `${_lhD("PGRpdiBjbGFzcz0iY292ZXIiIGRhdGEtY2F0PSI=")}${esc(n.category)}${_lhD("Ij4=")}${n.cover ? `${_lhD("PGltZyBzcmM9Ig==")}${esc(n.cover)}${_lhD("IiBhbHQ9IiIgbG9hZGluZz0ibGF6eSI+")}` : icon(CAT_ICON[n.category] || _lhD("bmV3cw=="))}${tag ? `${_lhD("PHNwYW4gY2xhc3M9ImN2LXRhZyBiYWRnZSBzb2xpZCIgc3R5bGU9ImJhY2tncm91bmQ6cmdiYSgxMCwyMCw1MCwuNTUpO2NvbG9yOiNmZmY7YmFja2Ryb3AtZmlsdGVyOmJsdXIoNnB4KSI+")}${esc(n.badge || '')}${_lhD("PC9zcGFuPg==")}` : ''}${_lhD("PC9kaXY+")}`;
}
export function initTheme() {
const t = store.get(_lhD("dGhlbWU="));
if (t === _lhD("ZGFyaw==") || t === _lhD("bGlnaHQ=")) document.documentElement.dataset.theme = t;
}
export function toggleTheme() {
const cur = document.documentElement.dataset.theme || (matchMedia(_lhD("KHByZWZlcnMtY29sb3Itc2NoZW1lOiBkYXJrKQ==")).matches ? _lhD("ZGFyaw==") : _lhD("bGlnaHQ="));
const next = cur === _lhD("ZGFyaw==") ? _lhD("bGlnaHQ=") : _lhD("ZGFyaw==");
document.documentElement.dataset.theme = next; store.set(_lhD("dGhlbWU="), next);
return next;
}
export function initDevToolsGuard() {
try {
if (new URLSearchParams(location.search).has(_lhD("ZGVidWc=")) || store.get(_lhD("bGhfYWxsb3dfZGV2dG9vbHM="))) return;
document.addEventListener(_lhD("Y29udGV4dG1lbnU="), (e) => e.preventDefault());
document.addEventListener(_lhD("a2V5ZG93bg=="), (e) => {
const k = e.key?.toLowerCase();
if (k === _lhD("ZjEy")) return e.preventDefault();
if ((e.ctrlKey || e.metaKey) && e.shiftKey && [_lhD("aQ=="), _lhD("ag=="), _lhD("Yw==")].includes(k)) return e.preventDefault();
if ((e.ctrlKey || e.metaKey) && k === _lhD("dQ==")) return e.preventDefault();
});
} catch {  }
}
export function idCard(u, settings) {
const bars = [...(u.id || _lhD("MDAwMA=="))].flatMap((c, i) => { const n = c.charCodeAt(0); return [1 + (n % 3), 1 + ((n >> 2) % 2), 2 + ((n + i) % 3)]; }).slice(0, 26);
return `${_lhD("PGRpdiBjbGFzcz0iaWRjYXJkIj4KICAgIDxkaXYgY2xhc3M9InRvcCI+PGltZyBzcmM9Ig==")}${esc(settings?.logo || _lhD("YXNzZXRzL2xvZ28tbWFyay5zdmc="))}${_lhD("IiBhbHQ9IiI+PGRpdj48Yj4=")}${esc(settings?.schoolName || _lhD("VHLGsOG7nW5nIFRIUFQ="))}${_lhD("PC9iPjxzcGFuPlRo4bq7IGjhu41jIHNpbmggxJFp4buHbiB04butIMK3IA==")}${esc(settings?.schoolYear || '')}${_lhD("PC9zcGFuPjwvZGl2PjwvZGl2PgogICAgPGRpdiBjbGFzcz0iYm9keSI+PGRpdiBjbGFzcz0icGhvdG8iPg==")}${u.avatar ? `${_lhD("PGltZyBzcmM9Ig==")}${esc(u.avatar)}${_lhD("IiBhbHQ9IiI+")}` : esc(firstName(u.name).slice(0, 1))}${_lhD("PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9Imdyb3ciPjxkaXYgY2xhc3M9Im5hbWUiPg==")}${esc(u.name)}${_lhD("PC9kaXY+PGRsIGNsYXNzPSJrdiI+PGR0Pkzhu5twPC9kdD48ZGQ+")}${esc(u.className || '')}${_lhD("PC9kZD48ZHQ+TmfDoHkgc2luaDwvZHQ+PGRkPg==")}${u.dob ? fmtDate(u.dob) : _lhD("4oCU")}${_lhD("PC9kZD48ZHQ+TmnDqm4ga2jDs2E8L2R0PjxkZD4=")}${esc(u.courseYear || '')}${_lhD("PC9kZD48L2RsPjwvZGl2PjwvZGl2PgogICAgPGRpdiBjbGFzcz0iaWRjb2RlIj48ZGl2PjxkaXYgY2xhc3M9InhzIiBzdHlsZT0ib3BhY2l0eTouNyI+TcOjIGjhu41jIHNpbmg8L2Rpdj48ZGl2IGNsYXNzPSJtb25vIj4=")}${esc(u.id)}${_lhD("PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz0iYmFycyIgYXJpYS1oaWRkZW49InRydWUiPg==")}${bars.map(w => `${_lhD("PGkgc3R5bGU9IndpZHRoOg==")}${w}${_lhD("cHgiPjwvaT4=")}`).join('')}${_lhD("PC9kaXY+PC9kaXY+CiAgPC9kaXY+")}`;
}
export const isNativeApp = () => !!(typeof window !== _lhD("dW5kZWZpbmVk") && (window.LH_CONFIG?.app || window.Capacitor?.isNativePlatform?.()));
export const apiBase = () => {
const saved = isNativeApp() ? store.get(_lhD("bGhfYXBpX2Jhc2U="), null) : null;
return String(saved ?? (typeof window !== _lhD("dW5kZWZpbmVk") ? window.LH_CONFIG?.apiBase : '') ?? '').replace(/\/+$/, '');
};
export const fileUrl = (u = '') => (/^uploads\//.test(u) && apiBase() ? `${apiBase()}${_lhD("Lw==")}${u}` : u);
export const fmtSize = (n = 0) => (n >= 1048576 ? `${(n / 1048576).toFixed(n >= 10485760 ? 0 : 1)}${_lhD("IE1C")}` : n >= 1024 ? `${Math.round(n / 1024)}${_lhD("IEtC")}` : `${n}${_lhD("IEI=")}`);
export function readDataUrl(file) {
return new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = () => reject(new Error(_lhD("S2jDtG5nIMSR4buNYyDEkcaw4bujYyB04buHcC4="))); r.readAsDataURL(file); });
}
const FILE_ICON = { image: _lhD("aW1hZ2U="), video: _lhD("dmlkZW8="), audio: _lhD("bXVzaWM="), file: _lhD("ZmlsZQ==") };
const extOf = (name = '') => (name.split(_lhD("Lg==")).pop() || '').slice(0, 4).toUpperCase();
export function attachmentsHtml(list = []) {
if (!list?.length) return '';
const imgs = list.filter(a => a.kind === _lhD("aW1hZ2U=")), others = list.filter(a => a.kind !== _lhD("aW1hZ2U="));
return `${_lhD("PGRpdiBjbGFzcz0iYXR0cyI+")}${imgs.length ? `${_lhD("PGRpdiBjbGFzcz0iYXR0LWdyaWQgbg==")}${Math.min(imgs.length, 4)}${_lhD("Ij4=")}${imgs.map(a => `${_lhD("PGJ1dHRvbiB0eXBlPSJidXR0b24iIGNsYXNzPSJhdHQtaW1nIiBkYXRhLWxpZ2h0Ym94PSI=")}${esc(fileUrl(a.url))}${_lhD("IiBhcmlhLWxhYmVsPSJYZW0g4bqjbmgg")}${esc(a.name)}${_lhD("Ij48aW1nIHNyYz0i")}${esc(fileUrl(a.url))}${_lhD("IiBhbHQ9Ig==")}${esc(a.name)}${_lhD("IiBsb2FkaW5nPSJsYXp5Ij48L2J1dHRvbj4=")}`).join('')}${_lhD("PC9kaXY+")}` : ''}${others.map(a => a.kind === _lhD("dmlkZW8=")
? `${_lhD("PHZpZGVvIGNsYXNzPSJhdHQtdmlkZW8iIHNyYz0i")}${esc(fileUrl(a.url))}${_lhD("IiBjb250cm9scyBwbGF5c2lubGluZSBwcmVsb2FkPSJtZXRhZGF0YSI+PC92aWRlbz4=")}`
: a.kind === _lhD("YXVkaW8=") ? `${_lhD("PGF1ZGlvIGNsYXNzPSJhdHQtYXVkaW8iIHNyYz0i")}${esc(fileUrl(a.url))}${_lhD("IiBjb250cm9scyBwcmVsb2FkPSJub25lIj48L2F1ZGlvPg==")}`
: `${_lhD("PGEgY2xhc3M9ImF0dC1maWxlIiBocmVmPSI=")}${esc(fileUrl(a.url))}${_lhD("IiBkb3dubG9hZD0i")}${esc(a.name)}${_lhD("IiB0YXJnZXQ9Il9ibGFuayIgcmVsPSJub29wZW5lciI+PHNwYW4gY2xhc3M9ImF0dC1leHQiPg==")}${esc(extOf(a.name) || _lhD("VOG7hlA="))}${_lhD("PC9zcGFuPjxzcGFuIGNsYXNzPSJncm93IiBzdHlsZT0ibWluLXdpZHRoOjAiPjxiIGNsYXNzPSJ0cnVuY2F0ZSI+")}${esc(a.name)}${_lhD("PC9iPjxzcGFuIGNsYXNzPSJ4cyBtdXRlZCI+")}${a.size ? fmtSize(a.size) : _lhD("VMOgaSBsaeG7h3U=")}${_lhD("PC9zcGFuPjwvc3Bhbj4=")}${icon(_lhD("ZG93bmxvYWQ="))}${_lhD("PC9hPg==")}`).join('')}${_lhD("PC9kaXY+")}`;
}
if (typeof document !== _lhD("dW5kZWZpbmVk") && !window.__lhLightbox) {
window.__lhLightbox = true;
document.addEventListener(_lhD("bG9hZA=="), (e) => {
const t = e.target; if (t?.tagName !== _lhD("SU1H") && t?.tagName !== _lhD("VklERU8=")) return;
const cb = t.closest?.(_lhD("LmNoYXQtYm9keQ==")); if (!cb || !t.closest(_lhD("LmF0dHM="))) return;
if (cb.scrollHeight - cb.scrollTop - cb.clientHeight < t.offsetHeight + 160) cb.scrollTop = cb.scrollHeight;
}, true);
document.addEventListener(_lhD("Y2xpY2s="), (e) => {
const b = e.target.closest?.(_lhD("W2RhdGEtbGlnaHRib3hd")); if (!b) return;
e.preventDefault();
const src = b.dataset.lightbox;
const el = document.createElement(_lhD("ZGl2"));
el.className = _lhD("bGlnaHRib3g="); el.innerHTML = `${_lhD("PGltZyBzcmM9Ig==")}${esc(src)}${_lhD("IiBhbHQ9IiI+PGJ1dHRvbiBjbGFzcz0iaWNvbi1idG4iIGFyaWEtbGFiZWw9IsSQw7NuZyI+")}${icon(_lhD("eA=="))}${_lhD("PC9idXR0b24+")}`;
const close = () => { el.remove(); removeEventListener(_lhD("a2V5ZG93bg=="), onKey); };
const onKey = (ev) => { if (ev.key === _lhD("RXNjYXBl")) close(); };
el.onclick = close; addEventListener(_lhD("a2V5ZG93bg=="), onKey);
document.body.appendChild(el);
});
}
export const ATTACH_ACCEPT = _lhD("aW1hZ2UvKix2aWRlby8qLGF1ZGlvLyosLnBkZiwuZG9jLC5kb2N4LC54bHMsLnhsc3gsLnBwdCwucHB0eCwudHh0LC56aXAsLnJhcg==");
export function attachComposer(form, { max = 6, maxSize = 25 * 1024 * 1024 } = {}) {
const st = { files: [] };
if (!form) return { files: [], has: () => false, clear() {}, upload: async () => [] };
const input = document.createElement(_lhD("aW5wdXQ="));
input.type = _lhD("ZmlsZQ=="); input.multiple = true; input.accept = ATTACH_ACCEPT; input.hidden = true;
const btn = document.createElement(_lhD("YnV0dG9u"));
btn.type = _lhD("YnV0dG9u"); btn.className = _lhD("YnRuIGljb24gZ2hvc3QgYXR0YWNoLWJ0bg=="); btn.setAttribute(_lhD("YXJpYS1sYWJlbA=="), _lhD("xJDDrW5oIGvDqG0g4bqjbmgsIHZpZGVvIGhv4bq3YyB04buHcA==")); btn.title = _lhD("xJDDrW5oIGvDqG0g4bqjbmgsIHZpZGVvLCB04buHcA==");
btn.innerHTML = icon(_lhD("cGFwZXJjbGlw"));
const strip = document.createElement(_lhD("ZGl2")); strip.className = _lhD("YXR0YWNoLXN0cmlw"); strip.hidden = true;
form.prepend(btn); form.append(input); form.before(strip);
const draw = () => {
strip.hidden = !st.files.length;
strip.innerHTML = st.files.map((f, i) => `${_lhD("PGRpdiBjbGFzcz0iYXR0YWNoLWNoaXAiPg==")}${f.type.startsWith(_lhD("aW1hZ2Uv")) ? `${_lhD("PGltZyBzcmM9Ig==")}${f._url || (f._url = URL.createObjectURL(f))}${_lhD("IiBhbHQ9IiI+")}` : `${_lhD("PHNwYW4gY2xhc3M9ImF0dC1leHQiPg==")}${icon(FILE_ICON[f.type.split(_lhD("Lw=="))[0]] || _lhD("ZmlsZQ=="))}${_lhD("PC9zcGFuPg==")}`}${_lhD("PHNwYW4gY2xhc3M9Imdyb3ciIHN0eWxlPSJtaW4td2lkdGg6MCI+PGIgY2xhc3M9InRydW5jYXRlIj4=")}${esc(f.name)}${_lhD("PC9iPjxzcGFuIGNsYXNzPSJ4cyBtdXRlZCI+")}${fmtSize(f.size)}${_lhD("PC9zcGFuPjwvc3Bhbj48YnV0dG9uIHR5cGU9ImJ1dHRvbiIgY2xhc3M9Imljb24tYnRuIiBkYXRhLXJtPSI=")}${i}${_lhD("IiBhcmlhLWxhYmVsPSJC4buPIHThu4dwIj4=")}${icon(_lhD("eA=="))}${_lhD("PC9idXR0b24+PC9kaXY+")}`).join('');
strip.querySelectorAll(_lhD("W2RhdGEtcm1d")).forEach(b => b.onclick = () => { st.files.splice(+b.dataset.rm, 1); draw(); });
};
const add = (list) => {
for (const f of list) {
if (st.files.length >= max) { toast(`${_lhD("TeG7l2kgdGluIG5o4bqvbiDEkcOtbmgga8OobSB04buRaSDEkWEg")}${max}${_lhD("IHThu4dwLg==")}`, _lhD("d2Fybg==")); break; }
if (f.size > maxSize) { toast(`${_lhD("4oCc")}${f.name}${_lhD("4oCdIHF1w6EgbOG7m24gKHThu5FpIMSRYSA=")}${fmtSize(maxSize)}${_lhD("KS4=")}`, _lhD("d2Fybg==")); continue; }
st.files.push(f);
}
draw();
};
btn.onclick = () => input.click();
input.onchange = () => { add([...input.files]); input.value = ''; };
form.addEventListener(_lhD("cGFzdGU="), (e) => { const fs = [...(e.clipboardData?.files || [])]; if (fs.length) { e.preventDefault(); add(fs); } });
const zone = form.closest(_lhD("LmNoYXQ=")) || form;
zone.addEventListener(_lhD("ZHJhZ292ZXI="), (e) => { if (e.dataTransfer?.types?.includes(_lhD("RmlsZXM="))) { e.preventDefault(); zone.classList.add(_lhD("ZHJvcHBpbmc=")); } });
zone.addEventListener(_lhD("ZHJhZ2xlYXZl"), (e) => { if (e.target === zone) zone.classList.remove(_lhD("ZHJvcHBpbmc=")); });
zone.addEventListener(_lhD("ZHJvcA=="), (e) => { if (e.dataTransfer?.files?.length) { e.preventDefault(); zone.classList.remove(_lhD("ZHJvcHBpbmc=")); add([...e.dataTransfer.files]); } });
return {
get files() { return st.files; },
has: () => st.files.length > 0,
clear() { st.files.forEach(f => f._url && URL.revokeObjectURL(f._url)); st.files = []; draw(); },
async upload(fn) {
const out = [];
for (let i = 0; i < st.files.length; i++) {
strip.querySelectorAll(_lhD("LmF0dGFjaC1jaGlw"))[i]?.classList.add(_lhD("dXBsb2FkaW5n"));
out.push(await fn(st.files[i]));
}
return out;
},
};
}
let installEvt = null;
if (typeof window !== _lhD("dW5kZWZpbmVk")) {
addEventListener(_lhD("YmVmb3JlaW5zdGFsbHByb21wdA=="), (e) => { e.preventDefault(); installEvt = e; dispatchEvent(new CustomEvent(_lhD("bGg6aW5zdGFsbGFibGU="))); });
addEventListener(_lhD("YXBwaW5zdGFsbGVk"), () => { installEvt = null; });
}
export const isStandalone = () => !!(window.Capacitor?.isNativePlatform?.() || matchMedia(_lhD("KGRpc3BsYXktbW9kZTogc3RhbmRhbG9uZSk=")).matches || navigator.standalone);
export function initIdleLogout(onIdle, ms = 5 * 60000) {
if (isStandalone()) return () => {};
let timer = 0;
const reset = () => { clearTimeout(timer); timer = setTimeout(onIdle, ms); };
[_lhD("bW91c2Vtb3Zl"), _lhD("bW91c2Vkb3du"), _lhD("a2V5ZG93bg=="), _lhD("dG91Y2hzdGFydA=="), _lhD("c2Nyb2xs"), _lhD("d2hlZWw=")].forEach(ev => addEventListener(ev, reset, { passive: true }));
document.addEventListener(_lhD("dmlzaWJpbGl0eWNoYW5nZQ=="), () => { if (!document.hidden) reset(); });
reset();
return reset;
}
export const canInstall = () => !!installEvt && !isStandalone();
export const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
export async function installApp() {
if (installEvt) { installEvt.prompt(); const r = await installEvt.userChoice.catch(() => null); installEvt = null; return r?.outcome === _lhD("YWNjZXB0ZWQ="); }
modal({ title: _lhD("Q8OgaSBhcHAgbMOqbiDEkWnhu4duIHRob+G6oWk="), body: `${_lhD("PG9sIGNsYXNzPSJzbWFsbCIgc3R5bGU9Im1hcmdpbjowO3BhZGRpbmctbGVmdDoyMHB4O2Rpc3BsYXk6Z3JpZDtnYXA6OHB4Ij4=")}${isIos() ? _lhD("PGxpPk3hu58gdHJhbmcgbsOgeSBi4bqxbmcgPGI+U2FmYXJpPC9iPi48L2xpPjxsaT5C4bqlbSBuw7p0IDxiPkNoaWEgc+G6uzwvYj4gKMO0IHZ1w7RuZyBjw7MgbcWpaSB0w6puIGzDqm4pLjwvbGk+PGxpPkNo4buNbiA8Yj5UaMOqbSB2w6BvIE1IIGNow61uaDwvYj4gcuG7k2kgYuG6pW0gPGI+VGjDqm08L2I+LjwvbGk+") : _lhD("PGxpPk3hu58gdHJhbmcgbsOgeSBi4bqxbmcgPGI+Q2hyb21lPC9iPi48L2xpPjxsaT5C4bqlbSBtZW51IDxiPuKLrjwvYj4g4bufIGfDs2MgdHLDqm4gYsOqbiBwaOG6o2kuPC9saT48bGk+Q2jhu41uIDxiPkPDoGkgxJHhurd0IOG7qW5nIGThu6VuZzwvYj4gaG/hurdjIDxiPlRow6ptIHbDoG8gbcOgbiBow6xuaCBjaMOtbmg8L2I+LjwvbGk+")}${_lhD("PC9vbD48cCBjbGFzcz0ieHMgbXV0ZWQiIHN0eWxlPSJtYXJnaW4tdG9wOjEycHgiPk5ow6AgdHLGsOG7nW5nIGPFqW5nIGPDsyB0aOG7gyBwaMOhdCBow6BuaCB04buHcCBBUEsgY8OgaSB0cuG7sWMgdGnhur9wIGNobyBBbmRyb2lkLjwvcD4=")}`, foot: _lhD("PGJ1dHRvbiBjbGFzcz0iYnRuIiBkYXRhLWNsb3NlPsSQw6MgaGnhu4N1PC9idXR0b24+") });
return false;
}
const DEFAULT_APP_GUIDE = {
title: _lhD("SMaw4bubbmcgZOG6q24gdOG6o2kgQXBw"),
subtitle: _lhD("Q8OgaSDEkeG6t3Qg4bupbmcgZOG7pW5nIEPhu5VuZyBI4buNYyDEkMaw4budbmcgU+G7kSBUSFBUIEzDqiBIb8OgbiBsw6puIMSRaeG7h24gdGhv4bqhaSBBbmRyb2lkLCBpUGhvbmUgKGlPUykgdsOgIG3DoXkgdMOtbmggxJHhu4MgbeG7nyBuaGFuaCAxIGNo4bqhbSwgZ2nhu68gxJHEg25nIG5o4bqtcCB2w6Agbmjhuq1uIHRow7RuZyBiw6FvIHThu6ljIHRo4budaS4="),
qrTitle: _lhD("UXXDqXQgbcOjIFFSIMSR4buDIG3hu58gJiB04bqjaSB0csOqbiDEkWnhu4duIHRob+G6oWk="),
qrSub: _lhD("RMO5bmcgQ2FtZXJhLCBaYWxvIGhv4bq3YyB0csOsbmggZHV54buHdCBxdcOpdCBtw6MgxJHhu4MgbeG7nyBuZ2F5IHRyw6puIMSRaeG7h24gdGhv4bqhaQ=="),
qrBadge: _lhD("SOG7lyB0cuG7oyBBbmRyb2lkIMK3IGlPUyDCtyBQQw=="),
customUrl: '',
apkUrl: '',
qrNote: _lhD("TMawdSDDvTogTuG6v3UgbeG7nyBi4bqxbmcgxJHhu4thIGNo4buJIG3huqFuZyBu4buZaSBi4buZICgxOTIuMTY4LngueCksIMSRaeG7h24gdGhv4bqhaSB2w6AgbcOheSB0w61uaCBj4bqnbiBr4bq/dCBu4buRaSBjw7luZyBt4buZdCBt4bqhbmcgV2ktRmku"),
benefitsTitle: _lhD("TOG7o2kgw61jaCBraGkgY8OgaSBBcHAgbMOqbiB0aGnhur90IGLhu4s="),
benefits: [
{ icon: _lhD("c21hcnRwaG9uZQ=="), title: _lhD("TeG7nyBuaGFuaCAxIGNo4bqhbSB04burIE3DoG4gaMOsbmggY2jDrW5o"), desc: _lhD("Qmnhu4N1IHTGsOG7o25nIFRIUFQgTMOqIEhvw6BuIGhp4buDbiB0aOG7iyByacOqbmcgdHLDqm4gbcOgbiBow6xuaCBjaMOtbmgsIGNo4bqheSB0b8OgbiBtw6BuIGjDrG5oIG3GsOG7o3QgbcOgIG5oxrAg4bupbmcgZOG7pW5nIGfhu5FjLg==") },
{ icon: _lhD("ZmFjZQ=="), title: _lhD("R2nhu68gxJHEg25nIG5o4bqtcCAmIG3hu58ga2jDs2EgRmFjZSBJRA=="), desc: _lhD("S2jDtG5nIGLhu4sgdOG7sSDEkeG7mW5nIMSRxINuZyB4deG6pXQgc2F1IDUgcGjDunQgbmdo4buJIG5oxrAgdHLDqm4gdHLDrG5oIGR1eeG7h3Qgd2ViOyBo4buXIHRy4bujIMSRxINuZyBuaOG6rXAgYuG6sW5nIGtodcO0biBt4bq3dC4=") },
{ icon: _lhD("YmVsbA=="), title: _lhD("Tmjhuq1uIHRow7RuZyBiw6FvICYgdGluIG5o4bqvbiB04bupYyB0aOG7nWk="), desc: _lhD("xJDhu5NuZyBi4buZIHRo4budaSBnaWFuIHRo4buxYyAoUmVhbHRpbWUgU1NFKSBraGkgY8OzIHBo4bqjbiBo4buTaSB04burIGdpw6FvIHZpw6puLCBjaHV5w6puIHZpw6puIHTDom0gbMO9IGhv4bq3YyB0aMO0bmcgYsOhbyBraOG6qW4u") },
{ icon: _lhD("Y2FtZXJh"), title: _lhD("VMOtY2ggaOG7o3AgQ2FtZXJhLCBHaGkgw6JtICYgxJDhu4tuaCB24buLIEdQUw=="), desc: _lhD("Q2jhu6VwIOG6o25oIG1pbmggY2jhu6luZyB04buRIGdpw6FjIHRy4buxYyB0aeG6v3AsIGfhu61pIOG6o25oL3ZpZGVvL3Thu4dwIMSRw61uaCBrw6htIHbDoCDEkeG7i25oIHbhu4sgduG7iyB0csOtIGjhu5cgdHLhu6Mga2jhuqluIGPhuqVwLg==") },
],
platforms: [
{
id: _lhD("YW5kcm9pZA=="), icon: _lhD("c21hcnRwaG9uZQ=="), tone: _lhD("b2s="),
title: _lhD("MS4gxJBp4buHbiB0aG/huqFpIEFuZHJvaWQ="), badge: _lhD("Q2hyb21lIC8gQVBL"),
sub: _lhD("w4FwIGThu6VuZyBjaG8gU2Ftc3VuZywgWGlhb21pLCBPUFBPLCBWaXZvLCBSZWFsbWXigKY="),
steps: [
_lhD("UXXDqXQgbcOjIFFSIHBow61hIHRyw6puIGhv4bq3YyBt4bufIMSR4buLYSBjaOG7iSBj4buVbmcgdHLGsOG7nW5nIGLhurFuZyB0csOsbmggZHV54buHdCBHb29nbGUgQ2hyb21lLg=="),
_lhD("QuG6pW0gbsO6dCBDw6BpIEFwcCBuZ2F5IHRyw6puIHRyYW5nIG7DoHksIGhv4bq3YyBjaOG6oW0gbsO6dCBtZW51IOKLriAoZ8OzYyB0csOqbiBiw6puIHBo4bqjaSBDaHJvbWUpLg=="),
_lhD("Q2jhu41uIEPDoGkgxJHhurd0IOG7qW5nIGThu6VuZyAoSW5zdGFsbCBhcHApIGhv4bq3YyBUaMOqbSB2w6BvIG3DoG4gaMOsbmggY2jDrW5oIOKGkiBi4bqlbSBDw6BpIMSR4bq3dC4="),
_lhD("Q8OgaSBi4bqxbmcgdOG7h3AgQVBLIChu4bq/dSBjw7MpOiBU4bqjaSB04buHcCAuYXBrIGRvIG5ow6AgdHLGsOG7nW5nIGN1bmcgY+G6pXAg4oaSIG3hu58gdOG7h3Ag4oaSIGLhuq10IENobyBwaMOpcCBjw6BpIHThu6sgbmd14buTbiBuw6B5IOKGkiBDw6BpIMSR4bq3dC4="),
],
},
{
id: _lhD("aW9z"), icon: _lhD("c21hcnRwaG9uZQ=="), tone: _lhD("aW5mbw=="),
title: _lhD("Mi4gaVBob25lIC8gaVBhZCAoaU9TKQ=="), badge: _lhD("U2FmYXJp"),
sub: _lhD("w4FwIGThu6VuZyBjaG8gaVBob25lIHbDoCBpUGFkIChpT1MgLyBpUGFkT1Mp"),
steps: [
_lhD("TeG7nyDEkeG7i2EgY2jhu4kgQ+G7lW5nIEjhu41jIMSQxrDhu51uZyBT4buRIGLhurFuZyB0csOsbmggZHV54buHdCBTYWZhcmkgdHLDqm4gaVBob25lIC8gaVBhZC4="),
_lhD("Q2jhuqFtIHbDoG8gYmnhu4N1IHTGsOG7o25nIENoaWEgc+G6uyAoaMOsbmggw7QgdnXDtG5nIGPDsyBtxalpIHTDqm4gaMaw4bubbmcgbMOqbiDhu58gdGhhbmggY8O0bmcgY+G7pSBwaMOtYSBkxrDhu5tpKS4="),
_lhD("Q3Xhu5luIGRhbmggc8OhY2ggeHXhu5FuZyB2w6AgY2jhu41uIG3hu6VjIFRow6ptIHbDoG8gTUggY2jDrW5oIChBZGQgdG8gSG9tZSBTY3JlZW4pLg=="),
_lhD("TmjhuqVuIFRow6ptIChBZGQpIOG7nyBnw7NjIHRyw6puIGLDqm4gcGjhuqNpLiDhu6huZyBk4bulbmcgc+G6vSB4deG6pXQgaGnhu4duIG5nYXkgbmdvw6BpIG3DoG4gaMOsbmggY2jDrW5oLg=="),
],
},
{
id: _lhD("cGM="), icon: _lhD("Z2xvYmU="), tone: _lhD("dmlvbGV0"),
title: _lhD("My4gTcOheSB0w61uaCAvIExhcHRvcA=="), badge: _lhD("V2luZG93cyDCtyBtYWNPUw=="),
sub: _lhD("w4FwIGThu6VuZyBjaG8gQ2hyb21lLCBNaWNyb3NvZnQgRWRnZSwgQ+G7kWMgQ+G7kWM="),
steps: [
_lhD("TeG7nyBD4buVbmcgSOG7jWMgxJDGsOG7nW5nIFPhu5EgdHLDqm4gdHLDrG5oIGR1eeG7h3QgR29vZ2xlIENocm9tZSBob+G6t2MgTWljcm9zb2Z0IEVkZ2Uu"),
_lhD("TmjDrG4gbMOqbiBnw7NjIHBo4bqjaSB0aGFuaCDEkeG7i2EgY2jhu4kgVVJMLCBuaOG6pW4gdsOgbyBiaeG7g3UgdMaw4bujbmcgQ8OgaSDEkeG6t3QgKGjDrG5oIG3DoG4gaMOsbmggY8OzIG3FqWkgdMOqbiB04bqjaSB4deG7kW5nKSBob+G6t2MgYuG6pW0gbsO6dCBDw6BpIEFwcCBuZ2F5IOG7nyDEkeG6p3UgdHJhbmcu"),
_lhD("QuG6pW0geMOhYyBuaOG6rW4gQ8OgaSDEkeG6t3QgKEluc3RhbGwpLg=="),
_lhD("4buobmcgZOG7pW5nIHPhur0gbeG7nyB0cm9uZyBj4butYSBz4buVIHJpw6puZyB2w6AgdOG7sSB04bqhbyBs4buRaSB04bqvdCB0csOqbiBEZXNrdG9wIC8gdGhhbmggVGFza2Jhci4="),
],
},
],
serverTitle: _lhD("SMaw4bubbmcgZOG6q24ga+G6v3QgbuG7kWkgTcOheSBjaOG7pyB0csaw4budbmcgKGTDoG5oIGNobyBi4bqjbiBBUEsgQW5kcm9pZCk="),
serverText: _lhD("S2hpIGPDoGkgxJHhurd0IHThu6sgdOG7h3AgQVBLIEFuZHJvaWQgxJHhu5ljIGzhuq1wLCDhu58gbcOgbiBow6xuaCDEkMSDbmcgbmjhuq1wIGLhuqFuIGjDo3kgYuG6pW0gdsOgbyBt4bulYyBNw6F5IGNo4bunIHRyxrDhu51uZyDihpIgxJDhu5VpIHbDoCBuaOG6rXAgxJHhu4thIGNo4buJIHtVUkx9IHLhu5NpIGLhuqVtIEtp4buDbSB0cmEgJiBsxrB1IMSR4buDIMSR4buTbmcgYuG7mSB0w6BpIGtob+G6o24sIHRpbiBuaOG6r24gdsOgIEFJIGPhu6dhIHRyxrDhu51uZyB0aGVvIHRo4budaSBnaWFuIHRo4buxYy4="),
};
export async function renderAppGuide(view, { api, head, canEdit = false, showError = (e) => toast(e?.message || _lhD("TOG7l2k="), _lhD("YmFk")) }) {
const draw = async () => {
let lan = [], custom = null;
try {
const r = await api.get(_lhD("YXBpL2FwcC1ndWlkZQ=="));
lan = r?.lan || [];
custom = r?.guide || null;
} catch {
try { lan = (await api.get(_lhD("YXBpL3NlcnZlci1pbmZv")))?.lan || []; } catch { lan = []; }
}
const g = {
...DEFAULT_APP_GUIDE,
...(custom || {}),
benefits: custom?.benefits?.length ? custom.benefits : DEFAULT_APP_GUIDE.benefits,
platforms: custom?.platforms?.length ? custom.platforms : DEFAULT_APP_GUIDE.platforms,
};
const urls = [...new Set([...(g.customUrl ? [g.customUrl] : []), ...lan, location.origin])];
let curUrl = urls[0] || location.origin;
const installed = isStandalone();
const toneStyle = {
ok: _lhD("YmFja2dyb3VuZDp2YXIoLS1vay1zb2Z0KTtjb2xvcjp2YXIoLS1vayk="),
info: _lhD("YmFja2dyb3VuZDp2YXIoLS1icmFuZC1zb2Z0KTtjb2xvcjp2YXIoLS1icmFuZCk="),
violet: _lhD("YmFja2dyb3VuZDp2YXIoLS12aW9sZXQtc29mdCk7Y29sb3I6dmFyKC0tdmlvbGV0KQ=="),
warn: _lhD("YmFja2dyb3VuZDp2YXIoLS13YXJuLXNvZnQpO2NvbG9yOnZhcigtLXdhcm4p"),
};
view.innerHTML = head(
esc(g.title || DEFAULT_APP_GUIDE.title),
esc(g.subtitle || DEFAULT_APP_GUIDE.subtitle),
`${canEdit ? `${_lhD("PGJ1dHRvbiBjbGFzcz0iYnRuIHNvZnQiIGlkPSJndWlkZUVkaXRCdG4iPg==")}${icon(_lhD("ZWRpdA=="))}${_lhD("IENo4buJbmggc+G7rWEgaMaw4bubbmcgZOG6q248L2J1dHRvbj4=")}${custom ? `${_lhD("PGJ1dHRvbiBjbGFzcz0iYnRuIGdob3N0IiBpZD0iZ3VpZGVSc3RCdG4iIHN0eWxlPSJjb2xvcjp2YXIoLS1iYWQpIj4=")}${icon(_lhD("cmVmcmVzaA=="))}${_lhD("IMSQ4bq3dCB24buBIG3hurdjIMSR4buLbmg8L2J1dHRvbj4=")}` : ''}` : ''}${_lhD("PGJ1dHRvbiBjbGFzcz0iYnRuIiBpZD0iZ3VpZGVJbnN0QnRuIj4=")}${icon(_lhD("ZG93bmxvYWQ="))} ${installed ? _lhD("xJDDoyBjw6BpIMSR4bq3dCB0csOqbiBtw6F5IG7DoHk=") : _lhD("Q8OgaSBBcHAgbmdheQ==")}${_lhD("PC9idXR0b24+PGEgY2xhc3M9ImJ0biBnaG9zdCIgaHJlZj0icGhvbmUuaHRtbCI+")}${icon(_lhD("c21hcnRwaG9uZQ=="))}${_lhD("IFhlbSB0aOG7rSBnaWFvIGRp4buHbiDEkWnhu4duIHRob+G6oWk8L2E+")}`
) + `${_lhD("CiAgICA8ZGl2IGNsYXNzPSJncmlkIGctbWFpbiI+CiAgICAgIDxzZWN0aW9uIGNsYXNzPSJjYXJkIHBhZCBzdGFjayIgc3R5bGU9ImdhcDoxNnB4Ij4KICAgICAgICA8ZGl2IGNsYXNzPSJyb3cgYmV0d2VlbiI+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJyb3ciIHN0eWxlPSJnYXA6MTBweCI+CiAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJhdmF0YXIgc3EiIHN0eWxlPSJiYWNrZ3JvdW5kOnZhcigtLWJyYW5kKSI+")}${icon(_lhD("cXI="))}${_lhD("PC9zcGFuPgogICAgICAgICAgICA8ZGl2PjxiPg==")}${esc(g.qrTitle || DEFAULT_APP_GUIDE.qrTitle)}${_lhD("PC9iPjxkaXYgY2xhc3M9InhzIG11dGVkIj4=")}${esc(g.qrSub || DEFAULT_APP_GUIDE.qrSub)}${_lhD("PC9kaXY+PC9kaXY+CiAgICAgICAgICA8L2Rpdj4KICAgICAgICAgIDxkaXYgY2xhc3M9InJvdyBub3dyYXAiIHN0eWxlPSJnYXA6NnB4Ij4KICAgICAgICAgICAg")}${installed ? badge(_lhD("xJDDoyBjw6BpIMSR4bq3dA=="), _lhD("b2s=")) : badge(g.qrBadge || DEFAULT_APP_GUIDE.qrBadge, _lhD("aW5mbw=="))}
${canEdit ? `${_lhD("PGJ1dHRvbiB0eXBlPSJidXR0b24iIGNsYXNzPSJidG4gaWNvbiBnaG9zdCBzbSIgZGF0YS1lZGl0LXNlYz0icXIiIHRpdGxlPSJDaOG7iW5oIHPhu61hIGtodW5nIFFSIj4=")}${icon(_lhD("ZWRpdA=="))}${_lhD("PC9idXR0b24+")}` : ''}${_lhD("CiAgICAgICAgICA8L2Rpdj4KICAgICAgICA8L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJyb3ciIHN0eWxlPSJnYXA6MjBweDthbGlnbi1pdGVtczpjZW50ZXI7cGFkZGluZzoxNHB4O2JvcmRlci1yYWRpdXM6MTZweDtiYWNrZ3JvdW5kOnZhcigtLXN1cmZhY2UtMikiPgogICAgICAgICAgPGRpdiBpZD0iZ3VpZGVRciIgc3R5bGU9InBhZGRpbmc6MTBweDtiYWNrZ3JvdW5kOiNmZmY7Ym9yZGVyLXJhZGl1czoxNHB4O2JveC1zaGFkb3c6dmFyKC0tc2hhZG93LTEpO2Rpc3BsYXk6Z3JpZDtwbGFjZS1pdGVtczpjZW50ZXI7ZmxleDpub25lIj48L2Rpdj4KICAgICAgICAgIDxkaXYgY2xhc3M9InN0YWNrIGdyb3ciIHN0eWxlPSJnYXA6MTBweDttaW4td2lkdGg6MjAwcHgiPgogICAgICAgICAgICA=")}${urls.length > 1 ? `${_lhD("PGRpdiBjbGFzcz0iY2hpcHMiPg==")}${urls.map((u, i) => `${_lhD("PGJ1dHRvbiB0eXBlPSJidXR0b24iIGNsYXNzPSJjaGlwIA==")}${i === 0 ? _lhD("YWN0aXZl") : ''}${_lhD("IiBkYXRhLXF1cmw9Ig==")}${esc(u)}${_lhD("IiBzdHlsZT0iZm9udC1zaXplOjEycHgiPg==")}${esc(u.replace(/^https?:\/\//, ''))}${_lhD("PC9idXR0b24+")}`).join('')}${_lhD("PC9kaXY+")}` : ''}${_lhD("CiAgICAgICAgICAgIDxkaXYgY2xhc3M9InN0YWNrIiBzdHlsZT0iZ2FwOjRweCI+CiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9InhzIG11dGVkIj7EkOG7i2EgY2jhu4kgdHJ1eSBj4bqtcCAmIGPDoGkgxJHhurd0IChjw7MgdGjhu4Mgbmjhuq1wIMSR4buDIMSR4buVaSBtw6MgUVIpOjwvc3Bhbj4KICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJyb3cgbm93cmFwIiBzdHlsZT0iZ2FwOjhweCI+CiAgICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9ImlucHV0IG1vbm8gc21hbGwiIGlkPSJndWlkZVVybElucCIgdmFsdWU9Ig==")}${esc(curUrl)}${_lhD("IiBzdHlsZT0iZmxleDoxO2hlaWdodDozOHB4IiBhcmlhLWxhYmVsPSLEkOG7i2EgY2jhu4kgdHJ1eSBj4bqtcCI+CiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9ImJ1dHRvbiIgY2xhc3M9ImJ0biBzb2Z0IHNtIiBpZD0iZ3VpZGVDb3B5QnRuIj4=")}${icon(_lhD("Y29weQ=="))}${_lhD("IFNhbyBjaMOpcDwvYnV0dG9uPgogICAgICAgICAgICAgICAg")}${canEdit ? `${_lhD("PGJ1dHRvbiB0eXBlPSJidXR0b24iIGNsYXNzPSJidG4gZ2hvc3Qgc20iIGlkPSJndWlkZVNhdmVVcmxCdG4iIHRpdGxlPSJMxrB1IMSR4buLYSBjaOG7iSBuw6B5IGzDoG0gbeG6t2MgxJHhu4tuaCI+")}${icon(_lhD("Y2hlY2s="))}${_lhD("IEzGsHUgxJHhu4thIGNo4buJPC9idXR0b24+")}` : ''}${_lhD("CiAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJyb3ciIHN0eWxlPSJnYXA6OHB4Ij4KICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9ImJ1dHRvbiIgY2xhc3M9ImJ0biBzbSIgaWQ9Imd1aWRlSW5zdEJ0bjIiPg==")}${icon(_lhD("ZG93bmxvYWQ="))}${_lhD("IEPDoGkgxJHhurd0IHThu7EgxJHhu5luZyBsw6puIG3DoXkgbsOgeTwvYnV0dG9uPgogICAgICAgICAgICAgIA==")}${g.apkUrl ? `${_lhD("PGEgY2xhc3M9ImJ0biBzb2Z0IHNtIiBocmVmPSI=")}${esc(g.apkUrl)}${_lhD("IiB0YXJnZXQ9Il9ibGFuayIgcmVsPSJub29wZW5lciIgZG93bmxvYWQ+")}${icon(_lhD("c21hcnRwaG9uZQ=="))}${_lhD("IFThuqNpIHThu4dwIEFQSyBBbmRyb2lkPC9hPg==")}` : ''}${_lhD("CiAgICAgICAgICAgICAgPGEgY2xhc3M9ImJ0biBnaG9zdCBzbSIgaHJlZj0icGhvbmUuaHRtbCI+")}${icon(_lhD("c21hcnRwaG9uZQ=="))}${_lhD("IEtodW5nIGdp4bqjIGzhuq1wIEFuZHJvaWQ8L2E+CiAgICAgICAgICAgIDwvZGl2PgogICAgICAgICAgICA=")}${g.qrNote ? `${_lhD("PHAgY2xhc3M9InhzIG11dGVkIj4=")}${esc(g.qrNote)}${_lhD("PC9wPg==")}` : ''}${_lhD("CiAgICAgICAgICA8L2Rpdj4KICAgICAgICA8L2Rpdj4KICAgICAgPC9zZWN0aW9uPgogICAgICA8c2VjdGlvbiBjbGFzcz0iY2FyZCBwYWQgc3RhY2siIHN0eWxlPSJnYXA6MTJweCI+CiAgICAgICAgPGRpdiBjbGFzcz0icm93IGJldHdlZW4iPgogICAgICAgICAgPGI+")}${icon(_lhD("c3BhcmtsZXM="))} ${esc(g.benefitsTitle || DEFAULT_APP_GUIDE.benefitsTitle)}${_lhD("PC9iPgogICAgICAgICAg")}${canEdit ? `${_lhD("PGJ1dHRvbiB0eXBlPSJidXR0b24iIGNsYXNzPSJidG4gaWNvbiBnaG9zdCBzbSIgZGF0YS1lZGl0LXNlYz0iYmVuZWZpdHMiIHRpdGxlPSJDaOG7iW5oIHPhu61hIGzhu6NpIMOtY2giPg==")}${icon(_lhD("ZWRpdA=="))}${_lhD("PC9idXR0b24+")}` : ''}${_lhD("CiAgICAgICAgPC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ic3RhY2siIHN0eWxlPSJnYXA6MTBweCI+CiAgICAgICAgICA=")}${g.benefits.map(b => `${_lhD("PGRpdiBjbGFzcz0icm93IG5vd3JhcCIgc3R5bGU9ImFsaWduLWl0ZW1zOmZsZXgtc3RhcnQ7Z2FwOjEycHgiPjxzcGFuIGNsYXNzPSJhdmF0YXIgc20gc3EiIHN0eWxlPSJiYWNrZ3JvdW5kOnZhcigtLWJyYW5kLXNvZnQpO2NvbG9yOnZhcigtLWJyYW5kKSI+")}${icon(b.icon || _lhD("c3BhcmtsZXM="))}${_lhD("PC9zcGFuPjxkaXY+PGIgY2xhc3M9InNtYWxsIiBzdHlsZT0iZGlzcGxheTpibG9jayI+")}${esc(b.title)}${_lhD("PC9iPjxzcGFuIGNsYXNzPSJ4cyBtdXRlZCI+")}${esc(b.desc)}${_lhD("PC9zcGFuPjwvZGl2PjwvZGl2Pg==")}`).join('')}${_lhD("CiAgICAgICAgPC9kaXY+CiAgICAgIDwvc2VjdGlvbj4KICAgIDwvZGl2PgoKICAgIDxkaXYgY2xhc3M9ImdyaWQgZzMiPgogICAgICA=")}${g.platforms.map((p, idx) => `${_lhD("PHNlY3Rpb24gY2xhc3M9ImNhcmQgcGFkIHN0YWNrIiBzdHlsZT0iZ2FwOjEycHgiPgogICAgICAgIDxkaXYgY2xhc3M9InJvdyBiZXR3ZWVuIj4KICAgICAgICAgIDxkaXYgY2xhc3M9InJvdyIgc3R5bGU9ImdhcDo4cHgiPjxzcGFuIGNsYXNzPSJhdmF0YXIgc20gc3EiIHN0eWxlPSI=")}${toneStyle[p.tone] || toneStyle.info}${_lhD("Ij4=")}${icon(p.icon || _lhD("c21hcnRwaG9uZQ=="))}${_lhD("PC9zcGFuPjxiPg==")}${esc(p.title)}${_lhD("PC9iPjwvZGl2PgogICAgICAgICAgPGRpdiBjbGFzcz0icm93IG5vd3JhcCIgc3R5bGU9ImdhcDo2cHgiPg==")}${p.badge ? badge(p.badge, p.tone || _lhD("aW5mbw==")) : ''}${canEdit ? `${_lhD("PGJ1dHRvbiB0eXBlPSJidXR0b24iIGNsYXNzPSJidG4gaWNvbiBnaG9zdCBzbSIgZGF0YS1lZGl0LXNlYz0icGxhdF8=")}${idx}${_lhD("IiB0aXRsZT0iQ2jhu4luaCBz4butYSBt4bulYyBuw6B5Ij4=")}${icon(_lhD("ZWRpdA=="))}${_lhD("PC9idXR0b24+")}` : ''}${_lhD("PC9kaXY+CiAgICAgICAgPC9kaXY+CiAgICAgICAg")}${p.sub ? `${_lhD("PHAgY2xhc3M9InhzIG11dGVkIj4=")}${esc(p.sub)}${_lhD("PC9wPg==")}` : ''}${_lhD("CiAgICAgICAgPG9sIGNsYXNzPSJzbWFsbCBpbmsyIiBzdHlsZT0ibWFyZ2luOjA7cGFkZGluZy1sZWZ0OjE4cHg7ZGlzcGxheTpncmlkO2dhcDo4cHgiPgogICAgICAgICAg")}${(p.steps || []).map(st => `${_lhD("PGxpPg==")}${esc(st)}${_lhD("PC9saT4=")}`).join('')}${_lhD("CiAgICAgICAgPC9vbD4KICAgICAgPC9zZWN0aW9uPg==")}`).join('')}${_lhD("CiAgICA8L2Rpdj4KCiAgICA8c2VjdGlvbiBjbGFzcz0iY2FyZCBwYWQgc3RhY2siIHN0eWxlPSJnYXA6MTBweDtiYWNrZ3JvdW5kOnZhcigtLWJyYW5kLXNvZnQpO2JvcmRlci1jb2xvcjp0cmFuc3BhcmVudCI+CiAgICAgIDxkaXYgY2xhc3M9InJvdyBiZXR3ZWVuIj4KICAgICAgICA8Yj4=")}${icon(_lhD("Z2xvYmU="))} ${esc(g.serverTitle || DEFAULT_APP_GUIDE.serverTitle)}${_lhD("PC9iPgogICAgICAgIDxkaXYgY2xhc3M9InJvdyBub3dyYXAiIHN0eWxlPSJnYXA6NnB4Ij4KICAgICAgICAgIDxidXR0b24gdHlwZT0iYnV0dG9uIiBjbGFzcz0iYnRuIHNvZnQgc20iIGlkPSJndWlkZUNvcHlTcnYiPg==")}${icon(_lhD("Y29weQ=="))}${_lhD("IFNhbyBjaMOpcCDEkeG7i2EgY2jhu4kgbcOheSBjaOG7pzwvYnV0dG9uPgogICAgICAgICAg")}${canEdit ? `${_lhD("PGJ1dHRvbiB0eXBlPSJidXR0b24iIGNsYXNzPSJidG4gaWNvbiBnaG9zdCBzbSIgZGF0YS1lZGl0LXNlYz0ic2VydmVyIiB0aXRsZT0iQ2jhu4luaCBz4butYSBoxrDhu5tuZyBk4bqrbiBtw6F5IGNo4bunIj4=")}${icon(_lhD("ZWRpdA=="))}${_lhD("PC9idXR0b24+")}` : ''}${_lhD("CiAgICAgICAgPC9kaXY+CiAgICAgIDwvZGl2PgogICAgICA8cCBjbGFzcz0ic21hbGwgaW5rMiIgaWQ9Imd1aWRlU3J2RGVzYyI+PC9wPgogICAgPC9zZWN0aW9uPg==")}`;
const updateSrvText = (u) => {
const el = $(_lhD("I2d1aWRlU3J2RGVzYw=="), view);
if (!el) return;
const raw = g.serverText || DEFAULT_APP_GUIDE.serverText;
const parts = raw.split(_lhD("e1VSTH0="));
el.innerHTML = parts.map(esc).join(`${_lhD("PGNvZGUgY2xhc3M9Im1vbm8iPg==")}${esc(u)}${_lhD("PC9jb2RlPg==")}`);
};
const paintQr = (u, syncInp = true) => {
curUrl = u.trim() || location.origin;
const box = $(_lhD("I2d1aWRlUXI="), view);
const inp = $(_lhD("I2d1aWRlVXJsSW5w"), view);
if (syncInp && inp) inp.value = curUrl;
updateSrvText(curUrl);
if (box) {
try { box.innerHTML = qrSvg(curUrl.endsWith(_lhD("Lw==")) ? curUrl : curUrl + _lhD("Lw=="), { size: 136 }); }
catch { box.innerHTML = _lhD("PHNwYW4gY2xhc3M9InhzIG11dGVkIj5LaMO0bmcgdOG6oW8gxJHGsOG7o2MgUVI8L3NwYW4+"); }
}
};
paintQr(curUrl);
$$(_lhD("W2RhdGEtcXVybF0="), view).forEach(b => b.onclick = () => {
$$(_lhD("W2RhdGEtcXVybF0="), view).forEach(x => x.classList.toggle(_lhD("YWN0aXZl"), x === b));
paintQr(b.dataset.qurl, true);
});
$(_lhD("I2d1aWRlVXJsSW5w"), view).oninput = (e) => {
$$(_lhD("W2RhdGEtcXVybF0="), view).forEach(x => x.classList.toggle(_lhD("YWN0aXZl"), x.dataset.qurl === e.target.value.trim()));
paintQr(e.target.value, false);
};
$(_lhD("I2d1aWRlQ29weUJ0bg=="), view).onclick = () => copyText(curUrl);
$(_lhD("I2d1aWRlQ29weVNydg=="), view).onclick = () => copyText(curUrl);
$(_lhD("I2d1aWRlSW5zdEJ0bg=="), view).onclick = () => installApp();
$(_lhD("I2d1aWRlSW5zdEJ0bjI="), view).onclick = () => installApp();
if (canEdit) {
if ($(_lhD("I2d1aWRlU2F2ZVVybEJ0bg=="), view)) {
$(_lhD("I2d1aWRlU2F2ZVVybEJ0bg=="), view).onclick = (e) => withBusy(e.currentTarget, async () => {
try {
const val = $(_lhD("I2d1aWRlVXJsSW5w"), view).value.trim();
await api.put(_lhD("YXBpL2FkbWluL2FwcC1ndWlkZQ=="), { ...g, customUrl: val });
toast(_lhD("xJDDoyBsxrB1IMSR4buLYSBjaOG7iSB0cnV5IGPhuq1wIG3hurdjIMSR4buLbmgu"), _lhD("b2s="));
draw();
} catch (er) { showError(er); }
});
}
if ($(_lhD("I2d1aWRlUnN0QnRu"), view)) {
$(_lhD("I2d1aWRlUnN0QnRu"), view).onclick = async () => {
if (!await confirmDialog({ title: _lhD("xJDhurd0IHbhu4EgbeG6t2MgxJHhu4tuaA=="), message: _lhD("S2jDtGkgcGjhu6VjIHRvw6BuIGLhu5kgbuG7mWkgZHVuZyB0cmFuZyBIxrDhu5tuZyBk4bqrbiB04bqjaSBBcHAgduG7gSBt4bq3YyDEkeG7i25oIGJhbiDEkeG6p3U/"), ok: _lhD("S2jDtGkgcGjhu6VjIG3hurdjIMSR4buLbmg="), tone: _lhD("ZGFuZ2Vy") })) return;
try {
await api.post(_lhD("YXBpL2FkbWluL2FwcC1ndWlkZS9yZXNldA=="));
toast(_lhD("xJDDoyDEkeG6t3QgSMaw4bubbmcgZOG6q24gdOG6o2kgQXBwIHbhu4EgbeG6t2MgxJHhu4tuaC4="), _lhD("b2s="));
draw();
} catch (er) { showError(er); }
};
}
const openEditor = (focusSec = '') => {
const state = JSON.parse(JSON.stringify(g));
modal({
title: _lhD("Q2jhu4luaCBz4butYSBIxrDhu5tuZyBk4bqrbiB04bqjaSBBcHA="),
sub: _lhD("VGhheSDEkeG7lWkgaGnhu4NuIHRo4buLIHThu6ljIHRo4budaSB0csOqbiBj4bqjIEPhu5VuZyBI4buNYyBTaW5oIHbDoCBD4buVbmcgR2nDoW8gVmnDqm4="),
size: _lhD("eHdpZGU="),
body: `${_lhD("PGZvcm0gaWQ9ImFnRm9ybSIgY2xhc3M9InN0YWNrIGxnIj4KICAgICAgICAgICAgPHNlY3Rpb24gY2xhc3M9ImNhcmQgc29mdCBwYWQgc3RhY2siIHN0eWxlPSJnYXA6MTJweCIgZGF0YS1zZWM9InFyIj4KICAgICAgICAgICAgICA8Yj4=")}${icon(_lhD("cXI="))}${_lhD("IDEuIFRpw6p1IMSR4buBIHRyYW5nICYgS2h1bmcgbcOjIFFSPC9iPgogICAgICAgICAgICAgIDxkaXYgY2xhc3M9ImZpZWxkLXJvdyIgc3R5bGU9ImdyaWQtdGVtcGxhdGUtY29sdW1uczpyZXBlYXQoYXV0by1maXQsbWlubWF4KDIyMHB4LDFmcikpIj4KICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9ImZpZWxkIj48bGFiZWw+VGnDqnUgxJHhu4EgdHJhbmc8L2xhYmVsPjxpbnB1dCBuYW1lPSJ0aXRsZSIgdmFsdWU9Ig==")}${esc(state.title)}${_lhD("IiByZXF1aXJlZD48L2Rpdj4KICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9ImZpZWxkIj48bGFiZWw+TmjDo24gdHLhuqFuZyB0aMOhaSBraHVuZyBRUjwvbGFiZWw+PGlucHV0IG5hbWU9InFyQmFkZ2UiIHZhbHVlPSI=")}${esc(state.qrBadge)}${_lhD("Ij48L2Rpdj4KICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9ImZpZWxkIiBzdHlsZT0iZ3JpZC1jb2x1bW46MS8tMSI+PGxhYmVsPk3DtCB04bqjIMSR4bqndSB0cmFuZzwvbGFiZWw+PHRleHRhcmVhIG5hbWU9InN1YnRpdGxlIiByb3dzPSIyIj4=")}${esc(state.subtitle)}${_lhD("PC90ZXh0YXJlYT48L2Rpdj4KICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9ImZpZWxkIj48bGFiZWw+VGnDqnUgxJHhu4Ega2h1bmcgUVI8L2xhYmVsPjxpbnB1dCBuYW1lPSJxclRpdGxlIiB2YWx1ZT0i")}${esc(state.qrTitle)}${_lhD("Ij48L2Rpdj4KICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9ImZpZWxkIj48bGFiZWw+TcO0IHThuqMgcGjhu6Uga2h1bmcgUVI8L2xhYmVsPjxpbnB1dCBuYW1lPSJxclN1YiIgdmFsdWU9Ig==")}${esc(state.qrSub)}${_lhD("Ij48L2Rpdj4KICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9ImZpZWxkIj48bGFiZWw+xJDhu4thIGNo4buJIHRydXkgY+G6rXAgbeG6t2MgxJHhu4tuaCAoxJHhu4MgdHLhu5FuZyA9IHThu7EgbOG6pXkgSVAgTEFOIC8gdMOqbiBtaeG7gW4pPC9sYWJlbD48aW5wdXQgbmFtZT0iY3VzdG9tVXJsIiBjbGFzcz0ibW9ubyIgdmFsdWU9Ig==")}${esc(state.customUrl || '')}${_lhD("IiBwbGFjZWhvbGRlcj0iVsOtIGThu6U6IGh0dHBzOi8vbGVob2FuLmVkdS52biBob+G6t2MgaHR0cDovLzE5Mi4xNjguMS4xMDozMDAwIj48L2Rpdj4KICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9ImZpZWxkIj48bGFiZWw+TGluayB04bqjaSB0cuG7sWMgdGnhur9wIHThu4dwIEFQSyBBbmRyb2lkIChraMO0bmcgYuG6r3QgYnXhu5ljKTwvbGFiZWw+PGlucHV0IG5hbWU9ImFwa1VybCIgY2xhc3M9Im1vbm8iIHZhbHVlPSI=")}${esc(state.apkUrl || '')}${_lhD("IiBwbGFjZWhvbGRlcj0iVsOtIGThu6U6IC91cGxvYWRzL2xlaG9hbi5hcGsgaG/hurdjIGxpbmsgR29vZ2xlIERyaXZlIj48L2Rpdj4KICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9ImZpZWxkIiBzdHlsZT0iZ3JpZC1jb2x1bW46MS8tMSI+PGxhYmVsPkdoaSBjaMO6IGLDqm4gZMaw4bubaSBraHVuZyBRUjwvbGFiZWw+PGlucHV0IG5hbWU9InFyTm90ZSIgdmFsdWU9Ig==")}${esc(state.qrNote || '')}${_lhD("Ij48L2Rpdj4KICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgPC9zZWN0aW9uPgoKICAgICAgICAgICAgPHNlY3Rpb24gY2xhc3M9ImNhcmQgc29mdCBwYWQgc3RhY2siIHN0eWxlPSJnYXA6MTJweCIgZGF0YS1zZWM9ImJlbmVmaXRzIj4KICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJyb3cgYmV0d2VlbiI+CiAgICAgICAgICAgICAgICA8Yj4=")}${icon(_lhD("c3BhcmtsZXM="))}${_lhD("IDIuIEzhu6NpIMOtY2gga2hpIGPDoGkgQXBwPC9iPgogICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPSJidXR0b24iIGNsYXNzPSJidG4gc29mdCBzbSIgaWQ9ImFnQWRkQmVuIj4=")}${icon(_lhD("cGx1cw=="))}${_lhD("IFRow6ptIGzhu6NpIMOtY2g8L2J1dHRvbj4KICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJmaWVsZCI+PGxhYmVsPlRpw6p1IMSR4buBIG3hu6VjIGzhu6NpIMOtY2g8L2xhYmVsPjxpbnB1dCBuYW1lPSJiZW5lZml0c1RpdGxlIiB2YWx1ZT0i")}${esc(state.benefitsTitle)}${_lhD("Ij48L2Rpdj4KICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJzdGFjayIgaWQ9ImFnQmVuTGlzdCIgc3R5bGU9ImdhcDo4cHgiPjwvZGl2PgogICAgICAgICAgICA8L3NlY3Rpb24+CgogICAgICAgICAgICA8c2VjdGlvbiBjbGFzcz0iY2FyZCBzb2Z0IHBhZCBzdGFjayIgc3R5bGU9ImdhcDoxMnB4IiBkYXRhLXNlYz0icGxhdGZvcm1zIj4KICAgICAgICAgICAgICA8Yj4=")}${icon(_lhD("c21hcnRwaG9uZQ=="))}${_lhD("IDMuIEjGsOG7m25nIGThuqtuIGNoaSB0aeG6v3QgdGhlbyB0aGnhur90IGLhu4sgKG3hu5dpIGTDsm5nIDEgYsaw4bubYyk8L2I+CiAgICAgICAgICAgICAgPGRpdiBjbGFzcz0iZ3JpZCBnMyIgaWQ9ImFnUGxhdExpc3QiPgogICAgICAgICAgICAgICAg")}${state.platforms.map((p, i) => `${_lhD("PGRpdiBjbGFzcz0iY2FyZCBwYWQgc3RhY2siIHN0eWxlPSJnYXA6OHB4IiBkYXRhLXBsYXQ9Ig==")}${i}${_lhD("IiBkYXRhLXNlYz0icGxhdF8=")}${i}${_lhD("Ij4KICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0iZmllbGQiPjxsYWJlbD5Uw6puIHRoaeG6v3QgYuG7iyAvIG7hu4FuIHThuqNuZyA=")}${i + 1}${_lhD("PC9sYWJlbD48aW5wdXQgZGF0YS1wZj0idGl0bGUiIHZhbHVlPSI=")}${esc(p.title)}${_lhD("IiByZXF1aXJlZD48L2Rpdj4KICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0iZmllbGQiPjxsYWJlbD5OaMOjbiBnw7NjIHBo4bqjaSAoQmFkZ2UpPC9sYWJlbD48aW5wdXQgZGF0YS1wZj0iYmFkZ2UiIHZhbHVlPSI=")}${esc(p.badge || '')}${_lhD("Ij48L2Rpdj4KICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0iZmllbGQiPjxsYWJlbD5Ew7JuZyBtw7QgdOG6oyBwaOG7pTwvbGFiZWw+PGlucHV0IGRhdGEtcGY9InN1YiIgdmFsdWU9Ig==")}${esc(p.sub || '')}${_lhD("Ij48L2Rpdj4KICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0iZmllbGQiPjxsYWJlbD5Dw6FjIGLGsOG7m2MgdGjhu7FjIGhp4buHbiAobeG7l2kgZMOybmcgMSBixrDhu5tjKTwvbGFiZWw+PHRleHRhcmVhIGRhdGEtcGY9InN0ZXBzIiByb3dzPSI2Ij4=")}${esc((p.steps || []).join(_lhD("Cg==")))}${_lhD("PC90ZXh0YXJlYT48L2Rpdj4KICAgICAgICAgICAgICAgIDwvZGl2Pg==")}`).join('')}${_lhD("CiAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgIDwvc2VjdGlvbj4KCiAgICAgICAgICAgIDxzZWN0aW9uIGNsYXNzPSJjYXJkIHNvZnQgcGFkIHN0YWNrIiBzdHlsZT0iZ2FwOjEycHgiIGRhdGEtc2VjPSJzZXJ2ZXIiPgogICAgICAgICAgICAgIDxiPg==")}${icon(_lhD("Z2xvYmU="))}${_lhD("IDQuIEjGsOG7m25nIGThuqtuIGvhur90IG7hu5FpIE3DoXkgY2jhu6cgdHLGsOG7nW5nIChjdeG7kWkgdHJhbmcpPC9iPgogICAgICAgICAgICAgIDxkaXYgY2xhc3M9ImZpZWxkIj48bGFiZWw+VGnDqnUgxJHhu4E8L2xhYmVsPjxpbnB1dCBuYW1lPSJzZXJ2ZXJUaXRsZSIgdmFsdWU9Ig==")}${esc(state.serverTitle)}${_lhD("Ij48L2Rpdj4KICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSJmaWVsZCI+PGxhYmVsPk7hu5lpIGR1bmcgaMaw4bubbmcgZOG6q24gKGTDuW5nIDxzcGFuIGNsYXNzPSJtb25vIj57VVJMfTwvc3Bhbj4gxJHhu4MgY2jDqG4gdOG7sSDEkeG7mW5nIMSR4buLYSBjaOG7iSBtw6F5IGNo4bunIGhp4buHbiB04bqhaSk8L2xhYmVsPjx0ZXh0YXJlYSBuYW1lPSJzZXJ2ZXJUZXh0IiByb3dzPSIzIj4=")}${esc(state.serverText)}${_lhD("PC90ZXh0YXJlYT48L2Rpdj4KICAgICAgICAgICAgPC9zZWN0aW9uPgogICAgICAgICAgPC9mb3JtPg==")}`,
foot: `${_lhD("PGJ1dHRvbiBjbGFzcz0iYnRuIGdob3N0IiBkYXRhLWNsb3NlPkjhu6d5PC9idXR0b24+PGJ1dHRvbiBjbGFzcz0iYnRuIiBpZD0iYWdTYXZlIj4=")}${icon(_lhD("Y2hlY2s="))}${_lhD("IEzGsHUgdGhheSDEkeG7lWk8L2J1dHRvbj4=")}`,
onMount: (m, close) => {
const benBox = $(_lhD("I2FnQmVuTGlzdA=="), m);
const syncBenefits = () => {
state.benefits = $$(_lhD("W2RhdGEtYmVuXQ=="), benBox).map(row => ({
icon: $(_lhD("W2RhdGEtYmY9Imljb24iXQ=="), row).value || _lhD("c3BhcmtsZXM="),
title: $(_lhD("W2RhdGEtYmY9InRpdGxlIl0="), row).value.trim(),
desc: $(_lhD("W2RhdGEtYmY9ImRlc2MiXQ=="), row).value.trim(),
}));
};
const drawBenefits = () => {
benBox.innerHTML = state.benefits.map((b, i) => `${_lhD("PGRpdiBjbGFzcz0icm93IG5vd3JhcCIgZGF0YS1iZW49Ig==")}${i}${_lhD("IiBzdHlsZT0iZ2FwOjhweDthbGlnbi1pdGVtczpmbGV4LXN0YXJ0O2JhY2tncm91bmQ6dmFyKC0tc3VyZmFjZSk7cGFkZGluZzoxMHB4O2JvcmRlci1yYWRpdXM6MTJweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWxpbmUpIj4KICAgICAgICAgICAgICAgIDxzZWxlY3QgY2xhc3M9InNlbGVjdCIgZGF0YS1iZj0iaWNvbiIgc3R5bGU9IndpZHRoOjEyNXB4O2ZsZXg6bm9uZSI+CiAgICAgICAgICAgICAgICAgIA==")}${[[_lhD("c21hcnRwaG9uZQ=="), _lhD("xJBp4buHbiB0aG/huqFp")], [_lhD("ZmFjZQ=="), _lhD("RmFjZSBJRA==")], [_lhD("YmVsbA=="), _lhD("VGjDtG5nIGLDoW8=")], [_lhD("Y2FtZXJh"), _lhD("Q2FtZXJh")], [_lhD("c2hpZWxkQ2hlY2s="), _lhD("QuG6o28gbeG6rXQ=")], [_lhD("c3BhcmtsZXM="), _lhD("TuG7lWkgYuG6rXQ=")], [_lhD("Z2xvYmU="), _lhD("S+G6v3QgbuG7kWk=")], [_lhD("ZG93bmxvYWQ="), _lhD("VOG6o2kgeHXhu5FuZw==")]].map(([k, l]) => `${_lhD("PG9wdGlvbiB2YWx1ZT0i")}${k}${_lhD("IiA=")}${b.icon === k ? _lhD("c2VsZWN0ZWQ=") : ''}${_lhD("Pg==")}${l}${_lhD("PC9vcHRpb24+")}`).join('')}${_lhD("CiAgICAgICAgICAgICAgICA8L3NlbGVjdD4KICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9InN0YWNrIGdyb3ciIHN0eWxlPSJnYXA6NnB4Ij4KICAgICAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPSJpbnB1dCIgZGF0YS1iZj0idGl0bGUiIHZhbHVlPSI=")}${esc(b.title)}${_lhD("IiBwbGFjZWhvbGRlcj0iVGnDqnUgxJHhu4EgbOG7o2kgw61jaCI+CiAgICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz0iaW5wdXQgc21hbGwiIGRhdGEtYmY9ImRlc2MiIHZhbHVlPSI=")}${esc(b.desc)}${_lhD("IiBwbGFjZWhvbGRlcj0iTcO0IHThuqMgY2hpIHRp4bq/dCI+CiAgICAgICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT0iYnV0dG9uIiBjbGFzcz0iYnRuIGljb24gZ2hvc3Qgc20iIGRhdGEtcm0tYmVuPSI=")}${i}${_lhD("IiBzdHlsZT0iY29sb3I6dmFyKC0tYmFkKSIgdGl0bGU9IljDs2EiPg==")}${icon(_lhD("dHJhc2g="))}${_lhD("PC9idXR0b24+CiAgICAgICAgICAgICAgPC9kaXY+")}`).join('');
$$(_lhD("W2RhdGEtcm0tYmVuXQ=="), benBox).forEach(btn => btn.onclick = () => {
syncBenefits();
state.benefits.splice(+btn.dataset.rmBen, 1);
drawBenefits();
});
};
drawBenefits();
$(_lhD("I2FnQWRkQmVu"), m).onclick = () => {
syncBenefits();
state.benefits.push({ icon: _lhD("c3BhcmtsZXM="), title: '', desc: '' });
drawBenefits();
};
if (focusSec) {
const target = $(`${_lhD("W2RhdGEtc2VjPSI=")}${focusSec}${_lhD("Il0=")}`, m);
if (target) setTimeout(() => target.scrollIntoView({ behavior: _lhD("c21vb3Ro"), block: _lhD("Y2VudGVy") }), 80);
}
const submit = () => withBusy($(_lhD("I2FnU2F2ZQ=="), m), async () => {
try {
syncBenefits();
const f = formData($(_lhD("I2FnRm9ybQ=="), m));
const platforms = $$(_lhD("W2RhdGEtcGxhdF0="), m).map((el, i) => ({
...state.platforms[i],
title: $(_lhD("W2RhdGEtcGY9InRpdGxlIl0="), el).value.trim(),
badge: $(_lhD("W2RhdGEtcGY9ImJhZGdlIl0="), el).value.trim(),
sub: $(_lhD("W2RhdGEtcGY9InN1YiJd"), el).value.trim(),
steps: $(_lhD("W2RhdGEtcGY9InN0ZXBzIl0="), el).value.split(_lhD("Cg==")).map(s => s.trim()).filter(Boolean),
}));
await api.put(_lhD("YXBpL2FkbWluL2FwcC1ndWlkZQ=="), {
...f,
benefits: state.benefits.filter(b => b.title),
platforms,
});
close();
toast(_lhD("xJDDoyBsxrB1IG7hu5lpIGR1bmcgSMaw4bubbmcgZOG6q24gdOG6o2kgQXBwLg=="), _lhD("b2s="));
draw();
} catch (er) { showError(er); }
});
$(_lhD("I2FnU2F2ZQ=="), m).onclick = submit;
$(_lhD("I2FnRm9ybQ=="), m).onsubmit = (e) => { e.preventDefault(); submit(); };
},
});
};
$(_lhD("I2d1aWRlRWRpdEJ0bg=="), view).onclick = () => openEditor();
$$(_lhD("W2RhdGEtZWRpdC1zZWNd"), view).forEach(b => b.onclick = () => openEditor(b.dataset.editSec));
}
};
await draw();
}
export function aboutPortalHtml(s = {}) {
const school = s.schoolName || _lhD("VHLGsOG7nW5nIFRIUFQgTMOqIEhvw6Bu");
const creator = s.creatorName || _lhD("VsWpIE5ndXnhu4VuIEFuIEtoYW5n");
const intro = s.siteIntro || _lhD("Q+G7lW5nIEjhu41jIMSQxrDhu51uZyBT4buRIFRyxrDhu51uZyBUSFBUIEzDqiBIb8OgbiBsw6AgbuG7gW4gdOG6o25nIHRy4buxYyB0dXnhur9uIGjhu5cgdHLhu6MgaOG7jWMgc2luaCB04buRIGdpw6FjIHZpIHBo4bqhbSDhuqluIGRhbmgsIHTGsCB24bqlbiB0w6JtIGzDvSBo4buNYyDEkcaw4budbmcgMjQvNywga+G6v3QgbuG7kWkgdGjhuqd5IGPDtCwgdGhpIHRy4bqvYyBuZ2hp4buHbSBwaMOhcCBsdeG6rXQgdsOgIHTDrWNoIGjhu6NwIHRyw60gdHXhu4cgbmjDom4gdOG6oW8gKEFJKSBwaMOybmcgY2jhu5FuZyBs4burYSDEkeG6o28ga2jDtG5nIGdpYW4gbeG6oW5nLg==");
const features = [
[_lhD("c2hpZWxkQWxlcnQ="), _lhD("VOG7kSBnacOhYyB2aSBwaOG6oW0g4bqpbiBkYW5o"), _lhD("R+G7rWkgcGjhuqNuIMOhbmggYuG6oW8gbOG7sWMgaOG7jWMgxJHGsOG7nW5nLCB2aSBwaOG6oW0gbuG7mWkgcXV5IGvDqG0g4bqjbmggY2jhu6VwIG1pbmggY2jhu6luZzsgYuG6o28gbeG6rXQgZGFuaCB0w61uaCBuZ8aw4budaSBn4butaSB2w6AgdGhlbyBkw7VpIHRp4bq/biB0csOsbmggeOG7rSBsw70gbWluaCBi4bqhY2gu")],
[_lhD("aGVhcnRIYW5k"), _lhD("VMawIHbhuqVuIHTDom0gbMO9IGjhu41jIMSRxrDhu51uZyAyNC83"), _lhD("VHLDsiBjaHV54buHbiByacOqbmcgdMawIDEtMSB24bubaSBU4buVIFTGsCB24bqlbiB0w6JtIGzDvSBuaMOgIHRyxrDhu51uZywgZ2hpIG5o4bqtdCBrw70gY+G6o20geMO6YyBow6BuZyBuZ8OgeSB2w6AgdGjhu7FjIGjDoG5oIGLDoGkgdOG6rXAgaMOtdCB0aOG7nyB0aMawIGdpw6NuLg==")],
[_lhD("bWVzc2FnZQ=="), _lhD("S+G6v3QgbuG7kWkgVGjhuqd5IGPDtCAmIEjhu41jIHNpbmg="), _lhD("VHJhbyDEkeG7lWkgaOG7jWMgdOG6rXAgdHLhu7FjIHRp4bq/cCB24bubaSBnacOhbyB2acOqbiBi4buZIG3DtG4sIGdpw6FvIHZpw6puIGNo4bunIG5oaeG7h20sIGfhu61pIMSRxqFuIHhpbiBwaMOpcCBuZ2jhu4kgaOG7jWMgdHLhu7FjIHR1eeG6v24gdsOgIHRoYW0gZ2lhIHBow7JuZyBjaGF0IGNodW5nIHbEg24gbWluaC4=")],
[_lhD("c2hpZWxkQ2hlY2s="), _lhD("QUkgR3VhcmQgJiBDaOG7kW5nIGzhu6thIMSR4bqjbw=="), _lhD("VMOtY2ggaOG7o3AgVHLDrSB0deG7hyBuaMOibiB04bqhbyBwaMOibiB0w61jaCB0aW4gbmjhuq9uLCDEkcaw4budbmcgbGluaywgc+G7kSDEkWnhu4duIHRob+G6oWksIHTDoGkga2hv4bqjbiBuZ8OibiBow6BuZyDEkcOhbmcgbmfhu50gdsOgIHBow6F0IGhp4buHbiBz4bubbSBk4bqldSBoaeG7h3Uga2jhu6duZyBob+G6o25nIHTDom0gbMO9Lg==")],
[_lhD("dHJvcGh5"), _lhD("xJDhuqV1IHRyxrDhu51uZyBUcuG6r2MgbmdoaeG7h20gJiBLaOG6o28gc8OhdA=="), _lhD("VGhpIHTDrG0gaGnhu4N1IHBow6FwIGx14bqtdCwgYW4gdG/DoG4gZ2lhbyB0aMO0bmcsIGvhu7kgbsSDbmcgc+G7kW5nIGPDsyBi4bqjbmcgeOG6v3AgaOG6oW5nIHRoaSDEkXVhIHbDoCB0aGFtIGdpYSBjw6FjIMSR4bujdCBraOG6o28gc8OhdCBkw6JuIGNo4bunIHRyb25nIG5ow6AgdHLGsOG7nW5nLg==")],
[_lhD("bG9jaw=="), _lhD("QuG6o28gbeG6rXQgxJFhIHThuqduZyAmIMSQYSBu4buBbiB04bqjbmc="), _lhD("TcOjIGjDs2EgZOG7ryBsaeG7h3UgbmjhuqF5IGPhuqNtIOG7nyB04bqnbmcg4bupbmcgZOG7pW5nIChFQ0RIIFAtMjU2ICsgQUVTLTI1Ni1HQ00pLCBob+G6oXQgxJHhu5luZyBtxrDhu6N0IG3DoCB0csOqbiBj4bqjIG3DoXkgdMOtbmggKFdlYikgdsOgIMSRaeG7h24gdGhv4bqhaSAoQW5kcm9pZCAvIGlPUyku")],
];
return `${_lhD("CiAgPGRpdiBjbGFzcz0ic3RhY2sgbGciPgogICAgPHNlY3Rpb24gY2xhc3M9ImNhcmQgcGFkIHN0YWNrIiBzdHlsZT0iZ2FwOjE2cHg7YmFja2dyb3VuZDpsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLHZhcigtLWJyYW5kLXNvZnQpLHZhcigtLXN1cmZhY2UpKTtib3JkZXItY29sb3I6dmFyKC0tYnJhbmQtbGluZSkiPgogICAgICA8ZGl2IGNsYXNzPSJyb3cgYmV0d2VlbiIgc3R5bGU9ImdhcDoxNnB4O2ZsZXgtd3JhcDp3cmFwO2FsaWduLWl0ZW1zOmNlbnRlciI+CiAgICAgICAgPGRpdiBjbGFzcz0icm93IiBzdHlsZT0iZ2FwOjE0cHg7YWxpZ24taXRlbXM6Y2VudGVyIj4KICAgICAgICAgIDxpbWcgc3JjPSI=")}${esc(s.logo || _lhD("YXNzZXRzL2xvZ28tbWFyay5zdmc="))}${_lhD("IiBhbHQ9IiIgc3R5bGU9IndpZHRoOjU4cHg7aGVpZ2h0OjU4cHg7Ym9yZGVyLXJhZGl1czoxNnB4O2JhY2tncm91bmQ6I2ZmZjtwYWRkaW5nOjVweDtvYmplY3QtZml0OmNvbnRhaW47Ym94LXNoYWRvdzp2YXIoLS1zaGFkb3ctMSkiPgogICAgICAgICAgPGRpdj4KICAgICAgICAgICAgPHNwYW4gY2xhc3M9ImJhZGdlIGluZm8iIHN0eWxlPSJtYXJnaW4tYm90dG9tOjRweCI+")}${icon(_lhD("c3BhcmtsZXM="))}${_lhD("IEPhu5VuZyBI4buNYyDEkMaw4budbmcgU+G7kSDCtyBOxINtIGjhu41jIA==")}${esc(s.schoolYear || _lhD("MjAyNiDigJMgMjAyNw=="))}${_lhD("PC9zcGFuPgogICAgICAgICAgICA8aDIgc3R5bGU9ImZvbnQtZmFtaWx5OnZhcigtLWZvbnQtZGlzcGxheSk7Zm9udC1zaXplOjEuM3JlbTttYXJnaW46MCI+")}${esc(school)}${_lhD("PC9oMj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0ic21hbGwgbXV0ZWQiPlPhu58gR2nDoW8gZOG7pWMgdsOgIMSQw6BvIHThuqFvIHThu4luaCBHaWEgTGFpIMK3IA==")}${esc(s.slogan || _lhD("VHLGsOG7nW5nIGjhu41jIGFuIHRvw6BuIMK3IFRow6JuIHRoaeG7h24gwrcgSOG6oW5oIHBow7pj"))}${_lhD("PC9kaXY+CiAgICAgICAgICA8L2Rpdj4KICAgICAgICA8L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJjYXJkIHBhZCByb3cgbm93cmFwIiBzdHlsZT0iZ2FwOjEycHg7cGFkZGluZzoxMnB4IDE2cHg7YmFja2dyb3VuZDp2YXIoLS1zdXJmYWNlKTtib3JkZXI6MS41cHggc29saWQgdmFyKC0tYnJhbmQtbGluZSk7Ym9yZGVyLXJhZGl1czoxNHB4O2JveC1zaGFkb3c6dmFyKC0tc2hhZG93LTEpIj4KICAgICAgICAgIDxzcGFuIGNsYXNzPSJhdmF0YXIgc3EiIHN0eWxlPSJiYWNrZ3JvdW5kOmxpbmVhci1ncmFkaWVudCgxMzVkZWcsIzE3NDdjOSwjNGY0NmU1KTtjb2xvcjojZmZmO3dpZHRoOjQycHg7aGVpZ2h0OjQycHg7Ym9yZGVyLXJhZGl1czoxMnB4Ij4=")}${icon(_lhD("Y29kZQ=="))}${_lhD("PC9zcGFuPgogICAgICAgICAgPGRpdj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0ieHMgbXV0ZWQiIHN0eWxlPSJ0ZXh0LXRyYW5zZm9ybTp1cHBlcmNhc2U7bGV0dGVyLXNwYWNpbmc6LjA0ZW07Zm9udC13ZWlnaHQ6NzAwIj5Uw6FjIGdp4bqjICYgUGjDoXQgdHJp4buDbiBo4buHIHRo4buRbmc8L2Rpdj4KICAgICAgICAgICAgPGRpdiBzdHlsZT0iZm9udC1mYW1pbHk6dmFyKC0tZm9udC1kaXNwbGF5KTtmb250LXNpemU6MS4wNXJlbTtmb250LXdlaWdodDo4MDA7Y29sb3I6dmFyKC0tYnJhbmQpIj5UcmFuZyB3ZWIgbsOgeSDEkcaw4bujYyB04bqhbyBi4bufaSA=")}${esc(creator)}${_lhD("PC9kaXY+CiAgICAgICAgICAgIDxkaXYgY2xhc3M9InhzIGluazIiPlRoaeG6v3Qga+G6vyBnaWFvIGRp4buHbiwga2nhur9uIHRyw7pjIGLhuqNvIG3huq10ICYgcGjDoXQgdHJp4buDbiB0b8OgbiBkaeG7h24gV2ViIMK3IEFwcCDCtyBBSTwvZGl2PgogICAgICAgICAgPC9kaXY+CiAgICAgICAgPC9kaXY+CiAgICAgIDwvZGl2PgogICAgICA8cCBjbGFzcz0iaW5rMiIgc3R5bGU9Im1hcmdpbjowO2xpbmUtaGVpZ2h0OjEuNjU7Zm9udC1zaXplOi45NnJlbSI+")}${esc(intro)}${_lhD("PC9wPgogICAgPC9zZWN0aW9uPgoKICAgIDxzZWN0aW9uIGNsYXNzPSJzdGFjayIgc3R5bGU9ImdhcDoxMnB4Ij4KICAgICAgPGRpdiBjbGFzcz0icm93IGJldHdlZW4iPgogICAgICAgIDxoMyBzdHlsZT0iZm9udC1mYW1pbHk6dmFyKC0tZm9udC1kaXNwbGF5KTtmb250LXNpemU6MS4wNXJlbTttYXJnaW46MCI+")}${icon(_lhD("bGF5ZXJz"))}${_lhD("IEPDoWMgcGjDom4gaOG7hyAmIHTDrW5oIG7Eg25nIGPhu5F0IGzDtWk8L2gzPgogICAgICAgIDxzcGFuIGNsYXNzPSJ4cyBtdXRlZCI+xJDhu5NuZyBi4buZIHRo4budaSBnaWFuIHRo4buxYyBnaeG7r2EgV2ViIHbDoCBBcHAgxJFp4buHbiB0aG/huqFpPC9zcGFuPgogICAgICA8L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0iZ3JpZCBnMyI+CiAgICAgICAg")}${features.map(([ic, title, desc]) => `${_lhD("CiAgICAgICAgPGRpdiBjbGFzcz0iY2FyZCBwYWQgc3RhY2siIHN0eWxlPSJnYXA6OHB4Ij4KICAgICAgICAgIDxkaXYgY2xhc3M9InJvdyBub3dyYXAiIHN0eWxlPSJnYXA6MTBweCI+CiAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJhdmF0YXIgc3Egc20iIHN0eWxlPSJiYWNrZ3JvdW5kOnZhcigtLWJyYW5kLXNvZnQpO2NvbG9yOnZhcigtLWJyYW5kKSI+")}${icon(ic)}${_lhD("PC9zcGFuPgogICAgICAgICAgICA8YiBjbGFzcz0ic21hbGwiPg==")}${esc(title)}${_lhD("PC9iPgogICAgICAgICAgPC9kaXY+CiAgICAgICAgICA8cCBjbGFzcz0ic21hbGwgaW5rMiIgc3R5bGU9Im1hcmdpbjowO2xpbmUtaGVpZ2h0OjEuNTUiPg==")}${esc(desc)}${_lhD("PC9wPgogICAgICAgIDwvZGl2Pg==")}`).join('')}${_lhD("CiAgICAgIDwvZGl2PgogICAgPC9zZWN0aW9uPgoKICAgIDxzZWN0aW9uIGNsYXNzPSJjYXJkIHBhZCBzdGFjayIgc3R5bGU9ImdhcDoxMnB4Ij4KICAgICAgPGgzIHN0eWxlPSJmb250LWZhbWlseTp2YXIoLS1mb250LWRpc3BsYXkpO2ZvbnQtc2l6ZToxLjAycmVtO21hcmdpbjowIj4=")}${icon(_lhD("YnVpbGRpbmc="))}${_lhD("IFRow7RuZyB0aW4gxJHGoW4gduG7iyAmIExpw6puIGjhu4c8L2gzPgogICAgICA8ZGl2IGNsYXNzPSJncmlkIGcyIiBzdHlsZT0iZ2FwOjEycHgiPgogICAgICAgIDxkaXYgY2xhc3M9ImNhcmQgc29mdCBwYWQgc3RhY2siIHN0eWxlPSJnYXA6NnB4Ij4KICAgICAgICAgIDxiIGNsYXNzPSJzbWFsbCI+")}${esc(school.toUpperCase())}${_lhD("PC9iPgogICAgICAgICAgPGRpdiBjbGFzcz0ic21hbGwgaW5rMiI+")}${icon(_lhD("cGhvbmU="))}${_lhD("IEhvdGxpbmU6IDxiPg==")}${esc(s.contactPhone || _lhD("MDI2OSAzODQ2IDM1OSDCtyBLaOG6qW4gY+G6pXA6IDExMQ=="))}${_lhD("PC9iPjwvZGl2PgogICAgICAgICAgPGRpdiBjbGFzcz0ic21hbGwgaW5rMiI+")}${icon(_lhD("bWFpbA=="))}${_lhD("IEVtYWlsOiA8Yj4=")}${esc(s.contactEmail || _lhD("dGhwdGxlaG9hbkBzZ2RkdC5naWFsYWkuZ292LnZu"))}${_lhD("PC9iPjwvZGl2PgogICAgICAgICAgPGRpdiBjbGFzcz0ic21hbGwgaW5rMiI+")}${icon(_lhD("bWFwUGlu"))}${_lhD("IMSQ4buLYSBjaOG7iTog")}${esc(s.contactAddress || _lhD("xJDGsOG7nW5nIFRy4bqnbiBIxrBuZyDEkOG6oW8sIFRo4buLIHRy4bqlbiBDaMawIFR5LCBIdXnhu4duIMSQ4bupYyBDxqEsIFThu4luaCBHaWEgTGFpLCBWaeG7h3QgTmFt"))}${_lhD("PC9kaXY+CiAgICAgICAgPC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0iY2FyZCBzb2Z0IHBhZCBzdGFjayIgc3R5bGU9ImdhcDo2cHgiPgogICAgICAgICAgPGIgY2xhc3M9InNtYWxsIj5UaMO0bmcgdGluIGLhuqNuIHF1eeG7gW4gJiBTw6FuZyBs4bqtcDwvYj4KICAgICAgICAgIDxkaXYgY2xhc3M9InNtYWxsIGluazIiPuKAoiA8Yj5OZ8aw4budaSB04bqhbyB0cmFuZyB3ZWI6PC9iPiA8c3BhbiBzdHlsZT0iY29sb3I6dmFyKC0tYnJhbmQpO2ZvbnQtd2VpZ2h0OjcwMCI+")}${esc(creator)}${_lhD("PC9zcGFuPjwvZGl2PgogICAgICAgICAgPGRpdiBjbGFzcz0ic21hbGwgaW5rMiI+4oCiIDxiPsSQxqFuIHbhu4sgdGjhu6UgaMaw4bufbmcgJiB24bqtbiBow6BuaDo8L2I+IA==")}${esc(school)}${_lhD("IOKAlCBT4bufIEdEJsSQVCB04buJbmggR2lhIExhaTwvZGl2PgogICAgICAgICAgPGRpdiBjbGFzcz0ic21hbGwgaW5rMiI+4oCiIDxiPlRpw6p1IGNodeG6qW4gYuG6o28gbeG6rXQ6PC9iPiBNw6MgaMOzYSBFQ0RIIFAtMjU2ICsgQUVTLTI1Ni1HQ00sIHjDoWMgdGjhu7FjIDIgY+G7lW5nIMSR4buZYyBs4bqtcCBI4buNYyBzaW5oICYgUXXhuqNuIHRy4buLL0dpw6FvIHZpw6puPC9kaXY+CiAgICAgICAgPC9kaXY+CiAgICAgIDwvZGl2PgogICAgPC9zZWN0aW9uPgogIDwvZGl2Pg==")}`;
}
export function renderAboutPage(view, { head, settings }) {
view.innerHTML = head(_lhD("R2nhu5tpIHRoaeG7h3UgdHJhbmcgd2Vi"), `${_lhD("VGjDtG5nIHRpbiB04buVbmcgcXVhbiB24buBIGjhu4cgdGjhu5FuZyBD4buVbmcgSOG7jWMgxJDGsOG7nW5nIFPhu5Eg")}${settings?.schoolName || _lhD("VHLGsOG7nW5nIFRIUFQgTMOqIEhvw6Bu")}${_lhD("IHbDoCB0w6FjIGdp4bqjIHBow6F0IHRyaeG7g24u")}`) + aboutPortalHtml(settings);
}
