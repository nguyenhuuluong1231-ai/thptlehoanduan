// Tiện ích giao diện dùng chung: định dạng, hộp thoại, thông báo nhanh, biểu đồ SVG, markdown an toàn…
import { icon } from './icons.js';
import { qrSvg } from './qr.js';

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ---------- Lưu trữ an toàn (có thể bị chặn trong một số trình duyệt) ----------
export const store = {
  get(k, d = null) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* bỏ qua */ } },
  del(k) { try { localStorage.removeItem(k); } catch { /* bỏ qua */ } },
};

// ---------- Định dạng ----------
const pad = (n) => String(n).padStart(2, '0');
export const fmtDate = (iso) => { if (!iso) return '—'; const d = new Date(iso); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`; };
export const fmtTime = (iso) => { if (!iso) return ''; const d = new Date(iso); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
export const fmtDateTime = (iso) => iso ? `${fmtTime(iso)} · ${fmtDate(iso)}` : '—';
export const DAY = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
export const DAY_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
export function ago(iso) {
  if (!iso) return '';
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 45) return 'Vừa xong';
  if (s < 3600) return `${Math.round(s / 60)} phút trước`;
  if (s < 86400) return `${Math.round(s / 3600)} giờ trước`;
  if (s < 86400 * 2) return 'Hôm qua';
  if (s < 86400 * 30) return `${Math.floor(s / 86400)} ngày trước`;
  return fmtDate(iso);
}
export const vnd = (n) => new Intl.NumberFormat('vi-VN').format(Math.round(n || 0)) + ' đ';
export const num = (n, d = 0) => n === null || n === undefined || Number.isNaN(n) ? '—' : Number(n).toLocaleString('vi-VN', { minimumFractionDigits: d, maximumFractionDigits: d });
export const greeting = () => { const h = new Date().getHours(); return h < 11 ? 'Chào buổi sáng' : h < 13 ? 'Chào buổi trưa' : h < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'; };
export const firstName = (n = '') => n.replace(/^(ThS\.|TS\.|Thầy|Cô)\s*/i, '').trim().split(/\s+/).pop();

const AV_COLORS = ['#1747c9', '#0f8f67', '#6a4fe0', '#e8513a', '#0a84b8', '#b0367a', '#c27c0e', '#2f6b4f'];
export function avatar(u, cls = '') {
  const name = u?.name || '?';
  const parts = name.replace(/^(ThS\.|TS\.|Thầy|Cô)\s*/i, '').trim().split(/\s+/);
  const ini = ((parts.at(-2)?.[0] || '') + (parts.at(-1)?.[0] || '')).toUpperCase();
  let h = 0; for (const c of (u?.id || name)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  if (u?.avatar) return `<span class="avatar ${cls}"><img src="${esc(u.avatar)}" alt="" loading="lazy"></span>`;
  return `<span class="avatar ${cls}" style="background:${AV_COLORS[h % AV_COLORS.length]}" aria-hidden="true">${esc(ini)}</span>`;
}

// ---------- Markdown tối giản, an toàn ----------
export function md(text = '') {
  const blocks = [];
  let t = esc(text).replace(/```([\s\S]*?)```/g, (_, code) => { blocks.push(`<pre>${code.replace(/^\n/, '')}</pre>`); return `\u0000${blocks.length - 1}\u0000`; });
  t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, '$1<em>$2</em>').replace(/`([^`]+)`/g, '<code>$1</code>');
  const lines = t.split('\n'); const out = []; let list = null;
  for (const line of lines) {
    const ul = /^\s*[-•]\s+(.*)/.exec(line), ol = /^\s*(\d+)[.)]\s+(.*)/.exec(line);
    if (ul || ol) {
      const type = ul ? 'ul' : 'ol';
      if (list !== type) { if (list) out.push(`</${list}>`); out.push(`<${type}>`); list = type; }
      out.push(`<li>${(ul || ol)[ul ? 1 : 2]}</li>`);
    } else {
      if (list) { out.push(`</${list}>`); list = null; }
      if (line.trim()) out.push(`<p>${line}</p>`);
    }
  }
  if (list) out.push(`</${list}>`);
  return out.join('').replace(/<p>\u0000(\d+)\u0000<\/p>|\u0000(\d+)\u0000/g, (_, a, b) => blocks[a ?? b]);
}

// ---------- Thông báo nhanh ----------
let toastHost;
export function toast(message, tone = 'info', ms = 3600) {
  if (!toastHost) { toastHost = document.createElement('div'); toastHost.className = 'toasts'; toastHost.setAttribute('role', 'status'); toastHost.setAttribute('aria-live', 'polite'); document.body.appendChild(toastHost); }
  const el = document.createElement('div');
  el.className = `toast ${tone}`;
  el.innerHTML = `${icon(tone === 'ok' ? 'checkCircle' : tone === 'bad' ? 'alertCircle' : tone === 'warn' ? 'alert' : 'info')}<span>${esc(message)}</span>`;
  toastHost.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 260); }, ms);
}

// ---------- Hộp thoại ----------
export function modal({ title, sub = '', body = '', foot = '', size = '', onMount, onClose } = {}) {
  const back = document.createElement('div');
  back.className = 'backdrop';
  back.innerHTML = `<div class="modal ${size}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <div class="modal-head"><h3>${esc(title)}${sub ? `<div class="sub">${sub}</div>` : ''}</h3><button class="btn icon ghost sm" data-close aria-label="Đóng">${icon('x')}</button></div>
    <div class="modal-body">${body}</div>${foot ? `<div class="modal-foot">${foot}</div>` : ''}</div>`;
  const prevFocus = document.activeElement;
  const close = (v) => { back.remove(); document.removeEventListener('keydown', onKey); onClose?.(v); prevFocus?.focus?.(); };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  back.addEventListener('mousedown', (e) => { if (e.target === back) close(); });
  back.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => close()));
  document.addEventListener('keydown', onKey);
  document.body.appendChild(back);
  const m = back.querySelector('.modal');
  onMount?.(m, close);
  setTimeout(() => (m.querySelector('[autofocus]') || m.querySelector('input,textarea,select,button:not([data-close])'))?.focus(), 30);
  return { el: m, close };
}

export function confirmDialog({ title = 'Xác nhận', message = '', ok = 'Đồng ý', tone = '', cancel = 'Hủy' } = {}) {
  return new Promise((resolve) => {
    let answered = false;
    modal({ title, body: `<p class="ink2">${message}</p>`, foot: `<button class="btn ghost" data-close>${cancel}</button><button class="btn ${tone}" data-ok>${ok}</button>`,
      onMount: (m, close) => m.querySelector('[data-ok]').addEventListener('click', () => { answered = true; close(); resolve(true); }),
      onClose: () => { if (!answered) resolve(false); } });
  });
}

export function drawer({ title, body = '', onMount }) {
  const back = document.createElement('div'); back.className = 'drawer-back';
  const d = document.createElement('aside'); d.className = 'drawer'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', title);
  d.innerHTML = `<div class="drawer-head"><h3>${esc(title)}</h3><button class="btn icon ghost sm" data-close aria-label="Đóng">${icon('x')}</button></div><div class="drawer-body">${body}</div>`;
  const close = () => { back.remove(); d.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  back.addEventListener('click', close); d.querySelector('[data-close]').addEventListener('click', close);
  document.addEventListener('keydown', onKey);
  document.body.append(back, d);
  onMount?.(d, close);
  return { el: d, close };
}

// ---------- Biểu mẫu ----------
export function formData(form) {
  const o = {};
  for (const el of form.elements) {
    if (!el.name || el.disabled) continue;
    if (el.type === 'checkbox') { if (form.querySelectorAll(`[name="${el.name}"]`).length > 1) { (o[el.name] ||= []); if (el.checked) o[el.name].push(el.value); } else o[el.name] = el.checked; }
    else if (el.type === 'radio') { if (el.checked) o[el.name] = el.value; else if (!(el.name in o)) o[el.name] = ''; }
    else o[el.name] = el.value;
  }
  return o;
}
export async function withBusy(btn, fn) {
  if (!btn) return fn();
  btn.classList.add('loading'); btn.disabled = true;
  try { return await fn(); } finally { btn.classList.remove('loading'); btn.disabled = false; }
}

/** Nén ảnh trước khi tải lên (tối đa 1280px, JPEG 0.82) */
export function compressImage(file, max = 1280, quality = .82) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('Vui lòng chọn tệp hình ảnh.'));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không đọc được ảnh.'));
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Ảnh không hợp lệ.'));
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/** Hộp thoại chỉnh sửa ảnh đại diện: chọn ảnh mới, kéo căn khung, phóng to/thu nhỏ hoặc xóa ảnh */
export function editAvatarModal(u, onSave) {
  let imgObj = null, zoom = 1, dx = 0, dy = 0, removed = false, dirty = false;
  const SIZE = 400;
  return modal({
    title: 'Chỉnh sửa ảnh đại diện',
    sub: u?.name ? `${u.name}${u.className ? ' · ' + u.className : ''}` : '',
    body: `<div class="stack" style="align-items:center;gap:14px">
      <div id="avStage" style="position:relative;width:210px;height:210px;border-radius:50%;overflow:hidden;box-shadow:0 0 0 4px var(--brand-soft),var(--shadow-1);background:var(--surface-2);cursor:grab;touch-action:none;display:grid;place-items:center">
        <canvas id="avCanvas" width="${SIZE}" height="${SIZE}" style="width:100%;height:100%;display:none"></canvas>
        <div id="avFallback" style="display:grid;place-items:center;width:100%;height:100%">${avatar({ ...u, avatar: null }, 'lg')}</div>
      </div>
      <div class="row nowrap" id="avZoomRow" style="width:100%;max-width:280px;gap:10px" hidden>
        <span class="xs muted">Thu nhỏ</span>
        <input type="range" id="avZoom" min="1" max="3" step="0.02" value="1" style="flex:1">
        <span class="xs muted">Phóng to</span>
      </div>
      <span class="xs muted" id="avHint">Bấm “Chọn ảnh” để tải ảnh mới hoặc kéo ảnh để căn chỉnh khung tròn</span>
      <div class="row" style="gap:8px;justify-content:center">
        <label class="btn soft sm" style="cursor:pointer">${icon('camera')} Chọn ảnh từ thiết bị<input type="file" id="avFile" accept="image/*" hidden></label>
        <button type="button" class="btn ghost sm" id="avReset" hidden>${icon('refresh')} Căn giữa</button>
        <button type="button" class="btn ghost sm" id="avClear" style="color:var(--bad)" ${u?.avatar ? '' : 'hidden'}>${icon('trash')} Xóa ảnh</button>
      </div>
    </div>`,
    foot: `<button class="btn ghost" data-close>Hủy</button><button class="btn" id="avSave">${icon('check')} Lưu ảnh đại diện</button>`,
    onMount: (m, close) => {
      const cvs = $('#avCanvas', m), ctx = cvs.getContext('2d'), fb = $('#avFallback', m);
      const zRow = $('#avZoomRow', m), zInp = $('#avZoom', m), rst = $('#avReset', m), clr = $('#avClear', m), stg = $('#avStage', m);
      const fbSpan = fb.querySelector('.avatar');
      if (fbSpan) { fbSpan.style.width = '100%'; fbSpan.style.height = '100%'; fbSpan.style.fontSize = '3.2rem'; }
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
          cvs.style.display = 'none'; fb.style.display = 'grid'; zRow.hidden = true; rst.hidden = true;
          return;
        }
        cvs.style.display = 'block'; fb.style.display = 'none'; zRow.hidden = false; rst.hidden = (zoom === 1 && dx === 0 && dy === 0); clr.hidden = false;
        clamp();
        ctx.clearRect(0, 0, SIZE, SIZE);
        const s = Math.max(SIZE / imgObj.width, SIZE / imgObj.height) * zoom;
        const w = imgObj.width * s, h = imgObj.height * s;
        ctx.drawImage(imgObj, (SIZE - w) / 2 + dx, (SIZE - h) / 2 + dy, w, h);
      };
      const loadSrc = (src, markDirty = false) => {
        const im = new Image();
        im.crossOrigin = 'anonymous';
        im.onload = () => { imgObj = im; zoom = 1; dx = 0; dy = 0; zInp.value = '1'; removed = false; if (markDirty) dirty = true; paint(); };
        im.onerror = () => toast('Không đọc được tệp ảnh.', 'warn');
        im.src = src;
      };
      if (u?.avatar) loadSrc(fileUrl(u.avatar), false);
      $('#avFile', m).onchange = (e) => {
        const f = e.target.files?.[0]; if (!f) return;
        if (!f.type.startsWith('image/')) return toast('Vui lòng chọn tệp hình ảnh.', 'warn');
        const r = new FileReader();
        r.onload = () => loadSrc(r.result, true);
        r.readAsDataURL(f);
        e.target.value = '';
      };
      zInp.oninput = () => { zoom = Number(zInp.value) || 1; dirty = true; paint(); };
      stg.addEventListener('wheel', (e) => {
        if (!imgObj) return;
        e.preventDefault();
        zoom = Math.max(1, Math.min(3, zoom + (e.deltaY < 0 ? 0.08 : -0.08)));
        zInp.value = String(zoom); dirty = true; paint();
      }, { passive: false });
      let drag = null;
      stg.addEventListener('pointerdown', (e) => {
        if (!imgObj) return $('#avFile', m).click();
        stg.setPointerCapture(e.pointerId);
        drag = { x: e.clientX, y: e.clientY, dx0: dx, dy0: dy };
        stg.style.cursor = 'grabbing';
      });
      stg.addEventListener('pointermove', (e) => {
        if (!drag || !imgObj) return;
        const ratio = SIZE / stg.clientWidth;
        dx = drag.dx0 + (e.clientX - drag.x) * ratio;
        dy = drag.dy0 + (e.clientY - drag.y) * ratio;
        dirty = true; paint();
      });
      const endDrag = () => { drag = null; stg.style.cursor = 'grab'; };
      stg.addEventListener('pointerup', endDrag);
      stg.addEventListener('pointercancel', endDrag);
      rst.onclick = () => { zoom = 1; dx = 0; dy = 0; zInp.value = '1'; dirty = true; paint(); };
      clr.onclick = () => { imgObj = null; removed = true; dirty = true; clr.hidden = true; paint(); };
      $('#avSave', m).onclick = () => withBusy($('#avSave', m), async () => {
        try {
          let out;
          if (removed || !imgObj) out = '';
          else if (dirty) out = cvs.toDataURL('image/jpeg', 0.88);
          else out = cvs.toDataURL('image/jpeg', 0.88);
          await onSave(out);
          close();
        } catch (er) { toast(er?.message || 'Không lưu được ảnh đại diện.', 'bad'); }
      });
    },
  });
}

// ---------- Kiểm tra ảnh có khuôn mặt (dùng cho ảnh thẻ hồ sơ) ----------
// Ưu tiên FaceDetector của trình duyệt (Chrome/WebView Android) nếu có; nếu trình duyệt không hỗ trợ,
// dùng phỏng đoán theo tỉ lệ vùng "màu da" ở giữa ảnh làm phương án dự phòng — không cần thư viện ngoài,
// không cần kết nối mạng (đúng tinh thần "không phụ thuộc gói ngoài" của toàn bộ dự án).
export async function detectFace(dataUrl) {
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = () => rej(new Error('Ảnh không hợp lệ.')); img.src = dataUrl; });
  if (typeof FaceDetector === 'function') {
    try {
      const det = new FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
      const faces = await det.detect(img);
      return faces.length > 0;
    } catch { /* khai báo nhưng chạy lỗi (một số trình duyệt) — chuyển sang phỏng đoán bên dưới */ }
  }
  const max = 220;
  const s = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(img.width * s)); c.height = Math.max(1, Math.round(img.height * s));
  const g = c.getContext('2d'); g.drawImage(img, 0, 0, c.width, c.height);
  let data, width = c.width, height = c.height;
  try { ({ data } = g.getImageData(0, 0, width, height)); } catch { return true; } // canvas bị khóa (CORS) — không chặn người dùng
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
  try { await navigator.clipboard.writeText(text); toast('Đã sao chép', 'ok', 1800); }
  catch { const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); toast('Đã sao chép', 'ok', 1800); } catch { toast('Không sao chép được, hãy chọn và sao chép thủ công.', 'warn'); } t.remove(); }
}

// ---------- Trạng thái rỗng / khung tải ----------
export const empty = (title, text = '', ico = 'sparkles', action = '') => `<div class="empty"><div class="art">${icon(ico)}</div><h4>${esc(title)}</h4>${text ? `<p class="small">${text}</p>` : ''}${action}</div>`;
export const skeleton = (rows = 3) => `<div class="loading-page">${'<div class="skel" style="height:120px"></div>'.repeat(rows)}</div>`;
export const badge = (text, tone = '') => `<span class="badge ${tone}">${esc(text)}</span>`;

// ---------- Biểu đồ SVG ----------
/** Biểu đồ cột dọc. data: [{label, value, color?}] */
export function barChart(data, { height = 180, width = 560, max = null, unit = '', color = 'var(--brand)', format = (v) => v } = {}) {
  const W = Math.max(280, Math.round(width)), H = height, padL = 38, padB = 26, padT = 16;
  const top = max ?? Math.max(1, ...data.map(d => d.value ?? 0));
  const nice = top <= 5 ? 5 : top <= 10 ? 10 : Math.ceil(top / (top > 50 ? 25 : 5)) * (top > 50 ? 25 : 5);
  const bw = (W - padL - 10) / data.length;
  const y = (v) => H - padB - ((v ?? 0) / nice) * (H - padB - padT);
  const ticks = [0, nice / 2, nice];
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Biểu đồ cột">
    ${ticks.map(t => `<line class="grid-line" x1="${padL}" x2="${W - 6}" y1="${y(t)}" y2="${y(t)}"/><text x="${padL - 8}" y="${y(t) + 4}" text-anchor="end">${format(t)}${unit}</text>`).join('')}
    ${data.map((d, i) => { const w = Math.min(bw * .6, 72), x = padL + i * bw + (bw - w) / 2, yy = y(d.value), h = H - padB - yy; return `<rect x="${x.toFixed(1)}" y="${yy.toFixed(1)}" width="${w.toFixed(1)}" height="${Math.max(0, h).toFixed(1)}" rx="6" fill="${d.value === null ? 'var(--surface-3)' : d.color || color}"><title>${esc(d.label)}: ${d.value ?? '—'}${unit}</title></rect>${d.value !== null && d.value !== undefined ? `<text x="${(x + w / 2).toFixed(1)}" y="${(yy - 5).toFixed(1)}" text-anchor="middle" style="fill:var(--ink-2);font-weight:600">${format(d.value)}</text>` : ''}<text x="${(x + w / 2).toFixed(1)}" y="${H - 8}" text-anchor="middle">${esc(d.label)}</text>`; }).join('')}
  </svg>`;
}
/** Biểu đồ vành khuyên. data: [{label, value, color}] */
export function donut(data, { size = 160, thickness = 22, center = '', sub = '' } = {}) {
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  const r = (size - thickness) / 2, c = 2 * Math.PI * r; let off = 0;
  const arcs = data.filter(d => d.value > 0).map(d => { const len = (d.value / total) * c; const s = `<circle r="${r}" cx="${size / 2}" cy="${size / 2}" fill="none" stroke="${d.color}" stroke-width="${thickness}" stroke-dasharray="${len.toFixed(2)} ${(c - len).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}"><title>${esc(d.label)}: ${d.value}</title></circle>`; off += len; return s; }).join('');
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="max-width:100%;height:auto" role="img" aria-label="Biểu đồ tỷ lệ"><g transform="rotate(-90 ${size / 2} ${size / 2})"><circle r="${r}" cx="${size / 2}" cy="${size / 2}" fill="none" stroke="var(--surface-3)" stroke-width="${thickness}"/>${arcs}</g>
    <text x="50%" y="${center && sub ? '48%' : '53%'}" text-anchor="middle" style="font:600 22px var(--font-display);fill:var(--ink)">${esc(center)}</text>${sub ? `<text x="50%" y="62%" text-anchor="middle" style="font:500 11px var(--font-body);fill:var(--muted)">${esc(sub)}</text>` : ''}</svg>`;
}
/** Đường xu hướng nhỏ */
export function sparkline(values, { width = 120, height = 36, color = 'var(--brand)' } = {}) {
  const v = values.map(x => x ?? 0); const max = Math.max(...v, 1), min = Math.min(...v, 0);
  const pts = v.map((x, i) => [(i / Math.max(1, v.length - 1)) * width, height - 4 - ((x - min) / (max - min || 1)) * (height - 8)]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('');
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="max-width:100%"><path d="${d} L${width} ${height} L0 ${height}Z" fill="${color}" opacity=".12"/><path d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"/><circle cx="${pts.at(-1)[0]}" cy="${pts.at(-1)[1]}" r="3" fill="${color}"/></svg>`;
}
/** Đồng hồ đo rủi ro nửa vòng (0–100) */
export function gauge(score, color) {
  const a = Math.PI * (1 - score / 100), x = 60 + 46 * Math.cos(a), y = 60 - 46 * Math.sin(a);
  return `<svg class="gauge" viewBox="0 0 120 72" role="img" aria-label="Điểm rủi ro ${score}/100"><path d="M14 60 A46 46 0 0 1 106 60" fill="none" stroke="var(--surface-3)" stroke-width="10" stroke-linecap="round"/><path d="M14 60 A46 46 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)}" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round"/><text x="60" y="56" text-anchor="middle" style="font:700 22px var(--font-display);fill:${color}">${score}</text><text x="60" y="70" text-anchor="middle" style="font:500 9px var(--font-body);fill:var(--muted)">/ 100 điểm rủi ro</text></svg>`;
}

// ---------- Ảnh bìa bản tin ----------
const CAT_ICON = { violence: 'shieldAlert', scam: 'alert', drugs: 'pill', explosive: 'bomb', law: 'scale', traffic: 'car', wellbeing: 'heartHand', school: 'school' };
export function cover(n, tag = true) {
  return `<div class="cover" data-cat="${esc(n.category)}">${n.cover ? `<img src="${esc(n.cover)}" alt="" loading="lazy">` : icon(CAT_ICON[n.category] || 'news')}${tag ? `<span class="cv-tag badge solid" style="background:rgba(10,20,50,.55);color:#fff;backdrop-filter:blur(6px)">${esc(n.badge || '')}</span>` : ''}</div>`;
}

// ---------- Chủ đề sáng / tối ----------
export function initTheme() {
  const t = store.get('theme');
  if (t === 'dark' || t === 'light') document.documentElement.dataset.theme = t;
}
export function toggleTheme() {
  const cur = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next; store.set('theme', next);
  return next;
}

// Hạn chế mở Công cụ nhà phát triển / chuột phải / xem mã nguồn trên các trang chính — CHỈ mang tính
// ngăn cản thông thường, không phải một lớp bảo mật thật sự (ai rành kỹ thuật vẫn mở được bằng menu
// trình duyệt hoặc Remote Debugging). Mục đích là tránh học sinh tò mò bấm nhầm/xem lướt qua, không
// nhằm chặn người có chủ đích. Dữ liệu API thật sự được bảo vệ bằng mã hóa (xem core/api.js), không
// phải bằng cách ẩn giao diện này. Thêm ?debug=1 vào địa chỉ trang để tắt khi cần gỡ lỗi (vd. GV/QT).
export function initDevToolsGuard() {
  try {
    if (new URLSearchParams(location.search).has('debug') || store.get('lh_allow_devtools')) return;
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('keydown', (e) => {
      const k = e.key?.toLowerCase();
      if (k === 'f12') return e.preventDefault();
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(k)) return e.preventDefault();
      if ((e.ctrlKey || e.metaKey) && k === 'u') return e.preventDefault();
    });
  } catch { /* bỏ qua */ }
}

/** Thẻ học sinh (điểm nhấn nhận diện) */
export function idCard(u, settings) {
  const bars = [...(u.id || '0000')].flatMap((c, i) => { const n = c.charCodeAt(0); return [1 + (n % 3), 1 + ((n >> 2) % 2), 2 + ((n + i) % 3)]; }).slice(0, 26);
  return `<div class="idcard">
    <div class="top"><img src="${esc(settings?.logo || 'assets/logo-mark.svg')}" alt=""><div><b>${esc(settings?.schoolName || 'Trường THPT')}</b><span>Thẻ học sinh điện tử · ${esc(settings?.schoolYear || '')}</span></div></div>
    <div class="body"><div class="photo">${u.avatar ? `<img src="${esc(u.avatar)}" alt="">` : esc(firstName(u.name).slice(0, 1))}</div>
      <div class="grow"><div class="name">${esc(u.name)}</div><dl class="kv"><dt>Lớp</dt><dd>${esc(u.className || '')}</dd><dt>Ngày sinh</dt><dd>${u.dob ? fmtDate(u.dob) : '—'}</dd><dt>Niên khóa</dt><dd>${esc(u.courseYear || '')}</dd></dl></div></div>
    <div class="idcode"><div><div class="xs" style="opacity:.7">Mã học sinh</div><div class="mono">${esc(u.id)}</div></div><div class="bars" aria-hidden="true">${bars.map(w => `<i style="width:${w}px"></i>`).join('')}</div></div>
  </div>`;
}


// ---------- Địa chỉ máy chủ (app điện thoại) & tệp đính kèm ----------
/** Địa chỉ máy chủ API. Web: rỗng (cùng nguồn). App điện thoại: địa chỉ máy chủ trường đã cấu hình. */
export const isNativeApp = () => !!(typeof window !== 'undefined' && (window.LH_CONFIG?.app || window.Capacitor?.isNativePlatform?.()));
export const apiBase = () => {
  // Trong app: địa chỉ người dùng tự nhập (nếu có) ưu tiên hơn địa chỉ đóng gói sẵn khi build.
  const saved = isNativeApp() ? store.get('lh_api_base', null) : null;
  return String(saved ?? (typeof window !== 'undefined' ? window.LH_CONFIG?.apiBase : '') ?? '').replace(/\/+$/, '');
};
/** Đường dẫn tệp tải lên (uploads/…) → địa chỉ đầy đủ khi chạy trong app. */
export const fileUrl = (u = '') => (/^uploads\//.test(u) && apiBase() ? `${apiBase()}/${u}` : u);
export const fmtSize = (n = 0) => (n >= 1048576 ? `${(n / 1048576).toFixed(n >= 10485760 ? 0 : 1)} MB` : n >= 1024 ? `${Math.round(n / 1024)} KB` : `${n} B`);
export function readDataUrl(file) {
  return new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = () => reject(new Error('Không đọc được tệp.')); r.readAsDataURL(file); });
}
const FILE_ICON = { image: 'image', video: 'video', audio: 'music', file: 'file' };
const extOf = (name = '') => (name.split('.').pop() || '').slice(0, 4).toUpperCase();

/** Hiển thị tệp đính kèm trong bong bóng chat: lưới ảnh, trình phát video / âm thanh, thẻ tài liệu. */
export function attachmentsHtml(list = []) {
  if (!list?.length) return '';
  const imgs = list.filter(a => a.kind === 'image'), others = list.filter(a => a.kind !== 'image');
  return `<div class="atts">${imgs.length ? `<div class="att-grid n${Math.min(imgs.length, 4)}">${imgs.map(a => `<button type="button" class="att-img" data-lightbox="${esc(fileUrl(a.url))}" aria-label="Xem ảnh ${esc(a.name)}"><img src="${esc(fileUrl(a.url))}" alt="${esc(a.name)}" loading="lazy"></button>`).join('')}</div>` : ''}${others.map(a => a.kind === 'video'
    ? `<video class="att-video" src="${esc(fileUrl(a.url))}" controls playsinline preload="metadata"></video>`
    : a.kind === 'audio' ? `<audio class="att-audio" src="${esc(fileUrl(a.url))}" controls preload="none"></audio>`
    : `<a class="att-file" href="${esc(fileUrl(a.url))}" download="${esc(a.name)}" target="_blank" rel="noopener"><span class="att-ext">${esc(extOf(a.name) || 'TỆP')}</span><span class="grow" style="min-width:0"><b class="truncate">${esc(a.name)}</b><span class="xs muted">${a.size ? fmtSize(a.size) : 'Tài liệu'}</span></span>${icon('download')}</a>`).join('')}</div>`;
}

// Bấm ảnh để phóng to
if (typeof document !== 'undefined' && !window.__lhLightbox) {
  window.__lhLightbox = true;
  // Ảnh đính kèm tải xong làm khung chat cao thêm: giữ cuộn ở cuối nếu người dùng đang ở gần cuối
  document.addEventListener('load', (e) => {
    const t = e.target; if (t?.tagName !== 'IMG' && t?.tagName !== 'VIDEO') return;
    const cb = t.closest?.('.chat-body'); if (!cb || !t.closest('.atts')) return;
    if (cb.scrollHeight - cb.scrollTop - cb.clientHeight < t.offsetHeight + 160) cb.scrollTop = cb.scrollHeight;
  }, true);
  document.addEventListener('click', (e) => {
    const b = e.target.closest?.('[data-lightbox]'); if (!b) return;
    e.preventDefault();
    const src = b.dataset.lightbox;
    const el = document.createElement('div');
    el.className = 'lightbox'; el.innerHTML = `<img src="${esc(src)}" alt=""><button class="icon-btn" aria-label="Đóng">${icon('x')}</button>`;
    const close = () => { el.remove(); removeEventListener('keydown', onKey); };
    const onKey = (ev) => { if (ev.key === 'Escape') close(); };
    el.onclick = close; addEventListener('keydown', onKey);
    document.body.appendChild(el);
  });
}

export const ATTACH_ACCEPT = 'image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar';
/**
 * Gắn nút đính kèm (ảnh, video, tệp) vào khung soạn tin `.chat-input`.
 * @returns {{ files: File[], has(): boolean, clear(): void, upload(fn): Promise<object[]> }}
 */
export function attachComposer(form, { max = 6, maxSize = 25 * 1024 * 1024 } = {}) {
  const st = { files: [] };
  if (!form) return { files: [], has: () => false, clear() {}, upload: async () => [] };
  const input = document.createElement('input');
  input.type = 'file'; input.multiple = true; input.accept = ATTACH_ACCEPT; input.hidden = true;
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'btn icon ghost attach-btn'; btn.setAttribute('aria-label', 'Đính kèm ảnh, video hoặc tệp'); btn.title = 'Đính kèm ảnh, video, tệp';
  btn.innerHTML = icon('paperclip');
  const strip = document.createElement('div'); strip.className = 'attach-strip'; strip.hidden = true;
  form.prepend(btn); form.append(input); form.before(strip);
  const draw = () => {
    strip.hidden = !st.files.length;
    strip.innerHTML = st.files.map((f, i) => `<div class="attach-chip">${f.type.startsWith('image/') ? `<img src="${f._url || (f._url = URL.createObjectURL(f))}" alt="">` : `<span class="att-ext">${icon(FILE_ICON[f.type.split('/')[0]] || 'file')}</span>`}<span class="grow" style="min-width:0"><b class="truncate">${esc(f.name)}</b><span class="xs muted">${fmtSize(f.size)}</span></span><button type="button" class="icon-btn" data-rm="${i}" aria-label="Bỏ tệp">${icon('x')}</button></div>`).join('');
    strip.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { st.files.splice(+b.dataset.rm, 1); draw(); });
  };
  const add = (list) => {
    for (const f of list) {
      if (st.files.length >= max) { toast(`Mỗi tin nhắn đính kèm tối đa ${max} tệp.`, 'warn'); break; }
      if (f.size > maxSize) { toast(`“${f.name}” quá lớn (tối đa ${fmtSize(maxSize)}).`, 'warn'); continue; }
      st.files.push(f);
    }
    draw();
  };
  btn.onclick = () => input.click();
  input.onchange = () => { add([...input.files]); input.value = ''; };
  // Dán ảnh từ bộ nhớ tạm & kéo thả tệp vào khung chat
  form.addEventListener('paste', (e) => { const fs = [...(e.clipboardData?.files || [])]; if (fs.length) { e.preventDefault(); add(fs); } });
  const zone = form.closest('.chat') || form;
  zone.addEventListener('dragover', (e) => { if (e.dataTransfer?.types?.includes('Files')) { e.preventDefault(); zone.classList.add('dropping'); } });
  zone.addEventListener('dragleave', (e) => { if (e.target === zone) zone.classList.remove('dropping'); });
  zone.addEventListener('drop', (e) => { if (e.dataTransfer?.files?.length) { e.preventDefault(); zone.classList.remove('dropping'); add([...e.dataTransfer.files]); } });
  return {
    get files() { return st.files; },
    has: () => st.files.length > 0,
    clear() { st.files.forEach(f => f._url && URL.revokeObjectURL(f._url)); st.files = []; draw(); },
    /** Tải lần lượt từng tệp bằng hàm `fn(file)` (api.upload), trả về danh sách tệp đính kèm. */
    async upload(fn) {
      const out = [];
      for (let i = 0; i < st.files.length; i++) {
        strip.querySelectorAll('.attach-chip')[i]?.classList.add('uploading');
        out.push(await fn(st.files[i]));
      }
      return out;
    },
  };
}


// ---------- Cài app lên màn hình chính (PWA) ----------
let installEvt = null;
if (typeof window !== 'undefined') {
  addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; dispatchEvent(new CustomEvent('lh:installable')); });
  addEventListener('appinstalled', () => { installEvt = null; });
}
export const isStandalone = () => !!(window.Capacitor?.isNativePlatform?.() || matchMedia('(display-mode: standalone)').matches || navigator.standalone);

// ---------- Tự động đăng xuất khi không hoạt động (chỉ áp dụng trên web — app di động cài đặt thì không) ----------
// Trên trình duyệt web thường, nếu 5 phút không có thao tác gì (chuột, bàn phím, chạm, cuộn) sẽ gọi onIdle() để đăng xuất.
// Trên app di động (Capacitor hoặc đã cài vào màn hình chính) thì bỏ qua hoàn toàn, không bao giờ tự đăng xuất.
export function initIdleLogout(onIdle, ms = 5 * 60000) {
  if (isStandalone()) return () => {};
  let timer = 0;
  const reset = () => { clearTimeout(timer); timer = setTimeout(onIdle, ms); };
  ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'].forEach(ev => addEventListener(ev, reset, { passive: true }));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) reset(); });
  reset();
  return reset;
}
export const canInstall = () => !!installEvt && !isStandalone();
export const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
export async function installApp() {
  if (installEvt) { installEvt.prompt(); const r = await installEvt.userChoice.catch(() => null); installEvt = null; return r?.outcome === 'accepted'; }
  modal({ title: 'Cài app lên điện thoại', body: `<ol class="small" style="margin:0;padding-left:20px;display:grid;gap:8px">${isIos() ? '<li>Mở trang này bằng <b>Safari</b>.</li><li>Bấm nút <b>Chia sẻ</b> (ô vuông có mũi tên lên).</li><li>Chọn <b>Thêm vào MH chính</b> rồi bấm <b>Thêm</b>.</li>' : '<li>Mở trang này bằng <b>Chrome</b>.</li><li>Bấm menu <b>⋮</b> ở góc trên bên phải.</li><li>Chọn <b>Cài đặt ứng dụng</b> hoặc <b>Thêm vào màn hình chính</b>.</li>'}</ol><p class="xs muted" style="margin-top:12px">Nhà trường cũng có thể phát hành tệp APK cài trực tiếp cho Android.</p>`, foot: '<button class="btn" data-close>Đã hiểu</button>' });
  return false;
}

const DEFAULT_APP_GUIDE = {
  title: 'Hướng dẫn tải App',
  subtitle: 'Cài đặt ứng dụng Cổng Học Đường Số THPT Lê Hoàn lên điện thoại Android, iPhone (iOS) và máy tính để mở nhanh 1 chạm, giữ đăng nhập và nhận thông báo tức thời.',
  qrTitle: 'Quét mã QR để mở & tải trên điện thoại',
  qrSub: 'Dùng Camera, Zalo hoặc trình duyệt quét mã để mở ngay trên điện thoại',
  qrBadge: 'Hỗ trợ Android · iOS · PC',
  customUrl: '',
  apkUrl: '',
  qrNote: 'Lưu ý: Nếu mở bằng địa chỉ mạng nội bộ (192.168.x.x), điện thoại và máy tính cần kết nối cùng một mạng Wi-Fi.',
  benefitsTitle: 'Lợi ích khi cài App lên thiết bị',
  benefits: [
    { icon: 'smartphone', title: 'Mở nhanh 1 chạm từ Màn hình chính', desc: 'Biểu tượng THPT Lê Hoàn hiển thị riêng trên màn hình chính, chạy toàn màn hình mượt mà như ứng dụng gốc.' },
    { icon: 'face', title: 'Giữ đăng nhập & mở khóa Face ID', desc: 'Không bị tự động đăng xuất sau 5 phút nghỉ như trên trình duyệt web; hỗ trợ đăng nhập bằng khuôn mặt.' },
    { icon: 'bell', title: 'Nhận thông báo & tin nhắn tức thời', desc: 'Đồng bộ thời gian thực (Realtime SSE) khi có phản hồi từ giáo viên, chuyên viên tâm lý hoặc thông báo khẩn.' },
    { icon: 'camera', title: 'Tích hợp Camera, Ghi âm & Định vị GPS', desc: 'Chụp ảnh minh chứng tố giác trực tiếp, gửi ảnh/video/tệp đính kèm và định vị vị trí hỗ trợ khẩn cấp.' },
  ],
  platforms: [
    {
      id: 'android', icon: 'smartphone', tone: 'ok',
      title: '1. Điện thoại Android', badge: 'Chrome / APK',
      sub: 'Áp dụng cho Samsung, Xiaomi, OPPO, Vivo, Realme…',
      steps: [
        'Quét mã QR phía trên hoặc mở địa chỉ cổng trường bằng trình duyệt Google Chrome.',
        'Bấm nút Cài App ngay trên trang này, hoặc chạm nút menu ⋮ (góc trên bên phải Chrome).',
        'Chọn Cài đặt ứng dụng (Install app) hoặc Thêm vào màn hình chính → bấm Cài đặt.',
        'Cài bằng tệp APK (nếu có): Tải tệp .apk do nhà trường cung cấp → mở tệp → bật Cho phép cài từ nguồn này → Cài đặt.',
      ],
    },
    {
      id: 'ios', icon: 'smartphone', tone: 'info',
      title: '2. iPhone / iPad (iOS)', badge: 'Safari',
      sub: 'Áp dụng cho iPhone và iPad (iOS / iPadOS)',
      steps: [
        'Mở địa chỉ Cổng Học Đường Số bằng trình duyệt Safari trên iPhone / iPad.',
        'Chạm vào biểu tượng Chia sẻ (hình ô vuông có mũi tên hướng lên ở thanh công cụ phía dưới).',
        'Cuộn danh sách xuống và chọn mục Thêm vào MH chính (Add to Home Screen).',
        'Nhấn Thêm (Add) ở góc trên bên phải. Ứng dụng sẽ xuất hiện ngay ngoài màn hình chính.',
      ],
    },
    {
      id: 'pc', icon: 'globe', tone: 'violet',
      title: '3. Máy tính / Laptop', badge: 'Windows · macOS',
      sub: 'Áp dụng cho Chrome, Microsoft Edge, Cốc Cốc',
      steps: [
        'Mở Cổng Học Đường Số trên trình duyệt Google Chrome hoặc Microsoft Edge.',
        'Nhìn lên góc phải thanh địa chỉ URL, nhấn vào biểu tượng Cài đặt (hình màn hình có mũi tên tải xuống) hoặc bấm nút Cài App ngay ở đầu trang.',
        'Bấm xác nhận Cài đặt (Install).',
        'Ứng dụng sẽ mở trong cửa sổ riêng và tự tạo lối tắt trên Desktop / thanh Taskbar.',
      ],
    },
  ],
  serverTitle: 'Hướng dẫn kết nối Máy chủ trường (dành cho bản APK Android)',
  serverText: 'Khi cài đặt từ tệp APK Android độc lập, ở màn hình Đăng nhập bạn hãy bấm vào mục Máy chủ trường → Đổi và nhập địa chỉ {URL} rồi bấm Kiểm tra & lưu để đồng bộ tài khoản, tin nhắn và AI của trường theo thời gian thực.',
};

export async function renderAppGuide(view, { api, head, canEdit = false, showError = (e) => toast(e?.message || 'Lỗi', 'bad') }) {
  const draw = async () => {
    let lan = [], custom = null;
    try {
      const r = await api.get('api/app-guide');
      lan = r?.lan || [];
      custom = r?.guide || null;
    } catch {
      try { lan = (await api.get('api/server-info'))?.lan || []; } catch { lan = []; }
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
      ok: 'background:var(--ok-soft);color:var(--ok)',
      info: 'background:var(--brand-soft);color:var(--brand)',
      violet: 'background:var(--violet-soft);color:var(--violet)',
      warn: 'background:var(--warn-soft);color:var(--warn)',
    };

    view.innerHTML = head(
      esc(g.title || DEFAULT_APP_GUIDE.title),
      esc(g.subtitle || DEFAULT_APP_GUIDE.subtitle),
      `${canEdit ? `<button class="btn soft" id="guideEditBtn">${icon('edit')} Chỉnh sửa hướng dẫn</button>${custom ? `<button class="btn ghost" id="guideRstBtn" style="color:var(--bad)">${icon('refresh')} Đặt về mặc định</button>` : ''}` : ''}<button class="btn" id="guideInstBtn">${icon('download')} ${installed ? 'Đã cài đặt trên máy này' : 'Cài App ngay'}</button><a class="btn ghost" href="phone.html">${icon('smartphone')} Xem thử giao diện điện thoại</a>`
    ) + `
    <div class="grid g-main">
      <section class="card pad stack" style="gap:16px">
        <div class="row between">
          <div class="row" style="gap:10px">
            <span class="avatar sq" style="background:var(--brand)">${icon('qr')}</span>
            <div><b>${esc(g.qrTitle || DEFAULT_APP_GUIDE.qrTitle)}</b><div class="xs muted">${esc(g.qrSub || DEFAULT_APP_GUIDE.qrSub)}</div></div>
          </div>
          <div class="row nowrap" style="gap:6px">
            ${installed ? badge('Đã cài đặt', 'ok') : badge(g.qrBadge || DEFAULT_APP_GUIDE.qrBadge, 'info')}
            ${canEdit ? `<button type="button" class="btn icon ghost sm" data-edit-sec="qr" title="Chỉnh sửa khung QR">${icon('edit')}</button>` : ''}
          </div>
        </div>
        <div class="row" style="gap:20px;align-items:center;padding:14px;border-radius:16px;background:var(--surface-2)">
          <div id="guideQr" style="padding:10px;background:#fff;border-radius:14px;box-shadow:var(--shadow-1);display:grid;place-items:center;flex:none"></div>
          <div class="stack grow" style="gap:10px;min-width:200px">
            ${urls.length > 1 ? `<div class="chips">${urls.map((u, i) => `<button type="button" class="chip ${i === 0 ? 'active' : ''}" data-qurl="${esc(u)}" style="font-size:12px">${esc(u.replace(/^https?:\/\//, ''))}</button>`).join('')}</div>` : ''}
            <div class="stack" style="gap:4px">
              <span class="xs muted">Địa chỉ truy cập & cài đặt (có thể nhập để đổi mã QR):</span>
              <div class="row nowrap" style="gap:8px">
                <input class="input mono small" id="guideUrlInp" value="${esc(curUrl)}" style="flex:1;height:38px" aria-label="Địa chỉ truy cập">
                <button type="button" class="btn soft sm" id="guideCopyBtn">${icon('copy')} Sao chép</button>
                ${canEdit ? `<button type="button" class="btn ghost sm" id="guideSaveUrlBtn" title="Lưu địa chỉ này làm mặc định">${icon('check')} Lưu địa chỉ</button>` : ''}
              </div>
            </div>
            <div class="row" style="gap:8px">
              <button type="button" class="btn sm" id="guideInstBtn2">${icon('download')} Cài đặt tự động lên máy này</button>
              ${g.apkUrl ? `<a class="btn soft sm" href="${esc(g.apkUrl)}" target="_blank" rel="noopener" download>${icon('smartphone')} Tải tệp APK Android</a>` : ''}
              <a class="btn ghost sm" href="phone.html">${icon('smartphone')} Khung giả lập Android</a>
            </div>
            ${g.qrNote ? `<p class="xs muted">${esc(g.qrNote)}</p>` : ''}
          </div>
        </div>
      </section>
      <section class="card pad stack" style="gap:12px">
        <div class="row between">
          <b>${icon('sparkles')} ${esc(g.benefitsTitle || DEFAULT_APP_GUIDE.benefitsTitle)}</b>
          ${canEdit ? `<button type="button" class="btn icon ghost sm" data-edit-sec="benefits" title="Chỉnh sửa lợi ích">${icon('edit')}</button>` : ''}
        </div>
        <div class="stack" style="gap:10px">
          ${g.benefits.map(b => `<div class="row nowrap" style="align-items:flex-start;gap:12px"><span class="avatar sm sq" style="background:var(--brand-soft);color:var(--brand)">${icon(b.icon || 'sparkles')}</span><div><b class="small" style="display:block">${esc(b.title)}</b><span class="xs muted">${esc(b.desc)}</span></div></div>`).join('')}
        </div>
      </section>
    </div>

    <div class="grid g3">
      ${g.platforms.map((p, idx) => `<section class="card pad stack" style="gap:12px">
        <div class="row between">
          <div class="row" style="gap:8px"><span class="avatar sm sq" style="${toneStyle[p.tone] || toneStyle.info}">${icon(p.icon || 'smartphone')}</span><b>${esc(p.title)}</b></div>
          <div class="row nowrap" style="gap:6px">${p.badge ? badge(p.badge, p.tone || 'info') : ''}${canEdit ? `<button type="button" class="btn icon ghost sm" data-edit-sec="plat_${idx}" title="Chỉnh sửa mục này">${icon('edit')}</button>` : ''}</div>
        </div>
        ${p.sub ? `<p class="xs muted">${esc(p.sub)}</p>` : ''}
        <ol class="small ink2" style="margin:0;padding-left:18px;display:grid;gap:8px">
          ${(p.steps || []).map(st => `<li>${esc(st)}</li>`).join('')}
        </ol>
      </section>`).join('')}
    </div>

    <section class="card pad stack" style="gap:10px;background:var(--brand-soft);border-color:transparent">
      <div class="row between">
        <b>${icon('globe')} ${esc(g.serverTitle || DEFAULT_APP_GUIDE.serverTitle)}</b>
        <div class="row nowrap" style="gap:6px">
          <button type="button" class="btn soft sm" id="guideCopySrv">${icon('copy')} Sao chép địa chỉ máy chủ</button>
          ${canEdit ? `<button type="button" class="btn icon ghost sm" data-edit-sec="server" title="Chỉnh sửa hướng dẫn máy chủ">${icon('edit')}</button>` : ''}
        </div>
      </div>
      <p class="small ink2" id="guideSrvDesc"></p>
    </section>`;

    const updateSrvText = (u) => {
      const el = $('#guideSrvDesc', view);
      if (!el) return;
      const raw = g.serverText || DEFAULT_APP_GUIDE.serverText;
      const parts = raw.split('{URL}');
      el.innerHTML = parts.map(esc).join(`<code class="mono">${esc(u)}</code>`);
    };

    const paintQr = (u, syncInp = true) => {
      curUrl = u.trim() || location.origin;
      const box = $('#guideQr', view);
      const inp = $('#guideUrlInp', view);
      if (syncInp && inp) inp.value = curUrl;
      updateSrvText(curUrl);
      if (box) {
        try { box.innerHTML = qrSvg(curUrl.endsWith('/') ? curUrl : curUrl + '/', { size: 136 }); }
        catch { box.innerHTML = '<span class="xs muted">Không tạo được QR</span>'; }
      }
    };
    paintQr(curUrl);

    $$('[data-qurl]', view).forEach(b => b.onclick = () => {
      $$('[data-qurl]', view).forEach(x => x.classList.toggle('active', x === b));
      paintQr(b.dataset.qurl, true);
    });
    $('#guideUrlInp', view).oninput = (e) => {
      $$('[data-qurl]', view).forEach(x => x.classList.toggle('active', x.dataset.qurl === e.target.value.trim()));
      paintQr(e.target.value, false);
    };
    $('#guideCopyBtn', view).onclick = () => copyText(curUrl);
    $('#guideCopySrv', view).onclick = () => copyText(curUrl);
    $('#guideInstBtn', view).onclick = () => installApp();
    $('#guideInstBtn2', view).onclick = () => installApp();

    if (canEdit) {
      if ($('#guideSaveUrlBtn', view)) {
        $('#guideSaveUrlBtn', view).onclick = (e) => withBusy(e.currentTarget, async () => {
          try {
            const val = $('#guideUrlInp', view).value.trim();
            await api.put('api/admin/app-guide', { ...g, customUrl: val });
            toast('Đã lưu địa chỉ truy cập mặc định.', 'ok');
            draw();
          } catch (er) { showError(er); }
        });
      }
      if ($('#guideRstBtn', view)) {
        $('#guideRstBtn', view).onclick = async () => {
          if (!await confirmDialog({ title: 'Đặt về mặc định', message: 'Khôi phục toàn bộ nội dung trang Hướng dẫn tải App về mặc định ban đầu?', ok: 'Khôi phục mặc định', tone: 'danger' })) return;
          try {
            await api.post('api/admin/app-guide/reset');
            toast('Đã đặt Hướng dẫn tải App về mặc định.', 'ok');
            draw();
          } catch (er) { showError(er); }
        };
      }
      const openEditor = (focusSec = '') => {
        const state = JSON.parse(JSON.stringify(g));
        modal({
          title: 'Chỉnh sửa Hướng dẫn tải App',
          sub: 'Thay đổi hiển thị tức thời trên cả Cổng Học Sinh và Cổng Giáo Viên',
          size: 'xwide',
          body: `<form id="agForm" class="stack lg">
            <section class="card soft pad stack" style="gap:12px" data-sec="qr">
              <b>${icon('qr')} 1. Tiêu đề trang & Khung mã QR</b>
              <div class="field-row" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">
                <div class="field"><label>Tiêu đề trang</label><input name="title" value="${esc(state.title)}" required></div>
                <div class="field"><label>Nhãn trạng thái khung QR</label><input name="qrBadge" value="${esc(state.qrBadge)}"></div>
                <div class="field" style="grid-column:1/-1"><label>Mô tả đầu trang</label><textarea name="subtitle" rows="2">${esc(state.subtitle)}</textarea></div>
                <div class="field"><label>Tiêu đề khung QR</label><input name="qrTitle" value="${esc(state.qrTitle)}"></div>
                <div class="field"><label>Mô tả phụ khung QR</label><input name="qrSub" value="${esc(state.qrSub)}"></div>
                <div class="field"><label>Địa chỉ truy cập mặc định (để trống = tự lấy IP LAN / tên miền)</label><input name="customUrl" class="mono" value="${esc(state.customUrl || '')}" placeholder="Ví dụ: https://lehoan.edu.vn hoặc http://192.168.1.10:3000"></div>
                <div class="field"><label>Link tải trực tiếp tệp APK Android (không bắt buộc)</label><input name="apkUrl" class="mono" value="${esc(state.apkUrl || '')}" placeholder="Ví dụ: /uploads/lehoan.apk hoặc link Google Drive"></div>
                <div class="field" style="grid-column:1/-1"><label>Ghi chú bên dưới khung QR</label><input name="qrNote" value="${esc(state.qrNote || '')}"></div>
              </div>
            </section>

            <section class="card soft pad stack" style="gap:12px" data-sec="benefits">
              <div class="row between">
                <b>${icon('sparkles')} 2. Lợi ích khi cài App</b>
                <button type="button" class="btn soft sm" id="agAddBen">${icon('plus')} Thêm lợi ích</button>
              </div>
              <div class="field"><label>Tiêu đề mục lợi ích</label><input name="benefitsTitle" value="${esc(state.benefitsTitle)}"></div>
              <div class="stack" id="agBenList" style="gap:8px"></div>
            </section>

            <section class="card soft pad stack" style="gap:12px" data-sec="platforms">
              <b>${icon('smartphone')} 3. Hướng dẫn chi tiết theo thiết bị (mỗi dòng 1 bước)</b>
              <div class="grid g3" id="agPlatList">
                ${state.platforms.map((p, i) => `<div class="card pad stack" style="gap:8px" data-plat="${i}" data-sec="plat_${i}">
                  <div class="field"><label>Tên thiết bị / nền tảng ${i + 1}</label><input data-pf="title" value="${esc(p.title)}" required></div>
                  <div class="field"><label>Nhãn góc phải (Badge)</label><input data-pf="badge" value="${esc(p.badge || '')}"></div>
                  <div class="field"><label>Dòng mô tả phụ</label><input data-pf="sub" value="${esc(p.sub || '')}"></div>
                  <div class="field"><label>Các bước thực hiện (mỗi dòng 1 bước)</label><textarea data-pf="steps" rows="6">${esc((p.steps || []).join('\n'))}</textarea></div>
                </div>`).join('')}
              </div>
            </section>

            <section class="card soft pad stack" style="gap:12px" data-sec="server">
              <b>${icon('globe')} 4. Hướng dẫn kết nối Máy chủ trường (cuối trang)</b>
              <div class="field"><label>Tiêu đề</label><input name="serverTitle" value="${esc(state.serverTitle)}"></div>
              <div class="field"><label>Nội dung hướng dẫn (dùng <span class="mono">{URL}</span> để chèn tự động địa chỉ máy chủ hiện tại)</label><textarea name="serverText" rows="3">${esc(state.serverText)}</textarea></div>
            </section>
          </form>`,
          foot: `<button class="btn ghost" data-close>Hủy</button><button class="btn" id="agSave">${icon('check')} Lưu thay đổi</button>`,
          onMount: (m, close) => {
            const benBox = $('#agBenList', m);
            const syncBenefits = () => {
              state.benefits = $$('[data-ben]', benBox).map(row => ({
                icon: $('[data-bf="icon"]', row).value || 'sparkles',
                title: $('[data-bf="title"]', row).value.trim(),
                desc: $('[data-bf="desc"]', row).value.trim(),
              }));
            };
            const drawBenefits = () => {
              benBox.innerHTML = state.benefits.map((b, i) => `<div class="row nowrap" data-ben="${i}" style="gap:8px;align-items:flex-start;background:var(--surface);padding:10px;border-radius:12px;border:1px solid var(--line)">
                <select class="select" data-bf="icon" style="width:125px;flex:none">
                  ${[['smartphone', 'Điện thoại'], ['face', 'Face ID'], ['bell', 'Thông báo'], ['camera', 'Camera'], ['shieldCheck', 'Bảo mật'], ['sparkles', 'Nổi bật'], ['globe', 'Kết nối'], ['download', 'Tải xuống']].map(([k, l]) => `<option value="${k}" ${b.icon === k ? 'selected' : ''}>${l}</option>`).join('')}
                </select>
                <div class="stack grow" style="gap:6px">
                  <input class="input" data-bf="title" value="${esc(b.title)}" placeholder="Tiêu đề lợi ích">
                  <input class="input small" data-bf="desc" value="${esc(b.desc)}" placeholder="Mô tả chi tiết">
                </div>
                <button type="button" class="btn icon ghost sm" data-rm-ben="${i}" style="color:var(--bad)" title="Xóa">${icon('trash')}</button>
              </div>`).join('');
              $$('[data-rm-ben]', benBox).forEach(btn => btn.onclick = () => {
                syncBenefits();
                state.benefits.splice(+btn.dataset.rmBen, 1);
                drawBenefits();
              });
            };
            drawBenefits();
            $('#agAddBen', m).onclick = () => {
              syncBenefits();
              state.benefits.push({ icon: 'sparkles', title: '', desc: '' });
              drawBenefits();
            };
            if (focusSec) {
              const target = $(`[data-sec="${focusSec}"]`, m);
              if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
            }
            const submit = () => withBusy($('#agSave', m), async () => {
              try {
                syncBenefits();
                const f = formData($('#agForm', m));
                const platforms = $$('[data-plat]', m).map((el, i) => ({
                  ...state.platforms[i],
                  title: $('[data-pf="title"]', el).value.trim(),
                  badge: $('[data-pf="badge"]', el).value.trim(),
                  sub: $('[data-pf="sub"]', el).value.trim(),
                  steps: $('[data-pf="steps"]', el).value.split('\n').map(s => s.trim()).filter(Boolean),
                }));
                await api.put('api/admin/app-guide', {
                  ...f,
                  benefits: state.benefits.filter(b => b.title),
                  platforms,
                });
                close();
                toast('Đã lưu nội dung Hướng dẫn tải App.', 'ok');
                draw();
              } catch (er) { showError(er); }
            });
            $('#agSave', m).onclick = submit;
            $('#agForm', m).onsubmit = (e) => { e.preventDefault(); submit(); };
          },
        });
      };
      $('#guideEditBtn', view).onclick = () => openEditor();
      $$('[data-edit-sec]', view).forEach(b => b.onclick = () => openEditor(b.dataset.editSec));
    }
  };
  await draw();
}

export function aboutPortalHtml(s = {}) {
  const school = s.schoolName || 'Trường THPT Lê Hoàn';
  const creator = s.creatorName || 'Vũ Nguyễn An Khang';
  const intro = s.siteIntro || 'Cổng Học Đường Số Trường THPT Lê Hoàn là nền tảng trực tuyến hỗ trợ học sinh tố giác vi phạm ẩn danh, tư vấn tâm lý học đường 24/7, kết nối thầy cô, thi trắc nghiệm pháp luật và tích hợp trí tuệ nhân tạo (AI) phòng chống lừa đảo không gian mạng.';
  const features = [
    ['shieldAlert', 'Tố giác vi phạm ẩn danh', 'Gửi phản ánh bạo lực học đường, vi phạm nội quy kèm ảnh chụp minh chứng; bảo mật danh tính người gửi và theo dõi tiến trình xử lý minh bạch.'],
    ['heartHand', 'Tư vấn tâm lý học đường 24/7', 'Trò chuyện riêng tư 1-1 với Tổ Tư vấn tâm lý nhà trường, ghi nhật ký cảm xúc hàng ngày và thực hành bài tập hít thở thư giãn.'],
    ['message', 'Kết nối Thầy cô & Học sinh', 'Trao đổi học tập trực tiếp với giáo viên bộ môn, giáo viên chủ nhiệm, gửi đơn xin phép nghỉ học trực tuyến và tham gia phòng chat chung văn minh.'],
    ['shieldCheck', 'AI Guard & Chống lừa đảo', 'Tích hợp Trí tuệ nhân tạo phân tích tin nhắn, đường link, số điện thoại, tài khoản ngân hàng đáng ngờ và phát hiện sớm dấu hiệu khủng hoảng tâm lý.'],
    ['trophy', 'Đấu trường Trắc nghiệm & Khảo sát', 'Thi tìm hiểu pháp luật, an toàn giao thông, kỹ năng sống có bảng xếp hạng thi đua và tham gia các đợt khảo sát dân chủ trong nhà trường.'],
    ['lock', 'Bảo mật đa tầng & Đa nền tảng', 'Mã hóa dữ liệu nhạy cảm ở tầng ứng dụng (ECDH P-256 + AES-256-GCM), hoạt động mượt mà trên cả máy tính (Web) và điện thoại (Android / iOS).'],
  ];
  return `
  <div class="stack lg">
    <section class="card pad stack" style="gap:16px;background:linear-gradient(135deg,var(--brand-soft),var(--surface));border-color:var(--brand-line)">
      <div class="row between" style="gap:16px;flex-wrap:wrap;align-items:center">
        <div class="row" style="gap:14px;align-items:center">
          <img src="${esc(s.logo || 'assets/logo-mark.svg')}" alt="" style="width:58px;height:58px;border-radius:16px;background:#fff;padding:5px;object-fit:contain;box-shadow:var(--shadow-1)">
          <div>
            <span class="badge info" style="margin-bottom:4px">${icon('sparkles')} Cổng Học Đường Số · Năm học ${esc(s.schoolYear || '2026 – 2027')}</span>
            <h2 style="font-family:var(--font-display);font-size:1.3rem;margin:0">${esc(school)}</h2>
            <div class="small muted">Sở Giáo dục và Đào tạo tỉnh Gia Lai · ${esc(s.slogan || 'Trường học an toàn · Thân thiện · Hạnh phúc')}</div>
          </div>
        </div>
        <div class="card pad row nowrap" style="gap:12px;padding:12px 16px;background:var(--surface);border:1.5px solid var(--brand-line);border-radius:14px;box-shadow:var(--shadow-1)">
          <span class="avatar sq" style="background:linear-gradient(135deg,#1747c9,#4f46e5);color:#fff;width:42px;height:42px;border-radius:12px">${icon('code')}</span>
          <div>
            <div class="xs muted" style="text-transform:uppercase;letter-spacing:.04em;font-weight:700">Tác giả & Phát triển hệ thống</div>
            <div style="font-family:var(--font-display);font-size:1.05rem;font-weight:800;color:var(--brand)">Trang web này được tạo bởi ${esc(creator)}</div>
            <div class="xs ink2">Thiết kế giao diện, kiến trúc bảo mật & phát triển toàn diện Web · App · AI</div>
          </div>
        </div>
      </div>
      <p class="ink2" style="margin:0;line-height:1.65;font-size:.96rem">${esc(intro)}</p>
    </section>

    <section class="stack" style="gap:12px">
      <div class="row between">
        <h3 style="font-family:var(--font-display);font-size:1.05rem;margin:0">${icon('layers')} Các phân hệ & tính năng cốt lõi</h3>
        <span class="xs muted">Đồng bộ thời gian thực giữa Web và App điện thoại</span>
      </div>
      <div class="grid g3">
        ${features.map(([ic, title, desc]) => `
        <div class="card pad stack" style="gap:8px">
          <div class="row nowrap" style="gap:10px">
            <span class="avatar sq sm" style="background:var(--brand-soft);color:var(--brand)">${icon(ic)}</span>
            <b class="small">${esc(title)}</b>
          </div>
          <p class="small ink2" style="margin:0;line-height:1.55">${esc(desc)}</p>
        </div>`).join('')}
      </div>
    </section>

    <section class="card pad stack" style="gap:12px">
      <h3 style="font-family:var(--font-display);font-size:1.02rem;margin:0">${icon('building')} Thông tin đơn vị & Liên hệ</h3>
      <div class="grid g2" style="gap:12px">
        <div class="card soft pad stack" style="gap:6px">
          <b class="small">${esc(school.toUpperCase())}</b>
          <div class="small ink2">${icon('phone')} Hotline: <b>${esc(s.contactPhone || '0269 3846 359 · Khẩn cấp: 111')}</b></div>
          <div class="small ink2">${icon('mail')} Email: <b>${esc(s.contactEmail || 'thptlehoan@sgddt.gialai.gov.vn')}</b></div>
          <div class="small ink2">${icon('mapPin')} Địa chỉ: ${esc(s.contactAddress || 'Đường Trần Hưng Đạo, Thị trấn Chư Ty, Huyện Đức Cơ, Tỉnh Gia Lai, Việt Nam')}</div>
        </div>
        <div class="card soft pad stack" style="gap:6px">
          <b class="small">Thông tin bản quyền & Sáng lập</b>
          <div class="small ink2">• <b>Người tạo trang web:</b> <span style="color:var(--brand);font-weight:700">${esc(creator)}</span></div>
          <div class="small ink2">• <b>Đơn vị thụ hưởng & vận hành:</b> ${esc(school)} — Sở GD&ĐT tỉnh Gia Lai</div>
          <div class="small ink2">• <b>Tiêu chuẩn bảo mật:</b> Mã hóa ECDH P-256 + AES-256-GCM, xác thực 2 cổng độc lập Học sinh & Quản trị/Giáo viên</div>
        </div>
      </div>
    </section>
  </div>`;
}

export function renderAboutPage(view, { head, settings }) {
  view.innerHTML = head('Giới thiệu trang web', `Thông tin tổng quan về hệ thống Cổng Học Đường Số ${settings?.schoolName || 'Trường THPT Lê Hoàn'} và tác giả phát triển.`) + aboutPortalHtml(settings);
}
