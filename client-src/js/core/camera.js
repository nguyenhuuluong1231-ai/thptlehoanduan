// Camera chụp ảnh trực tiếp trong app (dùng cho tố giác).
// - Có camera và kết nối an toàn (HTTPS, localhost, app APK): mở khung ngắm ngay trong app, chụp liên tiếp nhiều ảnh.
// - Không dùng được (mạng nội bộ http, trình duyệt cũ, bị từ chối quyền): mở camera gốc của điện thoại.
import { icon } from './icons.js';
import { esc, toast, compressImage } from './ui.js';

const MAX_SIDE = 1600, QUALITY = 0.82;
let nativeInput = null;

/** Mở camera gốc của máy (phải gọi ngay trong sự kiện bấm). */
function pickNative({ capture = true, max = 4 } = {}) {
  return new Promise((resolve) => {
    nativeInput?.remove();
    nativeInput = Object.assign(document.createElement('input'), { type: 'file', accept: 'image/*', multiple: true, hidden: true });
    if (capture) nativeInput.setAttribute('capture', 'environment');
    document.body.appendChild(nativeInput);
    nativeInput.onchange = async () => {
      const out = [];
      for (const f of [...nativeInput.files].slice(0, max)) { try { out.push(await compressImage(f, MAX_SIDE, QUALITY)); } catch (e) { toast(e.message, 'warn'); } }
      nativeInput.remove(); nativeInput = null;
      resolve(out.length ? out : null);
    };
    nativeInput.click();
  });
}

const canLive = () => !!(navigator.mediaDevices?.getUserMedia) && (window.isSecureContext || location.hostname === 'localhost');

/**
 * Mở camera chụp ảnh. Trả về mảng ảnh (data URL JPEG) hoặc null nếu người dùng đóng.
 * @param {{ max?: number, title?: string, hint?: string }} opts
 */
export function openCamera({ max = 4, title = 'Chụp ảnh', hint = '' } = {}) {
  if (!canLive()) return pickNative({ max });
  return new Promise((resolve) => {
    let stream = null, facing = 'environment', shots = [], closed = false;
    const el = document.createElement('div');
    el.className = 'cam';
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', title);
    el.innerHTML = `
      <div class="cam-top"><button class="cam-btn" data-x aria-label="Đóng camera">${icon('x')}</button><b>${esc(title)}</b><button class="cam-btn" data-flip aria-label="Đổi camera trước / sau">${icon('refresh')}</button></div>
      <div class="cam-view"><video playsinline autoplay muted></video><div class="cam-flash"></div><div class="cam-msg" hidden></div></div>
      <div class="cam-bottom">
        <div class="cam-hint">${esc(hint)}</div>
        <div class="cam-row">
          <button class="cam-side" data-lib aria-label="Chọn ảnh từ thư viện">${icon('image')}<span>Thư viện</span></button>
          <button class="cam-shutter" data-shot aria-label="Chụp ảnh"><i></i></button>
          <button class="cam-side cam-done" data-done aria-label="Xong" disabled>${icon('check')}<span>Xong <em>0</em>/${max}</span></button>
        </div>
        <div class="cam-shots"></div>
      </div>`;
    document.body.appendChild(el);
    document.body.style.overflow = 'hidden';
    const video = el.querySelector('video'), msg = el.querySelector('.cam-msg');

    const stop = () => { stream?.getTracks().forEach(t => t.stop()); stream = null; };
    const finish = (val) => {
      if (closed) return; closed = true;
      stop(); el.remove(); document.body.style.overflow = ''; removeEventListener('keydown', onKey);
      resolve(val && val.length ? val : null);
    };
    const onKey = (e) => { if (e.key === 'Escape') finish(null); };
    addEventListener('keydown', onKey);

    const showError = (text) => {
      msg.hidden = false;
      msg.innerHTML = `${icon('camera')}<b>${esc(text)}</b><button class="btn" data-native>Mở camera của máy</button><button class="btn ghost" data-lib2>Chọn ảnh có sẵn</button>`;
      msg.querySelector('[data-native]').onclick = async () => { const r = await pickNative({ max: max - shots.length }); if (r) { shots.push(...r); drawShots(); finish(shots); } };
      msg.querySelector('[data-lib2]').onclick = async () => { const r = await pickNative({ capture: false, max: max - shots.length }); if (r) { shots.push(...r); drawShots(); finish(shots); } };
    };
    const start = async () => {
      stop(); msg.hidden = true;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
        if (closed) return stop();
        video.srcObject = stream;
        video.classList.toggle('mirror', facing === 'user' || (stream.getVideoTracks()[0]?.getSettings?.().facingMode === 'user'));
        await video.play().catch(() => { /* bỏ qua */ });
      } catch (e) {
        showError(e?.name === 'NotAllowedError' ? 'Chưa được cấp quyền dùng camera' : e?.name === 'NotFoundError' ? 'Không tìm thấy camera trên thiết bị này' : 'Không mở được camera');
      }
    };
    const drawShots = () => {
      el.querySelector('.cam-shots').innerHTML = shots.map((s, i) => `<span class="cam-thumb"><img src="${s}" alt="Ảnh ${i + 1}"><button data-rm="${i}" aria-label="Xóa ảnh ${i + 1}">${icon('x')}</button></span>`).join('');
      el.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { shots.splice(+b.dataset.rm, 1); drawShots(); });
      const done = el.querySelector('[data-done]'); done.disabled = !shots.length; done.querySelector('em').textContent = shots.length;
      el.querySelector('[data-shot]').disabled = shots.length >= max;
    };
    const shoot = () => {
      if (!stream || !video.videoWidth || shots.length >= max) return;
      const s = Math.min(1, MAX_SIDE / Math.max(video.videoWidth, video.videoHeight));
      const c = document.createElement('canvas'); c.width = Math.round(video.videoWidth * s); c.height = Math.round(video.videoHeight * s);
      const g = c.getContext('2d');
      if (video.classList.contains('mirror')) { g.translate(c.width, 0); g.scale(-1, 1); }
      g.drawImage(video, 0, 0, c.width, c.height);
      shots.push(c.toDataURL('image/jpeg', QUALITY));
      const f = el.querySelector('.cam-flash'); f.classList.remove('on'); void f.offsetWidth; f.classList.add('on');
      navigator.vibrate?.(30);
      drawShots();
      if (shots.length >= max) toast(`Đã đủ ${max} ảnh. Bấm Xong để tiếp tục.`, 'info', 2500);
    };

    el.querySelector('[data-x]').onclick = () => finish(shots.length ? shots : null);
    el.querySelector('[data-flip]').onclick = () => { facing = facing === 'environment' ? 'user' : 'environment'; start(); };
    el.querySelector('[data-shot]').onclick = shoot;
    el.querySelector('[data-done]').onclick = () => finish(shots);
    el.querySelector('[data-lib]').onclick = async () => { const r = await pickNative({ capture: false, max: max - shots.length }); if (r) { shots.push(...r); drawShots(); } };
    video.onclick = shoot;
    start();
  });
}
