// Trang "App điện thoại": xem trước app Android trong khung hình điện thoại, mở trên máy thật bằng mã QR.
import { api, detect, getMode } from './core/api.js';
import { icon } from './core/icons.js';
import { $, $$, esc, store, initTheme, initDevToolsGuard, toggleTheme } from './core/ui.js';
import { qrSvg } from './core/qr.js';

initTheme(); initDevToolsGuard();
const IS_REAL_PHONE = (matchMedia('(max-width: 760px)').matches || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '')) && !/[?&]frame/.test(location.search);

const DEVICES = {
  pixel: { name: 'Pixel 8', w: 412, h: 915 },
  a55: { name: 'Galaxy A55', w: 384, h: 854 },
  s24: { name: 'Galaxy S24', w: 360, h: 780 },
};
const SCREENS = [['./', 'Đăng nhập', 'lock'], ['app.html', 'Cổng học sinh', 'grad'], ['admin.html', 'Cổng quản trị · GV', 'building']];
const BEZEL = 12, SBAR = 30;
let dev = DEVICES[store.get('lh_phone_dev')] ? store.get('lh_phone_dev') : 'pixel';
let nav = store.get('lh_phone_nav', 'buttons');
let lan = [];

const svg = {
  wifi: '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 20.5 1.4 8.6a15 15 0 0 1 21.2 0z"/></svg>',
  signal: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M2 22h20V2z"/></svg>',
  battery: '<svg viewBox="0 0 26 14" width="22" height="12"><rect x=".7" y=".7" width="21.6" height="12.6" rx="3" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="2.6" y="2.6" width="15" height="8.8" rx="1.5" fill="currentColor"/><rect x="23.4" y="4.5" width="2" height="5" rx="1" fill="currentColor"/></svg>',
  back: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M17 4.5 6 12l11 7.5z"/></svg>',
  home: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="7.5"/></svg>',
  recent: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="5" width="14" height="14" rx="2"/></svg>',
};

async function boot() {
  if (IS_REAL_PHONE) {
    render();
    return;
  }
  await detect();
  try { lan = (await api.get('api/server-info')).lan || []; } catch { lan = []; }
  render();
  addEventListener('resize', fit, { passive: true });
  setInterval(tick, 15000);
}

function hasActiveSession(p) {
  const tok = (() => { try { return sessionStorage.getItem('lh_token_' + p) || store.get('lh_token_' + p); } catch { return store.get('lh_token_' + p); } })();
  return !!tok;
}

function getInitialSrc() {
  const cur = $('#fr')?.contentWindow?.location;
  if (cur?.pathname) {
    const file = cur.pathname.split('/').pop() || 'index.html';
    return `${file === './' ? 'index.html' : file}?mobile=1${cur.hash || ''}`;
  }
  if (hasActiveSession('student')) return 'app.html?mobile=1';
  return 'index.html?mobile=1';
}

function render() {
  const startSrc = getInitialSrc();
  if (IS_REAL_PHONE) {
    $('#root').innerHTML = `<iframe id="fr" title="App điện thoại THPT Lê Hoàn" src="${esc(startSrc)}" style="position:fixed;inset:0;width:100%;height:100%;border:0;background:var(--bg)" allow="camera; geolocation; clipboard-write; fullscreen"></iframe>`;
    return;
  }
  const d = DEVICES[dev];
  const navH = nav === 'buttons' ? 48 : 22;
  $('#root').innerHTML = `
  <div class="pp">
    <header class="pp-top">
      <a class="brand" href="./" style="padding:0"><img src="assets/logo-mark.svg" alt=""><div><b>App điện thoại</b><span>Cổng Học Đường Số · Trường THPT Lê Hoàn</span></div></a>
      <div class="row" style="gap:8px"><a class="btn ghost sm" href="./">${icon('globe')} Bản web</a><button class="icon-btn" id="theme" aria-label="Đổi giao diện sáng/tối">${icon('moon')}</button></div>
    </header>
    <main class="pp-main">
      <div class="pp-stage" id="stage">
        <div class="device-wrap" id="wrap"><div class="device" id="device" style="--w:${d.w}px;--h:${d.h}px;--bezel:${BEZEL}px">
          <span class="hw hw-power"></span><span class="hw hw-vol"></span>
          <div class="screen">
            <div class="sbar" style="height:${SBAR}px"><span id="clock"></span><i class="cam"></i><span class="sicons">${svg.wifi}${svg.signal}${svg.battery}</span></div>
            <iframe id="fr" title="App điện thoại THPT Lê Hoàn" src="${esc(startSrc)}" style="height:${d.h - SBAR - navH}px" allow="camera; geolocation; clipboard-write; fullscreen"></iframe>
            <div class="navbar ${nav}" style="height:${navH}px">${nav === 'buttons' ? `<button data-nav="back" aria-label="Quay lại">${svg.back}</button><button data-nav="home" aria-label="Màn hình chính">${svg.home}</button><button data-nav="recent" aria-label="Tải lại">${svg.recent}</button>` : '<i class="pill"></i>'}</div>
          </div>
        </div></div>
        <div class="pp-caption small muted">${esc(d.name)} · ${d.w}×${d.h}</div>
      </div>
      <aside class="pp-side stack lg">
        <section class="card pad stack">
          <h1 class="pp-h1">Xem trước app Android</h1>
          <p class="small ink2">App dùng chung tài khoản và dữ liệu với trang web: tin nhắn, thông báo, tố giác… đồng bộ tức thời. Thao tác trong khung điện thoại như trên máy thật.</p>
          <div class="stack" style="gap:8px">
            <span class="eyebrow">Màn hình</span>
            <div class="pp-screens">${SCREENS.map(([src, label, ic]) => `<button class="btn ghost sm" data-go="${src}">${icon(ic)} ${label}</button>`).join('')}<button class="btn ghost sm" data-nav="recent">${icon('refresh')} Tải lại</button></div>
          </div>
          <div class="stack" style="gap:8px">
            <span class="eyebrow">Thiết bị</span>
            <div class="seg" style="width:100%">${Object.entries(DEVICES).map(([k, v]) => `<button data-dev="${k}" class="${dev === k ? 'active' : ''}" style="flex:1">${v.name}</button>`).join('')}</div>
            <div class="seg" style="width:100%"><button data-navmode="buttons" class="${nav === 'buttons' ? 'active' : ''}" style="flex:1">Thanh 3 nút</button><button data-navmode="gesture" class="${nav === 'gesture' ? 'active' : ''}" style="flex:1">Vuốt cử chỉ</button></div>
          </div>
        </section>
        <section class="card pad stack">
          <b>${icon('smartphone')} Mở trên điện thoại thật</b>
          ${getMode() === 'demo' ? '<p class="small ink2">Đây là bản xem trước. Chạy máy chủ bằng <span class="mono">npm start</span> rồi mở trang này để có mã QR quét bằng điện thoại.</p>' : lan.length ? `
          <div class="row nowrap" style="gap:14px;align-items:center"><div id="qr" class="pp-qr" aria-label="Mã QR mở app"></div><div class="stack" style="gap:6px;min-width:0"><span class="small ink2">Quét mã bằng camera điện thoại (cùng mạng Wi-Fi với máy tính):</span>${lan.map(u => `<a class="mono small truncate" href="${esc(u)}" target="_blank" rel="noopener">${esc(u)}</a>`).join('')}</div></div>
          <p class="xs muted">Không mở được? Kiểm tra điện thoại và máy tính cùng Wi-Fi, và cho phép Node.js qua tường lửa Windows (Windows Defender Firewall → Allow an app).</p>` : `<p class="small ink2">Mở <span class="mono">${esc(location.origin)}</span> trên trình duyệt điện thoại.</p><div id="qr" class="pp-qr"></div>`}
        </section>
        <section class="card pad stack">
          <b>${icon('download')} Cài app lên điện thoại</b>
          <ol class="small ink2 pp-steps">
            <li><b>Android, iPhone (không cần APK):</b> mở địa chỉ trên bằng Chrome hoặc Safari → <i>Thêm vào màn hình chính</i>. Cần trang chạy qua HTTPS hoặc localhost.</li>
            <li><b>Tệp APK Android:</b> đưa dự án lên GitHub → tab <i>Actions</i> → <i>Build APK Android</i> → tải tệp APK. Hướng dẫn chi tiết trong <span class="mono">mobile/README.md</span>.</li>
          </ol>
        </section>
      </aside>
    </main>
  </div>`;
  bind();
  fit(); tick(); drawQr();
}

function bind() {
  const fr = $('#fr');
  const saveFrameUrl = () => {
    try {
      const loc = fr.contentWindow.location;
      const file = loc.pathname.split('/').pop() || './';
      const rel = (file === 'index.html' || file === 'loginhocinh' ? './' : file) + (loc.hash || '');
      sessionStorage.setItem('lh_phone_src', rel);
      store.set('lh_phone_src', rel);
    } catch { /* bỏ qua */ }
  };
  fr.addEventListener('load', () => {
    saveFrameUrl();
    try { fr.contentWindow.addEventListener('hashchange', saveFrameUrl); } catch { /* bỏ qua */ }
  });
  $('#theme').onclick = () => { const t = toggleTheme(); try { $('#fr').contentDocument.documentElement.dataset.theme = t; } catch { /* bỏ qua */ } };
  $$('[data-dev]').forEach(b => b.onclick = () => { dev = b.dataset.dev; store.set('lh_phone_dev', dev); render(); });
  $$('[data-navmode]').forEach(b => b.onclick = () => { nav = b.dataset.navmode; store.set('lh_phone_nav', nav); render(); });
  $$('[data-go]').forEach(b => b.onclick = () => {
    const target = b.dataset.go === './' ? './?switch=1' : b.dataset.go;
    try { sessionStorage.setItem('lh_phone_src', b.dataset.go); store.set('lh_phone_src', b.dataset.go); } catch { /* bỏ qua */ }
    $('#fr').src = target;
  });
  $$('[data-nav]').forEach(b => b.onclick = () => {
    const w = $('#fr').contentWindow;
    try {
      if (b.dataset.nav === 'back') w.history.back();
      else if (b.dataset.nav === 'recent') w.location.reload();
      else if (/app\.html/.test(w.location.pathname)) w.location.hash = 'home';
      else if (/(admin|teacher)\.html/.test(w.location.pathname)) w.location.hash = '';
      else $('#fr').src = './';
    } catch { $('#fr').src = './'; }
  });
}

// Thu nhỏ khung điện thoại cho vừa màn hình máy tính
function fit() {
  const d = DEVICES[dev], el = $('#device'), stage = $('#stage');
  if (!el) return;
  const outerW = d.w + BEZEL * 2, outerH = d.h + BEZEL * 2;
  const top = stage.getBoundingClientRect().top + scrollY;
  const availH = Math.max(420, innerHeight - top - 46);
  const availW = Math.max(280, stage.clientWidth || outerW);
  const s = Math.min(1, availH / outerH, availW / (outerW + 12));
  el.style.transform = `scale(${s})`;
  const wrap = $('#wrap'); wrap.style.width = `${outerW * s}px`; wrap.style.height = `${outerH * s}px`;
}

function tick() { const c = $('#clock'); if (c) c.textContent = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }); }

function drawQr() {
  const box = $('#qr'); if (!box) return;
  const url = (lan[0] || location.origin) + '/';
  try { box.innerHTML = qrSvg(url, { size: 132 }); box.title = url; } catch { box.innerHTML = '<span class="xs muted">Không tạo được mã QR</span>'; }
}

boot();
