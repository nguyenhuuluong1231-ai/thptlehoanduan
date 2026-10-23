// =============================================================================
//  CỔNG HỌC SINH — ứng dụng một trang (SPA), tự co giãn cho điện thoại & máy tính
// =============================================================================
import { api, session, setPortal, detect, getMode, live, showError } from './core/api.js';
import { icon, drumArt, moodFace } from './core/icons.js';
import { openCamera } from './core/camera.js';
import { $, $$, esc, toast, modal, confirmDialog, drawer, formData, withBusy, compressImage, editAvatarModal, copyText, empty, skeleton, badge, barChart, gauge, cover, md, store,
  fmtDate, fmtTime, fmtDateTime, ago, vnd, num, greeting, firstName, avatar, idCard, initTheme, initDevToolsGuard, toggleTheme, DAY, DAY_SHORT, sleep, attachmentsHtml, attachComposer, canInstall, installApp, isStandalone, isNativeApp, fileUrl, renderAppGuide, renderAboutPage } from './core/ui.js';

setPortal('student');
initTheme(); initDevToolsGuard();

const S = { user: null, settings: null, unread: 0, badges: null, cleanups: [] };
const root = $('#root');

const NAV = [
  { group: 'Tổng quan', items: [
    { id: 'home', label: 'Trang chủ', icon: 'home' },
  ] },
  { group: 'Kết nối', items: [
    { id: 'counseling', label: 'Chat tư vấn tâm lý', icon: 'heartHand', module: 'counseling' },
    { id: 'school-chat', label: 'Chat toàn trường', icon: 'chats', module: 'schoolChat' },
    { id: 'teacher-chat', label: 'Chat với giáo viên', icon: 'message', module: 'teacherChat' },
    { id: 'teacher-list', label: 'Danh sách giáo viên', icon: 'school', module: 'teacherChat' },
    { id: 'quiz', label: 'Đấu trường trắc nghiệm', icon: 'trophy', module: 'quiz' },
    { id: 'survey', label: 'Khảo sát', icon: 'clipboardCheck', module: 'survey' },
  ] },
  { group: 'An toàn & tâm lý', items: [
    { id: 'report', label: 'Tố giác vi phạm', icon: 'shieldAlert', module: 'report' },
    { id: 'counsel-team', label: 'Tổ tâm lý', icon: 'users', module: 'counseling' },
    { id: 'mood', label: 'Cảm xúc & thư giãn', icon: 'smile' },
    { id: 'handbook', label: 'Cẩm nang & đường dây nóng', icon: 'bookOpen' },
    { id: 'news', label: 'Bản tin tuyên truyền', icon: 'news' },
  ] },
  { group: 'Trí tuệ nhân tạo', items: [
    { id: 'scam', label: 'Tra cứu lừa đảo', icon: 'shieldCheck', module: 'scam' },
    { id: 'ai', label: 'Trợ lý học đường AI', icon: 'bot', module: 'aiChat' },
    { id: 'app-guide', label: 'Hướng dẫn tải App', icon: 'smartphone' },
    { id: 'about', label: 'Giới thiệu trang web', icon: 'info' },
  ] },
];
const ALL = NAV.flatMap(g => g.items).concat([{ id: 'profile', label: 'Hồ sơ cá nhân', icon: 'user' }, { id: 'inbox', label: 'Tin nhắn', icon: 'chats' }]);
// Giao diện gọn cho điện thoại / app (màn hình hẹp)
const compact = () => isNativeApp() || /[?&]mobile/.test(location.search) || matchMedia('(max-width: 760px)').matches;
const ROOT_TABS = ['home', 'inbox', 'report', 'ai', 'profile'];
const CHAT_PAGES = ['inbox', 'school-chat', 'teacher-chat', 'counseling'];
const enabled = (it) => !it.module || S.settings?.modules?.[it.module] !== false;
const go = (page) => { if (location.hash !== '#' + page) location.hash = page; else render(); };

const studentLoginUrl = () => (window.self !== window.top || /[?&]mobile/.test(location.search) || isNativeApp() ? 'index.html?mobile=1&switch=1' : (getMode() !== 'server' ? './?switch=1' : '/hocsinhlogin'));

// ---------------------------------------------------------------------------
async function boot() {
  root.innerHTML = '<div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:24px;text-align:center"><img src="assets/school_logo.png" alt="Trường THPT Lê Hoàn" style="width:96px;height:96px;object-fit:contain;border-radius:50%;background:#fff;padding:6px;box-shadow:0 12px 32px rgba(23,71,201,.28)"><div style="font-weight:700;font-size:16px">Trường THPT Lê Hoàn</div><div class="skel" style="width:180px;height:8px;border-radius:99px"></div></div>';
  await detect();
  if (!session.token) return (location.href = studentLoginUrl());
  try {
    const [{ user }, settings] = await Promise.all([api.get('api/auth/me'), api.get('api/settings/public')]);
    if (user.role !== 'student') return (location.href = 'admin.html');
    S.user = user; S.settings = settings;
  } catch { return (location.href = studentLoginUrl()); }
  enterApp();
}

// Vào ứng dụng thật sự — chỉ gọi sau khi KHÔNG còn cổng chặn nào (đổi mật khẩu / hoàn tất hồ sơ).
function enterApp() {
  if (S.user.mustChangePassword) return gateChangePassword();
  if (S.user.profileComplete === false) return gateCompleteProfile();
  shell();
  live.connect();
  bindLive();
  refreshBadges(0);
  addEventListener('hashchange', render);
  render();
}

// ---------------------------------------------------------------------------
// Cổng chặn 1/2: bắt buộc đổi mật khẩu (tài khoản mới tạo luôn có mustChangePassword=true).
// Không có cách thoát ngoài gửi đúng form này — chưa hiện thanh điều hướng, chưa gọi shell()/render().
// ---------------------------------------------------------------------------
function gateChangePassword() {
  document.body.classList.remove('has-tabbar');
  root.innerHTML = `
  <div style="min-height:100vh;display:grid;place-items:center;padding:24px">
    <form id="gpw" class="card" style="max-width:420px;width:100%">
      <div class="card-head"><h2>${icon('key')} Đổi mật khẩu lần đầu</h2></div>
      <div class="card-body stack">
        <p class="small muted">Tài khoản của bạn đang dùng mật khẩu mặc định. Vui lòng đặt mật khẩu mới trước khi tiếp tục sử dụng.</p>
        <div class="field"><label for="gcp">Mật khẩu hiện tại</label><input id="gcp" name="currentPassword" type="password" autocomplete="current-password" required></div>
        <div class="field"><label for="gnp">Mật khẩu mới</label><input id="gnp" name="newPassword" type="password" autocomplete="new-password" minlength="6" required><span class="hint">Ít nhất 6 ký tự, nên kết hợp chữ, số và ký tự đặc biệt.</span></div>
        <div class="field"><label for="gnp2">Nhập lại mật khẩu mới</label><input id="gnp2" type="password" autocomplete="new-password" required></div>
      </div>
      <div class="card-foot"><button class="btn block" id="gpwb">${icon('check')} Đổi mật khẩu & tiếp tục</button></div>
    </form>
  </div>`;
  $('#gpw').onsubmit = (e) => {
    e.preventDefault();
    const f = formData(e.target);
    if (f.newPassword !== $('#gnp2').value) return toast('Mật khẩu nhập lại không khớp.', 'warn');
    withBusy($('#gpwb'), async () => {
      try {
        const r = await api.post('api/auth/change-password', f);
        session.set(r.token, true);
        S.user.mustChangePassword = false;
        toast('Đã đổi mật khẩu.', 'ok');
        enterApp();
      } catch (er) { showError(er); }
    });
  };
}

// ---------------------------------------------------------------------------
// Cổng chặn 2/2: bắt buộc điền họ tên + chọn lớp thật (tài khoản tạo hàng loạt chưa có thông tin
// thật — xem POST /api/admin/users/bulk-generate). Chỉ sau khi lưu thành công mới vào được ứng dụng.
// ---------------------------------------------------------------------------
function gateCompleteProfile() {
  document.body.classList.remove('has-tabbar');
  root.innerHTML = '<div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:24px;text-align:center"><img src="assets/school_logo.png" alt="Trường THPT Lê Hoàn" style="width:96px;height:96px;object-fit:contain;border-radius:50%;background:#fff;padding:6px;box-shadow:0 12px 32px rgba(23,71,201,.28)"><div style="font-weight:700;font-size:16px">Trường THPT Lê Hoàn</div><div class="skel" style="width:180px;height:8px;border-radius:99px"></div></div>';
  api.get('api/classes').then(({ items }) => {
    root.innerHTML = `
    <div style="min-height:100vh;display:grid;place-items:center;padding:24px">
      <form id="gpf" class="card" style="max-width:460px;width:100%">
        <div class="card-head"><h2>${icon('user')} Hoàn tất hồ sơ</h2></div>
        <div class="card-body stack">
          <p class="small muted">Tài khoản của bạn chưa có đầy đủ thông tin. Vui lòng điền trước khi sử dụng ứng dụng.</p>
          <div class="field"><label for="gfname">Họ và tên</label><input id="gfname" name="name" required maxlength="80" placeholder="Nguyễn Văn A"></div>
          <div class="field"><label for="gfclass">Lớp</label><select id="gfclass" name="classId" required><option value="">— Chọn lớp —</option>${items.map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')}</select></div>
          <div class="field"><label for="gfgender">Giới tính</label><select id="gfgender" name="gender"><option value="">—</option><option>Nam</option><option>Nữ</option></select></div>
          <div class="field"><label for="gfdob">Ngày sinh</label><input id="gfdob" name="dob" type="date"></div>
          <div class="field"><label for="gfemail">Email (không bắt buộc)</label><input id="gfemail" name="email" type="email" placeholder="tenban@gmail.com"></div>
          <div class="field"><label for="gfphone">Số điện thoại (không bắt buộc)</label><input id="gfphone" name="phone" inputmode="tel" placeholder="09xx xxx xxx"></div>
        </div>
        <div class="card-foot"><button class="btn block" id="gpfb">${icon('check')} Lưu & vào ứng dụng</button></div>
      </form>
    </div>`;
    $('#gpf').onsubmit = (e) => {
      e.preventDefault();
      withBusy($('#gpfb'), async () => {
        try {
          const r = await api.put('api/auth/complete-profile', formData(e.target));
          S.user = r.user;
          toast('Đã lưu thông tin. Chào mừng bạn!', 'ok');
          enterApp();
        } catch (er) { showError(er); }
      });
    };
  }).catch(showError);
}

function openMyAvatarEditor(after) {
  editAvatarModal(S.user, async (data) => {
    const r = await api.put('api/profile', { avatar: data });
    S.user = r.user;
    toast(data ? 'Đã cập nhật ảnh đại diện.' : 'Đã xóa ảnh đại diện.', 'ok');
    shell();
    if (after) after(r.user); else render();
  });
}

// Ẩn biểu tượng máy ảnh trên ảnh đại diện; nhấp vào ảnh đại diện mới hiện máy ảnh, nhấp tiếp vào máy ảnh (hoặc nhấp lần 2) để mở hộp thoại đổi ảnh
function bindAvatarCam(btn, onOpen = () => openMyAvatarEditor()) {
  if (!btn) return;
  btn.onclick = (e) => {
    e.stopPropagation();
    const camHit = e.target.closest('.m-user-cam, .top-av-cam');
    if (btn.classList.contains('show-cam') || camHit) {
      btn.classList.remove('show-cam');
      onOpen();
    } else {
      $$('.show-cam').forEach(el => el.classList.remove('show-cam'));
      btn.classList.add('show-cam');
    }
  };
}
document.addEventListener('click', (e) => {
  if (!e.target.closest('.m-user-av, .top-av-btn')) $$('.show-cam').forEach(el => el.classList.remove('show-cam'));
});

function shell() {
  const u = S.user, s = S.settings;
  document.body.classList.add('has-tabbar');
  root.innerHTML = `
  <div class="shell">
    <aside class="sidebar">
      <a class="brand" href="#home"><img src="${esc(s.logo)}" alt=""><div><b>${esc(s.schoolName || s.shortName)}</b><span>Cổng Học Sinh</span></div></a>
      <div class="card side-user">
        <button type="button" id="sideAv" class="m-user-av" title="Bấm để chỉnh sửa ảnh đại diện">${avatar(u)}<span class="m-user-cam">${icon('camera')}</span></button>
        <a href="#profile" class="m-user-info">
          <b class="truncate">${esc(u.name)}</b>
          <div class="m-user-pills">
            ${u.className || u.classId ? `<span class="m-user-pill brand">${esc(u.className || u.classId)}</span>` : ''}
            <span class="m-user-pill mono">${esc(u.id)}</span>
          </div>
        </a>
        <a href="#profile" class="m-user-go" aria-label="Hồ sơ">${icon('chevronRight')}</a>
      </div>
      ${NAV.map(g => { const items = g.items.filter(enabled); return items.length ? `<div class="nav-label eyebrow">${g.group}</div><nav class="nav">${items.map(it => `<a href="#${it.id}" data-nav="${it.id}">${icon(it.icon)}<span>${it.label}</span><span class="count" data-count="${it.id}" hidden></span></a>`).join('')}</nav>` : ''; }).join('')}
      <div class="sidebar-foot">
        <a class="side-sos" href="tel:111">
          <span class="side-sos-ico">${icon('phone')}</span>
          <div class="grow"><b class="small">Cần giúp đỡ khẩn cấp?</b><div class="xs muted">Tổng đài bảo vệ trẻ em 24/7</div></div>
          <span class="side-sos-num">111</span>
        </a>
        <div class="row nowrap"><button class="btn ghost sm grow" id="themeBtn">${icon('moon')} Giao diện</button><button class="btn ghost sm grow" id="logoutBtn">${icon('logout')} Đăng xuất</button></div>
      </div>
    </aside>
    <div class="main">
      <header class="mobilebar" id="mbar">
        <button class="icon-btn mb-back" id="mbBack" aria-label="Quay lại">${icon('arrowLeft')}</button>
        <img class="mb-logo" src="${esc(s.logo)}" alt=""><div class="grow mb-title"><b id="mbTitle">${esc(s.schoolName || s.shortName)}</b><span id="mbSub">Cổng Học Sinh</span></div>
        <button class="icon-btn" data-bell aria-label="Thông báo">${icon('bell')}<span class="dot" data-dot hidden></span></button>
      </header>
      <header class="topbar desktop-only">
        <div class="search" id="finder"><span>${icon('search')}</span><input placeholder="Tìm nhanh chức năng: tố giác, khảo sát, trợ lý AI…" aria-label="Tìm chức năng" id="finderInput" autocomplete="off"><kbd class="search-kbd">/</kbd><div class="card" id="finderList" hidden style="position:absolute;top:48px;left:0;right:0;padding:6px;z-index:5;box-shadow:var(--shadow-2)"></div></div>
        <div class="spacer"></div>
        <span class="top-meta-pill">${icon('calendar')} ${esc(s.semester || 'Học kỳ I')} · ${esc(s.schoolYear || '')}</span>
        <button class="icon-btn" data-bell aria-label="Thông báo">${icon('bell')}<span class="dot" data-dot hidden></span></button>
        <div class="top-user-chip">
          <button type="button" id="topAv" class="top-av-btn" title="Bấm để chỉnh sửa ảnh đại diện">${avatar(u, 'sm')}<span class="top-av-cam">${icon('camera')}</span></button>
          <a href="#profile" class="top-user-meta"><b class="truncate">${esc(u.name)}</b><span>Lớp ${esc(u.className || u.classId || '')}</span></a>
        </div>
      </header>
      <main id="view" class="page" tabindex="-1"></main>
    </div>
  </div>
  <nav class="tabbar" aria-label="Điều hướng nhanh">
    <a href="#home" data-tab="home">${icon('home')}<span>Trang chủ</span></a>
    <a href="#inbox" data-tab="inbox"><span class="tico">${icon('chats')}<span class="count tcount" data-count="inbox" hidden></span></span><span>Tin nhắn</span></a>
    <a href="#report" data-tab="report" class="fab"><span class="fab-ico">${icon('camera')}</span><span>Tố giác</span></a>
    <a href="#ai" data-tab="ai">${icon('bot')}<span>Trợ lý AI</span></a>
    <a href="#profile" data-tab="profile">${icon('user')}<span>Cá nhân</span></a>
  </nav>
  ${getMode() === 'demo' ? '<div class="demo-ribbon"><i></i>Bản xem trước</div>' : ''}`;
  $('#themeBtn').onclick = toggleTheme;
  $('#logoutBtn').onclick = logout;
  bindAvatarCam($('#sideAv'));
  bindAvatarCam($('#topAv'));
  // Nút Tố giác (giữa thanh tab): bấm là mở camera chụp ảnh ngay
  $('[data-tab="report"]').onclick = (e) => { e.preventDefault(); reportCamera(); };
  $('#mbBack').onclick = () => { if (history.length > 1) history.back(); else go(CHAT_PAGES.includes(curPage()) ? 'inbox' : 'home'); };
  if (!S.shellBound) {
    S.shellBound = true;
    let wasCompact = compact();
    addEventListener('resize', () => { const c = compact(); if (c !== wasCompact) { wasCompact = c; if (curPage() === 'home') render(); } }, { passive: true });
    addEventListener('scroll', () => $('.topbar')?.classList.toggle('scrolled', scrollY > 4), { passive: true });
  }
  $$('[data-bell]').forEach(b => b.onclick = openNotifications);
  const fi = $('#finderInput'), fl = $('#finderList');
  const showFinder = () => {
    const q = fi.value.trim().toLowerCase();
    const m = ALL.filter(enabled).filter(it => !q || it.label.toLowerCase().includes(q)).slice(0, 7);
    fl.innerHTML = m.map((it, i) => `<a class="item click ${i === 0 ? 'active' : ''}" href="#${it.id}" style="padding:8px 10px;margin:0;border:0;color:inherit;text-decoration:none">${icon(it.icon)}<span>${it.label}</span></a>`).join('') || '<div class="small muted" style="padding:8px">Không có chức năng phù hợp</div>';
    fl.hidden = false;
  };
  fi.onfocus = showFinder; fi.oninput = showFinder;
  fi.onkeydown = (e) => { if (e.key === 'Enter') { const a = fl.querySelector('a'); if (a) { go(a.getAttribute('href').slice(1)); fi.value = ''; fi.blur(); } } if (e.key === 'Escape') fi.blur(); };
  fi.onblur = () => setTimeout(() => (fl.hidden = true), 150);
}

async function reportCamera() {
  const shots = await openCamera({ max: 4, title: 'Chụp ảnh tố giác', hint: 'Ảnh chỉ gửi tới Ban Giám thị, danh tính của bạn được bảo mật. Chụp tối đa 4 ảnh.' });
  if (!shots) return;
  if (S.addReportPhotos && document.getElementById('thumbs')) return S.addReportPhotos(shots);
  S.pendingPhotos = shots;
  if (location.hash === '#report') render(); else location.hash = 'report';
}

async function logout() {
  if (!await confirmDialog({ title: 'Đăng xuất', message: 'Bạn muốn đăng xuất khỏi Cổng Học Sinh trên thiết bị này?', ok: 'Đăng xuất', tone: 'danger' })) return;
  try { await api.post('api/auth/logout'); } catch { /* bỏ qua */ }
  session.clear(); location.href = studentLoginUrl();
}

function bindLive() {
  live.on('notification', (n) => { toast(n.title + (n.content ? ' · ' + n.content.slice(0, 70) : ''), n.type === 'warning' ? 'warn' : 'info', 4200); refreshBadges(0); });
  live.on('sync', () => { toast('Nhà trường vừa đồng bộ dữ liệu mới.', 'info'); render(); });
  live.on('settings', async () => { S.settings = await api.get('api/settings/public'); if (safeToRefresh()) { shell(); render(); refreshBadges(0); } });
  // Nội dung do nhà trường cập nhật (bản tin, cẩm nang, khảo sát, đấu trường trắc nghiệm): tải lại trang đang xem nếu liên quan
  live.on('data:changed', ({ scope }) => { const pages = { news: ['home', 'news'], handbook: ['handbook'], surveys: ['home', 'survey'], quiz: ['quiz'], appGuide: ['app-guide'] }[scope] || []; if (pages.includes(curPage()) && safeToRefresh()) render(); });
  // Hồ sơ đổi trên thiết bị khác (ảnh đại diện, liên hệ) hoặc do nhà trường cập nhật
  live.on('profile:update', ({ user }) => {
    if (!user) return;
    if (user.id === S.user.id) { S.user = { ...S.user, ...user }; if (safeToRefresh()) { shell(); render(); refreshBadges(0); } }
    else if (['quiz', 'school-chat', 'teacher-chat', 'counseling', 'team', 'teachers'].includes(curPage()) && safeToRefresh()) render();
  });
  live.on('ai:config', (st) => {
    toast(st.enabled ? `Nhà trường vừa bật AI: ${st.label}` : 'Nhà trường đã tắt AI nâng cao, đang dùng chế độ cơ bản.', 'info', 4000);
    if (['ai', 'scam'].includes(curPage())) render();
  });
  live.on('teacher-chat:message', () => refreshBadges(100));
  live.on('counseling:reply', () => refreshBadges(100));
  live.on('school-chat:message', (m) => {
    if (m.userId !== S.user.id) {
      toast(`💬 ${m.name || 'Chat toàn trường'}: ${(m.text || '📎 Đã gửi tệp đính kèm').slice(0, 80)}`, 'info', 4000);
      refreshBadges(0);
    }
  });
  live.on('school-chat:delete', () => refreshBadges(0));
  live.on('connection', ({ online }) => { if (online && S.wasOffline) resync(); S.wasOffline = !online; });
  live.on('connection', ({ online }) => { const b = $('#liveBadge'); if (b) { b.className = `badge ${online ? 'ok' : 'warn'}`; b.innerHTML = `<span class="pulse"></span>${online ? 'Đồng bộ realtime' : 'Đang kết nối lại…'}`; } });
  addEventListener('auth:expired', (e) => {
    toast(e?.detail?.idle ? 'Đã tự động đăng xuất sau 5 phút không hoạt động.' : 'Phiên đăng nhập đã hết hạn.', 'warn');
    setTimeout(() => (location.href = studentLoginUrl()), 900);
  });
}
// Đồng bộ khi app quay lại từ nền / có mạng trở lại: tin nhắn, thông báo, dữ liệu trang đang xem
function safeToRefresh() {
  const a = document.activeElement;
  if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && a.value) return false;
  return !document.querySelector('.backdrop, .cam, .lightbox, .attach-strip:not([hidden])');
}
function resync() { refreshBadges(0); if (safeToRefresh()) render(); }
let hiddenAt = 0;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { hiddenAt = Date.now(); return; }
  if (hiddenAt && Date.now() - hiddenAt > 15000) resync();
});
function setCount(id, v) { $$(`[data-count="${id}"]`).forEach(el => { el.hidden = !v; el.textContent = v; }); }

// Chấm đỏ: số tin nhắn / thông báo chưa đọc trên menu, ô chức năng, chuông và tiêu đề tab
const curPage = () => (location.hash || '#home').slice(1).split('/')[0];
const fmtCount = (n) => (n > 99 ? '99+' : n ? String(n) : '');
let badgeTimer = 0;
function refreshBadges(delay = 200) { clearTimeout(badgeTimer); badgeTimer = setTimeout(loadBadges, delay); }
const refreshUnread = () => refreshBadges(0);
async function loadBadges() {
  try {
    if (curPage() === 'school-chat') await api.post('api/me/seen', { key: 'schoolChat' });
    const prev = S.badges;
    S.badges = await api.get('api/me/badges');
    applyBadges(prev);
  } catch { /* bỏ qua */ }
}
function applyBadges(prev) {
  const b = S.badges; if (!b) return;
  [['school-chat', b.schoolChat], ['teacher-chat', b.teacherChat], ['counseling', b.counseling]].forEach(([id, n]) => {
    setCount(id, fmtCount(n));
    if (prev && n > (prev[{ 'school-chat': 'schoolChat', 'teacher-chat': 'teacherChat', counseling: 'counseling' }[id]] || 0)) $$(`[data-count="${id}"]`).forEach(el => { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); });
  });
  S.unread = b.notifications;
  $$('[data-dot]').forEach(d => { d.hidden = !b.notifications; d.textContent = b.notifications > 9 ? '9+' : String(b.notifications || ''); });
  setCount('inbox', fmtCount(b.messages));
  const base = document.title.replace(/^\(\d+\+?\)\s/, '');
  document.title = b.total ? `(${b.total > 99 ? '99+' : b.total}) ${base}` : base;
}

function openNotifications() {
  drawer({ title: 'Thông báo', body: skeleton(3), onMount: async (d, close) => {
    const body = $('.drawer-body', d);
    const load = async () => {
      const r = await api.get('api/notifications');
      body.innerHTML = `<div class="notif-bar"><span class="badge ${r.unread ? 'info' : ''}">${r.unread ? `${r.unread} chưa đọc` : 'Đã đọc tất cả'}</span>${r.unread ? `<button class="btn ghost sm" id="readAll">${icon('check')} Đọc tất cả</button>` : ''}</div>
        <div class="notif-list">${r.items.map(n => `<div class="notif-item ${n.unread ? 'unread' : ''}" data-id="${n.id}" data-link="${esc(n.link || '')}">
          <span class="avatar sm sq" style="background:${n.type === 'warning' ? 'var(--warn)' : n.type === 'report' ? 'var(--accent)' : n.type === 'chat' ? 'var(--violet)' : 'var(--brand)'}">${icon(n.type === 'warning' ? 'alert' : n.type === 'report' ? 'shield' : n.type === 'chat' ? 'chat' : n.type === 'academic' ? 'calendar' : 'bell')}</span>
          <div class="grow" style="min-width:0"><div class="row between nowrap" style="gap:8px"><b class="small truncate">${esc(n.title)}</b><span class="xs muted nowrap">${ago(n.createdAt)}</span></div><p class="xs ink2">${esc(n.content)}</p></div>${n.unread ? '<span class="notif-dot"></span>' : ''}</div>`).join('') || empty('Chưa có thông báo', '', 'bell')}</div>`;
      if ($('#readAll', body)) $('#readAll', body).onclick = async () => { await api.post('api/notifications/read-all'); refreshUnread(); load(); };
      $$('.notif-item[data-id]', body).forEach(it => it.onclick = async () => { await api.post(`api/notifications/${it.dataset.id}/read`); refreshUnread(); const link = it.dataset.link; if (link && ALL.some(a => a.id === link)) { close(); go(link); } else load(); });
    };
    load().catch(showError);
  } });
}

// ---------------------------------------------------------------------------
async function render() {
  S.cleanups.forEach(f => { try { f(); } catch { /* bỏ qua */ } }); S.cleanups = [];
  S.addReportPhotos = null;
  let page = (location.hash || '#home').slice(1).split('/')[0];
  const item = ALL.find(i => i.id === page);
  if (!item || !enabled(item)) page = 'home';
  $$('[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === page));
  $$('[data-tab]').forEach(a => a.classList.toggle('active', a.dataset.tab === page || (a.dataset.tab === 'inbox' && CHAT_PAGES.includes(page))));
  const mbar = $('#mbar');
  if (mbar) {
    mbar.classList.toggle('sub', !ROOT_TABS.includes(page));
    mbar.classList.toggle('home', page === 'home');
    $('#mbTitle').textContent = page === 'home' ? (S.settings.schoolName || S.settings.shortName) : (item?.label || '');
    $('#mbSub').textContent = page === 'home' ? 'Cổng Học Sinh' : (S.settings.schoolName || S.settings.shortName || '');
  }
  const view = $('#view');
  view.innerHTML = skeleton(3);
  view.style.animation = 'none'; void view.offsetWidth; view.style.animation = '';
  document.title = `${(ALL.find(i => i.id === page) || {}).label || 'Trang chủ'} · Cổng Học Sinh`;
  scrollTo({ top: 0 });
  try { await PAGES[page](view); } catch (e) { view.innerHTML = empty('Không tải được trang', esc(e.message), 'alertCircle', '<button class="btn" onclick="location.reload()">Tải lại</button>'); }
  applyBadges();
  if (['school-chat', 'teacher-chat', 'counseling'].includes(page)) refreshBadges(300);
}
// App điện thoại chưa kết nối máy chủ trường: AI chỉ chạy được trên máy chủ (khóa API không nằm trong app)
const aiOfflineNote = (ai) => getMode() === 'demo' && !ai?.enabled && isNativeApp() ? `<div class="card soft small row nowrap" style="padding:10px 14px;gap:8px">${icon('info')}<span>App đang ở <b>bản trải nghiệm</b> nên dùng chế độ cơ bản. Đăng xuất → <b>Máy chủ trường</b> → nhập địa chỉ máy chủ để dùng AI của nhà trường.</span></div>` : '';
const aiPill = (ai) => ai?.enabled ? `<span class="badge violet" title="${esc(ai.label || '')}">${icon('sparkles')} AI thật đang bật</span>` : '<span class="badge" title="Thêm khóa API trong .env để bật AI">Bộ luật · chưa bật AI</span>';
/** Nội dung bong bóng chat: chữ + tệp đính kèm (ảnh, video, tài liệu). */
const bubbleBody = (m) => `${m.text ? esc(m.text) : ''}${attachmentsHtml(m.attachments)}`;
const bubbleCls = (m) => (!m.text && m.attachments?.length ? 'att-only' : '');
// Thu hồi tin nhắn: người khác chỉ còn thấy “đã thu hồi”; ban quản trị vẫn lưu nội dung gốc để bảo đảm an toàn
const recalledText = (mine) => (mine ? 'Bạn đã thu hồi một tin nhắn' : 'Tin nhắn đã được thu hồi');
const bubble = (m, mine, extraCls = '') => m.recalled ? `<div class="bubble deleted">${icon('undo')} ${recalledText(mine)}</div>` : `<div class="bubble ${extraCls || bubbleCls(m)}">${bubbleBody(m)}</div>`;
const recallBtn = (m, mine) => (mine && !m.recalled && !m.deleted && m.kind !== 'leave' ? ` · <button type="button" class="recall-btn" data-recall="${m.id}">Thu hồi</button>` : '');
async function askRecall(url) {
  const ok = await confirmDialog({ title: 'Thu hồi tin nhắn?', message: 'Tin nhắn sẽ được gỡ khỏi cuộc trò chuyện, người nhận chỉ thấy “Tin nhắn đã được thu hồi”. Ban quản trị nhà trường vẫn xem được nội dung để bảo đảm an toàn.', ok: 'Thu hồi', tone: 'danger' });
  if (!ok) return null;
  try { const r = await api.post(url, {}); toast('Đã thu hồi tin nhắn.', 'ok', 1800); return r; } catch (e) { showError(e); return null; }
}
/** Gửi tin kèm tệp: tải tệp lên trước, rồi gọi `post({ text, attachments })`. */
async function sendWithFiles(comp, text, post, btn) {
  if (!text && !comp.has()) return false;
  btn && (btn.disabled = true);
  try {
    const attachments = comp.has() ? await comp.upload(api.upload) : [];
    await post({ text, attachments });
    comp.clear();
    return true;
  } catch (e) { showError(e); return false; } finally { btn && (btn.disabled = false); }
}
// Gắn sự kiện lên khung trang (#view dùng chung giữa các trang) và tự gỡ khi chuyển trang
const onView = (view, type, fn) => { view.addEventListener(type, fn); S.cleanups.push(() => view.removeEventListener(type, fn)); };
const head = (title, sub = '', actions = '') => `<div class="page-head"><div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ''}</div>${actions ? `<div class="actions">${actions}</div>` : ''}</div>`;

// Dải vuốt ngang (ô chức năng, bản tin): chấm chỉ vị trí, bấm chấm để chuyển,
// kéo bằng chuột khi xem trên máy tính; trên điện thoại dùng vuốt cảm ứng sẵn có.
function bindPager(pager, dots, { step } = {}) {
  if (!pager) return;
  const gap = () => parseFloat(getComputedStyle(pager).columnGap || getComputedStyle(pager).gap) || 0;
  const stepPx = () => (step ? step() : 0) || (pager.firstElementChild ? pager.firstElementChild.getBoundingClientRect().width + gap() : pager.clientWidth) || 1;
  const max = () => Math.max(0, dots.length - 1);
  const at = () => { const end = pager.scrollWidth - pager.clientWidth; if (end > 0 && pager.scrollLeft >= end - 2) return max(); return Math.min(max(), Math.round(pager.scrollLeft / stepPx())); };
  const show = () => { const k = at(); dots.forEach((d, i) => d.classList.toggle('on', i === k)); };
  const goTo = (i) => pager.scrollTo({ left: Math.max(0, i) * stepPx(), behavior: 'smooth' });
  pager.addEventListener('scroll', () => requestAnimationFrame(show), { passive: true });
  dots.forEach((d, i) => d.onclick = () => goTo(i));
  let down = null, moved = false;
  pager.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse' || e.button !== 0) return; down = { x: e.clientX, left: pager.scrollLeft, idx: at() }; moved = false; });
  const onMove = (e) => { if (!down) return; const dx = e.clientX - down.x; if (!moved && Math.abs(dx) > 6) { moved = true; pager.classList.add('dragging'); } if (moved) pager.scrollLeft = down.left - dx; };
  const onUp = (e) => {
    if (!down) return;
    const dx = e.clientX - down.x, from = down.idx; down = null;
    if (!moved) return;
    pager.classList.remove('dragging');
    const jump = Math.max(1, Math.round(Math.abs(dx) / stepPx()));
    goTo(Math.max(0, Math.min(max(), Math.abs(dx) > 40 ? from + (dx < 0 ? jump : -jump) : from)));
  };
  addEventListener('pointermove', onMove); addEventListener('pointerup', onUp);
  S.cleanups.push(() => { removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); });
  pager.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  pager.addEventListener('dragstart', (e) => e.preventDefault());
  show();
}

// Trang chủ gọn cho điện thoại: ít màu, ưu tiên thao tác nhanh
function homeCompact(view, d, meta) {
  const u = d.user, s = S.settings, moods = meta.moods;
  const items = [
    ['counseling', 'Tư vấn', 'heartHand'], ['report', 'Tố giác', 'shieldAlert'], ['scam', 'Tra cứu lừa đảo', 'shieldCheck'], ['ai', 'Trợ lý AI', 'bot'],
    ['school-chat', 'Chat chung', 'chats'], ['teacher-chat', 'Giáo viên', 'message'], ['mood', 'Cảm xúc', 'smile'], ['quiz', 'Trắc nghiệm', 'trophy'],
    ['teacher-list', 'DS Giáo viên', 'school'], ['counsel-team', 'Tổ tâm lý', 'users'], ['survey', 'Khảo sát', 'clipboardCheck'], ['handbook', 'Cẩm nang', 'bookOpen'], ['app-guide', 'Tải App', 'smartphone'], ['profile', 'Cá nhân', 'user'], ['news', 'Bản tin', 'news'],
  ].filter(([id]) => enabled(ALL.find(a => a.id === id) || {}));
  // Chia lưới chức năng thành các trang 8 ô (4 × 2), vuốt ngang để chuyển trang
  const pages = []; for (let i = 0; i < items.length; i += 8) pages.push(items.slice(i, i + 8));
  const now = new Date();
  view.innerHTML = `
    <div class="card m-user">
      <button type="button" id="mHomeAv" class="m-user-av" title="Bấm để chỉnh sửa ảnh đại diện">${avatar(u)}<span class="m-user-cam">${icon('camera')}</span></button>
      <a href="#profile" class="m-user-info">
        <span class="m-user-greet">${greeting()} 👋</span>
        <b class="truncate">${esc(u.name)}</b>
        <div class="m-user-pills">
          ${u.className || u.classId ? `<span class="m-user-pill brand">${icon('grad')} Lớp ${esc(u.className || u.classId)}</span>` : ''}
          <span class="m-user-pill mono">MSHS: ${esc(u.id)}</span>
        </div>
      </a>
      <a href="#profile" class="m-user-go" aria-label="Hồ sơ">${icon('chevronRight')}</a>
    </div>
    ${canInstall() && !store.get('lh_install_dismiss') ? `<div class="m-install card">${icon('smartphone')}<div class="grow"><b class="small">Cài app Lê Hoàn</b><div class="xs muted">Mở nhanh từ màn hình chính, nhận tin mới</div></div><button class="btn sm" id="instGo">Cài đặt</button><button class="icon-btn" id="instX" aria-label="Ẩn">${icon('x')}</button></div>` : ''}
    <section class="m-pager-wrap" aria-label="Chức năng">
      <div class="m-pager" id="mPager">${pages.map((pg, i) => `<div class="m-page" aria-label="Trang ${i + 1}/${pages.length}">${pg.map(([id, label, ic]) => `<a href="#${id}" class="m-tile" draggable="false"><span class="m-ico">${icon(ic)}<span class="count fcount" data-count="${id}" hidden></span></span><span>${label}</span></a>`).join('')}</div>`).join('')}</div>
      ${pages.length > 1 ? `<div class="m-dots">${pages.map((_, i) => `<button data-pg="${i}" class="${i === 0 ? 'on' : ''}" aria-label="Trang chức năng ${i + 1}"></button>`).join('')}</div>` : ''}
    </section>
    ${d.news.length ? `<section class="stack m-news-sec" style="gap:10px"><div class="section-title"><h2>Bản tin</h2><a class="btn plain sm" href="#news">Tất cả</a></div><div class="m-news-row" id="mNews">${d.news.map(n => `<button class="m-news-card" data-news="${n.id}">${cover(n, false)}<div class="m-news-body"><b class="clamp-2">${esc(n.title)}</b><span class="xs muted">${ago(n.publishedAt)}</span></div></button>`).join('')}</div>${d.news.length > 1 ? `<div class="m-dots">${d.news.map((_, i) => `<button class="${i === 0 ? 'on' : ''}" aria-label="Bản tin ${i + 1}"></button>`).join('')}</div>` : ''}</section>` : ''}`;
  bindPager($('#mPager'), $$('.m-pager-wrap .m-dots button', view), { step: () => $('#mPager').clientWidth });
  bindPager($('#mNews'), $$('#mNews + .m-dots button', view));
  bindAvatarCam($('#mHomeAv', view));
  $$('[data-news]', view).forEach(c => c.onclick = () => openNews(c.dataset.news));
  $$('[data-mood]', view).forEach(b => b.onclick = async () => { try { const r = await api.post('api/mood', { mood: b.dataset.mood }); toast(r.advice, 'ok', 5000); render(); } catch (e) { showError(e); } });
  if ($('#instGo')) { $('#instGo').onclick = async () => { await installApp(); render(); }; $('#instX').onclick = () => { store.set('lh_install_dismiss', 1); $('.m-install')?.remove(); }; }
}

// =============================================================================
const PAGES = {
  // ---------------------------------------------------------------- Trang chủ
  async home(view) {
    const [d, meta] = await Promise.all([api.get('api/me/dashboard'), api.get('api/meta')]);
    if (compact()) return homeCompact(view, d, meta);
    const u = d.user, s = S.settings, now = new Date(), moods = meta.moods;
    const ST = { pending: ['Chờ tiếp nhận', ''], verifying: ['Đang xác minh', 'warn'], reminded: ['Đã nhắc nhở', 'info'], disciplined: ['Đã kỷ luật', 'bad'], recorded: ['Đã lập biên bản', 'bad'], resolved: ['Đã xử lý', 'ok'], archived: ['Lưu hồ sơ', ''] };
    const features = [
      ['counseling', 'Chat tư vấn tâm lý', 'heartHand', '#d6457a', 'HOT', 'Tâm sự 1-1 bảo mật'],
      ['mood', 'Cảm xúc & thư giãn', 'smile', '#7a5af5', '', 'Nhật ký & bài tập thở'],
      ['school-chat', 'Chat toàn trường', 'chats', '#0a84b8', '', 'Giao lưu văn minh'],
      ['report', 'Tố giác vi phạm', 'shieldAlert', '#e8513a', '', 'Gửi kín danh tính'],
      ['scam', 'Tra cứu lừa đảo', 'shieldCheck', '#c27c0e', 'AI', 'Quét tin nhắn & link'],
      ['survey', 'Khảo sát', 'clipboardCheck', '#0f8f67', '', 'Góp ý xây dựng trường'],
      ['quiz', 'Đấu trường trắc nghiệm', 'trophy', '#d68a00', '', 'Đua Top bảng vàng'],
      ['teacher-chat', 'Chat với giáo viên', 'message', '#1747c9', '', 'Trao đổi & xin phép'],
      ['ai', 'Trợ lý AI 24/7', 'bot', '#6a4fe0', 'AI', 'Giải đáp kỹ năng & luật'],
      ['handbook', 'Cẩm nang & hotline', 'bookOpen', '#0a84b8', '', 'Kỹ năng ứng phó nhanh'],
      ['news', 'Bản tin', 'news', '#2f6b4f', '', 'Tin tức & tuyên truyền'],
      ['app-guide', 'Hướng dẫn tải App', 'smartphone', '#0f8f67', 'APP', 'Cài trên điện thoại'],
    ].filter(f => enabled(ALL.find(a => a.id === f[0]) || {}));
    const actions = [
      ['report', 'camera', 'Tố giác ẩn danh', 'Gửi kín danh tính · bảo mật tuyệt đối', 'linear-gradient(135deg, #ff6b52, #f97316)', 'rgba(255, 107, 82, .45)'],
      ['counseling', 'heartHand', 'Tâm sự với chuyên viên', d.counseling.unread ? `${d.counseling.unread} phản hồi mới` : 'Bảo mật tuyệt đối · lắng nghe 1-1', 'linear-gradient(135deg, #ec4899, #8b5cf6)', 'rgba(236, 72, 153, .42)'],
      ['scam', 'shieldCheck', 'Kiểm tra lừa đảo', 'Tin nhắn, link, số máy đáng ngờ', 'linear-gradient(135deg, #10b981, #06b6d4)', 'rgba(16, 185, 129, .42)'],
    ].filter(a => enabled(ALL.find(x => x.id === a[0]) || {}));
    const kpis = [
      ['Tố giác của bạn', d.reports.total, d.reports.open ? `${d.reports.open} hồ sơ đang xử lý` : 'Không có hồ sơ chờ', 'report', 'shieldAlert', 'linear-gradient(135deg, #ff785a, #f59e0b)'],
      ['Khảo sát chờ bạn', d.surveys.open, d.surveys.open ? 'Mất khoảng 3–4 phút' : 'Đã hoàn thành hết', 'survey', 'clipboardCheck', 'linear-gradient(135deg, #10b981, #14b8a6)'],
      ['Điểm trắc nghiệm', d.quiz.best || '—', `${d.quiz.attempts} lượt thi`, 'quiz', 'trophy', 'linear-gradient(135deg, #f59e0b, #eab308)'],
    ];
    view.innerHTML = `
    <div class="stack lg">
      <section class="hero hero-home">
        ${drumArt(440, 'drum').replace('class="drum"', 'class="drum" style="right:-100px;top:-110px"')}
        <div class="hero-welcome">
          <span class="hero-date-pill">${icon('calendar')} ${DAY[now.getDay()]}, ${fmtDate(now)} · ${esc(s.semester)} · Năm học ${esc(s.schoolYear)}</span>
          <h1>${greeting()}, ${esc(firstName(u.name))}! 👋</h1>
          <p class="hero-lead">Bạn không đơn độc. Nhà trường luôn lắng nghe và bảo vệ bạn.</p>
        </div>
        <div class="quick-actions">${actions.map(([id, ic, t, sub, grad, glow]) => `<a href="#${id}" class="qa" style="--qgrad:${grad};--qglow:${glow}"><span class="qa-ico">${icon(ic)}</span><span class="grow"><b>${t}</b><span>${esc(sub)}</span></span><span class="qa-go">${icon('arrowRight')}</span></a>`).join('')}</div>
        <div class="hero-kpis">
          ${kpis.map(([k, v, sub, link, ic, grad]) => `<a href="#${link}" class="hero-kpi"><div class="hero-kpi-top"><span class="hero-kpi-ico" style="--kgrad:${grad}">${icon(ic)}</span><span class="hero-kpi-lbl">${k}</span></div><div class="hero-kpi-val num">${v}</div><div class="hero-kpi-sub truncate">${esc(sub)}</div></a>`).join('')}
        </div>
      </section>
      ${s.marquee?.length ? `<div class="marquee" role="marquee"><span class="tag">${icon('megaphone')} Thông báo</span><div class="track"><div class="run">${s.marquee.map(m => `<span>${esc(m)}</span>`).join('')}</div></div></div>` : ''}
      <section class="stack features-wrap">
        <div class="section-title"><div><h2>Tiện ích học đường</h2><span class="xs muted">Truy cập nhanh ${features.length} chức năng dành cho học sinh</span></div><span class="badge info">${features.length} tiện ích</span></div>
        <div class="features">${features.map(([id, label, ic, c, tag, desc]) => `<a class="feature" href="#${id}" style="--c:${c}">${tag ? `<span class="tagx">${tag}</span>` : ''}<span class="fi">${icon(ic)}<span class="count fcount" data-count="${id}" hidden></span></span><div class="feature-txt"><b>${label}</b><span>${desc}</span></div></a>`).join('')}</div>
      </section>
      ${d.reports.latest ? `<a class="card hover row nowrap" href="#report" style="padding:16px 18px;gap:14px;color:inherit;text-decoration:none"><span class="avatar sq" style="background:var(--accent-soft);color:var(--accent)">${icon('shield')}</span><div class="grow"><div class="xs muted">Hồ sơ tố giác gần nhất · cập nhật ${ago(d.reports.latest.updatedAt)}</div><b class="mono small">${esc(d.reports.latest.id)}</b></div>${badge(...ST[d.reports.latest.status])}${icon('chevronRight')}</a>` : ''}
      <section class="stack">
        <div class="section-title">
          <div><h2>Bản tin tuyên truyền</h2><span class="xs muted">Kiến thức pháp luật, kỹ năng an toàn & tin tức nhà trường</span></div>
          <div class="row nowrap" style="gap:6px">
            <button type="button" class="icon-btn sm news-nav-btn" id="newsPrev" aria-label="Trước">${icon('arrowLeft')}</button>
            <button type="button" class="icon-btn sm news-nav-btn" id="newsNext" aria-label="Tiếp">${icon('arrowRight')}</button>
            <a class="btn soft sm" href="#news">Xem tất cả ${icon('arrowRight')}</a>
          </div>
        </div>
        <div class="hscroll" id="homeNewsRow">${d.news.map(n => `<article class="card hover news-card" data-news="${n.id}">${cover(n)}<div class="news-card-body"><h3 class="clamp-2">${esc(n.title)}</h3><p class="small muted clamp-2">${esc(n.summary)}</p><div class="meta"><span>${icon('clock')} ${ago(n.publishedAt)}</span><span>${icon('eye')} ${num(n.views)}</span><span class="news-read-more">Đọc tin →</span></div></div></article>`).join('')}</div>
      </section>
    </div>`;
    const nr = $('#homeNewsRow', view);
    if (nr) {
      $('#newsPrev', view).onclick = () => nr.scrollBy({ left: -320, behavior: 'smooth' });
      $('#newsNext', view).onclick = () => nr.scrollBy({ left: 320, behavior: 'smooth' });
    }
    $$('[data-news]', view).forEach(c => c.onclick = () => openNews(c.dataset.news));
    $$('[data-mood]', view).forEach(b => b.onclick = async () => { try { const r = await api.post('api/mood', { mood: b.dataset.mood }); toast(r.advice, 'ok', 5000); render(); } catch (e) { showError(e); } });
  },

  // ---------------------------------------------------------------- Tin nhắn (trung tâm chat trên điện thoại)
  async inbox(view) {
    const b = S.badges || await api.get('api/me/badges').catch(() => ({}));
    const rows = [
      ['counseling', 'heartHand', 'Chat tư vấn tâm lý', 'Nhắn riêng chuyên viên, có thể ẩn danh', b.counseling],
      ['school-chat', 'chats', 'Chat toàn trường', 'Kênh chung của học sinh toàn trường', b.schoolChat],
      ['teacher-chat', 'message', 'Chat với giáo viên', 'Trao đổi với thầy cô · xin nghỉ phép', b.teacherChat],
      ['ai', 'bot', 'Trợ lý học đường AI', 'Hỏi bài, phân tích tin nhắn lừa đảo', 0],
    ].filter(([id]) => enabled(ALL.find(a => a.id === id) || {}));
    view.innerHTML = head('Tin nhắn', 'Tất cả cuộc trò chuyện của bạn ở một nơi.') + `
      <section class="card"><div class="list inbox-list">${rows.map(([id, ic, t, sub, n]) => `<a class="item click" href="#${id}"><span class="inbox-ico">${icon(ic)}</span><div class="grow" style="min-width:0"><b class="small">${t}</b><div class="xs muted truncate">${sub}</div></div><span class="count-pill" data-count="${id}" ${n ? '' : 'hidden'}>${fmtCount(n)}</span>${icon('chevronRight')}</a>`).join('')}
        <button class="item click" data-bell><span class="inbox-ico">${icon('bell')}</span><div class="grow"><b class="small">Thông báo</b><div class="xs muted">Tin từ nhà trường, phản hồi tố giác</div></div><span class="count-pill" ${b.notifications ? '' : 'hidden'}>${fmtCount(b.notifications)}</span>${icon('chevronRight')}</button>
      </div></section>`;
    $$('[data-bell]', view).forEach(x => x.onclick = openNotifications);
  },

  // ---------------------------------------------------------------- Tố giác
  async report(view) {
    const [{ types }, mine] = await Promise.all([api.get('api/report-types'), api.get('api/reports')]);
    let tab = location.hash.includes('history') ? 'history' : 'new';
    const TYPE_ICON = { violence: 'users', bullying: 'shieldAlert', cyber: 'smartphone', smoking: 'vape', drugs: 'pill', weapon: 'knife', traffic: 'car', other: 'flag' };
    const TYPE_SHORT = {
      violence: 'Bạo lực, đánh nhau',
      bullying: 'Bắt nạt, cô lập',
      cyber: 'Bắt nạt trên mạng',
      smoking: 'Thuốc lá, vape',
      drugs: 'Chất cấm, đồ lạ',
      weapon: 'Hung khí, nguy hiểm',
      traffic: 'An toàn giao thông',
      other: 'Vi phạm khác',
    };
    const STATUS_TONE = { pending: '', verifying: 'warn', reminded: 'info', disciplined: 'bad', recorded: 'bad', resolved: 'ok', archived: '' };
    const photos = [];
    const draw = () => {
      view.innerHTML = head('Tố giác vi phạm', 'Báo cáo nhanh hành vi bạo lực, bắt nạt, tệ nạn học đường. Bảo mật danh tính tuyệt đối.') + `
      <div class="seg rep-tabs"><button data-t="new" class="${tab === 'new' ? 'active' : ''}">${icon('camera')} Gửi tố giác</button><button data-t="history" class="${tab === 'history' ? 'active' : ''}">${icon('history')} Lịch sử (${mine.items.length})</button></div>
      ${tab === 'new' ? `
      <div class="grid g-main rep-layout">
        <form class="card rep-card" id="rf" novalidate>
          <div class="card-body stack rep-stack">
            <div class="field">
              <div class="row between"><span class="label">Loại vi phạm</span><span class="xs muted">Chọn 1 nhóm</span></div>
              <div class="rep-type-grid">${Object.entries(types).map(([k, t], i) => `<label class="rep-type" title="${esc(t.label)}"><input type="radio" name="type" value="${k}" ${i === 0 ? 'checked' : ''}><span class="rt-ico">${icon(TYPE_ICON[k])}</span><span class="rt-txt">${esc(TYPE_SHORT[k] || t.label)}</span></label>`).join('')}</div>
            </div>
            <div class="rep-row2">
              <div class="field">
                <div class="row between"><label for="loc">Địa điểm</label><button type="button" class="rep-gps-btn" id="useLoc">${icon('target')} Vị trí hiện tại</button></div>
                <div class="input-icon">${icon('pin')}<input id="loc" name="location" placeholder="VD: Cổng phụ, hành lang dãy B…" maxlength="200" required></div>
              </div>
              <div class="field">
                <label for="at">Thời gian xảy ra</label>
                <input id="at" name="occurredAt" type="datetime-local" value="${new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}">
              </div>
            </div>
            <div class="field">
              <div class="row between"><label for="desc">Mô tả sự việc</label><span class="xs muted" id="cnt">0/3000 · tối thiểu 10 ký tự</span></div>
              <textarea id="desc" name="description" rows="3" maxlength="3000" placeholder="Mô tả ngắn gọn: chuyện gì xảy ra, số người, đặc điểm nhận dạng…" required></textarea>
            </div>
            <div class="field">
              <div class="row between"><span class="label">Ảnh minh chứng <span class="muted" style="font-weight:400">(tối đa 4 ảnh)</span></span><span class="xs muted" id="phCount">${photos.length}/4 ảnh</span></div>
              <div class="rep-dz" id="dz">
                <button type="button" class="btn rep-dz-btn" id="camGo">${icon('camera')} Chụp ảnh</button>
                <label class="btn soft rep-dz-btn">${icon('image')} Chọn thư viện<input type="file" id="ph" accept="image/*" multiple hidden></label>
              </div>
              <div class="thumbs" id="thumbs"></div>
            </div>
            <label class="rep-anon-bar" for="anon">
              <span class="rep-anon-ico">${icon('eyeOff')}</span>
              <div class="grow" style="min-width:0">
                <b>Gửi ẩn danh</b>
                <span>Giấu hoàn toàn họ tên & MSHS · vẫn theo dõi được tiến độ</span>
              </div>
              <span class="switch"><input type="checkbox" name="anonymous" id="anon" checked><span class="track"></span></span>
            </label>
          </div>
          <div class="card-foot rep-foot">
            <span class="xs muted">${icon('lock')} Mã hóa bảo mật · chỉ Ban Giám thị xem được</span>
            <button class="btn accent rep-submit" id="send">${icon('send')} Gửi tố giác</button>
          </div>
        </form>
        <aside class="stack rep-aside">
          <section class="card pad stack" style="gap:8px;padding:14px 16px;background:var(--warn-soft);border-color:transparent"><b class="small" style="color:var(--warn)">${icon('alert')} Nguyên tắc an toàn</b><ul class="xs ink2" style="margin:0;padding-left:16px;display:grid;gap:4px"><li>Chỉ chụp ảnh ở vị trí an toàn, kín đáo, giữ khoảng cách.</li><li>Không đăng lên mạng xã hội trước khi nhà trường xác minh.</li><li>Khẩn cấp gọi ngay <b>113</b> (Công an) hoặc <b>111</b> (Bảo vệ trẻ em).</li></ul></section>
          <section class="card pad stack hide-sm" style="gap:8px;padding:14px 16px"><b class="small">${icon('route')} Quy trình 3 bước</b><div class="timeline">${[['1. Tiếp nhận mã hóa', 'Chuyển thẳng tới Ban Giám thị.'], ['2. Xác minh nhanh', 'Kiểm tra hiện trường & camera.'], ['3. Xử lý & phản hồi', 'Thông báo kết quả trực tiếp trên ứng dụng.']].map(([t, d], i) => `<div class="tl ${i === 0 ? 'done' : ''}"><b>${t}</b><p>${d}</p></div>`).join('')}</div></section>
        </aside>
      </div>` : `
      <div class="stack">${mine.items.length ? mine.items.map(r => `<div class="card hover row nowrap" data-rep="${r.id}" style="padding:12px 15px;gap:12px;align-items:stretch"><span class="sev ${r.severity}"></span>
        <div class="grow stack" style="gap:3px"><div class="row" style="gap:6px"><b class="mono small">${r.id}</b>${badge(r.statusName, STATUS_TONE[r.status])}${r.anonymous ? badge('Ẩn danh', 'violet') : ''}</div><b class="small">${esc(r.typeName)}</b><span class="xs muted truncate">${icon('pin')} ${esc(r.location)}</span></div>
        <div class="stack" style="align-items:flex-end;gap:4px;flex:none"><span class="xs muted">${ago(r.createdAt)}</span>${r.photos?.length ? `<span class="xs muted">${icon('image')} ${r.photos.length}</span>` : ''}${icon('chevronRight')}</div></div>`).join('') : empty('Bạn chưa gửi tố giác nào', 'Mỗi tố giác giúp trường học an toàn hơn.', 'shield')}</div>`}`;
      $$('[data-t]', view).forEach(b => b.onclick = () => { tab = b.dataset.t; draw(); });
      $$('[data-rep]', view).forEach(c => c.onclick = () => openReport(mine.items.find(x => x.id === c.dataset.rep), STATUS_TONE));
      if (tab !== 'new') return;
      const desc = $('#desc'); desc.oninput = () => ($('#cnt').textContent = `${desc.value.length}/3000 · tối thiểu 10 ký tự`);
      const drawThumbs = () => {
        if ($('#phCount')) $('#phCount').textContent = `${photos.length}/4 ảnh`;
        $('#thumbs').innerHTML = photos.map((p, i) => `<div class="thumb"><img src="${p}" alt="Ảnh ${i + 1}"><button type="button" data-rm="${i}" aria-label="Xóa ảnh">${icon('x')}</button></div>`).join('');
        $$('[data-rm]').forEach(b => b.onclick = () => { photos.splice(+b.dataset.rm, 1); drawThumbs(); });
      };
      drawThumbs();
      const addFiles = async (files) => { for (const f of [...files].slice(0, 4 - photos.length)) { try { photos.push(await compressImage(f)); } catch (e) { showError(e); } } drawThumbs(); };
      $('#ph').onchange = (e) => addFiles(e.target.files);
      const addShots = (arr) => { const room = 4 - photos.length; photos.push(...arr.slice(0, room)); drawThumbs(); if (arr.length > room) toast('Mỗi tố giác đính kèm tối đa 4 ảnh.', 'warn'); else toast(`Đã đính kèm ${arr.length} ảnh. Hãy chọn loại vi phạm, địa điểm và mô tả rồi gửi.`, 'ok', 3500); };
      S.addReportPhotos = addShots;
      if (S.pendingPhotos) { addShots(S.pendingPhotos); S.pendingPhotos = null; }
      $('#camGo').onclick = async () => { if (photos.length >= 4) return toast('Đã đủ 4 ảnh.', 'warn'); const r = await openCamera({ max: 4 - photos.length, title: 'Chụp ảnh tố giác', hint: 'Chụp rõ hiện trường, tránh lộ khuôn mặt của bạn.' }); if (r) addShots(r); };
      const dz = $('#dz'); dz.ondragover = (e) => { e.preventDefault(); dz.classList.add('drag'); }; dz.ondragleave = () => dz.classList.remove('drag'); dz.ondrop = (e) => { e.preventDefault(); dz.classList.remove('drag'); addFiles(e.dataTransfer.files); };
      $('#useLoc').onclick = async () => { const p = await getPosition(); if (p) { $('#loc').value = ($('#loc').value ? $('#loc').value + ' · ' : '') + `Tọa độ ${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`; toast('Đã thêm tọa độ vị trí hiện tại.', 'ok'); } else toast('Không lấy được vị trí. Hãy nhập địa điểm thủ công.', 'warn'); };
      $('#rf').onsubmit = async (e) => {
        e.preventDefault();
        const f = formData(e.target);
        if (!f.location.trim()) return toast('Vui lòng nhập địa điểm xảy ra sự việc.', 'warn');
        if (f.description.trim().length < 10) return toast('Mô tả cần ít nhất 10 ký tự để nhà trường xác minh.', 'warn');
        await withBusy($('#send'), async () => {
          try {
            const r = await api.post('api/reports', { ...f, photos });
            mine.items.unshift(r.item); photos.length = 0;
            modal({ title: 'Đã gửi tố giác', body: `<div class="empty" style="padding:6px"><div class="art" style="background:var(--ok-soft);color:var(--ok)">${icon('shieldCheck')}</div><h4>Cảm ơn bạn đã lên tiếng!</h4><p class="small">Mã hồ sơ của bạn</p><b class="mono" style="font-size:1.3rem;color:var(--ink)">${r.item.id}</b><p class="small">${r.item.anonymous ? 'Hồ sơ ẩn danh: danh tính của bạn không được lưu.' : 'Nhà trường sẽ phản hồi kết quả qua thông báo.'}</p></div>`, foot: '<button class="btn" data-close>Xem tiến độ</button>', onClose: () => { tab = 'history'; draw(); } });
          } catch (er) { showError(er); }
        });
      };
    };
    draw();
  },

  // ---------------------------------------------------------------- Cảm xúc
  async mood(view) {
    const m = await api.get('api/mood');
    let pick = m.today?.mood || null;
    const days = [...Array(14)].map((_, i) => { const d = new Date(Date.now() - (13 - i) * 86400000); const key = d.toDateString(); const e = m.history.find(h => new Date(h.at).toDateString() === key); return { d, e }; });
    const total = Object.values(m.counts).reduce((a, b) => a + b, 0) || 1;
    view.innerHTML = head('Cảm xúc & thư giãn', 'Ghi lại cảm xúc mỗi ngày giúp bạn hiểu bản thân hơn. Chỉ bạn xem được nhật ký này.') + `
    <div class="grid g-main">
      <div class="stack lg">
        <section class="card"><div class="card-head"><div><h2>Hôm nay bạn cảm thấy thế nào?</h2><div class="sub">${m.today ? `Lần ghi gần nhất: ${m.moods[m.today.mood].label} lúc ${fmtTime(m.today.at)}` : 'Chọn một biểu cảm gần nhất với bạn'}</div></div></div>
          <div class="card-body stack">
            <div class="moods">${Object.entries(m.moods).map(([k, x]) => `<button class="mood ${pick === k ? 'active' : ''}" data-m="${k}" style="--mc:${x.tone}">${moodFace(k, x.tone)}<span>${x.label}</span></button>`).join('')}</div>
            <div class="field"><label for="note">Ghi chú (không bắt buộc)</label><textarea id="note" maxlength="500" placeholder="Điều gì khiến bạn cảm thấy như vậy?" style="min-height:72px"></textarea></div>
            <div class="row between"><span class="small muted">${icon('lock')} Riêng tư, không chia sẻ với bạn bè</span><button class="btn" id="saveMood">${icon('check')} Lưu cảm xúc</button></div>
            <div id="advice"></div>
          </div></section>
        <section class="card"><div class="card-head"><div><h2>${icon('wind')} Bài tập thở 4-7-8</h2><div class="sub">Giúp hạ nhịp tim, giảm lo âu trước giờ kiểm tra</div></div><span class="badge" id="cycles">0/4 lượt</span></div>
          <div class="card-body"><div class="breath"><div class="orb" id="orb">Sẵn sàng</div><p class="small muted" id="bhint" style="text-align:center">Hít vào 4 giây · giữ 7 giây · thở ra 8 giây</p><button class="btn" id="bstart">${icon('play')} Bắt đầu</button></div></div></section>
      </div>
      <aside class="stack lg">
        <section class="card"><div class="card-head"><h2>14 ngày qua</h2></div><div class="card-body">
          <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px">${days.map(({ d, e }) => `<div title="${fmtDate(d)}${e ? ': ' + m.moods[e.mood].label : ''}" style="aspect-ratio:1;border-radius:10px;display:grid;place-items:center;background:${e ? m.moods[e.mood].tone : 'var(--surface-3)'};color:${e ? '#3a2a10' : 'var(--muted)'};font-size:11px;font-weight:600">${d.getDate()}</div>`).join('')}</div>
          <div class="stack" style="gap:8px;margin-top:16px">${Object.entries(m.moods).map(([k, x]) => `<div class="hbar"><span class="small">${x.label}</span><div class="meter" style="--c:${x.tone}"><i style="width:${m.counts[k] / total * 100}%"></i></div><b class="small num">${m.counts[k]}</b></div>`).join('')}</div>
        </div></section>
        <section class="card pad stack"><b>${icon('bulb')} Kỹ thuật 5-4-3-2-1</b><p class="small ink2">Khi lo lắng, hãy gọi tên <b>5</b> thứ bạn nhìn thấy, <b>4</b> thứ chạm được, <b>3</b> âm thanh nghe được, <b>2</b> mùi hương và <b>1</b> vị bạn cảm nhận. Cách này giúp tâm trí quay về hiện tại.</p></section>
        <section class="card pad stack" style="background:var(--violet-soft);border-color:transparent"><b>${icon('heartHand')} Cần ai đó lắng nghe?</b><p class="small ink2">Chuyên viên tâm lý của trường luôn sẵn sàng. Bạn có thể nhắn ẩn danh.</p><a class="btn" href="#counseling" style="background:var(--violet);color:#fff;align-self:flex-start">Nhắn chuyên viên ${icon('arrowRight')}</a></section>
      </aside>
    </div>`;
    $$('[data-m]', view).forEach(b => b.onclick = () => { pick = b.dataset.m; $$('[data-m]', view).forEach(x => x.classList.toggle('active', x === b)); });
    $('#saveMood').onclick = (e) => withBusy(e.currentTarget, async () => {
      if (!pick) return toast('Hãy chọn một cảm xúc trước nhé.', 'warn');
      try {
        const r = await api.post('api/mood', { mood: pick, note: $('#note').value });
        $('#advice').innerHTML = `<div class="card soft" style="padding:14px 16px;border-color:${m.moods[pick].tone}"><b>${icon('sparkles')} Gợi ý cho bạn</b><p class="small ink2" style="margin-top:4px">${esc(r.advice)}</p>${r.showHotline ? `<p class="small" style="margin-top:8px;color:var(--bad)"><b>Bạn không đơn độc.</b> Hãy gọi 111 hoặc nhắn chuyên viên tâm lý ngay nhé.</p>` : ''}</div>`;
        toast('Đã lưu cảm xúc hôm nay.', 'ok');
      } catch (er) { showError(er); }
    });
    let running = false, timer = null;
    const orb = $('#orb'), hint = $('#bhint');
    const stop = () => { running = false; clearTimeout(timer); orb.className = 'orb'; orb.textContent = 'Sẵn sàng'; $('#bstart').innerHTML = `${icon('play')} Bắt đầu`; };
    const cycle = (n) => {
      if (!running) return;
      if (n >= 4) { stop(); hint.textContent = 'Tuyệt vời! Bạn đã hoàn thành 4 lượt thở.'; return; }
      $('#cycles').textContent = `${n + 1}/4 lượt`;
      orb.className = 'orb in'; orb.textContent = 'Hít vào'; hint.textContent = 'Hít vào thật sâu bằng mũi… 4 giây';
      timer = setTimeout(() => { orb.className = 'orb hold'; orb.textContent = 'Giữ hơi'; hint.textContent = 'Giữ hơi… 7 giây';
        timer = setTimeout(() => { orb.className = 'orb out'; orb.textContent = 'Thở ra'; hint.textContent = 'Thở ra chậm bằng miệng… 8 giây';
          timer = setTimeout(() => cycle(n + 1), 8000); }, 7000); }, 4000);
    };
    $('#bstart').onclick = () => { if (running) return stop(); running = true; $('#bstart').innerHTML = `${icon('pause')} Dừng lại`; cycle(0); };
    S.cleanups.push(stop);
  },

  // ---------------------------------------------------------------- Tư vấn tâm lý
  async counseling(view) {
    const initData = await api.get('api/counseling/threads');
    let threads = initData.items, allThreads = initData.allItems || initData.items, current = null;
    view.innerHTML = head('Tư vấn tâm lý', 'Tâm sự với chuyên viên tâm lý học đường — mỗi chuyên viên một cuộc trò chuyện riêng, bảo mật tuyệt đối, có thể chọn ẩn danh hoặc hiện tên bất cứ lúc nào.', `<button class="btn hide-sm" id="newC">${icon('plus')} Nhắn chuyên viên</button>`) + `
    <section class="card chat-layout" id="cl"><div class="threads" id="th"></div><div class="chat" id="cp"></div></section>`;
    const pickCounselor = () => {
      modal({
        title: 'Chọn chuyên viên tư vấn tâm lý',
        sub: `${allThreads.length} chuyên viên · chọn thầy cô để bắt đầu trò chuyện`,
        body: `<div class="list" id="pickCList" style="max-height:58vh;overflow:auto">${allThreads.map(t => `<div class="item click" data-pick-c="${t.id}">${avatar(t.counselor || { id: 'counselor', name: 'Chuyên viên' })}<div class="grow" style="min-width:0"><b class="small truncate" style="display:block">${esc(t.counselor?.name || 'Chuyên viên tâm lý')}</b><div class="xs muted truncate">${esc(t.counselor?.title || 'Tổ tâm lý học đường')}</div></div>${icon('chevronRight')}</div>`).join('')}</div>`,
        onMount: (m, close) => {
          $$('[data-pick-c]', m).forEach(el => el.onclick = async () => {
            close();
            await open(el.dataset.pickC);
          });
        },
      });
    };
    if ($('#newC', view)) $('#newC', view).onclick = pickCounselor;
    const drawThreads = () => {
      $('#cl')?.classList.toggle('is-empty', !threads.length && !current);
      $('#th').innerHTML = `<div class="threads-head"><span class="xs muted strong">${icon('shieldCheck')} Bảo mật · Hỗ trợ 1-1</span><button class="btn sm" id="thNewC">${icon('plus')} Nhắn chuyên viên</button></div>` + (threads.length ? `<div class="list">${threads.map(t => `<div class="item click ${current?.id === t.id ? 'active' : ''}" data-t="${t.id}">${avatar(t.counselor || { id: 'counselor', name: 'Chuyên viên' })}<div class="grow" style="min-width:0"><div class="row between nowrap" style="gap:6px"><b class="small truncate">${esc(t.counselor?.name || 'Chuyên viên tâm lý')}</b><span class="xs muted nowrap">${t.last ? ago(t.last.at) : ''}</span></div><div class="xs muted truncate">${esc(t.counselor?.title || '')} · <span style="color:${t.anonymous !== false ? 'var(--violet)' : 'var(--brand)'};font-weight:600">${t.anonymous !== false ? 'Ẩn danh' : 'Hiện tên'}</span></div><div class="xs truncate ink2" style="margin-top:2px">${t.last ? esc((t.last.from === 'student' ? 'Bạn: ' : '') + (t.last.recalled ? 'Tin nhắn đã thu hồi' : t.last.text || (t.last.attachments?.length ? '📎 Tệp đính kèm' : ''))) : 'Chưa có tin nhắn — bấm để bắt đầu'}</div></div>${t.unreadStudent ? `<span class="count-pill">${t.unreadStudent}</span>` : ''}<button class="btn icon ghost sm" data-del-c="${t.id}" style="color:var(--bad)" aria-label="Xóa cuộc trò chuyện" title="Xóa cuộc trò chuyện">${icon('trash')}</button></div>`).join('')}</div>` : empty('Chưa có cuộc trò chuyện', 'Chọn chuyên viên tâm lý để chia sẻ ẩn danh hoặc hiện tên.', 'heartHand', `<button class="btn sm" id="emptyNewC" style="margin-top:4px">${icon('plus')} Chọn chuyên viên để nhắn</button>`));
      if ($('#thNewC', view)) $('#thNewC', view).onclick = pickCounselor;
      if ($('#emptyNewC', view)) $('#emptyNewC', view).onclick = pickCounselor;
      $$('[data-t]', view).forEach(el => el.onclick = () => open(el.dataset.t));
      $$('[data-del-c]', view).forEach(el => el.onclick = async (e) => {
        e.stopPropagation();
        const t = threads.find(x => x.id === el.dataset.delC);
        if (!await confirmDialog({ title: 'Xóa cuộc trò chuyện', message: `Xóa cuộc trò chuyện với <b>${esc(t?.counselor?.name || 'Chuyên viên tâm lý')}</b> khỏi danh sách của bạn?`, ok: 'Xóa', tone: 'danger' })) return;
        await api.del(`api/counseling/threads/${el.dataset.delC}`);
        if (current?.id === el.dataset.delC) { current = null; $('#cl').classList.remove('show-chat'); drawChat(); }
        toast('Đã xóa cuộc trò chuyện.', 'ok');
        refreshThreads();
      });
    };
    const msgHtml = (m) => { const mine = m.from === 'student'; return `<div class="msg ${mine ? 'me' : ''}">${!mine ? avatar({ id: current.counselor?.id || 'counselor', name: m.name || current.counselor?.name || 'Chuyên viên', avatar: current.counselor?.avatar }, 'sm') : ''}<div>${bubble(m, mine)}<div class="time">${fmtTime(m.at)} · ${fmtDate(m.at)}${recallBtn(m, mine)}</div></div></div>`; };
    const setAnon = async (val) => {
      if (!current) return;
      try {
        const r = await api.put(`api/counseling/threads/${current.id}/anonymous`, { anonymous: !!val });
        current = r.item;
        drawChat();
        refreshThreads();
        toast(current.anonymous ? 'Đã bật chế độ nhắn tin ẩn danh.' : 'Đã chuyển sang chế độ hiện tên thật.', 'ok', 2200);
      } catch (er) { showError(er); }
    };
    const drawChat = () => {
      const cp = $('#cp');
      if (!current) { cp.innerHTML = empty('Chọn một chuyên viên', 'Cuộc trò chuyện sẽ hiển thị tại đây.', 'heartHand'); return; }
      const c = current.counselor, started = current.messages.length > 0, hot = current.messages.some(x => x.guard?.level === 'red');
      const isAnon = current.anonymous !== false;
      cp.innerHTML = `<div class="chat-head"><button class="btn icon ghost sm back-btn" id="back" aria-label="Quay lại">${icon('arrowLeft')}</button>${avatar(c || { id: 'counselor', name: 'Chuyên viên' }, 'sm')}<div class="grow" style="min-width:0"><b class="truncate">${esc(c?.name || 'Chuyên viên tâm lý')}</b><div class="xs muted truncate"><span style="color:var(--ok)">●</span> ${esc(c?.title || 'Sẵn sàng lắng nghe')}</div></div><button type="button" class="btn soft sm" id="anonToggle" style="${isAnon ? 'background:var(--violet-soft);color:var(--violet);border-color:transparent' : ''}" title="Bấm để đổi chế độ ẩn danh / hiện tên">${icon(isAnon ? 'eyeOff' : 'user')} ${isAnon ? 'Ẩn danh' : 'Hiện tên'}</button><button type="button" class="btn icon ghost sm" id="delCounselChat" style="color:var(--bad)" title="Xóa cuộc trò chuyện">${icon('trash')}</button></div>
        ${hot ? `<section class="card pad stack" id="hot" style="margin:8px 10px 0;padding:10px 12px;background:var(--bad-soft);border-color:transparent"><b class="small" style="color:var(--bad)">${icon('siren')} Bạn không đơn độc</b><p class="xs ink2" style="margin:0">Nếu đang gặp nguy hiểm, hãy gọi ngay <b>111</b> hoặc <b>115</b>.</p></section>` : ''}
        <div class="chat-body" id="cb">${started ? current.messages.map(msgHtml).join('') : `<div class="empty"><div class="art" style="background:var(--violet-soft);color:var(--violet)">${icon('heartHand')}</div><h4>Bắt đầu cuộc trò chuyện</h4><p class="small">Chia sẻ cùng ${esc(c?.name || 'chuyên viên')}. Bảo mật tuyệt đối; chế độ ẩn danh không gửi họ tên, mã HS.${c?.phone ? ` Hỗ trợ trực tiếp: ${esc(c.phone)}.` : ''}</p></div>`}</div>
        <div class="chat-anon-bar">
          <label class="check"><input type="checkbox" id="anon" ${isAnon ? 'checked' : ''}><span class="truncate"><b>Nhắn ẩn danh</b> · ${isAnon ? 'Giấu tên & lớp' : `Hiện tên (${esc(firstName(S.user?.name || ''))})`}</span></label>
          <button type="button" class="badge ${isAnon ? 'violet' : 'info'}" id="anonBadge" style="border:0;cursor:pointer">${icon(isAnon ? 'lock' : 'user')} ${isAnon ? 'Đã ẩn' : 'Hiện tên'}</button>
        </div>
        <form class="chat-input" id="cf"><textarea id="ct" rows="1" placeholder="${isAnon ? 'Nhắn ẩn danh…' : 'Nhập điều muốn chia sẻ…'}" aria-label="Nội dung tâm sự"></textarea><button class="btn icon" aria-label="Gửi">${icon('send')}</button></form>`;
      const cb = $('#cb'); cb.scrollTop = cb.scrollHeight;
      cb.onclick = async (e) => { const b = e.target.closest('[data-recall]'); if (!b) return; const r = await askRecall(`api/counseling/threads/${current.id}/messages/${b.dataset.recall}/recall`); if (r) { current = r.item; drawChat(); refreshThreads(); } };
      $('#back').onclick = () => { $('#cl').classList.remove('show-chat'); };
      $('#anon').onchange = (e) => setAnon(e.target.checked);
      $('#anonToggle').onclick = () => setAnon(!isAnon);
      $('#anonBadge').onclick = () => setAnon(!isAnon);
      if ($('#delCounselChat')) $('#delCounselChat').onclick = async () => {
        if (!await confirmDialog({ title: 'Xóa cuộc trò chuyện', message: `Xóa cuộc trò chuyện với <b>${esc(c?.name || 'Chuyên viên tâm lý')}</b> khỏi danh sách của bạn?`, ok: 'Xóa', tone: 'danger' })) return;
        await api.del(`api/counseling/threads/${current.id}`);
        current = null; $('#cl').classList.remove('show-chat'); drawChat(); refreshThreads(); toast('Đã xóa cuộc trò chuyện.', 'ok');
      };
      autoGrow($('#ct'), () => $('#cf').requestSubmit());
      const comp = attachComposer($('#cf'));
      $('#cf').onsubmit = async (e) => { e.preventDefault(); const text = $('#ct').value.trim(); $('#ct').value = ''; const ok = await sendWithFiles(comp, text, async (b) => { const r = await api.post(`api/counseling/threads/${current.id}/messages`, { ...b, anonymous: $('#anon')?.checked ?? true }); current = r.item; }, $('#cf button[aria-label="Gửi"]')); if (ok) { refreshThreads(); drawChat(); } else if (text) $('#ct').value = text; };
    };
    const refreshThreads = async () => { const d = await api.get('api/counseling/threads'); threads = d.items; allThreads = d.allItems || d.items; drawThreads(); };
    const open = async (id, forceAnon = null) => {
      if (forceAnon !== null) current = (await api.put(`api/counseling/threads/${id}/anonymous`, { anonymous: !!forceAnon })).item;
      else current = (await api.get(`api/counseling/threads/${id}`)).item;
      $('#cl').classList.add('show-chat'); await refreshThreads(); drawChat(); refreshBadges();
    };
    drawThreads(); drawChat();
    const wantCounselor = sessionStorage.getItem('lh_open_counselor');
    const wantAnon = sessionStorage.getItem('lh_open_counselor_anon');
    sessionStorage.removeItem('lh_open_counselor');
    sessionStorage.removeItem('lh_open_counselor_anon');
    const targetThread = wantCounselor && allThreads.find(t => t.counselor?.id === wantCounselor || t.counselorId === wantCounselor);
    if (targetThread) open(targetThread.id, wantAnon !== null ? wantAnon === '1' : null);
    else if (threads[0] && innerWidth >= 1024) open(threads[0].id);
    S.cleanups.push(live.on('counseling:reply', async ({ threadId }) => {
      const draft = $('#ct')?.value || '';
      const hadFocus = document.activeElement?.id === 'ct';
      if (current?.id === threadId) {
        current = (await api.get(`api/counseling/threads/${threadId}`)).item;
        drawChat();
        if (draft && $('#ct')) $('#ct').value = draft;
        if (hadFocus && $('#ct')) $('#ct').focus();
      }
      refreshThreads();
    }));
  },

  // ---------------------------------------------------------------- Tổ tâm lý
  async 'counsel-team'(view) {
    let curYear = '', items = [], years = [];
    const load = async (yr = curYear) => {
      const r = await api.get(yr ? `api/counsel-team?year=${encodeURIComponent(yr)}` : 'api/counsel-team');
      items = r.items; curYear = r.year || yr; years = r.years || [];
    };
    await load();
    const DN = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const order = (d) => (d === 0 ? 7 : d); // tuần bắt đầu từ Thứ 2
    const dayText = (days = []) => {
      const ds = [...days].sort((a, b) => order(a) - order(b));
      if (!ds.length) return '';
      if (ds.length === 7) return 'Hằng ngày';
      const runs = []; for (const d of ds) { const r = runs.at(-1); if (r && order(d) === order(r.at(-1)) + 1) r.push(d); else runs.push([d]); }
      return runs.map(r => (r.length >= 3 ? `${DN[r[0]]} – ${DN[r.at(-1)]}` : r.map(d => DN[d]).join(', '))).join(', ');
    };
    const mins = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const onDuty = (m) => { if (!m.hours || !m.days.includes(new Date().getDay())) return false; const [a, b] = m.hours.split('-').map(mins), n = new Date(), c = n.getHours() * 60 + n.getMinutes(); return c >= a && c < b; };
    const sched = (m) => [dayText(m.days), m.hours.replace('-', ' – ')].filter(Boolean).join(' · ');
    const canChat = (m) => m.userId && enabled(ALL.find(a => a.id === 'counseling'));
    const actions = (m, big) => `${canChat(m) ? `<button class="btn ${big ? '' : 'sm'}" data-chat="${m.id}">${icon('heartHand')} Nhắn tin</button>` : ''}${m.certificate ? `<button class="btn soft ${big ? '' : 'sm'}" data-cert="${m.id}">${icon('award')} Chứng chỉ</button>` : ''}${m.phone ? `<a class="btn soft ${big ? '' : 'sm'}" href="tel:${esc(m.phone.replace(/\s/g, ''))}">${icon('phone')} Gọi</a>` : ''}${m.email ? `<a class="btn ghost ${big ? '' : 'sm'}" href="mailto:${esc(m.email)}">${icon('mail')} Email</a>` : ''}`;
    const card = (m) => { const on = onDuty(m); return `<article class="card team-card" data-m="${m.id}" tabindex="0" role="button" aria-label="Xem thông tin ${esc(m.name)}">
      <div class="team-top"><span class="team-av">${avatar(m, 'lg')}${on ? '<i class="dot-on" title="Đang trực"></i>' : ''}</span>
        <div class="grow" style="min-width:0"><b class="truncate">${esc(m.name)}</b><div class="xs muted team-title">${esc(m.title || '')}</div><div class="team-tags">${m.role ? `<span class="badge ${m.role === 'Tổ trưởng' ? 'violet' : ''}">${esc(m.role)}</span>` : ''}${m.certificate ? `<span class="badge info">${icon('award')} Có chứng chỉ</span>` : ''}${on ? '<span class="badge ok">● Đang trực</span>' : ''}</div></div></div>
      ${sched(m) ? `<div class="team-line">${icon('clock')}<span>${esc(sched(m))}</span></div>` : ''}
      ${m.room ? `<div class="team-line">${icon('pin')}<span>${esc(m.room)}</span></div>` : ''}
      ${m.topics.length ? `<div class="team-topics">${m.topics.map(t => `<span>${esc(t)}</span>`).join('')}</div>` : ''}
      <div class="team-act">${actions(m)}</div></article>`; };
    const showCert = (m) => {
      if (!m?.certificate) return;
      const url = fileUrl(m.certificate);
      modal({
        title: `Chứng chỉ · ${m.name}`,
        sub: esc(m.title || m.role || 'Tổ tâm lý học đường'),
        size: 'wide',
        body: `<div class="stack" style="align-items:center">
          <button type="button" data-lightbox="${esc(url)}" style="display:block;width:100%;padding:0;border:0;background:none;cursor:zoom-in" title="Bấm để phóng to toàn màn hình">
            <img src="${esc(url)}" alt="Chứng chỉ ${esc(m.name)}" style="width:100%;max-height:70vh;object-fit:contain;border-radius:14px;border:1px solid var(--line);background:var(--surface-2)">
          </button>
          <span class="xs muted">${icon('eye')} Bấm vào ảnh chứng chỉ để phóng to toàn màn hình</span>
        </div>`,
        foot: `<button class="btn soft" data-lightbox="${esc(url)}">${icon('eye')} Phóng to</button><a class="btn ghost" href="${esc(url)}" target="_blank" rel="noopener">${icon('external')} Mở ảnh gốc</a><button class="btn" data-close>Đóng</button>`,
      });
    };
    const draw = () => {
      const duty = items.filter(onDuty).length;
      view.innerHTML = head('Tổ tâm lý học đường', 'Thầy cô và các thành viên trong tổ luôn sẵn sàng lắng nghe và đồng hành cùng em. Mọi trao đổi đều được giữ bí mật.') + `
      ${years.length > 1 ? `<div class="chips" style="margin-bottom:12px">${years.map(y => `<button class="chip ${curYear === y ? 'active' : ''}" data-yr="${esc(y)}">${icon('calendar')} Năm học ${esc(y)}</button>`).join('')}</div>` : ''}
      <section class="card team-sum">
        <span class="m-ico" style="flex:none">${icon('heartHand')}</span>
        <div class="grow" style="min-width:0"><b class="small">Năm học ${esc(curYear)} · ${items.length} thành viên · ${duty ? `<span style="color:var(--ok)">${duty} đang trực</span>` : 'ngoài giờ trực'}</b><div class="xs muted">Ngoài giờ trực vẫn gửi tâm sự được, thầy cô sẽ phản hồi sớm.</div></div>
        ${enabled(ALL.find(a => a.id === 'counseling')) ? `<a class="btn sm" href="#counseling">${icon('eyeOff')} Gửi ẩn danh</a>` : ''}
      </section>
      ${items.length ? `<div class="team-grid">${items.map(card).join('')}</div>` : empty('Chưa có danh sách', 'Nhà trường đang cập nhật thành viên Tổ tâm lý.', 'users')}
      <p class="xs muted team-foot">${icon('siren')} Khi gặp nguy hiểm, gọi ngay <b>111</b> (bảo vệ trẻ em) hoặc <b>115</b> (cấp cứu).</p>`;
    };
    const startChat = (m) => {
      if (!m?.userId) return;
      sessionStorage.setItem('lh_open_counselor', m.userId);
      go('counseling');
    };
    const detail = (m) => modal({ title: m.name, sub: esc(m.title || m.role || ''), body: `<div class="stack">
      <div class="row nowrap" style="gap:14px">${avatar(m, 'xl')}<div class="stack" style="gap:6px;min-width:0">${m.role ? `<span class="badge ${m.role === 'Tổ trưởng' ? 'violet' : ''}" style="align-self:flex-start">${esc(m.role)}</span>` : ''}${onDuty(m) ? '<span class="badge ok" style="align-self:flex-start">● Đang trực</span>' : ''}</div></div>
      ${m.bio ? `<p class="ink2">${esc(m.bio)}</p>` : ''}
      <div class="stack" style="gap:8px">${sched(m) ? `<div class="team-line">${icon('clock')}<span><b>Lịch trực:</b> ${esc(sched(m))}</span></div>` : ''}${m.room ? `<div class="team-line">${icon('pin')}<span><b>Nơi gặp:</b> ${esc(m.room)}</span></div>` : ''}${m.phone ? `<div class="team-line">${icon('phone')}<span class="mono">${esc(m.phone)}</span></div>` : ''}${m.email ? `<div class="team-line">${icon('mail')}<span class="truncate">${esc(m.email)}</span></div>` : ''}</div>
      ${m.topics.length ? `<div><div class="xs muted" style="margin-bottom:6px">Lĩnh vực hỗ trợ</div><div class="team-topics">${m.topics.map(t => `<span>${esc(t)}</span>`).join('')}</div></div>` : ''}
      ${m.certificate ? `<div><div class="xs muted" style="margin-bottom:6px">Chứng chỉ / Quyết định (bấm vào ảnh để phóng to)</div><button type="button" data-lightbox="${esc(fileUrl(m.certificate))}" style="display:block;width:100%;padding:0;border:0;background:none;cursor:zoom-in"><img src="${esc(fileUrl(m.certificate))}" alt="Chứng chỉ ${esc(m.name)}" style="width:100%;border-radius:12px;border:1px solid var(--line);max-height:340px;object-fit:contain;background:var(--surface-2)"></button></div>` : ''}
      ${!canChat(m) ? `<p class="xs muted">${icon('info')} Muốn trao đổi kín với ${esc(m.name)}, em có thể gửi tâm sự ẩn danh hoặc nhờ chuyên viên tâm lý đặt lịch hẹn.</p>` : ''}
    </div>`, foot: `<div class="row" style="gap:8px;justify-content:flex-end;flex-wrap:wrap">${actions(m, true)}${!canChat(m) && enabled(ALL.find(a => a.id === 'counseling')) ? `<a class="btn" href="#counseling" data-close>${icon('heartHand')} Gửi tâm sự</a>` : ''}</div>`,
      onMount: (el, close) => {
        el.querySelector('[data-chat]')?.addEventListener('click', (e) => { close(); startChat(m, e.currentTarget); });
        el.querySelector('[data-cert]')?.addEventListener('click', () => { close(); showCert(m); });
      } });
    draw();
    onView(view, 'click', async (e) => {
      const yr = e.target.closest('[data-yr]'); if (yr) { await load(yr.dataset.yr); draw(); return; }
      const cert = e.target.closest('[data-cert]'); if (cert) { e.stopPropagation(); return showCert(items.find(x => x.id === cert.dataset.cert)); }
      const c = e.target.closest('[data-chat]'); if (c) { e.stopPropagation(); return startChat(items.find(x => x.id === c.dataset.chat), c); }
      if (e.target.closest('a,button')) return;
      const el = e.target.closest('[data-m]'); if (el) detail(items.find(x => x.id === el.dataset.m));
    });
    onView(view, 'keydown', (e) => { if (e.key === 'Enter' && e.target.matches('[data-m]')) detail(items.find(x => x.id === e.target.dataset.m)); });
    const tick = setInterval(draw, 60000); S.cleanups.push(() => clearInterval(tick));
    S.cleanups.push(live.on('data:changed', async ({ scope }) => { if (scope === 'counselTeam') { await load(curYear); draw(); } }));
  },

  // ---------------------------------------------------------------- Cẩm nang
  async handbook(view) {
    const r = await api.get('api/handbook');
    let cat = '';
    const cats = [...new Set(r.items.map(i => i.category))];
    const draw = () => {
      const items = r.items.filter(i => !cat || i.category === cat);
      view.innerHTML = head('Cẩm nang học đường & kỹ năng ứng phó', 'Sổ tay số về nội quy, kỹ năng tự bảo vệ và danh bạ đường dây nóng hỗ trợ khẩn cấp.') + `
      <section class="hotline-grid">${r.hotlines.map((h, i) => `<div class="card hotline-card ${i === 0 ? 'hotline-urgent' : ''}"><div class="hotline-ico">${icon(i === 0 ? 'heartHand' : i === 1 ? 'shield' : i === 2 ? 'siren' : 'phone')}</div><div class="hotline-info"><div class="xs muted truncate" title="${esc(h.name)}">${esc(h.name)}</div><a href="tel:${esc(h.number.replace(/\s/g, ''))}" class="hotline-num">${esc(h.number)}</a><div class="xs muted truncate">${esc(h.note)}</div></div><button type="button" class="btn icon ghost sm hotline-copy" data-copy="${esc(h.number)}" title="Sao chép số ${esc(h.number)}" aria-label="Sao chép số">${icon('copy')}</button></div>`).join('')}</section>
      <section class="card"><div class="card-head"><div><h2>${icon('siren')} Khi bị bắt nạt hoặc đe dọa: làm theo thứ tự</h2><div class="sub">Ghi nhớ để bình tĩnh xử lý</div></div></div>
        <div class="card-body grid g-auto" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr))">${[['Giữ bình tĩnh, không đối đầu', 'Nói chậm, rõ ràng, không khiêu khích.'], ['Rời đi tới nơi đông người', 'Cổng trường, phòng bảo vệ, cửa hàng gần nhất.'], ['Hô to để gây chú ý', '“CỨU VỚI” hoặc “CHÁY” khi bị giữ lại.'], ['Ghi nhớ đặc điểm', 'Số người, trang phục, biển số xe, thời gian.'], ['Báo ngay cho người lớn', 'GVCN, giám thị, cha mẹ hoặc gọi 113, 111.']].map(([t, d], i) => `<div class="row nowrap" style="align-items:flex-start;gap:12px"><span class="medal mx" style="background:var(--brand);color:#fff">${i + 1}</span><div><b class="small">${t}</b><p class="xs muted">${d}</p></div></div>`).join('')}</div></section>
      <div class="chips"><button class="chip ${!cat ? 'active' : ''}" data-c="">Tất cả (${r.items.length})</button>${cats.map(c => `<button class="chip ${cat === c ? 'active' : ''}" data-c="${esc(c)}">${esc(c)}</button>`).join('')}</div>
      <div class="grid g-auto">${items.map(h => `<article class="card hover pad stack" data-h="${h.id}" style="gap:8px"><div class="row between">${badge(h.category, 'info')}${h.pinned ? `<span class="badge warn">${icon('pin')} Ghim</span>` : ''}</div><h3 style="font-size:var(--fs-md)">${esc(h.title)}</h3><p class="small muted clamp-3">${esc(h.summary)}</p><div class="row between xs muted" style="margin-top:auto"><span>${esc(h.author)}</span><span>${icon('eye')} ${num(h.views)}</span></div></article>`).join('')}</div>`;
      $$('[data-c]', view).forEach(b => b.onclick = () => { cat = b.dataset.c; draw(); });
      $$('[data-copy]', view).forEach(b => b.onclick = () => copyText(b.dataset.copy));
      $$('[data-h]', view).forEach(c => c.onclick = async () => { const { item } = await api.get(`api/handbook/${c.dataset.h}`); modal({ title: item.title, sub: `${esc(item.category)} · ${esc(item.author)}`, size: 'wide', body: `<div class="article">${esc(item.content)}</div>`, foot: '<button class="btn" data-close>Đã đọc</button>' }); });
    };
    draw();
  },

  // ---------------------------------------------------------------- Bản tin
  async news(view) {
    const r = await api.get('api/news');
    let cat = '';
    const CATS = { '': 'Tất cả', violence: 'Bạo lực học đường', scam: 'Lừa đảo', drugs: 'Ma túy', explosive: 'Vật liệu nổ', law: 'Pháp luật', traffic: 'Giao thông', wellbeing: 'Sức khỏe tinh thần', school: 'Tin nhà trường' };
    const draw = () => {
      const items = r.items.filter(n => !cat || n.category === cat);
      view.innerHTML = head('Bản tin tuyên truyền', 'Phổ biến giáo dục pháp luật, phòng chống bạo lực học đường, lừa đảo công nghệ cao và tệ nạn xã hội.') + `
      <div class="chips">${Object.entries(CATS).filter(([k]) => !k || r.items.some(n => n.category === k)).map(([k, l]) => `<button class="chip ${cat === k ? 'active' : ''}" data-c="${k}">${l}</button>`).join('')}</div>
      ${items.length ? `<div class="grid g-auto">${items.map(n => `<article class="card hover news-card" data-n="${n.id}">${cover(n)}<h3 class="clamp-2">${esc(n.title)}</h3><p class="small muted clamp-2">${esc(n.summary)}</p><div class="meta"><span>${ago(n.publishedAt)}</span><span>${icon('eye')} ${num(n.views)}</span></div></article>`).join('')}</div>` : empty('Chưa có bản tin', '', 'news')}`;
      $$('[data-c]', view).forEach(b => b.onclick = () => { cat = b.dataset.c; draw(); });
      $$('[data-n]', view).forEach(c => c.onclick = () => openNews(c.dataset.n));
    };
    draw();
  },

  // ---------------------------------------------------------------- Chat toàn trường
  async 'school-chat'(view) {
    let data = await api.get('api/school-chat');
    let isAnon = !!store.get('lh_sc_anon', false);
    view.innerHTML = head('Chat chung toàn trường', 'Kênh giao lưu dành riêng cho học sinh. Có thể chọn nhắn tin ẩn danh hoặc hiện tên; ngôn từ phản cảm sẽ bị lọc tự động.') + `
    <section class="card chat school-chat-card">
      <div class="chat-head"><span class="avatar sm sq" style="background:linear-gradient(135deg,#1747c9,#0a84b8)">${icon('chats')}</span><div class="grow" style="min-width:0"><b class="truncate">Học sinh ${esc(S.settings.shortName)}</b><div class="xs muted truncate"><span style="color:var(--ok)">●</span> <span id="online">${data.online}</span> trực tuyến · Văn minh</div></div><button type="button" class="btn soft sm" id="scAnonBtn" title="Bấm để đổi chế độ ẩn danh / hiện tên"></button><span class="badge ok hide-sm">${icon('shieldCheck')} Văn minh 100%</span></div>
      <div class="chat-body" id="cb"></div>
      <div id="lockNote"></div>
      <div class="chat-anon-bar">
        <label class="check"><input type="checkbox" id="scAnon" ${isAnon ? 'checked' : ''}><span class="truncate"><b>Nhắn ẩn danh</b> · <span id="scAnonHint"></span></span></label>
        <button type="button" id="scAnonTag" style="border:0;cursor:pointer"></button>
      </div>
      <form class="chat-input" id="cf"><textarea id="ct" rows="1" maxlength="600" placeholder="Nhắn tới toàn trường…" aria-label="Tin nhắn"></textarea><button class="btn icon" aria-label="Gửi">${icon('send')}</button></form>
    </section>`;
    const cb = $('#cb');
    const syncAnonUi = () => {
      $('#scAnon').checked = isAnon;
      const btn = $('#scAnonBtn');
      btn.style.cssText = isAnon ? 'background:var(--violet-soft);color:var(--violet);border-color:transparent' : '';
      btn.innerHTML = `${icon(isAnon ? 'eyeOff' : 'user')} ${isAnon ? 'Ẩn danh' : 'Hiện tên'}`;
      $('#scAnonHint').textContent = isAnon ? 'Giấu tên & lớp' : `Hiện tên (${firstName(S.user?.name || '')})`;
      $('#scAnonTag').className = `badge ${isAnon ? 'violet' : 'info'}`;
      $('#scAnonTag').innerHTML = `${icon(isAnon ? 'lock' : 'user')} ${isAnon ? 'Đã ẩn' : 'Hiện tên'}`;
      $('#ct').placeholder = isAnon ? 'Nhắn ẩn danh…' : 'Nhắn tới toàn trường…';
    };
    const setAnon = (val) => {
      isAnon = !!val;
      store.set('lh_sc_anon', isAnon);
      syncAnonUi();
      toast(isAnon ? 'Đã bật chế độ nhắn tin ẩn danh trên kênh toàn trường.' : 'Đã chuyển sang nhắn tin hiện tên thật.', 'ok', 2000);
    };
    syncAnonUi();
    $('#scAnon').onchange = (e) => setAnon(e.target.checked);
    $('#scAnonBtn').onclick = () => setAnon(!isAnon);
    $('#scAnonTag').onclick = () => setAnon(!isAnon);
    const msgHtml = (m) => `<div class="msg ${m.mine ? 'me' : ''}" data-id="${m.id}">${!m.mine ? (m.anonymous ? `<span class="avatar sm" style="background:var(--violet);color:#fff">${icon('eyeOff')}</span>` : avatar({ id: m.userId, name: m.name, avatar: m.avatar }, 'sm')) : ''}<div style="min-width:0">
      <div class="who">${m.mine ? '' : `<b style="color:${m.anonymous ? 'var(--violet)' : 'var(--ink)'}">${esc(m.name)}</b>`}<span>${esc(m.className)}</span>${m.anonymous ? badge('Ẩn danh', 'violet') : ''}${m.role === 'staff' ? badge('Nhà trường', 'info') : ''}</div>
      ${m.deleted ? '<div class="bubble deleted">Tin nhắn đã bị quản trị viên gỡ</div>' : bubble(m, m.mine)}
      <div class="row nowrap" style="gap:6px;${m.mine ? 'justify-content:flex-end' : ''}"><div class="reacts">${Object.entries(m.reactions).map(([e, r]) => `<button class="react ${r.mine ? 'mine' : ''}" data-react="${e}">${e} ${r.count}</button>`).join('')}</div>${!m.deleted && !m.recalled ? `<span class="react-bar">${data.emojis.slice(0, 6).map(e => `<button data-react="${e}" aria-label="Thả ${e}">${e}</button>`).join('')}</span>` : ''}</div>
      <div class="time">${fmtTime(m.at)}${recallBtn(m, m.mine)}</div></div></div>`;
    const draw = () => {
      cb.innerHTML = data.items.map(msgHtml).join('');
      cb.scrollTop = cb.scrollHeight;
      $('#lockNote').innerHTML = data.locked ? `<div class="badge warn" style="margin:8px 12px 0;height:auto;padding:8px 12px;white-space:normal;border-radius:12px">${icon('lock')} ${esc(data.lockReason || 'Kênh chat đang tạm khóa.')}</div>` : data.muted ? `<div class="badge bad" style="margin:8px 12px 0;height:auto;padding:8px 12px;white-space:normal;border-radius:12px">${icon('volumeX')} Bạn đang bị tạm cấm chat do vi phạm quy tắc ứng xử.</div>` : '';
    };
    draw();
    cb.onclick = async (e) => {
      const rc = e.target.closest('[data-recall]');
      if (rc) { const r = await askRecall(`api/school-chat/${rc.dataset.recall}/recall`); if (r) { const i = data.items.findIndex(x => x.id === r.item.id); if (i >= 0) data.items[i] = r.item; draw(); } return; }
      const b = e.target.closest('[data-react]'); if (!b) return;
      const id = b.closest('[data-id]').dataset.id;
      try { const r = await api.post(`api/school-chat/${id}/react`, { emoji: b.dataset.react }); const i = data.items.findIndex(x => x.id === id); data.items[i] = r.item; draw(); } catch (er) { showError(er); }
    };
    autoGrow($('#ct'), () => $('#cf').requestSubmit());
    const comp = attachComposer($('#cf'));
    $('#cf').onsubmit = async (e) => {
      e.preventDefault(); const text = $('#ct').value.trim();
      $('#ct').value = '';
      const ok = await sendWithFiles(comp, text, async (b) => { const r = await api.post('api/school-chat', { ...b, anonymous: isAnon }); if (!data.items.some(x => x.id === r.item.id)) data.items.push(r.item); draw(); if (r.warning) toast(r.warning, 'warn', 5000); }, $('#cf button[aria-label="Gửi"]'));
      if (!ok && text) $('#ct').value = text;
    };
    const reloadSchoolChat = async () => { data = await api.get('api/school-chat'); draw(); };
    S.cleanups.push(live.on('school-chat:message', (m) => { if (!data.items.some(x => x.id === m.id)) { data.items.push({ ...m, attachments: m.attachments || [], mine: m.userId === S.user.id, reactions: {} }); draw(); } reloadSchoolChat(); }));
    S.cleanups.push(live.on('school-chat:delete', ({ id }) => { const m = data.items.find(x => x.id === id); if (m) { m.deleted = true; draw(); } reloadSchoolChat(); }));
    S.cleanups.push(live.on('school-chat:hard-delete', ({ id }) => { data.items = data.items.filter(x => x.id !== id); draw(); }));
    S.cleanups.push(live.on('school-chat:clear', () => { data.items = []; draw(); }));
    S.cleanups.push(live.on('school-chat:recall', ({ id }) => { const m = data.items.find(x => x.id === id); if (m && !m.recalled) { m.recalled = true; m.text = ''; m.attachments = []; m.reactions = {}; draw(); } reloadSchoolChat(); }));
    S.cleanups.push(live.on('school-chat:lock', (x) => { data.locked = x.locked; data.lockReason = x.reason; draw(); }));
    S.cleanups.push(live.on('school-chat:react', reloadSchoolChat));
  },

  // ---------------------------------------------------------------- Chat với giáo viên
  async 'teacher-chat'(view) {
    let threads = (await api.get('api/teacher-chat/threads')).items, current = null;
    view.innerHTML = head('Chat với giáo viên', 'Trao đổi riêng với thầy cô: GVCN, giáo viên bộ môn và tổ tư vấn — hỏi bài, xin nghỉ phép, nhờ hỗ trợ.', `<button class="btn hide-sm" id="newT">${icon('plus')} Nhắn giáo viên</button>`) + `
    <section class="card chat-layout" id="cl"><div class="threads" id="th"></div><div class="chat" id="cp"></div></section>`;
    const drawThreads = () => {
      $('#cl')?.classList.toggle('is-empty', !threads.length && !current);
      $('#th').innerHTML = `<div class="threads-head"><span class="xs muted strong">${threads.length ? `${threads.length} cuộc trò chuyện` : 'Danh sách trò chuyện'}</span><button class="btn sm" id="thNewT">${icon('plus')} Nhắn giáo viên</button></div>` + (threads.length ? `<div class="list">${threads.map(t => `<div class="item click ${current?.id === t.id ? 'active' : ''}" data-t="${t.id}">${avatar(t.teacher)}<div class="grow" style="min-width:0"><div class="row between nowrap" style="gap:6px"><b class="small truncate">${esc(t.teacher.name)}</b><span class="xs muted nowrap">${t.last ? ago(t.last.at) : ''}</span></div><div class="xs muted truncate">${esc(t.teacher.subject || '')}</div><div class="xs truncate ink2" style="margin-top:2px">${t.last ? esc((t.last.from === 'student' ? 'Bạn: ' : '') + (t.last.recalled ? 'Tin nhắn đã thu hồi' : t.last.text || (t.last.attachments?.length ? '📎 Tệp đính kèm' : ''))) : 'Chưa có tin nhắn'}</div></div>${t.unread ? `<span class="count-pill">${t.unread}</span>` : ''}<button class="btn icon ghost sm" data-del="${t.id}" style="color:var(--bad)" aria-label="Xóa cuộc trò chuyện" title="Xóa cuộc trò chuyện">${icon('trash')}</button></div>`).join('')}</div>` : empty('Chưa có cuộc trò chuyện', 'Chọn thầy cô chủ nhiệm hoặc giáo viên bộ môn để hỏi bài, xin nghỉ phép.', 'message', `<button class="btn sm" id="emptyNewT" style="margin-top:4px">${icon('plus')} Chọn giáo viên để nhắn</button>`));
      if ($('#thNewT', view)) $('#thNewT', view).onclick = () => $('#newT').click();
      if ($('#emptyNewT', view)) $('#emptyNewT', view).onclick = () => $('#newT').click();
      $$('[data-t]', view).forEach(el => el.onclick = () => open(el.dataset.t));
      $$('[data-del]', view).forEach(el => el.onclick = async (e) => {
        e.stopPropagation();
        const t = threads.find(x => x.id === el.dataset.del);
        if (!await confirmDialog({ title: 'Xóa cuộc trò chuyện', message: `Xóa cuộc trò chuyện với <b>${esc(t?.teacher?.name || '')}</b> khỏi danh sách của bạn?<br>Giáo viên không bị ảnh hưởng và vẫn xem được cuộc trò chuyện này. Nếu bạn nhắn lại, cuộc trò chuyện sẽ tự hiện lại.`, ok: 'Xóa', tone: 'danger' })) return;
        await api.del(`api/teacher-chat/threads/${el.dataset.del}`);
        if (current?.id === el.dataset.del) { current = null; $('#cl').classList.remove('show-chat'); drawChat(); }
        toast('Đã xóa cuộc trò chuyện.', 'ok');
        refreshThreads();
      });
    };
    const leaveCard = (m) => `<div class="bubble"><div class="leave-card"><b>${icon('file')} Đơn xin nghỉ học</b><div class="small" style="margin-top:4px">Ngày ${esc(m.leave.date.split('-').reverse().join('/'))} · ${esc(m.leave.session)}</div><div class="small">Lý do: ${esc(m.text)}</div><div style="margin-top:6px">${badge({ pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Không duyệt' }[m.leave.status], { pending: 'warn', approved: 'ok', rejected: 'bad' }[m.leave.status])}</div></div></div>`;
    const msgHtml = (m) => { const mine = m.from === 'student'; return `<div class="msg ${mine ? 'me' : ''}">${!mine ? avatar(current.teacher, 'sm') : ''}<div>${m.kind === 'leave' && !m.recalled ? leaveCard(m) : bubble(m, mine)}<div class="time">${fmtTime(m.at)} · ${fmtDate(m.at)}${recallBtn(m, mine)}</div></div></div>`; };
    const setAnon = async (val) => {
      if (!current) return;
      try {
        const r = await api.put(`api/teacher-chat/threads/${current.id}/anonymous`, { anonymous: !!val });
        current = r.item;
        drawChat();
        refreshThreads();
        toast(current.anonymous ? 'Đã bật chế độ nhắn tin ẩn danh.' : 'Đã chuyển sang chế độ hiện tên thật.', 'ok', 2200);
      } catch (er) { showError(er); }
    };
    const drawChat = () => {
      const cp = $('#cp');
      if (!current) { cp.innerHTML = empty('Chọn một cuộc trò chuyện', 'Tin nhắn với thầy cô sẽ hiển thị tại đây.', 'chat'); return; }
      const isAnon = !!current.anonymous;
      cp.innerHTML = `<div class="chat-head"><button class="btn icon ghost sm back-btn" id="back" aria-label="Quay lại">${icon('arrowLeft')}</button>${avatar(current.teacher, 'sm')}<div class="grow" style="min-width:0"><b class="truncate">${esc(current.teacher.name)}</b><div class="xs muted truncate">${esc(current.teacher.title || current.teacher.subject || '')}</div></div><button class="btn soft sm" id="leave" title="Gửi đơn xin nghỉ phép">${icon('file')} Nghỉ phép</button><button type="button" class="btn icon ghost sm" id="delTeacherChat" style="color:var(--bad)" title="Xóa cuộc trò chuyện">${icon('trash')}</button></div>
        <div class="chat-body" id="cb">${current.messages.length ? current.messages.map(msgHtml).join('') : empty('Gửi lời chào tới thầy cô', 'Trao đổi bài học hoặc gửi đơn xin nghỉ phép.', 'message')}</div>
        <div class="chat-anon-bar">
          <label class="check"><input type="checkbox" id="anon" ${isAnon ? 'checked' : ''}><span class="truncate"><b>Nhắn ẩn danh</b> · ${isAnon ? 'Giấu tên & lớp' : `Hiện tên (${esc(firstName(S.user?.name || ''))})`}</span></label>
          <button type="button" class="badge ${isAnon ? 'violet' : 'info'}" id="anonToggle" style="border:0;cursor:pointer" title="Bấm để đổi chế độ ẩn danh / hiện tên">${icon(isAnon ? 'lock' : 'user')} ${isAnon ? 'Đã ẩn' : 'Hiện tên'}</button>
        </div>
        <form class="chat-input" id="cf"><textarea id="ct" rows="1" placeholder="${isAnon ? 'Nhắn ẩn danh…' : 'Nhắn cho thầy cô…'}" aria-label="Tin nhắn"></textarea><button class="btn icon" aria-label="Gửi">${icon('send')}</button></form>`;
      const cb = $('#cb'); cb.scrollTop = cb.scrollHeight;
      cb.onclick = async (e) => { const b = e.target.closest('[data-recall]'); if (!b) return; const r = await askRecall(`api/teacher-chat/threads/${current.id}/messages/${b.dataset.recall}/recall`); if (r) { current = r.item; drawChat(); refreshThreads(); } };
      $('#back').onclick = () => { $('#cl').classList.remove('show-chat'); };
      $('#anon').onchange = (e) => setAnon(e.target.checked);
      $('#anonToggle').onclick = () => setAnon(!isAnon);
      $('#delTeacherChat').onclick = async () => {
        if (!await confirmDialog({ title: 'Xóa cuộc trò chuyện', message: `Xóa cuộc trò chuyện với <b>${esc(current.teacher?.name || '')}</b> khỏi danh sách của bạn?`, ok: 'Xóa', tone: 'danger' })) return;
        await api.del(`api/teacher-chat/threads/${current.id}`);
        current = null; $('#cl').classList.remove('show-chat'); drawChat(); refreshThreads(); toast('Đã xóa cuộc trò chuyện.', 'ok');
      };
      $$('[data-q]', cp).forEach(b => b.onclick = () => { $('#ct').value = b.dataset.q; $('#ct').focus(); });
      autoGrow($('#ct'), () => $('#cf').requestSubmit());
      const comp = attachComposer($('#cf'));
      $('#cf').onsubmit = async (e) => { e.preventDefault(); const text = $('#ct').value.trim(); $('#ct').value = ''; const ok = await sendWithFiles(comp, text, async (b) => { const r = await api.post(`api/teacher-chat/threads/${current.id}/messages`, { ...b, anonymous: $('#anon')?.checked ?? false }); current = r.item; }, $('#cf button[aria-label="Gửi"]')); if (ok) { refreshThreads(); drawChat(); } else if (text) $('#ct').value = text; };
      $('#leave').onclick = () => modal({ title: 'Đơn xin nghỉ học', sub: `Gửi tới ${esc(current.teacher.name)}`, body: `<form id="lf" class="stack"><div class="field-row"><div class="field"><label for="ld">Ngày nghỉ</label><input id="ld" name="date" type="date" required value="${new Date(Date.now() + 86400000).toISOString().slice(0, 10)}"></div><div class="field"><label for="ls">Buổi</label><select id="ls" name="session"><option>Cả ngày</option><option>Sáng</option><option>Chiều</option></select></div></div><div class="field"><label for="lr">Lý do</label><textarea id="lr" name="reason" required placeholder="Ví dụ: Em bị sốt, gia đình xin phép cho em nghỉ để đi khám."></textarea><span class="hint">Phụ huynh vui lòng xác nhận với GVCN qua điện thoại nếu nghỉ dài ngày.</span></div></form>`,
        foot: '<button class="btn ghost" data-close>Hủy</button><button class="btn" id="lsend">Gửi đơn</button>', onMount: (m, close) => $('#lsend', m).onclick = async () => { const f = formData($('#lf', m)); if (!f.reason.trim()) return toast('Vui lòng nhập lý do nghỉ.', 'warn'); try { const r = await api.post(`api/teacher-chat/threads/${current.id}/messages`, { kind: 'leave', leave: f }); current = r.item; close(); drawChat(); toast('Đã gửi đơn xin nghỉ.', 'ok'); } catch (e) { showError(e); } } });
    };
    const refreshThreads = async () => { threads = (await api.get('api/teacher-chat/threads')).items; drawThreads(); };
    const open = async (id) => { current = (await api.get(`api/teacher-chat/threads/${id}`)).item; $('#cl').classList.add('show-chat'); drawChat(); refreshThreads(); refreshBadges(); };
    drawThreads(); drawChat();
    const want = sessionStorage.getItem('lh_open_thread'); sessionStorage.removeItem('lh_open_thread');
    if (want && threads.some(t => t.id === want)) open(want);
    else if (threads[0] && innerWidth >= 1024) open(threads[0].id);
    $('#newT').onclick = async () => {
      // Không gợi ý chuyên viên tâm lý trong danh sách "chọn giáo viên để nhắn tin" — tách bạch với
      // mục Tư vấn tâm lý riêng (ẩn danh, mục đích khác hẳn chat giáo viên thông thường).
      const items = (await api.get('api/teachers')).items.filter(t => !t.counselor);
      const fold = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase();
      modal({
        title: 'Nhắn tin cho giáo viên',
        sub: `${items.length} giáo viên · chọn thầy cô để bắt đầu trò chuyện`,
        body: `<div class="stack" style="gap:10px">
          <div class="search">${icon('search')}<input id="pickQ" placeholder="Tìm tên giáo viên, chức danh, bộ môn…" aria-label="Tìm giáo viên"></div>
          <div class="list" id="pickList" style="max-height:58vh;overflow:auto"></div>
        </div>`,
        onMount: (m, close) => {
          const listEl = $('#pickList', m), qEl = $('#pickQ', m);
          const renderList = (q = '') => {
            const kw = q.trim().toLowerCase(), kwFold = fold(kw);
            const filtered = !kw ? items : items.filter(t => {
              const hay = [t.name, t.className, t.subject, t.department].filter(Boolean).join(' ');
              return hay.toLowerCase().includes(kw) || fold(hay).includes(kwFold);
            });
            listEl.innerHTML = filtered.length
              ? filtered.map(t => `<div class="item click" data-pick="${t.id}">${avatar(t)}<div class="grow"><b class="small">${esc(t.name)}</b><div class="xs muted">${esc([t.className, t.subject, t.department].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(' · '))}</div></div>${icon('chevronRight')}</div>`).join('')
              : empty('Không tìm thấy giáo viên', 'Thử nhập từ khóa khác.', 'search');
            $$('[data-pick]', listEl).forEach(el => el.onclick = async () => {
              const r = await api.post('api/teacher-chat/threads', { teacherId: el.dataset.pick });
              close(); await refreshThreads(); open(r.item.id);
            });
          };
          renderList();
          qEl.oninput = (e) => renderList(e.target.value);
          setTimeout(() => qEl.focus(), 50);
        },
      });
    };
    S.cleanups.push(live.on('teacher-chat:message', async ({ threadId }) => {
      const draft = $('#ct')?.value || '';
      const hadFocus = document.activeElement?.id === 'ct';
      if (current?.id === threadId) {
        current = (await api.get(`api/teacher-chat/threads/${threadId}`)).item;
        drawChat();
        if (draft && $('#ct')) $('#ct').value = draft;
        if (hadFocus && $('#ct')) $('#ct').focus();
      }
      refreshThreads();
    }));
  },

  // ---------------------------------------------------------------- Danh sách giáo viên
  async 'teacher-list'(view) {
    const items = (await api.get('api/teachers')).items;
    const canChat = enabled(ALL.find(a => a.id === 'teacher-chat'));
    const startChat = async (id, btn) => {
      try {
        btn && (btn.disabled = true);
        const r = await api.post('api/teacher-chat/threads', { teacherId: id });
        sessionStorage.setItem('lh_open_thread', r.item.id);
        go('teacher-chat');
      } catch (e) { showError(e); } finally { btn && (btn.disabled = false); }
    };
    const actions = (t) => `${canChat ? `<button class="btn sm" data-chat="${t.id}">${icon('message')} Nhắn tin</button>` : ''}${t.phone ? `<a class="btn soft sm" href="tel:${esc(t.phone.replace(/\s/g, ''))}">${icon('phone')} Gọi</a>` : ''}${t.email ? `<a class="btn ghost sm" href="mailto:${esc(t.email)}">${icon('mail')} Email</a>` : ''}`;
    const card = (t) => `<article class="card team-card">
      <div class="team-top"><span class="team-av">${avatar(t, 'lg')}</span>
        <div class="grow" style="min-width:0"><b class="truncate">${esc(t.name)}</b><div class="xs muted team-title">${esc(t.className || '')}</div>${t.department ? `<div class="team-tags"><span class="badge">${esc(t.department)}</span></div>` : ''}</div></div>
      <div class="team-act">${actions(t)}</div></article>`;
    const draw = (list) => { $('#tlGrid').innerHTML = list.length ? `<div class="team-grid">${list.map(card).join('')}</div>` : empty('Không tìm thấy', 'Thử từ khóa khác.', 'search'); };
    view.innerHTML = head('Danh sách giáo viên', `${items.length} thầy cô đang công tác tại trường · bấm “Nhắn tin” để trao đổi riêng.`) + `
    <div class="search" style="max-width:100%;margin-bottom:14px">${icon('search')}<input id="tlQ" placeholder="Tìm theo tên, chức danh, môn dạy…" aria-label="Tìm giáo viên"></div>
    <div id="tlGrid"></div>`;
    draw(items);
    $('#tlQ').oninput = (e) => { const q = e.target.value.trim().toLowerCase(); draw(!q ? items : items.filter(t => [t.name, t.className, t.subject, t.department].some(f => (f || '').toLowerCase().includes(q)))); };
    onView(view, 'click', (e) => { const c = e.target.closest('[data-chat]'); if (c) startChat(c.dataset.chat, c); });
  },

  // ---------------------------------------------------------------- Trắc nghiệm
  async quiz(view) {
    let [topics, lb] = await Promise.all([api.get('api/quiz/topics'), api.get('api/quiz/leaderboard?period=week')]);
    let topic = 'all', count = 10, period = 'week', board = lb, gateTimer = 0;
    S.cleanups.push(() => clearInterval(gateTimer));
    const evalGate = () => {
      const g = topics.gate || { locked: false, state: 'open' };
      const now = Date.now();
      const openMs = g.openAt ? new Date(g.openAt).getTime() : 0;
      const closeMs = g.closeAt ? new Date(g.closeAt).getTime() : 0;
      let state = 'open';
      if (g.manualLock) {
        if (openMs && now >= openMs && (!closeMs || now <= closeMs)) state = 'open';
        else if (openMs && now < openMs) state = 'scheduled';
        else state = 'locked';
      } else if (openMs && now < openMs) state = 'scheduled';
      else if (closeMs && now > closeMs) state = 'closed';
      return { ...g, state, locked: state !== 'open', openMs, closeMs };
    };
    const fmtRemain = (ms) => {
      const sec = Math.max(0, Math.ceil(ms / 1000));
      const d = Math.floor(sec / 86400);
      const h = Math.floor((sec % 86400) / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      return { d, h: String(h).padStart(2, '0'), m: String(m).padStart(2, '0'), s: String(s).padStart(2, '0') };
    };
    const lobby = () => {
      clearInterval(gateTimer);
      const top = board.items;
      const g = evalGate();
      const rem = g.state === 'scheduled' ? fmtRemain(g.openMs - Date.now()) : null;
      view.innerHTML = head('Đấu trường trắc nghiệm tri thức', 'Thử thách hiểu biết về kỹ năng phòng chống bạo lực, an ninh mạng, pháp luật và an toàn giao thông.') + `
      <div class="grid g-main quiz-lobby">
        <div class="stack" style="gap:12px">
          <section class="card quiz-setup ${g.locked ? 'is-locked' : ''}">
            <div class="quiz-setup-head">
              <div class="row between nowrap" style="gap:8px">
                <div class="row nowrap" style="gap:6px">
                  <span class="badge warn">${icon('trophy')} Mùa thi đua tháng ${new Date().getMonth() + 1}</span>
                  ${g.locked ? `<span class="badge ${g.state === 'scheduled' ? 'info' : 'bad'}">${icon('lock')} ${g.state === 'scheduled' ? 'Hẹn giờ mở đề' : g.state === 'closed' ? 'Đã đóng đề' : 'Đang khóa'}</span>` : `<span class="badge ok">${icon('unlock')} Đang mở thi</span>`}
                </div>
                <span class="xs muted">${icon('timer')} 30s / câu</span>
              </div>
              <h2>Trả lời nhanh, chính xác để lọt Top 3 bảng vàng tuần!</h2>
            </div>
            ${g.locked ? `
              <div class="quiz-lock-box ${g.state}">
                <div class="quiz-lock-ico">${icon(g.state === 'scheduled' ? 'clock' : 'lock')}</div>
                <div class="quiz-lock-info">
                  <b>${g.state === 'scheduled' ? 'Đấu trường đang khóa · Chờ đến giờ mở thi' : g.state === 'closed' ? 'Đã kết thúc thời gian mở đề thi' : 'Đấu trường đang tạm khóa'}</b>
                  <p>${g.state === 'scheduled' ? `Đề thi sẽ tự động mở lúc <b>${fmtDateTime(g.openAt)}</b>.${g.closeAt ? ` Hạn đóng đề: <b>${fmtDateTime(g.closeAt)}</b>.` : ''}` : g.state === 'closed' ? `Thời gian làm bài đã đóng lúc <b>${fmtDateTime(g.closeAt)}</b>.` : esc(g.note || 'Nhà trường đang tạm khóa đấu trường. Đề thi sẽ được mở khi đến giờ thi.')}</p>
                  ${g.state === 'scheduled' && g.note ? `<p class="xs" style="margin-top:2px;color:var(--brand)">${icon('info')} ${esc(g.note)}</p>` : ''}
                </div>
                ${g.state === 'scheduled' && rem ? `
                  <div class="quiz-countdown" id="qzCd" aria-label="Đếm ngược đến giờ mở thi">
                    ${rem.d > 0 ? `<div class="qcd-box"><b id="qcdD">${rem.d}</b><span>Ngày</span></div><span class="qcd-colon">:</span>` : ''}
                    <div class="qcd-box"><b id="qcdH">${rem.h}</b><span>Giờ</span></div><span class="qcd-colon">:</span>
                    <div class="qcd-box"><b id="qcdM">${rem.m}</b><span>Phút</span></div><span class="qcd-colon">:</span>
                    <div class="qcd-box"><b id="qcdS">${rem.s}</b><span>Giây</span></div>
                  </div>
                ` : ''}
              </div>
            ` : (g.closeAt && g.closeMs > Date.now() ? `<div class="quiz-open-note">${icon('clock')} Đang trong khung giờ mở đề · đóng lúc <b>${fmtDateTime(g.closeAt)}</b>${g.note ? ` · ${esc(g.note)}` : ''}</div>` : '')}
            <div class="quiz-field">
              <div class="quiz-label">Chủ đề câu hỏi</div>
              <div class="chips">
                <button type="button" class="chip ${topic === 'all' ? 'active' : ''}" data-topic="all">Tổng hợp (${topics.total})</button>
                ${topics.topics.filter(t => t.count).map(t => `<button type="button" class="chip ${topic === t.id ? 'active' : ''}" data-topic="${t.id}">${esc(t.short)} (${t.count})</button>`).join('')}
              </div>
            </div>
            <div class="quiz-start-row">
              <div class="quiz-field" style="flex:1;min-width:0">
                <div class="quiz-label">Số lượng câu</div>
                <div class="chips">${[5, 10, 15].map(n => `<button type="button" class="chip ${count === n ? 'active' : ''}" data-count="${n}">${n} câu</button>`).join('')}</div>
              </div>
              <button type="button" class="btn quiz-go-btn" id="start" ${g.locked ? 'disabled' : ''}>${icon(g.locked ? 'lock' : 'play')} ${g.locked ? (g.state === 'scheduled' ? 'Chưa đến giờ thi' : g.state === 'closed' ? 'Đã hết giờ thi' : 'Đang khóa') : 'Bắt đầu thi'}</button>
            </div>
          </section>
          <section class="quiz-stats">
            <div class="card quiz-stat">
              <span class="qs-ico">${icon('gamepad')}</span>
              <div><b>${board.mine.attempts}</b><span>Lượt thi</span></div>
            </div>
            <div class="card quiz-stat">
              <span class="qs-ico" style="--c:var(--ok)">${icon('target')}</span>
              <div><b>${board.mine.best}<small>/100</small></b><span>Điểm cao nhất</span></div>
            </div>
            <div class="card quiz-stat">
              <span class="qs-ico" style="--c:var(--warn)">${icon('award')}</span>
              <div style="min-width:0"><b>${board.mine.badges.length}</b><span class="truncate" title="${esc(board.mine.badges.map(b => b.label).join(', ') || 'Chưa có huy hiệu')}">${board.mine.badges.length ? esc(board.mine.badges[0].label) : 'Huy hiệu'}</span></div>
            </div>
          </section>
        </div>
        <section class="card quiz-board"><div class="card-head"><h2>${icon('crown')} Bảng vàng</h2><div class="seg"><button data-p="week" class="${period === 'week' ? 'active' : ''}">Tuần này</button><button data-p="all" class="${period === 'all' ? 'active' : ''}">Mọi lúc</button></div></div>
          <div class="card-body stack" style="gap:10px">
            ${top.length >= 3 ? `<div class="podium">${[1, 0, 2].map(i => `<div class="p p${i + 1}">${avatar({ id: top[i].userId, name: top[i].name, avatar: top[i].avatar }, 'sm')}<b class="xs truncate" style="max-width:100%">${esc(firstName(top[i].name))}</b><span class="xs muted" style="font-size:10.5px">${top[i].score}đ · ${top[i].duration}s</span><div class="stand">${i + 1}</div></div>`).join('')}</div>` : ''}
            <div class="list">${(top.length >= 3 ? top.slice(3) : top).map(t => `<div class="item"><span class="medal ${t.rank <= 3 ? 'm' + t.rank : 'mx'}">${t.rank}</span>${avatar({ id: t.userId, name: t.name, avatar: t.avatar }, 'sm')}<div class="grow" style="min-width:0"><b class="small truncate" style="display:block">${esc(t.name)}</b><div class="xs muted">${esc(t.className)} · ${t.attempts} lượt</div></div><b class="num small">${t.score}đ</b></div>`).join('') || empty('Chưa có lượt thi')}</div>
          </div></section>
      </div>
`;
      $$('[data-topic]', view).forEach(b => b.onclick = () => { topic = b.dataset.topic; lobby(); });
      $$('[data-count]', view).forEach(b => b.onclick = () => { count = +b.dataset.count; lobby(); });
      $$('[data-p]', view).forEach(b => b.onclick = async () => { period = b.dataset.p; board = await api.get(`api/quiz/leaderboard?period=${period}`); lobby(); });
      if ($('#start') && !g.locked) $('#start').onclick = play;
      if (g.state === 'scheduled' && g.openMs) {
        gateTimer = setInterval(async () => {
          const leftMs = g.openMs - Date.now();
          if (leftMs <= 0) {
            clearInterval(gateTimer);
            topics = await api.get('api/quiz/topics').catch(() => topics);
            toast('Đã đến giờ mở thi! Bạn có thể bắt đầu làm bài.', 'ok', 4000);
            lobby();
            return;
          }
          const r = fmtRemain(leftMs);
          if ($('#qcdD', view)) $('#qcdD', view).textContent = r.d;
          if ($('#qcdH', view)) $('#qcdH', view).textContent = r.h;
          if ($('#qcdM', view)) $('#qcdM', view).textContent = r.m;
          if ($('#qcdS', view)) $('#qcdS', view).textContent = r.s;
        }, 1000);
      } else if (!g.locked && g.closeMs && g.closeMs > Date.now()) {
        gateTimer = setInterval(() => {
          if (Date.now() >= g.closeMs) {
            clearInterval(gateTimer);
            toast('Đã hết thời gian mở đề thi.', 'warn');
            lobby();
          }
        }, 1000);
      }
    };
    const play = async () => {
      clearInterval(gateTimer);
      const { items, timeLimit } = await api.get(`api/quiz/questions?topic=${topic}&count=${count}`);
      const answers = {}; let i = 0, left = timeLimit; const t0 = Date.now();
      const tick = setInterval(() => { left--; const bar = $('#tb i'); if (bar) bar.style.width = `${left / timeLimit * 100}%`; const tl = $('#tl'); if (tl) tl.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`; if (left <= 0) finish(); }, 1000);
      S.cleanups.push(() => clearInterval(tick));
      const drawQ = () => {
        const q = items[i];
        view.innerHTML = `<div class="card quiz-play-card" style="max-width:760px;margin:0 auto;width:100%"><div class="card-body stack" style="gap:12px">
          <div class="row between nowrap"><span class="badge info">${esc(q.topicName || '')} · ${esc(q.difficulty)}</span><span class="row small muted" style="gap:5px">${icon('timer')} <b id="tl" class="mono">${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}</b></span></div>
          <div class="timer-bar" id="tb"><i style="width:${left / timeLimit * 100}%"></i></div>
          <div class="row between nowrap"><span class="eyebrow">Câu ${i + 1} / ${items.length}</span><div class="row" style="gap:4px">${items.map((_, k) => `<span style="width:${Math.max(6, 160 / items.length)}px;height:5px;border-radius:4px;background:${k < i || answers[items[k].id] !== undefined ? 'var(--brand)' : k === i ? 'var(--brand-line)' : 'var(--surface-3)'}"></span>`).join('')}</div></div>
          <h2 class="quiz-q">${esc(q.question)}</h2>
          <div class="opts">${q.options.map((o, k) => `<button class="opt ${answers[q.id] === k ? 'picked' : ''}" data-k="${k}"><span class="l">${'ABCD'[k]}</span><span>${esc(o)}</span></button>`).join('')}</div>
          <div class="row between" style="padding-top:4px"><button class="btn ghost sm" id="prev" ${i === 0 ? 'disabled' : ''}>${icon('arrowLeft')} Câu trước</button><button class="btn sm" id="next">${i === items.length - 1 ? `${icon('check')} Nộp bài` : `Câu tiếp ${icon('arrowRight')}`}</button></div>
        </div></div>`;
        $$('.opt', view).forEach(b => b.onclick = () => { answers[q.id] = +b.dataset.k; $$('.opt', view).forEach(x => x.classList.toggle('picked', x === b)); setTimeout(() => { if (i < items.length - 1) { i++; drawQ(); } }, 260); });
        $('#prev').onclick = () => { i--; drawQ(); };
        $('#next').onclick = () => { if (i < items.length - 1) { i++; drawQ(); } else finish(); };
      };
      let done = false;
      const finish = async () => {
        if (done) return; done = true; clearInterval(tick);
        const unanswered = items.filter(q => answers[q.id] === undefined).length;
        view.innerHTML = skeleton(2);
        try {
          const r = await api.post('api/quiz/submit', { topic, duration: Math.max(1, Math.round((Date.now() - t0) / 1000)), answers: items.map(q => ({ id: q.id, choice: answers[q.id] ?? null })) });
          const a = r.attempt;
          view.innerHTML = `<div class="grid g-main"><section class="card pad stack" style="align-items:center;text-align:center;gap:10px">
            <div class="ring" style="--p:${a.score};--c:${a.score >= 80 ? 'var(--ok)' : a.score >= 50 ? 'var(--brand)' : 'var(--warn)'};width:128px;--t:12px"><div><b style="font-size:1.85rem">${a.score}</b><span>điểm</span></div></div>
            <h3 style="font-size:1.1rem">${a.score === 100 ? 'Xuất sắc! Điểm tuyệt đối!' : a.score >= 80 ? 'Rất tốt!' : a.score >= 50 ? 'Khá lắm, cố gắng thêm nhé!' : 'Hãy ôn lại và thử lần nữa!'}</h3>
            <div class="row" style="justify-content:center;gap:6px">${badge(`${a.correct}/${a.total} câu đúng`, 'ok')}${badge(`${a.duration} giây`, 'info')}${r.rank ? badge(`Hạng ${r.rank} tuần này`, 'warn') : ''}${unanswered ? badge(`${unanswered} bỏ trống`, 'bad') : ''}</div>
            ${r.badges.length ? `<div class="row" style="justify-content:center;gap:6px">${r.badges.map(b => `<span class="badge warn">${icon('star')} ${esc(b.label)}</span>`).join('')}</div>` : ''}
            <div class="row" style="justify-content:center;gap:8px;padding-top:2px"><button class="btn sm" id="again">${icon('refresh')} Thi lại</button><button class="btn ghost sm" id="lobby">Bảng vàng</button></div></section>
            <section class="card"><div class="card-head"><h2>Đáp án & giải thích</h2></div><div class="card-body stack" style="gap:10px">${r.results.map((x, k) => `<div class="stack" style="gap:4px;padding-bottom:10px;border-bottom:1px solid var(--line)"><div class="row nowrap" style="align-items:flex-start;gap:8px"><span class="medal" style="width:24px;height:24px;font-size:11px;background:${x.correct ? 'var(--ok)' : 'var(--bad)'}">${icon(x.correct ? 'check' : 'x')}</span><b class="small">${k + 1}. ${esc(x.question)}</b></div><p class="xs" style="padding-left:32px">${x.choice !== null ? `Bạn chọn: <b style="color:${x.correct ? 'var(--ok)' : 'var(--bad)'}">${'ABCD'[x.choice]}. ${esc(x.options[x.choice])}</b><br>` : '<span class="muted">Bạn chưa trả lời. </span>'}${!x.correct ? `Đáp án đúng: <b style="color:var(--ok)">${'ABCD'[x.answer]}. ${esc(x.options[x.answer])}</b>` : ''}</p><p class="xs muted" style="padding-left:32px">${esc(x.explanation)}</p></div>`).join('')}</div></section></div>`;
          $('#again').onclick = play; $('#lobby').onclick = async () => { board = await api.get(`api/quiz/leaderboard?period=${period}`); lobby(); };
        } catch (e) { showError(e); lobby(); }
      };
      drawQ();
    };
    lobby();
  },

  // ---------------------------------------------------------------- Khảo sát
  async survey(view) {
    const r = await api.get('api/surveys');
    const P = { khkt: ['Nghiên cứu khoa học', 'violet'], discipline: ['Nề nếp kỷ luật', 'warn'], mental: ['Sức khỏe tinh thần', 'sky'], other: ['Khác', ''] };
    view.innerHTML = head('Khảo sát học đường', 'Ý kiến của bạn là dữ liệu quý cho đề tài nghiên cứu và các giải pháp an toàn học đường của nhà trường.') + `
    <div class="grid g-auto" style="grid-template-columns:repeat(auto-fill,minmax(320px,1fr))">${r.items.map(s => `<article class="card pad stack" style="gap:12px">
      <div class="row between">${badge(P[s.purpose]?.[0] || 'Khảo sát', P[s.purpose]?.[1] || '')}${s.done ? badge('Đã tham gia', 'ok') : s.expired ? badge('Hết hạn', 'bad') : badge(`Hạn ${fmtDate(s.deadline)}`)}</div>
      <h3 style="font-size:var(--fs-md)">${esc(s.title)}</h3><p class="small muted clamp-3">${esc(s.description)}</p>
      <div class="row small muted" style="gap:14px"><span>${icon('clipboard')} ${s.questionCount} câu</span><span>${icon('clock')} ~${Math.max(2, Math.round(s.questionCount * .45))} phút</span>${s.anonymous ? `<span>${icon('lock')} Ẩn danh</span>` : ''}</div>
      <div><div class="row between xs muted" style="margin-bottom:6px"><span>${s.responses} phiếu</span><span>Mục tiêu ${s.targetCount}</span></div><div class="meter"><i style="width:${Math.min(100, s.responses / s.targetCount * 100)}%"></i></div></div>
      <button class="btn ${s.done ? 'ghost' : ''}" data-s="${s.id}" ${s.done || s.expired ? 'disabled' : ''}>${s.done ? `${icon('checkCircle')} Cảm ơn bạn đã tham gia` : `${icon('edit')} Tham gia khảo sát`}</button></article>`).join('') || empty('Chưa có đợt khảo sát nào', '', 'clipboard')}</div>`;
    $$('[data-s]', view).forEach(b => b.onclick = () => fillSurvey(b.dataset.s));
  },

  // ---------------------------------------------------------------- Tra cứu lừa đảo
  async scam(view) {
    let kind = 'message';
    const ai = await api.get('api/ai/status').catch(() => ({ enabled: false }));
    let prefill = null;
    try { prefill = JSON.parse(sessionStorage.getItem('lh_scam_prefill') || 'null'); sessionStorage.removeItem('lh_scam_prefill'); } catch { /* bỏ qua */ }
    if (prefill?.kind) kind = prefill.kind;
    const K = {
      message: { label: 'Tin nhắn', icon: 'message', ph: 'Dán nội dung tin nhắn SMS, Zalo, Messenger đáng ngờ vào đây…', ex: ['Chúc mừng bạn đã trúng thưởng xe SH Mode trong chương trình tri ân khách hàng! Vui lòng chuyển khoản 2.000.000đ phí nhận quà và cung cấp mã OTP trong vòng 24h.', 'Cơ quan công an thông báo: bạn liên quan đến hồ sơ vụ án rửa tiền, yêu cầu chuyển toàn bộ số dư vào tài khoản tạm giữ để xác minh gấp.', 'Tuyển CTV làm việc nhẹ lương cao, chỉ cần like video TikTok, thu nhập 500k/ngày. Nạp 200k làm nhiệm vụ nhận hoa hồng 30%.'] },
      url: { label: 'Đường link', icon: 'link', ph: 'Ví dụ: http://vietcombank-xacthuc.top/login', ex: ['http://vietcombank-xacthuc.top/dang-nhap', 'https://nhanqua-shopee.vip/tri-an', 'https://www.vietcombank.com.vn'] },
      phone: { label: 'Số điện thoại', icon: 'phone', ph: 'Ví dụ: 0987 654 321 hoặc +1 202 555 0147', ex: ['+1 202 555 0147', '0120 555 014', '0912 345 678'] },
      account: { label: 'Số tài khoản', icon: 'bank', ph: 'Nhập số tài khoản ngân hàng / ví điện tử', ex: ['000123456789', '999988887777', '1903 5555 6666'] },
    };
    const draw = (result) => {
      const k = K[kind];
      view.innerHTML = head('Tra cứu & quét dấu hiệu lừa đảo AI', 'Công cụ 4-trong-1: kiểm tra tin nhắn, đường link, số điện thoại và số tài khoản trước khi bạn làm theo.', aiPill(ai)) + `
      ${aiOfflineNote(ai)}
      <div class="grid g-main">
        <div class="stack lg">
          <section class="card"><div class="card-body stack">
            <div class="seg seg-grid">${Object.entries(K).map(([key, v]) => `<button data-k="${key}" class="${kind === key ? 'active' : ''}">${icon(v.icon)} ${v.label}</button>`).join('')}</div>
            <form id="sf" class="stack">
              ${kind === 'message' ? `<textarea class="textarea" id="si" placeholder="${k.ph}" style="min-height:130px" aria-label="Nội dung cần kiểm tra"></textarea>` : `<div class="input-icon">${icon(k.icon)}<input class="input" id="si" placeholder="${k.ph}" aria-label="Nội dung cần kiểm tra" ${kind === 'phone' || kind === 'account' ? 'inputmode="tel"' : ''}></div>`}
              ${kind === 'account' ? '<input class="input" id="bank" placeholder="Tên ngân hàng (không bắt buộc)" aria-label="Tên ngân hàng">' : ''}
              <div class="row" style="justify-content:flex-end"><button class="btn lg" id="scanGo">${icon('sparkles')} Quét bằng AI</button></div>
            </form>
          </div></section>
          <div id="res">${result ? resultHtml(result) : `<div class="card pad">${empty('Kết quả phân tích sẽ hiển thị tại đây', 'AI chấm điểm rủi ro 0–100 và giải thích từng dấu hiệu đáng ngờ.', 'shieldCheck')}</div>`}</div>
        </div>
        <aside class="stack lg">
          <section class="card pad stack"><b>${icon('alert')} 5 dấu hiệu lừa đảo kinh điển</b><div class="stack" style="gap:10px">${[['Hối thúc khẩn cấp', '“Trong 24h”, “nếu không sẽ bị khóa”'], ['Đòi chuyển tiền trước', 'Phí nhận quà, tiền cọc, phí xử lý hồ sơ'], ['Xin mã OTP, mật khẩu', 'Không ai có quyền yêu cầu mã của bạn'], ['Mạo danh cơ quan', 'Công an, tòa án, nhà trường, ngân hàng'], ['Lợi ích quá hấp dẫn', 'Trúng thưởng, việc nhẹ lương cao']].map(([t, d], i) => `<div class="row nowrap" style="align-items:flex-start;gap:10px"><span class="medal mx">${i + 1}</span><div><b class="small">${t}</b><div class="xs muted">${d}</div></div></div>`).join('')}</div></section>
          <section class="card pad stack" style="background:var(--brand-soft);border-color:transparent"><b>${icon('shieldCheck')} Đã lỡ chuyển tiền?</b><p class="small ink2">Gọi ngay tổng đài ngân hàng để yêu cầu phong tỏa giao dịch, báo Công an nơi gần nhất (113) và thông báo cho GVCN, cha mẹ.</p></section>
        </aside>
      </div>`;
      $$('[data-k]', view).forEach(b => b.onclick = () => { kind = b.dataset.k; draw(); });
      $('#sf').onsubmit = async (e) => {
        e.preventDefault(); const input = $('#si').value.trim();
        if (!input) return toast('Hãy nhập nội dung cần kiểm tra.', 'warn');
        await withBusy($('#scanGo'), async () => {
          $('#res').innerHTML = `<div class="card pad stack" style="align-items:center"><div class="typing"><i></i><i></i><i></i></div><span class="small muted">${ai.enabled && ['message', 'url'].includes(kind) ? `AI đang đọc và phân tích ${k.label.toLowerCase()}… (vài giây)` : `Đang phân tích ${k.label.toLowerCase()}…`}</span></div>`;
          await sleep(500);
          try { const r = await api.post('api/ai/scam-check', { kind, input, bank: $('#bank')?.value || '' }); r.input = input; $('#res').innerHTML = resultHtml(r); bindResult(r); } catch (er) { showError(er); $('#res').innerHTML = ''; }
        });
      };
      if (result) bindResult(result);
      else if (prefill?.input && !draw.prefilled) {
        draw.prefilled = true; $('#si').value = prefill.input; $('#sf').requestSubmit();
      }
    };
    const COLORS = { safe: 'var(--ok)', warning: 'var(--warn)', danger: 'var(--bad)' };
    const resultHtml = (r) => `<section class="stack">
      <div class="verdict ${r.level}">${gauge(r.score, COLORS[r.level])}<div class="stack" style="gap:6px"><div class="row" style="gap:8px"><span class="eyebrow" style="color:var(--c)">Mức độ rủi ro</span>${r.engine === 'ai+rules' ? `<span class="badge violet">${icon('sparkles')} AI + bộ luật</span>` : '<span class="badge">Bộ luật</span>'}</div><h3>${esc(r.label)}${r.ai?.scamType && r.ai.scamType !== 'Không phát hiện' && r.level !== 'safe' ? ` · <span style="font-weight:600">${esc(r.ai.scamType)}</span>` : ''}</h3>${r.ai?.summary ? `<p class="small" style="font-weight:600">${esc(r.ai.summary)}</p>` : ''}<p class="small ink2">${esc(r.advice)}</p>
        ${r.kind === 'phone' ? `<div class="row small" style="gap:12px">${r.carrier ? `<span>${icon('smartphone')} ${esc(r.carrier)}</span>` : ''}<span class="mono">${esc(r.normalized)}</span>${r.reports ? `<span>${icon('flag')} ${r.reports} báo cáo</span>` : ''}</div>` : ''}${r.kind === 'url' && r.host ? `<span class="small mono">${icon('globe')} ${esc(r.host)}</span>` : ''}${r.kind === 'account' ? `<span class="small mono">${icon('bank')} ${esc(r.normalized)}${r.bank ? ' · ' + esc(r.bank) : ''}</span>` : ''}</div></div>
      ${aiCard(r)}
      <div class="card"><div class="card-head"><h2>${icon('list')} ${r.ai ? 'Dấu hiệu theo bộ luật' : 'Phân tích chi tiết'} (${r.findings.length})</h2><span class="xs muted">${fmtTime(r.checkedAt)}</span></div><div class="card-body">${r.findings.map(f => `<div class="finding"><span class="medal" style="background:${f.weight >= 30 ? 'var(--bad)' : f.weight >= 12 ? 'var(--warn)' : f.weight > 0 ? 'var(--brand)' : 'var(--ok)'}">${icon(f.weight > 0 ? 'alert' : 'check')}</span><div><b class="small">${esc(f.label)}</b><p class="small ink2">${esc(f.detail)}</p></div><span class="w">${f.weight ? '+' + f.weight : ''}</span></div>`).join('')}</div>
      ${r.kind !== 'message' ? `<div class="card-foot"><span class="small muted grow">Bạn từng bị đối tượng này lừa hoặc làm phiền?</span><button class="btn danger soft sm" id="rep">${icon('flag')} Báo cáo lừa đảo</button></div>` : ''}</div></section>`;
    const aiCard = (r) => r.ai ? `<div class="card ai-card"><div class="card-head"><h2>${icon('sparkles')} Phân tích của AI</h2><span class="xs muted">${esc(r.ai.model || 'AI')}</span></div><div class="card-body stack">
        ${r.ai.redFlags.length ? `<div>${r.ai.redFlags.map(f => `<div class="finding"><span class="medal" style="background:var(--violet)">${icon('alert')}</span><div><b class="small">${esc(f.label)}</b>${f.detail ? `<p class="small ink2">${esc(f.detail)}</p>` : ''}</div></div>`).join('')}</div>` : ''}
        ${r.ai.advice.length ? `<div class="stack" style="gap:6px"><b class="small">${icon('checkCircle')} Việc nên làm ngay</b><ol class="ai-steps">${r.ai.advice.map(a => `<li>${esc(a)}</li>`).join('')}</ol></div>` : ''}
        ${r.ai.reply ? `<div class="leave-card"><b class="small">${icon('message')} Gợi ý phản hồi an toàn</b><div class="small">${esc(r.ai.reply)}</div></div>` : ''}
        <div class="xs muted">AI có thể nhầm lẫn. Luôn xác minh qua kênh chính thức và hỏi ý kiến thầy cô, cha mẹ.</div>
      </div></div>` : r.aiError ? `<div class="card pad small muted row nowrap" style="gap:8px">${icon('info')} ${esc(r.aiError)}</div>` : '';
    const bindResult = (r) => { const b = $('#rep'); if (b) b.onclick = () => modal({ title: 'Báo cáo lừa đảo', sub: 'Giúp cộng đồng học sinh cảnh giác hơn', body: `<div class="field"><label>Đối tượng</label><input class="input mono" value="${esc(r.normalized || r.host || r.input)}" disabled></div><div class="field"><label for="rn">Mô tả thủ đoạn</label><textarea id="rn" placeholder="Ví dụ: Gọi điện mạo danh giáo viên, báo con bị tai nạn…"></textarea></div>`, foot: '<button class="btn ghost" data-close>Hủy</button><button class="btn danger" id="rsend">Gửi báo cáo</button>', onMount: (m, close) => $('#rsend', m).onclick = async () => { try { const x = await api.post('api/ai/scam-report', { kind: r.kind, value: r.input, note: $('#rn', m).value }); toast(x.message, 'ok'); close(); } catch (e) { showError(e); } } }); };
    draw();
  },

  // ---------------------------------------------------------------- Trợ lý AI
  async ai(view) {
    const [hist, ai] = await Promise.all([api.get('api/ai/conversations/mine'), api.get('api/ai/status').catch(() => ({ enabled: false }))]);
    let convId = hist.conversation?.id || null;
    const msgs = hist.conversation?.messages || [];
    const defaultChips = ['Công thức đạo hàm', 'Công thức lượng giác', 'Kế hoạch ôn thi', 'Dấu hiệu lừa đảo', 'Giảm căng thẳng'];
    let chips = [...defaultChips];
    view.innerHTML = head('Trợ lý học đường AI 24/7', 'Hỏi bài, xin mẹo ôn thi, hỏi cách nhận diện lừa đảo hoặc tâm sự khi căng thẳng. AI Guard giám sát để giữ an toàn cho bạn.') + `
    ${aiOfflineNote(ai)}
    <section class="card chat ai-chat-card">
      <div class="chat-head">
        <span class="avatar sq ai-bot-av">${icon('bot')}</span>
        <div class="grow" style="min-width:0">
          <b>Trợ lý Học đường AI</b>
          <div class="xs muted truncate"><span style="color:var(--ok)">●</span> ${ai.enabled ? `AI thật · ${esc(ai.label || ai.model || '')}` : 'Chế độ cơ bản'} · AI Guard bảo vệ</div>
        </div>
        <button class="btn ghost sm" id="newConv" title="Làm mới cuộc trò chuyện">${icon('refresh')} <span>Làm mới</span></button>
      </div>
      <div class="chat-body" id="cb"></div>
      <div class="ai-chips" id="aiChips"></div>
      <form class="chat-input" id="cf"><textarea id="ct" rows="1" maxlength="1500" placeholder="Nhập câu hỏi hoặc dán tin nhắn…" aria-label="Câu hỏi cho trợ lý AI"></textarea><button class="btn icon" aria-label="Gửi">${icon('send')}</button></form>
    </section>`;
    const cb = $('#cb'), chipBox = $('#aiChips');
    const bubble = (m) => m.role === 'user' ? `<div class="msg me"><div><div class="bubble">${esc(m.text)}</div>${m.at ? `<div class="time">${fmtTime(m.at)}</div>` : ''}</div></div>`
      : `<div class="msg"><span class="avatar sm sq ai-msg-av">${icon('bot')}</span><div style="min-width:0"><div class="bubble md" style="white-space:normal">${md(m.text)}${m.guard?.showHotline ? `<div class="leave-card" style="margin-top:8px;background:var(--bad-soft);border-color:color-mix(in srgb,var(--bad) 30%,transparent)"><b style="color:var(--bad)">${icon('siren')} Đường dây hỗ trợ</b><div class="small">111 · Bảo vệ trẻ em (24/7) &nbsp;·&nbsp; 115 · Cấp cứu &nbsp;·&nbsp; 113 · Công an</div></div>` : ''}</div>${m.scan ? scanCard(m.scan) : ''}${m.actions?.length ? `<div class="row" style="gap:6px;margin-top:5px">${m.actions.map((a) => `<a class="btn soft sm" href="#${a.page}" ${a.page === 'scam' && m.scan ? `data-scan="${esc(JSON.stringify({ kind: m.scan.kind, input: m.scan.input }))}"` : ''}>${esc(a.label)} ${icon('arrowRight')}</a>`).join('')}</div>` : ''}${m.at || m.engine === 'llm' ? `<div class="time">${m.engine === 'llm' ? `<span class="ai-src">${icon('sparkles')} AI</span> ` : ''}${m.at ? fmtTime(m.at) : ''}</div>` : ''}</div></div>`;
    const SC = { safe: ['ok', 'An toàn'], warning: ['warn', 'Cảnh báo'], danger: ['bad', 'Nguy hiểm'] };
    const scanCard = (sc) => `<div class="scan-mini ${sc.level}">${icon('shieldAlert')}<div class="grow"><b class="small">Quét lừa đảo: ${esc(sc.label || SC[sc.level]?.[1] || '')}</b><div class="xs muted">Điểm rủi ro theo bộ luật ${sc.score}/100</div></div>${badge(SC[sc.level]?.[1] || '', SC[sc.level]?.[0] || '')}</div>`;
    const intro = { role: 'assistant', text: `Chào **${esc(firstName(S.user.name))}**! 👋 Mình là **Trợ lý Học đường AI**.\n- **Học tập**: đạo hàm, nguyên hàm, lượng giác, nghị luận xã hội, tiếng Anh, Python…\n- **An toàn & tâm lý**: quét tin nhắn lừa đảo, ứng phó bắt nạt, giảm áp lực thi cử` };
    const draw = () => {
      cb.innerHTML = [intro, ...msgs].map(bubble).join(''); cb.scrollTop = cb.scrollHeight;
      $$('[data-scan]', cb).forEach(a => a.onclick = () => { try { sessionStorage.setItem('lh_scam_prefill', a.dataset.scan); } catch { /* bỏ qua */ } });
      chipBox.innerHTML = chips.map(c => `<button type="button" data-chip="${esc(c)}">${esc(c)}</button>`).join('');
      $$('[data-chip]', chipBox).forEach(b => b.onclick = () => ask(b.dataset.chip));
    };
    const ask = async (text) => {
      msgs.push({ role: 'user', text, at: new Date().toISOString() }); draw();
      cb.insertAdjacentHTML('beforeend', `<div class="msg" id="typing"><span class="avatar sm sq ai-msg-av">${icon('bot')}</span><div class="bubble typing"><i></i><i></i><i></i></div></div>`); cb.scrollTop = cb.scrollHeight;
      try {
        const r = await api.post('api/ai/chat', { message: text, conversationId: convId });
        await sleep(300);
        convId = r.conversationId;
        if (r.suggestions?.length) chips = r.suggestions;
        msgs.push({ role: 'assistant', text: r.reply, actions: r.actions, guard: r.guard, engine: r.engine, scan: r.scan, at: new Date().toISOString() });
        if (r.aiError) toast(r.aiError, 'warn');
        draw();
      } catch (e) { $('#typing')?.remove(); showError(e); }
    };
    draw();
    autoGrow($('#ct'), () => $('#cf').requestSubmit());
    $('#cf').onsubmit = (e) => { e.preventDefault(); const t = $('#ct').value.trim(); if (!t) return; $('#ct').value = ''; $('#ct').style.height = 'auto'; ask(t); };
    $('#newConv').onclick = () => { convId = null; msgs.length = 0; chips = [...defaultChips]; draw(); };
  },

  // ---------------------------------------------------------------- Hồ sơ
  async profile(view) {
    const [p, rec] = await Promise.all([api.get('api/profile'), api.get('api/my-records')]);
    const u = p.user;
    let tab = 'info';
    const draw = () => {
      const face = store.get('lh_face');
      let body = '';
      if (tab === 'info') body = `<div class="card"><div class="card-body stack" style="gap:14px"><div class="row nowrap" style="gap:14px;padding-bottom:14px;border-bottom:1px solid var(--line)"><button type="button" id="profAvBtn" class="m-user-av lg" title="Nhấp để hiện máy ảnh đổi ảnh đại diện">${avatar(u, 'lg')}<span class="m-user-cam">${icon('camera')}</span></button><div class="grow" style="min-width:0"><b style="font-size:1.1rem;display:block" class="truncate">${esc(u.name)}</b><span class="small muted">Lớp ${esc(u.className || u.classId || '')} · MSHS: <span class="mono">${esc(u.id)}</span></span><div class="xs muted" style="margin-top:4px">Nhấp vào ảnh đại diện để đổi ảnh</div></div></div><dl style="display:grid;grid-template-columns:132px minmax(0,1fr);gap:10px 12px;margin:0;align-items:baseline">${[['Họ và tên', u.name], ['Mã học sinh', `<span class="mono">${esc(u.id)}</span>`], ['Lớp', esc(u.className || u.classId || '')], ['Niên khóa', u.courseYear || '2024 – 2027'], ['Ngày sinh', u.dob ? fmtDate(u.dob) : '—'], ['Giới tính', u.gender || '—'], ['Quê quán', u.hometown || '—'], ['GV chủ nhiệm', u.homeroomName || p.homeroom?.name || '—'], ['Email', u.email || '—'], ['Điện thoại', u.phone || '<span class="muted">Chưa cập nhật</span>'], ['Điểm rèn luyện', `<b>${u.conduct ?? '—'}</b>/100`]].map(([k, v]) => `<dt class="small muted" style="padding:3px 0">${k}</dt><dd style="margin:0;padding:3px 0;font-weight:500" class="small">${typeof v === 'string' && !v.startsWith('<') ? esc(v) : v ?? '—'}</dd>`).join('')}</dl></div><div class="card-foot"><button class="btn" id="editInfo">${icon('edit')} Chỉnh sửa thông tin</button></div></div>`;
      if (tab === 'security') body = `<div class="grid g2"><form class="card" id="pw"><div class="card-head"><h2>${icon('key')} Đổi mật khẩu</h2></div><div class="card-body stack"><div class="field"><label for="cp">Mật khẩu hiện tại</label><input id="cp" name="currentPassword" type="password" autocomplete="current-password" required></div><div class="field"><label for="np">Mật khẩu mới</label><input id="np" name="newPassword" type="password" autocomplete="new-password" minlength="6" required><span class="hint">Ít nhất 6 ký tự, nên kết hợp chữ, số và ký tự đặc biệt.</span></div><div class="field"><label for="np2">Nhập lại mật khẩu mới</label><input id="np2" type="password" autocomplete="new-password" required></div></div><div class="card-foot"><button class="btn" id="pwb">${icon('check')} Lưu mật khẩu</button></div></form>
        <div class="stack lg"><div class="card pad stack"><b>${icon('logout')} Phiên đăng nhập</b><p class="small ink2">Đăng xuất khỏi tất cả điện thoại, máy tính đang đăng nhập tài khoản của bạn.</p><button class="btn ghost" id="logoutAll" style="align-self:flex-start">Đăng xuất mọi thiết bị</button></div></div></div>`;
      if (tab === 'records') body = `<div class="card"><div class="card-head"><h2>${icon('gavel')} Sổ theo dõi nề nếp</h2><span class="small muted">${rec.items.length} biên bản</span></div><div class="card-body stack">${rec.items.map(x => `<div class="card soft row nowrap" style="padding:12px 14px;gap:12px;align-items:flex-start">${x.photo ? `<img src="${esc(x.photo)}" alt="" style="width:64px;height:64px;border-radius:10px;object-fit:cover;flex:none;background:#fff">` : ''}<div class="grow"><div class="row" style="gap:8px"><b class="mono small">${x.id}</b>${badge(x.penalty, 'warn')}${x.points ? badge(`−${x.points} điểm`, 'bad') : ''}</div><p class="small" style="margin-top:4px">${esc(x.description)}</p><div class="xs muted">${fmtDateTime(x.at)} · ${esc(x.location)} · Lập bởi ${esc(x.createdByName)}</div></div></div>`).join('') || empty('Không có vi phạm nào', 'Tuyệt vời! Hãy tiếp tục giữ vững nề nếp nhé.', 'checkCircle')}</div></div>`;
      if (tab === 'feedback') body = `<form class="card" id="fbf"><div class="card-head"><div><h2>${icon('star')} Đánh giá ứng dụng</h2><div class="sub">Góp ý của bạn giúp nhà trường hoàn thiện Cổng Học Đường Số</div></div></div><div class="card-body stack"><div class="row" id="stars" role="radiogroup" aria-label="Số sao">${[1, 2, 3, 4, 5].map(n => `<button type="button" class="btn icon ghost" data-star="${n}" aria-label="${n} sao" style="font-size:1.4rem;width:48px;height:48px;color:var(--warn)">${icon('star')}</button>`).join('')}</div><div class="field"><label for="fbc">Góp ý</label><textarea id="fbc" maxlength="1000" placeholder="Bạn thích điều gì? Cần cải thiện điều gì?"></textarea></div></div><div class="card-foot"><button class="btn" id="fbb">${icon('send')} Gửi góp ý</button></div></form>`;
      view.innerHTML = head('Hồ sơ cá nhân', 'Thông tin học sinh, bảo mật tài khoản và nề nếp.', `<button class="btn ghost" id="th2">${icon('moon')} Sáng / tối</button><button class="btn danger soft" id="lo2">${icon('logout')} Đăng xuất</button>`) + `
      <div class="stack" id="pg">
        <div class="tabs">${[['info', 'user', 'Thông tin'], ['security', 'lock', 'Bảo mật'], ['records', 'gavel', 'Nề nếp'], ['feedback', 'star', 'Góp ý']].map(([k, i, l]) => `<button class="tab ${tab === k ? 'active' : ''}" data-tab2="${k}">${icon(i)} ${l}</button>`).join('')}</div>
        ${body}
      </div>`;
      $$('[data-tab2]', view).forEach(b => b.onclick = () => { tab = b.dataset.tab2; draw(); });
      $('#th2').onclick = toggleTheme; $('#lo2').onclick = logout;
      $$('[data-copy]', view).forEach(b => b.onclick = () => copyText(b.dataset.copy));
      if (tab === 'info') {
        const launchAv = () => openMyAvatarEditor((nu) => { Object.assign(u, nu); draw(); });
        bindAvatarCam($('#profAvBtn'), launchAv);
        $('#editInfo').onclick = () => modal({
          title: 'Chỉnh sửa thông tin cá nhân',
          sub: `Mã học sinh: ${esc(u.id)}`,
          size: 'wide',
          body: `<form id="ef" class="field-row" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">
            <div class="row nowrap" style="grid-column:1/-1;gap:14px;padding:10px 12px;border-radius:14px;background:var(--surface-2)"><span id="efAvPv">${avatar(u, 'lg')}</span><div class="grow"><b class="small" style="display:block">Ảnh đại diện</b><span class="xs muted">Hiển thị trên bảng vàng, kênh chat và hồ sơ học sinh</span></div><button type="button" class="btn soft sm" id="efAvBtn">${icon('camera')} Đổi / căn chỉnh ảnh</button></div>
            <div class="field" style="grid-column:1/-1"><label for="ename">Họ và tên</label><input id="ename" name="name" value="${esc(u.name || '')}" required></div>
            <div class="field"><label for="eclass">Lớp</label><input id="eclass" name="classId" value="${esc(u.className || u.classId || '')}" list="clsList" required><datalist id="clsList">${(p.classes || []).map(c => `<option value="${esc(c)}"></option>`).join('')}</datalist></div>
            <div class="field"><label for="ecourse">Niên khóa</label><input id="ecourse" name="courseYear" value="${esc(u.courseYear || '2024 – 2027')}" placeholder="2024 – 2027"></div>
            <div class="field"><label for="edob">Ngày sinh</label><input id="edob" name="dob" type="date" value="${esc((u.dob || '').slice(0, 10))}"></div>
            <div class="field"><label for="egender">Giới tính</label><select id="egender" name="gender">${['Nam', 'Nữ', 'Khác'].map(g => `<option value="${g}" ${u.gender === g ? 'selected' : ''}>${g}</option>`).join('')}</select></div>
            <div class="field"><label for="ehome">Quê quán</label><input id="ehome" name="hometown" value="${esc(u.hometown || '')}" placeholder="Đức Cơ, Gia Lai"></div>
            <div class="field"><label for="egvcn">Giáo viên chủ nhiệm</label><input id="egvcn" name="homeroomName" value="${esc(u.homeroomName || p.homeroom?.name || '')}" list="gvList" placeholder="Chọn hoặc nhập tên GVCN"><datalist id="gvList">${(p.teachers || []).map(t => `<option value="${esc(t)}"></option>`).join('')}</datalist></div>
            <div class="field"><label for="ephone">Số điện thoại</label><input id="ephone" name="phone" value="${esc(u.phone || '')}" inputmode="tel" placeholder="0987 654 321"></div>
            <div class="field"><label for="eemail">Email</label><input id="eemail" name="email" type="email" value="${esc(u.email || '')}"></div>
          </form>`,
          foot: '<button class="btn ghost" data-close>Hủy</button><button class="btn" id="esave">Lưu thay đổi</button>',
          onMount: (m, close) => {
            if ($('#efAvBtn', m)) $('#efAvBtn', m).onclick = () => openMyAvatarEditor((nu) => { Object.assign(u, nu); if ($('#efAvPv', m)) $('#efAvPv', m).innerHTML = avatar(u, 'lg'); draw(); });
            const submit = () => withBusy($('#esave', m), async () => {
              try {
                const r = await api.put('api/profile', formData($('#ef', m)));
                Object.assign(u, r.user);
                if (r.homeroom) p.homeroom = r.homeroom;
                S.user = r.user;
                close();
                toast('Đã lưu thông tin cá nhân.', 'ok');
                shell();
                draw();
              } catch (e) { showError(e); }
            });
            $('#esave', m).onclick = submit;
            $('#ef', m).onsubmit = (e) => { e.preventDefault(); submit(); };
          },
        });
      }
      if (tab === 'security') {
        $('#pw').onsubmit = (e) => { e.preventDefault(); const f = formData(e.target); if (f.newPassword !== $('#np2').value) return toast('Mật khẩu nhập lại không khớp.', 'warn'); withBusy($('#pwb'), async () => { try { const r = await api.post('api/auth/change-password', f); session.set(r.token, true); toast(r.message, 'ok'); e.target.reset(); } catch (er) { showError(er); } }); };
        $('#logoutAll').onclick = async () => { if (!await confirmDialog({ title: 'Đăng xuất mọi thiết bị', message: 'Tất cả phiên đăng nhập (kể cả thiết bị này) sẽ bị vô hiệu.', ok: 'Đăng xuất', tone: 'danger' })) return; await api.post('api/auth/logout-all'); session.clear(); location.href = './'; };
      }
      if (tab === 'feedback') {
        let rating = 5; const paint = () => $$('[data-star]', view).forEach(b => { b.style.opacity = +b.dataset.star <= rating ? 1 : .3; b.querySelector('svg').style.fill = +b.dataset.star <= rating ? 'currentColor' : 'none'; });
        paint(); $$('[data-star]', view).forEach(b => b.onclick = () => { rating = +b.dataset.star; paint(); });
        $('#fbf').onsubmit = (e) => { e.preventDefault(); withBusy($('#fbb'), async () => { try { const r = await api.post('api/feedback', { rating, comment: $('#fbc').value }); toast(r.message, 'ok'); $('#fbc').value = ''; } catch (er) { showError(er); } }); };
      }
    };
    draw();
  },

  // ---------------------------------------------------------------- Hướng dẫn tải App
  async 'app-guide'(view) {
    return renderAppGuide(view, { api, head });
  },

  // ---------------------------------------------------------------- Giới thiệu trang web
  async about(view) {
    return renderAboutPage(view, { head, settings: S.settings });
  },
};

// =============================================================================
async function openNews(id) {
  const { item, related } = await api.get(`api/news/${id}`);
  modal({ title: item.title, sub: `${esc(item.author)} · ${fmtDate(item.publishedAt)} · ${num(item.views)} lượt xem`, size: 'wide',
    body: `${cover(item)}<div class="article">${esc(item.content)}</div>${related.length ? `<div class="hr"></div><b>Bài liên quan</b><div class="list">${related.map(r => `<div class="item click" data-rel="${r.id}"><span class="badge info">${esc(r.badge)}</span><span class="grow small strong truncate">${esc(r.title)}</span>${icon('chevronRight')}</div>`).join('')}</div>` : ''}`,
    foot: `<button class="btn ghost" id="share">${icon('external')} Chia sẻ</button><button class="btn" data-close>Đóng</button>`,
    onMount: (m, close) => {
      $('#share', m).onclick = async () => { const text = `${item.title}\n\n${item.summary}\n— ${S.settings.schoolName}`; try { if (navigator.share) await navigator.share({ title: item.title, text }); else copyText(text); } catch { copyText(text); } };
      $$('[data-rel]', m).forEach(r => r.onclick = () => { close(); openNews(r.dataset.rel); });
    } });
}

function openReport(r, TONE) {
  modal({ title: `Hồ sơ ${r.id}`, sub: `${esc(r.typeName)} · gửi ${fmtDateTime(r.createdAt)}`, size: 'wide',
    body: `<div class="row" style="gap:8px">${badge(r.statusName, TONE[r.status])}${r.anonymous ? badge('Ẩn danh', 'violet') : ''}${badge('Mức ' + ({ low: 'thấp', medium: 'trung bình', high: 'cao', critical: 'nghiêm trọng' }[r.severity]), r.severity === 'low' ? '' : r.severity === 'medium' ? 'warn' : 'bad')}</div>
      <div class="grid g2"><div class="stack" style="gap:6px"><span class="eyebrow">Địa điểm</span><span>${esc(r.location)}</span></div><div class="stack" style="gap:6px"><span class="eyebrow">Thời gian xảy ra</span><span>${fmtDateTime(r.occurredAt)}</span></div></div>
      <div class="stack" style="gap:6px"><span class="eyebrow">Mô tả</span><p class="ink2">${esc(r.description)}</p></div>
      ${r.photos?.length ? `<div class="thumbs">${r.photos.map(p => `<a href="${esc(p)}" target="_blank" rel="noopener" class="thumb" style="width:120px;height:90px"><img src="${esc(p)}" alt="Ảnh minh chứng"></a>`).join('')}</div>` : ''}
      ${r.feedback ? `<div class="card soft" style="padding:14px 16px;border-color:var(--ok)"><b style="color:var(--ok)">${icon('checkCircle')} Phản hồi của nhà trường</b><p class="small ink2" style="margin-top:4px">${esc(r.feedback)}</p></div>` : ''}
      <div class="stack"><span class="eyebrow">Tiến trình xử lý</span><div class="timeline">${r.timeline.map(t => `<div class="tl done"><b>${esc(({ pending: 'Chờ tiếp nhận', verifying: 'Đang xác minh', reminded: 'Đã nhắc nhở', disciplined: 'Đã kỷ luật', recorded: 'Đã lập biên bản', resolved: 'Đã xử lý', archived: 'Lưu hồ sơ' })[t.status] || t.status)}</b><p>${esc(t.note)}</p><time>${fmtDateTime(t.at)} · ${esc(t.by)}</time></div>`).join('')}</div></div>`,
    foot: '<button class="btn" data-close>Đóng</button>' });
}

async function fillSurvey(id) {
  const { item: s } = await api.get(`api/surveys/${id}`);
  const answers = {};
  modal({ title: s.title, sub: `${s.questions.length} câu hỏi${s.anonymous ? ' · Phiếu ẩn danh' : ''}`, size: 'wide',
    body: `<div class="meter"><i id="sp" style="width:0%"></i></div><form id="svf" class="stack lg">${s.questions.map((q, i) => `<fieldset class="stack" style="border:0;padding:0;margin:0;gap:10px"><legend class="strong" style="margin-bottom:8px">${i + 1}. ${esc(q.text)} ${q.required ? '<span style="color:var(--bad)">*</span>' : ''}</legend>
      ${q.type === 'single' ? `<div class="chips">${q.options.map(o => `<label class="chip"><input type="radio" name="${q.id}" value="${esc(o)}">${esc(o)}</label>`).join('')}</div>` : ''}
      ${q.type === 'multi' ? `<div class="chips">${q.options.map(o => `<label class="chip"><input type="checkbox" name="${q.id}" value="${esc(o)}">${esc(o)}</label>`).join('')}</div><span class="hint xs muted">Có thể chọn nhiều đáp án</span>` : ''}
      ${q.type === 'scale' ? `<div class="row nowrap" style="gap:8px">${q.options.map(o => `<label class="chip" style="flex:1;justify-content:center;font-size:1rem;font-weight:700"><input type="radio" name="${q.id}" value="${o}">${o}</label>`).join('')}</div><div class="row between xs muted"><span>Thấp</span><span>Cao</span></div>` : ''}
      ${q.type === 'text' ? `<textarea name="${q.id}" maxlength="1000" placeholder="Câu trả lời của bạn…" class="textarea"></textarea>` : ''}</fieldset>`).join('')}</form>`,
    foot: `<span class="small muted grow">${icon('lock')} ${s.anonymous ? 'Không lưu danh tính người trả lời' : 'Phiếu có ghi tên'}</span><button class="btn ghost" data-close>Để sau</button><button class="btn" id="svs">${icon('send')} Gửi phiếu</button>`,
    onMount: (m, close) => {
      const form = $('#svf', m);
      const update = () => { const f = formData(form); s.questions.forEach(q => { const v = f[q.id]; answers[q.id] = q.type === 'multi' ? (Array.isArray(v) ? v : v ? [v] : []) : v || ''; }); const done = s.questions.filter(q => answers[q.id] && (!Array.isArray(answers[q.id]) || answers[q.id].length)).length; $('#sp', m).style.width = `${done / s.questions.length * 100}%`; };
      form.addEventListener('change', update); form.addEventListener('input', update);
      $('#svs', m).onclick = (e) => withBusy(e.currentTarget, async () => { update(); try { const r = await api.post(`api/surveys/${s.id}/responses`, { answers }); close(); modal({ title: 'Đã gửi phiếu khảo sát', body: `<div class="empty"><div class="art" style="background:var(--ok-soft);color:var(--ok)">${icon('checkCircle')}</div><h4>${esc(r.message)}</h4></div>`, foot: '<button class="btn" data-close>Hoàn tất</button>', onClose: render }); } catch (er) { showError(er); } });
    } });
}

// ---------- Vị trí GPS ----------
function getPosition() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition((p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }), () => resolve(null), { enableHighAccuracy: true, timeout: 9000, maximumAge: 30000 });
  });
}
function autoGrow(ta, onEnter) {
  ta.addEventListener('input', () => {
    ta.style.height = 'auto';
    ta.style.height = Math.min(140, ta.scrollHeight) + 'px';
    ta.style.overflowY = ta.scrollHeight > 140 ? 'auto' : 'hidden';
  });
  ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); onEnter(); } });
}

boot().catch(showError);
