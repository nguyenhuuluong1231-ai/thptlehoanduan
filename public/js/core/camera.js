const _lhD=(s)=>{try{return decodeURIComponent(escape(atob(s)));}catch{return atob(s);}};
import { icon } from './icons.js?v=mvkqq6wf';
import { esc, toast, compressImage } from './ui.js?v=mvkqq6wf';
const MAX_SIDE = 1600, QUALITY = 0.82;
let nativeInput = null;
function pickNative({ capture = true, max = 4 } = {}) {
return new Promise((resolve) => {
nativeInput?.remove();
nativeInput = Object.assign(document.createElement(_lhD("aW5wdXQ=")), { type: _lhD("ZmlsZQ=="), accept: _lhD("aW1hZ2UvKg=="), multiple: true, hidden: true });
if (capture) nativeInput.setAttribute(_lhD("Y2FwdHVyZQ=="), _lhD("ZW52aXJvbm1lbnQ="));
document.body.appendChild(nativeInput);
nativeInput.onchange = async () => {
const out = [];
for (const f of [...nativeInput.files].slice(0, max)) { try { out.push(await compressImage(f, MAX_SIDE, QUALITY)); } catch (e) { toast(e.message, _lhD("d2Fybg==")); } }
nativeInput.remove(); nativeInput = null;
resolve(out.length ? out : null);
};
nativeInput.click();
});
}
const canLive = () => !!(navigator.mediaDevices?.getUserMedia) && (window.isSecureContext || location.hostname === _lhD("bG9jYWxob3N0"));
export function openCamera({ max = 4, title = _lhD("Q2jhu6VwIOG6o25o"), hint = '' } = {}) {
if (!canLive()) return pickNative({ max });
return new Promise((resolve) => {
let stream = null, facing = _lhD("ZW52aXJvbm1lbnQ="), shots = [], closed = false;
const el = document.createElement(_lhD("ZGl2"));
el.className = _lhD("Y2Ft");
el.setAttribute(_lhD("cm9sZQ=="), _lhD("ZGlhbG9n")); el.setAttribute(_lhD("YXJpYS1sYWJlbA=="), title);
el.innerHTML = `${_lhD("CiAgICAgIDxkaXYgY2xhc3M9ImNhbS10b3AiPjxidXR0b24gY2xhc3M9ImNhbS1idG4iIGRhdGEteCBhcmlhLWxhYmVsPSLEkMOzbmcgY2FtZXJhIj4=")}${icon(_lhD("eA=="))}${_lhD("PC9idXR0b24+PGI+")}${esc(title)}${_lhD("PC9iPjxidXR0b24gY2xhc3M9ImNhbS1idG4iIGRhdGEtZmxpcCBhcmlhLWxhYmVsPSLEkOG7lWkgY2FtZXJhIHRyxrDhu5tjIC8gc2F1Ij4=")}${icon(_lhD("cmVmcmVzaA=="))}${_lhD("PC9idXR0b24+PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9ImNhbS12aWV3Ij48dmlkZW8gcGxheXNpbmxpbmUgYXV0b3BsYXkgbXV0ZWQ+PC92aWRlbz48ZGl2IGNsYXNzPSJjYW0tZmxhc2giPjwvZGl2PjxkaXYgY2xhc3M9ImNhbS1tc2ciIGhpZGRlbj48L2Rpdj48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0iY2FtLWJvdHRvbSI+CiAgICAgICAgPGRpdiBjbGFzcz0iY2FtLWhpbnQiPg==")}${esc(hint)}${_lhD("PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0iY2FtLXJvdyI+CiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJjYW0tc2lkZSIgZGF0YS1saWIgYXJpYS1sYWJlbD0iQ2jhu41uIOG6o25oIHThu6sgdGjGsCB2aeG7h24iPg==")}${icon(_lhD("aW1hZ2U="))}${_lhD("PHNwYW4+VGjGsCB2aeG7h248L3NwYW4+PC9idXR0b24+CiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJjYW0tc2h1dHRlciIgZGF0YS1zaG90IGFyaWEtbGFiZWw9IkNo4bulcCDhuqNuaCI+PGk+PC9pPjwvYnV0dG9uPgogICAgICAgICAgPGJ1dHRvbiBjbGFzcz0iY2FtLXNpZGUgY2FtLWRvbmUiIGRhdGEtZG9uZSBhcmlhLWxhYmVsPSJYb25nIiBkaXNhYmxlZD4=")}${icon(_lhD("Y2hlY2s="))}${_lhD("PHNwYW4+WG9uZyA8ZW0+MDwvZW0+Lw==")}${max}${_lhD("PC9zcGFuPjwvYnV0dG9uPgogICAgICAgIDwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9ImNhbS1zaG90cyI+PC9kaXY+CiAgICAgIDwvZGl2Pg==")}`;
document.body.appendChild(el);
document.body.style.overflow = _lhD("aGlkZGVu");
const video = el.querySelector(_lhD("dmlkZW8=")), msg = el.querySelector(_lhD("LmNhbS1tc2c="));
const stop = () => { stream?.getTracks().forEach(t => t.stop()); stream = null; };
const finish = (val) => {
if (closed) return; closed = true;
stop(); el.remove(); document.body.style.overflow = ''; removeEventListener(_lhD("a2V5ZG93bg=="), onKey);
resolve(val && val.length ? val : null);
};
const onKey = (e) => { if (e.key === _lhD("RXNjYXBl")) finish(null); };
addEventListener(_lhD("a2V5ZG93bg=="), onKey);
const showError = (text) => {
msg.hidden = false;
msg.innerHTML = `${icon(_lhD("Y2FtZXJh"))}${_lhD("PGI+")}${esc(text)}${_lhD("PC9iPjxidXR0b24gY2xhc3M9ImJ0biIgZGF0YS1uYXRpdmU+TeG7nyBjYW1lcmEgY+G7p2EgbcOheTwvYnV0dG9uPjxidXR0b24gY2xhc3M9ImJ0biBnaG9zdCIgZGF0YS1saWIyPkNo4buNbiDhuqNuaCBjw7Mgc+G6tW48L2J1dHRvbj4=")}`;
msg.querySelector(_lhD("W2RhdGEtbmF0aXZlXQ==")).onclick = async () => { const r = await pickNative({ max: max - shots.length }); if (r) { shots.push(...r); drawShots(); finish(shots); } };
msg.querySelector(_lhD("W2RhdGEtbGliMl0=")).onclick = async () => { const r = await pickNative({ capture: false, max: max - shots.length }); if (r) { shots.push(...r); drawShots(); finish(shots); } };
};
const start = async () => {
stop(); msg.hidden = true;
try {
stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
if (closed) return stop();
video.srcObject = stream;
video.classList.toggle(_lhD("bWlycm9y"), facing === _lhD("dXNlcg==") || (stream.getVideoTracks()[0]?.getSettings?.().facingMode === _lhD("dXNlcg==")));
await video.play().catch(() => {  });
} catch (e) {
showError(e?.name === _lhD("Tm90QWxsb3dlZEVycm9y") ? _lhD("Q2jGsGEgxJHGsOG7o2MgY+G6pXAgcXV54buBbiBkw7luZyBjYW1lcmE=") : e?.name === _lhD("Tm90Rm91bmRFcnJvcg==") ? _lhD("S2jDtG5nIHTDrG0gdGjhuqV5IGNhbWVyYSB0csOqbiB0aGnhur90IGLhu4sgbsOgeQ==") : _lhD("S2jDtG5nIG3hu58gxJHGsOG7o2MgY2FtZXJh"));
}
};
const drawShots = () => {
el.querySelector(_lhD("LmNhbS1zaG90cw==")).innerHTML = shots.map((s, i) => `${_lhD("PHNwYW4gY2xhc3M9ImNhbS10aHVtYiI+PGltZyBzcmM9Ig==")}${s}${_lhD("IiBhbHQ9IuG6om5oIA==")}${i + 1}${_lhD("Ij48YnV0dG9uIGRhdGEtcm09Ig==")}${i}${_lhD("IiBhcmlhLWxhYmVsPSJYw7NhIOG6o25oIA==")}${i + 1}${_lhD("Ij4=")}${icon(_lhD("eA=="))}${_lhD("PC9idXR0b24+PC9zcGFuPg==")}`).join('');
el.querySelectorAll(_lhD("W2RhdGEtcm1d")).forEach(b => b.onclick = () => { shots.splice(+b.dataset.rm, 1); drawShots(); });
const done = el.querySelector(_lhD("W2RhdGEtZG9uZV0=")); done.disabled = !shots.length; done.querySelector(_lhD("ZW0=")).textContent = shots.length;
el.querySelector(_lhD("W2RhdGEtc2hvdF0=")).disabled = shots.length >= max;
};
const shoot = () => {
if (!stream || !video.videoWidth || shots.length >= max) return;
const s = Math.min(1, MAX_SIDE / Math.max(video.videoWidth, video.videoHeight));
const c = document.createElement(_lhD("Y2FudmFz")); c.width = Math.round(video.videoWidth * s); c.height = Math.round(video.videoHeight * s);
const g = c.getContext(_lhD("MmQ="));
if (video.classList.contains(_lhD("bWlycm9y"))) { g.translate(c.width, 0); g.scale(-1, 1); }
g.drawImage(video, 0, 0, c.width, c.height);
shots.push(c.toDataURL(_lhD("aW1hZ2UvanBlZw=="), QUALITY));
const f = el.querySelector(_lhD("LmNhbS1mbGFzaA==")); f.classList.remove(_lhD("b24=")); void f.offsetWidth; f.classList.add(_lhD("b24="));
navigator.vibrate?.(30);
drawShots();
if (shots.length >= max) toast(`${_lhD("xJDDoyDEkeG7pyA=")}${max}${_lhD("IOG6o25oLiBC4bqlbSBYb25nIMSR4buDIHRp4bq/cCB04bulYy4=")}`, _lhD("aW5mbw=="), 2500);
};
el.querySelector(_lhD("W2RhdGEteF0=")).onclick = () => finish(shots.length ? shots : null);
el.querySelector(_lhD("W2RhdGEtZmxpcF0=")).onclick = () => { facing = facing === _lhD("ZW52aXJvbm1lbnQ=") ? _lhD("dXNlcg==") : _lhD("ZW52aXJvbm1lbnQ="); start(); };
el.querySelector(_lhD("W2RhdGEtc2hvdF0=")).onclick = shoot;
el.querySelector(_lhD("W2RhdGEtZG9uZV0=")).onclick = () => finish(shots);
el.querySelector(_lhD("W2RhdGEtbGliXQ==")).onclick = async () => { const r = await pickNative({ capture: false, max: max - shots.length }); if (r) { shots.push(...r); drawShots(); } };
video.onclick = shoot;
start();
});
}
