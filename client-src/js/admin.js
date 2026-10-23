// =============================================================================
//  CỔNG GIÁO VIÊN / QUẢN TRỊ — bảng điều khiển & 10 module quản lý
// =============================================================================
import { api, session, setPortal, detect, getMode, live, showError } from './core/api.js';
import { icon, drumArt } from './core/icons.js';
import { $, $$, esc, toast, modal, confirmDialog, formData, withBusy, compressImage, editAvatarModal, copyText, empty, skeleton, badge, barChart, donut, gauge, md, store,
  fmtDate, fmtTime, fmtDateTime, ago, vnd, num, greeting, firstName, avatar, initTheme, initDevToolsGuard, toggleTheme, DAY, sleep, attachmentsHtml, attachComposer, isNativeApp, fileUrl, renderAppGuide, renderAboutPage } from './core/ui.js';

const aiOfflineNote = (ai) => getMode() === 'demo' && !ai?.enabled && isNativeApp() ? `<div class="card soft small row nowrap" style="padding:10px 14px;gap:8px">${icon('info')}<span>App đang ở <b>bản trải nghiệm</b> nên dùng chế độ cơ bản. Đăng xuất → <b>Máy chủ trường</b> → nhập địa chỉ máy chủ để dùng AI của nhà trường.</span></div>` : '';
const aiPill = (ai) => ai?.enabled ? `<span class="badge violet" title="${esc(ai.label || '')}">${icon('sparkles')} AI thật đang bật</span>` : '<span class="badge" title="Thêm khóa API trong .env để bật AI">Bộ luật · chưa bật AI</span>';
function autoGrow(ta, onEnter) {
  ta.addEventListener('input', () => {
    ta.style.height = 'auto';
    ta.style.height = Math.min(140, ta.scrollHeight) + 'px';
    ta.style.overflowY = ta.scrollHeight > 140 ? 'auto' : 'hidden';
  });
  ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); onEnter(); } });
}

const bubbleBody = (m) => `${m.text ? esc(m.text) : ''}${attachmentsHtml(m.attachments)}`;
const bubbleCls = (m) => (!m.text && m.attachments?.length ? 'att-only' : '');
// Tin nhắn đã thu hồi: quản trị viên vẫn thấy nội dung gốc (viền nét đứt + nhãn); người khác chỉ thấy “đã thu hồi”
const recallTag = (m) => `<span class="recalled-orig">${icon('undo')} Đã thu hồi lúc ${fmtTime(m.recalledAt || m.at)} · chỉ quản trị viên thấy</span>`;
const sbubble = (m, extraStyle = '') => {
  if (m.recalled && !m.text && !m.attachments?.length) return `<div class="bubble deleted">${icon('undo')} Tin nhắn đã được thu hồi</div>`;
  return `<div class="bubble ${bubbleCls(m)} ${m.recalled ? 'was-recalled' : ''}" style="${extraStyle}">${bubbleBody(m)}${m.recalled ? recallTag(m) : ''}</div>`;
};
const recallLink = (m, mine) => (mine && !m.recalled && m.kind !== 'leave' ? ` · <button type="button" class="recall-btn" data-recall="${m.id}">Thu hồi</button>` : '');
async function askRecall(url) {
  if (!await confirmDialog({ title: 'Thu hồi tin nhắn?', message: 'Học sinh sẽ chỉ thấy “Tin nhắn đã được thu hồi”. Quản trị viên vẫn xem được nội dung gốc.', ok: 'Thu hồi', tone: 'danger' })) return false;
  try { await api.post(url, {}); toast('Đã thu hồi tin nhắn.', 'ok', 1800); return true; } catch (e) { showError(e); return false; }
}

setPortal('staff');
initTheme(); initDevToolsGuard();
const root = $('#root');
const S = { user: null, settings: null, meta: null, cleanups: [], alerts: 0 };

const isAdmin = () => S.user?.role === 'admin';
const canCounsel = () => isAdmin() || !!S.user?.inCounselTeam || !!S.user?.counselor;

const ADMIN_NAV = [
  { group: 'Tổng quan', items: [{ id: 'dashboard', label: 'Bảng điều khiển', icon: 'dashboard' }] },
  { group: 'Quản lý học đường', items: [
    { id: 'accounts', label: 'Tài khoản đăng nhập', icon: 'users', count: 'unlock' },
    { id: 'reports', label: 'Tố giác & biên bản', icon: 'shieldAlert', count: 'reports' },
  ] },
  { group: 'Hoạt động & tư vấn', items: [
    { id: 'counseling', label: 'Tư vấn tâm lý', icon: 'heartHand', count: 'counsel' },
    { id: 'teacher-chat', label: 'Chat với giáo viên', icon: 'message', count: 'teacherchat' },
    { id: 'team', label: 'Tổ tâm lý', icon: 'users' },
    { id: 'teacher-list', label: 'Danh sách giáo viên', icon: 'school' },
    { id: 'chatmod', label: 'Kiểm duyệt chat chung', icon: 'chats', count: 'chatmod' },
    { id: 'quiz', label: 'Trò chơi trắc nghiệm', icon: 'trophy' },
    { id: 'surveys', label: 'Khảo sát', icon: 'clipboardCheck' },
  ] },
  { group: 'AI & nội dung', items: [
    { id: 'ai', label: 'AI Guard & cảnh báo', icon: 'siren', count: 'alerts' },
    { id: 'scam', label: 'Tra cứu lừa đảo', icon: 'shieldCheck' },
    { id: 'ai-chat', label: 'Trợ lý học đường AI', icon: 'bot' },
    { id: 'content', label: 'Cẩm nang & bản tin', icon: 'bookOpen' },
    { id: 'broadcast', label: 'Phát thông báo', icon: 'megaphone' },
    { id: 'settings', label: 'Giao diện & cấu hình', icon: 'palette' },
    { id: 'logs', label: 'Nhật ký & góp ý', icon: 'history' },
    { id: 'app-guide', label: 'Hướng dẫn tải App', icon: 'smartphone' },
    { id: 'about', label: 'Giới thiệu trang web', icon: 'info' },
  ] },
];

const getTeacherNav = () => [
  { group: 'Kết nối & tư vấn', items: [
    ...(canCounsel() ? [{ id: 'counseling', label: 'Tư vấn tâm lý', icon: 'heartHand', count: 'counsel' }] : []),
    { id: 'teacher-chat', label: 'Chat với học sinh', icon: 'message', count: 'teacherchat' },
    { id: 'chatmod', label: 'Chat chung toàn trường', icon: 'chats', count: 'chatmod' },
    { id: 'about', label: 'Giới thiệu trang web', icon: 'info' },
  ] },
];

const getNav = () => (isAdmin() ? ADMIN_NAV : getTeacherNav());
const getAll = () => getNav().flatMap(g => g.items);
const go = (p) => { if (location.hash !== '#' + p) location.hash = p; else render(); };
const head = (title, sub = '', actions = '') => `<div class="page-head"><div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ''}</div>${actions ? `<div class="actions">${actions}</div>` : ''}</div>`;
const TONE = { pending: '', verifying: 'warn', reminded: 'info', disciplined: 'bad', recorded: 'bad', resolved: 'ok', archived: '' };
const SEV_TONE = { low: '', medium: 'warn', high: 'bad', critical: 'critical' };
const LEVEL = { red: ['Khẩn cấp', 'critical', 'var(--bad)'], orange: ['Cao', 'bad', 'var(--accent)'], yellow: ['Theo dõi', 'warn', 'var(--warn)'] };

const staffLoginUrl = () => (window.self !== window.top || /[?&]mobile/.test(location.search) || isNativeApp() ? 'index.html?mobile=1&switch=1' : 'staff.html');

// ---------------------------------------------------------------------------
async function boot() {
  root.innerHTML = '<div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:24px;text-align:center"><img src="assets/school_logo.png" alt="Trường THPT Lê Hoàn" style="width:96px;height:96px;object-fit:contain;border-radius:50%;background:#fff;padding:6px;box-shadow:0 12px 32px rgba(23,71,201,.28)"><div style="font-weight:700;font-size:16px">Trường THPT Lê Hoàn</div><div class="skel" style="width:180px;height:8px;border-radius:99px"></div></div>';
  await detect();
  if (!session.token) {
    setPortal('admin');
    if (session.token) {
      const tok = session.token;
      setPortal('staff');
      session.set(tok, true);
    } else {
      setPortal('staff');
      return (location.href = staffLoginUrl());
    }
  }
  try {
    const [{ user }, settings, meta] = await Promise.all([api.get('api/auth/me'), api.get('api/settings/public'), api.get('api/admin/meta')]);
    if (user.role === 'student') return (location.href = 'app.html');
    Object.assign(S, { user, settings, meta });
    document.title = `${user.role === 'admin' ? 'Cổng Quản Trị' : 'Cổng Giáo Viên'} · ${settings?.schoolName || 'Trường THPT Lê Hoàn'}`;
  } catch { session.clear(); return (location.href = staffLoginUrl()); }
  shell();
  live.connect();
  live.on('alert', (a) => { toast(`Cảnh báo ${LEVEL[a.level]?.[0] || ''}: ${a.title}`, a.level === 'yellow' ? 'warn' : 'bad', 6000); refreshCounts(0); });
  live.on('report:new', (r) => { toast(`Tố giác mới ${r.id}: ${r.typeName}`, 'warn', 5000); refreshCounts(0); });
  live.on('counseling:message', ({ counselorId, message, alias }) => {
    if (message && !message.recalled && message.from === 'student' && (isAdmin() || !counselorId || counselorId === S.user.id)) {
      toast(`💗 Tư vấn tâm lý · ${alias || 'Học sinh'}: ${(message.text || '📎 Đã gửi tệp đính kèm').slice(0, 80)}`, 'info', 4200);
    }
    refreshCounts(0);
  });
  live.on('counseling:reply', () => refreshCounts(100));
  live.on('teacher-chat:message', ({ message, teacherId }) => {
    if (message && !message.recalled && message.from === 'student' && (isAdmin() || !teacherId || teacherId === S.user.id)) {
      toast(`✉️ Tin nhắn học sinh: ${(message.text || '📎 Đã gửi tệp đính kèm').slice(0, 80)}`, 'info', 4200);
    }
    refreshCounts(0);
  });
  live.on('school-chat:message', (m) => {
    if (m.userId !== S.user.id) {
      toast(`💬 Chat chung · ${m.name || 'Học sinh'}: ${(m.text || '📎 Đã gửi tệp đính kèm').slice(0, 80)}`, 'info', 4000);
      refreshCounts(0);
    }
  });
  live.on('notification', (n) => {
    if (n?.title && n.type !== 'counseling' && n.type !== 'report') {
      toast(n.title + (n.content ? ' · ' + n.content.slice(0, 70) : ''), n.type === 'warning' || n.type === 'urgent' ? 'warn' : 'info', 4200);
    }
    refreshCounts(0);
  });
  // Đồng bộ lại khi có mạng trở lại hoặc quay lại app / tab sau một lúc
  const safe = () => { const a = document.activeElement; return !(a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && a.value) && !document.querySelector('.backdrop, .lightbox, .attach-strip:not([hidden])'); };
  const resync = () => { refreshCounts(0); if (safe()) render(); };
  live.on('sync', () => { toast('Đã đồng bộ dữ liệu mới.', 'info'); resync(); });
  live.on('connection', ({ online }) => { if (online && S.wasOffline) resync(); S.wasOffline = !online; });
  let hiddenAt = 0;
  document.addEventListener('visibilitychange', () => { if (document.hidden) hiddenAt = Date.now(); else if (hiddenAt && Date.now() - hiddenAt > 15000) resync(); });
  live.on('data:changed', () => refreshCounts(300));
  live.on('profile:update', ({ user }) => {
    if (user && user.id === S.user.id) { S.user = { ...S.user, ...user }; shell(); }
    if (safe()) render();
  });
  live.on('connection', ({ online }) => { const b = $('#liveBadge'); if (b) { b.className = `badge ${online ? 'ok' : 'warn'}`; b.innerHTML = `<span class="pulse"></span>${online ? 'Realtime' : 'Đang kết nối lại…'}`; } });
  addEventListener('auth:expired', (e) => {
    toast(e?.detail?.idle ? 'Đã tự động đăng xuất sau 5 phút không hoạt động.' : 'Phiên đăng nhập đã hết hạn.', 'warn');
    setTimeout(() => (location.href = staffLoginUrl()), 900);
  });
  addEventListener('hashchange', render);
  refreshCounts();
  render();
}

function openStaffAvatarEditor() {
  editAvatarModal(S.user, async (data) => {
    const r = await api.put('api/profile', { avatar: data });
    S.user = r.user;
    toast(data ? 'Đã cập nhật ảnh đại diện.' : 'Đã xóa ảnh đại diện.', 'ok');
    shell();
    render();
  });
}

function bindStaffAvatarCam(btn) {
  if (!btn) return;
  btn.onclick = (e) => {
    e.stopPropagation();
    const camHit = e.target.closest('.m-user-cam, .top-av-cam');
    if (btn.classList.contains('show-cam') || camHit) {
      btn.classList.remove('show-cam');
      openStaffAvatarEditor();
    } else {
      $$('.show-cam').forEach(el => el.classList.remove('show-cam'));
      btn.classList.add('show-cam');
    }
  };
}
document.addEventListener('click', (e) => {
  if (!e.target.closest('.m-user-av, .top-av-btn')) $$('.show-cam').forEach(el => el.classList.remove('show-cam'));
});

const getDefaultPage = () => (isAdmin() ? 'dashboard' : canCounsel() ? 'counseling' : 'teacher-chat');

function shell() {
  const u = S.user, s = S.settings, nav = getNav(), all = getAll(), homePage = getDefaultPage();
  root.innerHTML = `
  <div class="shell">
    <aside class="sidebar dark">
      <a class="brand" href="#${homePage}"><img src="${esc(s.logo)}" alt=""><div><b>${esc(s.schoolName || s.shortName)}</b><span>${isAdmin() ? 'Cổng Quản Trị' : 'Cổng Giáo Viên'}</span></div></a>
      <div class="card soft row nowrap" style="padding:10px 12px;gap:10px;background:#11204a;border-color:#1a2b57;box-shadow:none;width:100%;text-align:left"><button type="button" id="staffAvCard" class="m-user-av" title="Nhấp để hiện máy ảnh đổi ảnh đại diện">${avatar(u)}<span class="m-user-cam">${icon('camera')}</span></button><div class="grow" style="min-width:0"><b class="small truncate" style="display:block;color:#fff">${esc(u.name)}</b><span class="xs truncate" style="display:block;color:#8a9bc6">${esc(u.title || (isAdmin() ? 'Quản trị viên' : 'Giáo viên'))}</span></div></div>
      ${nav.map(g => `<div class="nav-label eyebrow">${g.group}</div><nav class="nav">${g.items.map(it => `<a href="#${it.id}" data-nav="${it.id}">${icon(it.icon)}<span>${it.label}</span>${it.count ? `<span class="count" data-count="${it.count}" hidden></span>` : ''}</a>`).join('')}</nav>`).join('')}
      <div class="sidebar-foot">
        <div class="row nowrap"><button class="btn sm grow" id="themeBtn" style="background:#11204a;color:#c3cfee">${icon('moon')}</button><button class="btn sm grow" id="logoutBtn" style="background:#3a1d26;color:#ffb3b3">${icon('logout')} Đăng xuất</button></div>
      </div>
    </aside>
    <div class="main">
      <header class="mobilebar"><img src="${esc(s.logo)}" alt=""><div class="grow"><b>${esc(s.schoolName || s.shortName)}</b><span>${isAdmin() ? 'Cổng Quản Trị' : 'Cổng Giáo Viên'}</span></div><button class="icon-btn" id="mMenu" aria-label="Menu">${icon('menu')}</button></header>
      <header class="topbar desktop-only">
        <div class="title" id="ptitle">${isAdmin() ? 'Bảng điều khiển' : canCounsel() ? 'Tư vấn tâm lý' : 'Chat với học sinh'}</div><div class="spacer"></div>
        ${isAdmin() ? `<button class="btn soft sm" id="qNotify">${icon('megaphone')} Gửi thông báo</button><button class="btn danger sm" id="qRecord">${icon('gavel')} Lập biên bản</button><a class="icon-btn" href="#ai" aria-label="Cảnh báo">${icon('bell')}<span class="dot" data-dot hidden></span></a>` : ''}
        <button type="button" id="topStaffAv" class="m-user-av" title="Nhấp để hiện máy ảnh đổi ảnh đại diện">${avatar(u)}<span class="m-user-cam">${icon('camera')}</span></button>
      </header>
      <main id="view" class="page" tabindex="-1"></main>
    </div>
  </div>
  ${getMode() === 'demo' ? '<div class="demo-ribbon"><i></i>Bản xem trước</div>' : ''}`;
  $('#themeBtn').onclick = toggleTheme;
  $('#logoutBtn').onclick = logout;
  bindStaffAvatarCam($('#staffAvCard'));
  bindStaffAvatarCam($('#topStaffAv'));
  if ($('#qSync')) $('#qSync').onclick = (e) => syncAll(e.currentTarget);
  if ($('#qNotify')) $('#qNotify').onclick = () => broadcastModal();
  if ($('#qRecord')) $('#qRecord').onclick = () => recordModal();
  $('#mMenu').onclick = () => modal({ title: isAdmin() ? 'Chức năng quản trị' : 'Chức năng giáo viên', body: `<div class="list">${all.map(it => `<a class="item click" href="#${it.id}" data-close style="color:inherit;text-decoration:none">${icon(it.icon)}<span class="grow">${it.label}</span>${icon('chevronRight')}</a>`).join('')}<button class="item click" id="mLogout" style="border:0;background:none;width:100%;text-align:left;color:var(--bad)">${icon('logout')}<span class="grow">Đăng xuất</span></button></div>`, onMount: (m, close) => { $$('a.item', m).forEach(a => a.addEventListener('click', () => close())); $('#mLogout', m).onclick = () => { close(); logout(); }; } });
  addEventListener('scroll', () => $('.topbar')?.classList.toggle('scrolled', scrollY > 4), { passive: true });
}

async function logout() {
  if (!await confirmDialog({ title: 'Đăng xuất', message: `Đăng xuất khỏi ${isAdmin() ? 'Cổng Quản Trị' : 'Cổng Giáo Viên'}?`, ok: 'Đăng xuất', tone: 'danger' })) return;
  const loginTarget = staffLoginUrl();
  try { await api.post('api/auth/logout'); } catch { /* bỏ qua */ }
  session.clear(); location.href = loginTarget;
}
async function syncAll(btn) { await withBusy(btn, async () => { try { const r = await api.post('api/admin/sync'); toast(r.message, 'ok'); render(); } catch (e) { showError(e); } }); }
// Chấm đỏ trên menu: tố giác chờ, cảnh báo, tin nhắn tư vấn / chat chưa đọc
let countTimer = 0;
function refreshCounts(delay = 0) { clearTimeout(countTimer); countTimer = setTimeout(loadCounts, delay); }
async function loadCounts() {
  try {
    const defaultPage = getDefaultPage();
    const page = (location.hash || '#' + defaultPage).slice(1).split('/')[0];
    if (page === 'chatmod') await api.post('api/me/seen', { key: 'schoolChat' });
    const [d, b] = await Promise.all([api.get('api/admin/dashboard'), api.get('api/me/badges')]);
    const fmt = (n) => (n > 99 ? '99+' : n ? String(n) : '');
    const set = (k, v) => $$(`[data-count="${k}"]`).forEach(el => { const was = +el.textContent || 0; el.hidden = !v; el.textContent = fmt(v); if (S.countsReady && v > was) { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); } });
    S.badges = b;
    set('reports', d.stats.reportsPending); set('alerts', d.stats.alertsOpen); set('counsel', b.counseling); set('teacherchat', b.teacherChat); set('chatmod', b.schoolChat); set('unlock', d.stats.unlockRequests);
    $$('[data-dot]').forEach(x => x.hidden = !d.stats.alertsOpen);
    S.countsReady = true;
  } catch { /* bỏ qua */ }
}

async function render() {
  S.cleanups.forEach(f => { try { f(); } catch { /* bỏ qua */ } }); S.cleanups = [];
  const all = getAll();
  const defaultPage = getDefaultPage();
  let page = (location.hash || '#' + defaultPage).slice(1);
  if (!PAGES[page] || !all.some(i => i.id === page)) page = defaultPage;
  $$('[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === page));
  const it = all.find(i => i.id === page);
  $('#ptitle') && ($('#ptitle').textContent = it?.label || '');
  document.title = `${it?.label || (isAdmin() ? 'Quản trị' : 'Giáo viên')} · Cổng Giáo Viên`;
  const view = $('#view'); view.innerHTML = skeleton(3); scrollTo({ top: 0 });
  view.style.animation = 'none'; void view.offsetWidth; view.style.animation = '';
  try { await PAGES[page](view); } catch (e) { console.error(e); view.innerHTML = empty('Không tải được trang', esc(e.message), 'alertCircle', '<button class="btn" onclick="location.reload()">Tải lại</button>'); }
  if (page === 'chatmod') refreshCounts(300);
}

// ---------- Biểu mẫu động ----------
function fieldHtml(f) {
  const id = 'f_' + f.name, v = f.value ?? '';
  const opts = (f.options || []).map(o => typeof o === 'string' ? { value: o, label: o } : o);
  let input;
  if (f.type === 'select') input = `<select id="${id}" name="${f.name}" ${f.required ? 'required' : ''}>${opts.map(o => `<option value="${esc(o.value)}" ${String(o.value) === String(v) ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}</select>`;
  else if (f.type === 'textarea') input = `<textarea id="${id}" name="${f.name}" rows="${f.rows || 4}" ${f.required ? 'required' : ''} placeholder="${esc(f.placeholder || '')}" maxlength="${f.max || 20000}">${esc(v)}</textarea>`;
  else if (f.type === 'switch') return `<label class="switch" style="${f.full ? 'grid-column:1/-1' : ''}"><input type="checkbox" name="${f.name}" ${v ? 'checked' : ''}><span class="track"></span><span class="small">${esc(f.label)}</span></label>`;
  else if (f.type === 'image') input = `<div class="row nowrap" style="gap:10px;flex-wrap:wrap"><div class="thumb" style="width:72px;height:72px;${f.name === 'avatar' ? 'border-radius:50%' : ''}" id="${id}_pv">${v ? `<img src="${esc(v)}" alt="">` : ''}</div><label class="btn ghost sm">${icon('upload')} Chọn ảnh<input type="file" accept="image/*" data-image="${f.name}" hidden></label>${f.name === 'avatar' ? `<button type="button" class="btn soft sm" data-crop-image="${f.name}">${icon('camera')} Căn chỉnh ảnh</button>` : ''}<button type="button" class="btn ghost sm" data-clr-image="${f.name}" style="color:var(--bad)" ${v ? '' : 'hidden'}>${icon('trash')} Xóa ảnh</button><input type="hidden" name="${f.name}" id="${id}" value="${esc(v)}"></div>`;
  else input = `<input id="${id}" name="${f.name}" type="${f.type || 'text'}" value="${esc(v)}" ${f.required ? 'required' : ''} ${f.min !== undefined ? `min="${f.min}"` : ''} ${f.max !== undefined && f.type === 'number' ? `max="${f.max}"` : ''} ${f.step ? `step="${f.step}"` : ''} placeholder="${esc(f.placeholder || '')}" ${f.list ? `list="${id}_l"` : ''}>${f.list ? `<datalist id="${id}_l">${f.list.map(o => `<option value="${esc(o.value)}">${esc(o.label)}</option>`).join('')}</datalist>` : ''}`;
  return `<div class="field" style="${f.full ? 'grid-column:1/-1' : ''}"><label for="${id}">${esc(f.label)}${f.required ? ' <span style="color:var(--bad)">*</span>' : ''}</label>${input}${f.hint ? `<span class="hint">${f.hint}</span>` : ''}</div>`;
}
function formModal({ title, sub = '', fields, submit = 'Lưu', size = '', onSubmit, extra = '' }) {
  return modal({ title, sub, size, body: `<form id="fm" class="field-row" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))" novalidate>${fields.map(fieldHtml).join('')}</form>${extra}`,
    foot: `<button class="btn ghost" data-close>Hủy</button><button class="btn" id="fmGo">${icon('check')} ${submit}</button>`,
    onMount: (m, close) => {
      $$('[data-image]', m).forEach(inp => inp.onchange = async () => { const f = inp.files[0]; if (!f) return; try { const d = await compressImage(f, 1280, .82); const k = inp.dataset.image; $(`#f_${k}`, m).value = d; $(`#f_${k}_pv`, m).innerHTML = `<img src="${d}" alt="">`; const cb = $(`[data-clr-image="${k}"]`, m); if (cb) cb.hidden = false; } catch (e) { showError(e); } });
      $$('[data-clr-image]', m).forEach(btn => btn.onclick = () => { const k = btn.dataset.clrImage; $(`#f_${k}`, m).value = ''; $(`#f_${k}_pv`, m).innerHTML = ''; const fi = $(`[data-image="${k}"]`, m); if (fi) fi.value = ''; btn.hidden = true; });
      $$('[data-crop-image]', m).forEach(btn => btn.onclick = () => {
        const k = btn.dataset.cropImage;
        const cur = $(`#f_${k}`, m).value;
        const nm = $('#f_name', m)?.value || title;
        editAvatarModal({ name: nm, avatar: cur }, async (data) => {
          $(`#f_${k}`, m).value = data || '';
          $(`#f_${k}_pv`, m).innerHTML = data ? `<img src="${data}" alt="">` : '';
          const cb = $(`[data-clr-image="${k}"]`, m); if (cb) cb.hidden = !data;
        });
      });
      const go2 = () => withBusy($('#fmGo', m), async () => { const form = $('#fm', m); const data = formData(form); for (const f of fields) if (f.required && f.type !== 'switch' && !String(data[f.name] ?? '').trim()) { toast(`Vui lòng nhập ${f.label.toLowerCase()}.`, 'warn'); return; } try { await onSubmit(data, close, m); } catch (e) { showError(e); } });
      $('#fmGo', m).onclick = go2;
      $('#fm', m).onsubmit = (e) => { e.preventDefault(); go2(); };
    } });
}
const studentList = async () => (await api.get('api/admin/users?role=student&limit=1000')).items;

function recordModal(prefill = {}) {
  studentList().then(st => formModal({
    title: 'Lập biên bản vi phạm', sub: 'Giám thị / GVCN lập biên bản học sinh vi phạm nội quy trong và ngoài trường', size: 'wide', submit: 'Lập biên bản',
    fields: [
      { name: 'studentId', label: 'Học sinh', type: 'select', required: true, value: prefill.studentId, options: [{ value: '', label: '— Chọn học sinh —' }, ...st.map(s => ({ value: s.id, label: `${s.name} · ${s.className} · ${s.id}` }))] },
      { name: 'type', label: 'Loại lỗi', type: 'select', options: Object.entries(S.meta.recordTypes).map(([value, label]) => ({ value, label })), value: prefill.type },
      { name: 'location', label: 'Địa điểm', required: true, value: prefill.location || '', placeholder: 'Cổng chính, sân sau, lớp 12A1…' },
      { name: 'at', label: 'Thời gian', type: 'datetime-local', value: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) },
      { name: 'penalty', label: 'Hình thức xử lý', type: 'select', options: S.meta.penalties },
      { name: 'points', label: 'Trừ điểm rèn luyện', type: 'number', value: 0, min: 0, max: 50 },
      { name: 'description', label: 'Nội dung vi phạm', type: 'textarea', required: true, full: true, value: prefill.description || '', placeholder: 'Mô tả sự việc, thái độ của học sinh, cam kết…' },
      { name: 'photo', label: 'Ảnh biên bản giấy / hiện trường', type: 'image', full: true },
    ],
    onSubmit: async (d, close) => { const r = await api.post('api/admin/records', { ...d, reportId: prefill.reportId || '' }); toast(r.message, 'ok'); close(); if ((location.hash || '').includes('reports')) render(); },
  }));
}
function broadcastModal() {
  formModal({ title: 'Phát thông báo', sub: 'Thông báo hiện ngay trên ứng dụng của người nhận (realtime)', submit: 'Phát thông báo',
    fields: [
      { name: 'target', label: 'Gửi tới', type: 'select', options: [{ value: 'all', label: 'Toàn trường' }, { value: 'students', label: 'Tất cả học sinh' }, { value: 'staff', label: 'Giáo viên & cán bộ' }, ...S.meta.classes.map(c => ({ value: 'class:' + c.id, label: `Lớp ${c.id}` }))] },
      { name: 'type', label: 'Loại', type: 'select', options: [{ value: 'info', label: 'Thông tin' }, { value: 'academic', label: 'Học vụ' }, { value: 'event', label: 'Sự kiện' }, { value: 'warning', label: 'Nhắc nhở' }, { value: 'urgent', label: 'Khẩn cấp' }] },
      { name: 'title', label: 'Tiêu đề', required: true, full: true, placeholder: 'Ví dụ: Lịch nghỉ học ngày 20/11' },
      { name: 'content', label: 'Nội dung', type: 'textarea', required: true, full: true },
    ],
    onSubmit: async (d, close) => { const r = await api.post('api/admin/notifications', d); toast(r.message, 'ok'); close(); if ((location.hash || '').includes('broadcast')) render(); } });
}

// Dùng chung cho 2 trang "Tư vấn tâm lý" và "Chat với giáo viên" — hai hộp thư tách riêng,
// cùng giao diện danh sách hội thoại + khung chat, chỉ khác nguồn dữ liệu (api/admin/counseling
// hay api/teacher-chat/threads) và cách hiển thị từng loại hội thoại.
async function threadsInbox(view, tab) {
  let current = null;
  const delThread = async (id, label = '') => {
    if (!await confirmDialog({ title: 'Xóa cuộc trò chuyện', message: `Xóa cuộc trò chuyện${label ? ` với <b>${esc(label)}</b>` : ''} khỏi danh sách?`, ok: 'Xóa', tone: 'danger' })) return;
    try {
      await api.del(tab === 'counsel' ? `api/admin/counseling/${id}` : `api/teacher-chat/threads/${id}`);
      if (current === id) { current = null; $('#cl')?.classList.remove('show-chat'); }
      toast('Đã xóa cuộc trò chuyện.', 'ok');
      refreshCounts();
      await draw();
    } catch (e) { showError(e); }
  };
  const draw = async () => {
    const list = tab === 'counsel' ? (await api.get('api/admin/counseling')).items : (await api.get('api/teacher-chat/threads')).items;
    view.innerHTML = (tab === 'counsel'
      ? head('Tư vấn tâm lý', 'Phản hồi học sinh theo thời gian thực. Đánh dấu các trường hợp cần gặp trực tiếp để can thiệp kịp thời.')
      : head('Chat với giáo viên', 'Tin nhắn học sinh gửi tới GVCN, giáo viên bộ môn và tổ tư vấn: hỏi bài, xin nghỉ phép, nhờ hỗ trợ.')) + `
      <section class="card chat-layout ${!list.length && !current ? 'is-empty' : ''}" id="cl"><div class="threads"><div class="threads-head"><span class="xs muted strong">${list.length ? `${list.length} cuộc trò chuyện` : 'Danh sách trò chuyện'}</span></div>${list.length ? `<div class="list">${list.map(t => tab === 'counsel'
        ? `<div class="item click ${current === t.id ? 'active' : ''}" data-t="${t.id}">${!t.anonymous && t.student ? avatar(t.student) : `<span class="avatar sq" style="background:${t.anonymous ? 'var(--violet)' : 'var(--brand)'}">${icon(t.anonymous ? 'eyeOff' : 'user')}</span>`}<div class="grow" style="min-width:0"><div class="row between nowrap" style="gap:6px"><b class="small truncate">${esc(t.alias)}</b><span class="xs muted nowrap">${ago(t.updatedAt)}</span></div><div class="xs muted truncate">Gửi tới ${esc(t.counselor?.name || 'chuyên viên')}</div><div class="xs truncate ink2" style="margin-top:2px">${t.last?.recalled && !t.last?.text ? '<i>Tin nhắn đã thu hồi</i>' : esc(t.last?.text || (t.last?.attachments?.length ? '📎 Tệp đính kèm' : ''))}</div><div class="row" style="gap:4px;margin-top:2px">${t.flagged ? badge('Cần gặp trực tiếp', 'bad') : ''}${t.status === 'closed' ? badge('Đã đóng') : ''}</div></div>${t.unreadStaff ? `<span class="count-pill">${t.unreadStaff}</span>` : ''}<button class="btn icon ghost sm" data-del-t="${t.id}" data-del-name="${esc(t.alias)}" style="color:var(--bad)" aria-label="Xóa cuộc trò chuyện" title="Xóa cuộc trò chuyện">${icon('trash')}</button></div>`
        : `<div class="item click ${current === t.id ? 'active' : ''}" data-t="${t.id}">${t.anonymous ? `<span class="avatar sq" style="background:var(--violet)">${icon('eyeOff')}</span>` : avatar(t.student)}<div class="grow" style="min-width:0"><div class="row between nowrap" style="gap:6px"><b class="small truncate">${esc(t.student?.name)}</b><span class="xs muted nowrap">${t.last ? ago(t.last.at) : ''}</span></div><div class="xs muted truncate">${esc(t.student?.className)} · với ${esc(t.teacher?.name)}</div><div class="xs truncate ink2" style="margin-top:2px">${t.last?.recalled && !t.last?.text ? '<i>Tin nhắn đã thu hồi</i>' : esc(t.last?.text || (t.last?.attachments?.length ? '📎 Tệp đính kèm' : ''))}</div></div>${t.unread ? `<span class="count-pill">${t.unread}</span>` : ''}${(isAdmin() || t.teacherId === S.user.id) ? `<button class="btn icon ghost sm" data-del-t="${t.id}" data-del-name="${esc(t.student?.name || '')}" style="color:var(--bad)" aria-label="Xóa cuộc trò chuyện" title="Xóa cuộc trò chuyện">${icon('trash')}</button>` : ''}</div>`).join('')}</div>` : empty('Chưa có cuộc trò chuyện', 'Khi học sinh nhắn tin, cuộc trò chuyện sẽ hiển thị tại đây.', 'chat')}</div><div class="chat" id="cp"></div></section>`;
    $$('[data-t]', view).forEach(el => el.onclick = () => { current = el.dataset.t; openT(); });
    $$('[data-del-t]', view).forEach(b => b.onclick = (e) => { e.stopPropagation(); delThread(b.dataset.delT, b.dataset.delName); });
    if (current) openT(); else $('#cp').innerHTML = empty('Chọn một cuộc trò chuyện', 'Tin nhắn sẽ hiển thị tại đây.', 'chat');
  };
  const openT = async () => {
    refreshCounts(500);
    $$('[data-t]', view).forEach(el => el.classList.toggle('active', el.dataset.t === current));
    $('#cl').classList.add('show-chat');
    const cp = $('#cp');
    if (tab === 'counsel') {
      const { item: t } = await api.get(`api/admin/counseling/${current}`);
      cp.innerHTML = `<div class="chat-head"><button class="btn icon ghost sm back-btn" id="back">${icon('arrowLeft')}</button>${!t.anonymous && t.student ? avatar(t.student) : `<span class="avatar sq" style="background:${t.anonymous ? 'var(--violet)' : 'var(--brand)'}">${icon(t.anonymous ? 'eyeOff' : 'user')}</span>`}<div class="grow" style="min-width:0"><b class="truncate">${esc(t.alias)}</b><div class="xs muted truncate">Gửi tới ${esc(t.counselor?.name || 'chuyên viên')} · ${t.messages.length} tin nhắn</div></div><label class="switch" title="Đánh dấu cần gặp trực tiếp"><input type="checkbox" id="flag" ${t.flagged ? 'checked' : ''}><span class="track"></span><span class="xs">Gặp trực tiếp</span></label><button class="btn icon ghost sm" id="delThread" style="color:var(--bad)" title="Xóa cuộc trò chuyện">${icon('trash')}</button></div>
        <div class="chat-body" id="cb">${t.messages.map(m => `<div class="msg ${m.from !== 'student' ? 'me' : ''}"><div><div class="who">${m.from === 'student' ? esc(t.alias) : esc(m.name || 'Chuyên viên')}${m.guard ? badge('AI Guard: ' + m.guard.categories[0], LEVEL[m.guard.level][1]) : ''}</div>${sbubble(m)}<div class="time">${fmtDateTime(m.at)}${recallLink(m, m.from === 'counselor' && (m.byId ? m.byId === S.user.id : m.name === S.user.name))}</div></div></div>`).join('')}</div>
        <form class="chat-input" id="cf"><textarea id="ct" rows="1" placeholder="Phản hồi học sinh…"></textarea><button class="btn icon">${icon('send')}</button></form>`;
      $('#flag').onchange = async (e) => { await api.patch(`api/admin/counseling/${t.id}`, { flagged: e.target.checked }); toast(e.target.checked ? 'Đã đánh dấu cần gặp trực tiếp.' : 'Đã bỏ đánh dấu.', 'ok'); };
      $('#delThread').onclick = () => delThread(t.id, t.alias);
      bindSend(async (b) => { await api.post(`api/admin/counseling/${t.id}/messages`, b); });
      $('#cb').onclick = async (e) => { const b = e.target.closest('[data-recall]'); if (b && await askRecall(`api/admin/counseling/${t.id}/messages/${b.dataset.recall}/recall`)) openT(); };
    } else {
      const { item: t } = await api.get(`api/teacher-chat/threads/${current}`);
      const mine = t.teacherId === S.user.id;
      cp.innerHTML = `<div class="chat-head"><button class="btn icon ghost sm back-btn" id="back">${icon('arrowLeft')}</button>${t.anonymous ? `<span class="avatar sq" style="background:var(--violet)">${icon('eyeOff')}</span>` : avatar(t.student)}<div class="grow" style="min-width:0"><b class="truncate">${esc(t.student.name)}</b><div class="xs muted truncate">${esc(t.student.className)} · với ${esc(t.teacher.name)}</div></div>${t.anonymous ? badge('Ẩn danh', 'violet') : ''}${(isAdmin() || mine) ? `<button class="btn icon ghost sm" id="delThread" style="color:var(--bad)" title="Xóa cuộc trò chuyện">${icon('trash')}</button>` : ''}</div>
        <div class="chat-body" id="cb">${t.messages.map(m => `<div class="msg ${m.from === 'teacher' ? 'me' : ''}"><div><div class="bubble">${m.kind === 'leave' ? `<div class="leave-card"><b>${icon('file')} Đơn xin nghỉ học</b><div class="small">Ngày ${esc(m.leave.date.split('-').reverse().join('/'))} · ${esc(m.leave.session)}</div><div class="small">Lý do: ${esc(m.text)}</div><div class="row" style="gap:6px;margin-top:8px">${m.leave.status === 'pending' && mine ? `<button class="btn ok sm" data-leave="${m.id}" data-ok="1">Duyệt</button><button class="btn danger soft sm" data-leave="${m.id}" data-ok="0">Từ chối</button>` : badge({ pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Không duyệt' }[m.leave.status], { pending: 'warn', approved: 'ok', rejected: 'bad' }[m.leave.status])}</div></div>${m.recalled ? recallTag(m) : ''}` : '§'}</div><div class="time">${fmtDateTime(m.at)}${recallLink(m, mine && m.from === 'teacher')}</div></div></div>`.replace('<div class="bubble">§</div>', () => sbubble(m)).replace('<div class="bubble">', `<div class="bubble ${m.kind === 'leave' && m.recalled ? 'was-recalled' : ''}">`)).join('')}</div>
        ${mine ? `<form class="chat-input" id="cf"><textarea id="ct" rows="1" placeholder="Trả lời học sinh…"></textarea><button class="btn icon">${icon('send')}</button></form>` : '<div class="small muted" style="padding:12px 16px;border-top:1px solid var(--line)">Bạn đang xem với quyền quản trị (chỉ đọc).</div>'}`;
      if ($('#delThread')) $('#delThread').onclick = () => delThread(t.id, t.student?.name || '');
      $$('[data-leave]', cp).forEach(b => b.onclick = async () => { await api.post(`api/teacher-chat/threads/${t.id}/messages`, { kind: 'leave-reply', messageId: b.dataset.leave, approve: b.dataset.ok === '1' }); toast('Đã phản hồi đơn xin nghỉ.', 'ok'); openT(); });
      if (mine) bindSend(async (b) => { await api.post(`api/teacher-chat/threads/${t.id}/messages`, b); });
      $('#cb').onclick = async (e) => { const b = e.target.closest('[data-recall]'); if (b && await askRecall(`api/teacher-chat/threads/${t.id}/messages/${b.dataset.recall}/recall`)) openT(); };
    }
    const cb = $('#cb'); cb.scrollTop = cb.scrollHeight;
    $('#back').onclick = () => $('#cl').classList.remove('show-chat');
    refreshCounts();
  };
  const bindSend = (fn) => {
    $$('[data-q]', view).forEach(b => b.onclick = () => { $('#ct').value = b.dataset.q; $('#ct').focus(); });
    $('#ct').addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#cf').requestSubmit(); } });
    const comp = attachComposer($('#cf'));
    $('#cf').onsubmit = async (e) => {
      e.preventDefault(); const text = $('#ct').value.trim(); if (!text && !comp.has()) return; $('#ct').value = '';
      const btn = $('#cf button.btn.icon:not(.attach-btn)'); btn && (btn.disabled = true);
      try { const attachments = comp.has() ? await comp.upload(api.upload) : []; await fn({ text, attachments }); comp.clear(); draw(); } catch (er) { showError(er); if (text) $('#ct').value = text; } finally { btn && (btn.disabled = false); }
    };
  };
  const refreshLive = async (threadId) => {
    const draft = $('#ct')?.value || '';
    const hadFocus = document.activeElement?.id === 'ct';
    await draw();
    if (current === threadId && draft && $('#ct')) $('#ct').value = draft;
    if (hadFocus && $('#ct')) $('#ct').focus();
  };
  await draw();
  S.cleanups.push(live.on('counseling:message', ({ threadId, counselorId }) => { if (tab === 'counsel' && (isAdmin() || !counselorId || counselorId === S.user.id)) refreshLive(threadId); }));
  S.cleanups.push(live.on('counseling:reply', ({ threadId, counselorId }) => { if (tab === 'counsel' && (isAdmin() || !counselorId || counselorId === S.user.id)) refreshLive(threadId); }));
  S.cleanups.push(live.on('teacher-chat:message', ({ threadId }) => { if (tab === 'teacher') refreshLive(threadId); }));
}

// =============================================================================
const PAGES = {
  // ---------------------------------------------------------------- Bảng điều khiển
  async dashboard(view) {
    const d = await api.get('api/admin/dashboard');
    const st = d.stats, now = new Date();
    const moodColors = Object.fromEntries(Object.entries(S.meta.moods).map(([k, m]) => [k, m.tone]));
    const moodTotal = Object.values(d.charts.moodWeek).reduce((a, b) => a + b, 0);
    const negative = ['stressed', 'sad', 'anxious', 'exhausted'].reduce((a, k) => a + d.charts.moodWeek[k], 0);
    const sortedByType = [...d.charts.reportsByType].sort((a, b) => b.count - a.count || (b.latestAt || '').localeCompare(a.latestAt || ''));
    const maxType = Math.max(1, ...sortedByType.map(x => x.count));
    view.innerHTML = `
    <section class="hero admin-hero">
      ${drumArt(460, 'drum').replace('class="drum"', 'class="drum" style="right:-120px;top:-150px"')}
      <div class="row between admin-hero-inner" style="align-items:flex-end">
        <div class="stack admin-hero-txt" style="gap:4px"><span class="small muted admin-hero-date">${DAY[now.getDay()]}, ${fmtDate(now)} · ${esc(S.settings.semester)} · ${esc(S.settings.schoolYear)}</span>
          <h1 class="admin-hero-title">${greeting()}, ${esc(S.user.name)}</h1>
          <p class="muted admin-hero-sub">${st.reportsPending ? `Có <b style="color:#fff">${st.reportsPending} tố giác</b> chờ tiếp nhận` : 'Không có tố giác chờ xử lý'}${st.alertsOpen ? ` · <b style="color:#ffd6cc">${st.alertsOpen} cảnh báo AI</b> cần xem` : ''}${st.counselingUnread ? ` · ${st.counselingUnread} tin nhắn tư vấn mới` : ''}.</p></div>
        <div class="row mobile-only admin-hero-btns" style="gap:6px"><button class="btn white" id="dSync">${icon('refresh')} Đồng bộ tất cả</button><button class="btn" style="background:rgba(255,255,255,.14);color:#fff" id="dNotify">${icon('megaphone')} Gửi thông báo</button><button class="btn accent" id="dRecord">${icon('gavel')} Lập biên bản nhanh</button></div>
      </div>
    </section>
    <div class="grid g4 admin-kpi-grid">
      ${[['users', 'var(--brand)', 'Học sinh toàn trường', st.students, `${st.classes} lớp · ${st.teachers} giáo viên`, 'accounts'], ['shieldAlert', 'var(--accent)', 'Tố giác chờ xử lý', st.reportsPending, `${st.reportsOpen} đang mở · ${st.reportsTotal} hồ sơ`, 'reports'], ['siren', 'var(--bad)', 'Cảnh báo AI đang mở', st.alertsOpen, 'Từ AI Guard, tố giác, chat', 'ai'], ['clipboardCheck', 'var(--violet)', 'Phiếu khảo sát', st.surveyResponses, `Mục tiêu ${st.surveyTarget} · ${st.surveyTarget ? Math.round(st.surveyResponses / st.surveyTarget * 100) : 0}%`, 'surveys']].map(([i, c, k, v, dd, link]) => `<a class="card stat hover" href="#${link}" style="--c:${c};color:inherit;text-decoration:none"><div class="k"><span class="si">${icon(i)}</span><span class="k-lbl">${k}</span></div><div class="v">${v}</div><div class="d">${dd}</div></a>`).join('')}
    </div>
    <div class="grid g4 admin-mini-grid">
      ${[['heartHand', '#d6457a', 'Tin nhắn tư vấn', st.counselingUnread, 'counseling'], ['flag', 'var(--bad)', 'Cần gặp trực tiếp', st.counselingFlagged, 'counseling'], ['trophy', 'var(--warn)', 'Thi trắc nghiệm', st.quizPlays, 'quiz'], ['shieldCheck', 'var(--sky)', 'Tra cứu lừa đảo', st.scamChecks, 'ai']].map(([i, c, k, v, link]) => `<a class="card hover row nowrap kpi-mini" href="#${link}" style="--c:${c};color:inherit;text-decoration:none"><span class="avatar sq kpi-mini-ico" style="background:color-mix(in srgb,${c} 14%,var(--surface));color:${c}">${icon(i)}</span><div class="grow kpi-mini-body"><div class="xs muted kpi-mini-lbl">${k}</div><b class="num kpi-mini-val">${v}</b></div>${icon('chevronRight')}</a>`).join('')}
    </div>
    <div class="grid g-main">
      <div class="stack lg">
        <section class="card"><div class="card-head"><div><h2>${icon('chart')} Chỉ số cảm xúc tích cực 7 ngày</h2><div class="sub">Tỷ lệ lượt ghi “Vui vẻ” và “Bình thường” trên tổng lượt học sinh ghi nhận cảm xúc</div></div></div>
          <div class="card-body" id="wbChart"></div></section>
        <div class="grid g2">
          <section class="card"><div class="card-head"><h2>${icon('shieldAlert')} Tố giác theo loại</h2></div><div class="card-body">${sortedByType.map((x, idx) => `<div class="hbar"><span class="small truncate" title="${esc(x.label)}">${idx === 0 && x.count > 0 ? `<b>${esc(x.label)}</b>` : esc(x.label)}</span><div class="meter" style="--c:${idx === 0 && x.count > 0 ? 'var(--bad)' : 'var(--accent)'}"><i style="width:${x.count ? Math.max(6, x.count / maxType * 100) : 0}%"></i></div><b class="small num">${x.count}</b></div>`).join('') || empty('Chưa có dữ liệu')}</div></section>
          <section class="card"><div class="card-head"><div><h2>${icon('smile')} Cảm xúc học sinh tuần qua</h2><div class="sub">${moodTotal ? Math.round(negative / moodTotal * 100) : 0}% lượt ghi nhận tiêu cực</div></div></div><div class="card-body row nowrap" style="gap:16px">${donut(Object.entries(d.charts.moodWeek).map(([k, v]) => ({ label: S.meta.moods[k].label, value: v, color: moodColors[k] })), { size: 140, thickness: 20, center: String(moodTotal), sub: 'lượt ghi' })}<div class="legend" style="flex-direction:column;gap:6px">${Object.entries(d.charts.moodWeek).map(([k, v]) => `<span><i style="background:${moodColors[k]}"></i>${S.meta.moods[k].label} · <b>${v}</b></span>`).join('')}</div></div></section>
        </div>
        <section class="card"><div class="card-head"><h2>${icon('shield')} Tố giác gần đây</h2><a class="btn plain sm" href="#reports">Tất cả ${icon('arrowRight')}</a></div>
          <div class="card-body list">${d.recentReports.map(r => `<div class="item click" data-r="${r.id}" style="align-items:stretch"><span class="sev ${r.severity}"></span><div class="grow stack" style="gap:2px;min-width:0"><div class="row" style="gap:6px"><b class="mono small">${r.id}</b>${badge(r.statusName, TONE[r.status])}${r.anonymous ? badge('Ẩn danh', 'violet') : ''}</div><b class="small">${esc(r.typeName)}</b><span class="xs muted truncate">${icon('pin')} ${esc(r.location)}</span></div><span class="xs muted" style="flex:none;align-self:center">${ago(r.createdAt)}</span></div>`).join('')}</div></section>
      </div>
      <aside class="stack lg">
        <section class="card"><div class="card-head"><h2>${icon('siren')} Cảnh báo cần xử lý</h2><a class="btn plain sm" href="#ai">Xem</a></div><div class="card-body stack" style="gap:10px">${d.alerts.map(a => `<div class="row nowrap" style="gap:10px;align-items:flex-start;padding:10px 12px;border-radius:14px;background:color-mix(in srgb,${LEVEL[a.level][2]} 9%,var(--surface));border:1px solid color-mix(in srgb,${LEVEL[a.level][2]} 25%,transparent)"><span class="sev" style="background:${LEVEL[a.level][2]}"></span><div class="grow"><b class="small">${esc(a.title)}</b><div class="xs muted">${esc(a.name || '')}${a.className ? ' · ' + esc(a.className) : ''} · ${ago(a.at)}</div><p class="xs ink2 clamp-2" style="margin-top:2px">${esc(a.context)}</p></div>${badge(LEVEL[a.level][0], LEVEL[a.level][1])}</div>`).join('') || empty('Không có cảnh báo mở', 'Mọi thứ đang ổn.', 'shieldCheck')}</div></section>
        <section class="card"><div class="card-head"><h2>${icon('crown')} Top trắc nghiệm tuần</h2>${d.leaderboard.length ? `<button class="btn plain sm" id="rstQuizTop" style="color:var(--bad)">${icon('refresh')} Đặt lại</button>` : ''}</div><div class="card-body list">${d.leaderboard.map(l => `<div class="item"><span class="medal m${l.rank}">${l.rank}</span>${avatar({ id: l.userId, name: l.name, avatar: l.avatar }, 'sm')}<div class="grow"><b class="small">${esc(l.name)}</b><div class="xs muted">${esc(l.className)} · ${l.duration}s</div></div><b class="num">${l.score}</b></div>`).join('') || empty('Chưa có lượt thi')}</div></section>
        <section class="card"><div class="card-head"><h2>${icon('history')} Hoạt động gần đây</h2></div><div class="card-body"><div class="timeline">${d.audit.map(a => `<div class="tl done"><b>${esc(a.action)}</b><p class="xs">${esc(a.name)}${a.detail ? ' · ' + esc(a.detail) : ''}</p><time>${ago(a.at)}</time></div>`).join('') || '<span class="small muted">Chưa có hoạt động</span>'}</div></div></section>
      </aside>
    </div>`;
    $('#dSync').onclick = (e) => syncAll(e.currentTarget); $('#dNotify').onclick = () => broadcastModal(); $('#dRecord').onclick = () => recordModal();
    if ($('#rstQuizTop')) $('#rstQuizTop').onclick = async () => { if (!await confirmDialog({ title: 'Đặt lại Top trắc nghiệm', message: 'Xóa toàn bộ kết quả thi trắc nghiệm để đưa Bảng vàng về mặc định trống?', ok: 'Đặt về mặc định', tone: 'danger' })) return; try { await api.del('api/admin/quiz/attempts'); toast('Đã đặt Top trắc nghiệm về mặc định.', 'ok'); PAGES.dashboard(view); } catch (e) { showError(e); } };
    // Biểu đồ vẽ theo đúng bề rộng khung để chữ không bị phóng to trên màn hình rộng
    const chartBox = $('#wbChart', view);
    const drawChart = () => { if (!chartBox.isConnected) return; chartBox.innerHTML = barChart(d.charts.wellbeing7.map(x => ({ label: x.label, value: x.rate, color: x.rate === null ? null : x.rate >= 60 ? 'var(--ok)' : x.rate >= 40 ? 'var(--brand)' : 'var(--warn)' })), { max: 100, unit: '%', height: 220, width: chartBox.clientWidth - 40, format: v => Math.round(v) }); };
    drawChart();
    let rt; const onResize = () => { clearTimeout(rt); rt = setTimeout(drawChart, 120); };
    addEventListener('resize', onResize); S.cleanups.push(() => removeEventListener('resize', onResize));
    S.cleanups.push(live.on('report:new', () => PAGES.dashboard(view)));
    S.cleanups.push(live.on('report:update', () => PAGES.dashboard(view)));
    S.cleanups.push(live.on('counseling:message', () => PAGES.dashboard(view)));
    S.cleanups.push(live.on('counseling:reply', () => PAGES.dashboard(view)));
    S.cleanups.push(live.on('teacher-chat:message', () => PAGES.dashboard(view)));
    S.cleanups.push(live.on('alert', () => PAGES.dashboard(view)));
    $$('[data-r]', view).forEach(tr => tr.onclick = () => reportDetail(tr.dataset.r));
  },

  // ---------------------------------------------------------------- Tài khoản
  async accounts(view) {
    let role = 'student', khoi = '', cls = '', q = '';
    const classSortKey = (c) => { const m = String(c.id).match(/^(\d+)([A-Za-z]*)(\d*)$/); return m ? [Number(m[1]), m[2], Number(m[3] || 0)] : [c.grade || 0, c.id, 0]; };
    const sortClasses = (list) => [...list].sort((a, b) => { const ka = classSortKey(a), kb = classSortKey(b); return ka[0] - kb[0] || (ka[1] < kb[1] ? -1 : ka[1] > kb[1] ? 1 : 0) || ka[2] - kb[2]; });
    const draw = async () => {
      const [r, ur] = await Promise.all([api.get(`api/admin/users?role=${role}&classId=${cls}&grade=${cls ? '' : khoi}&q=${encodeURIComponent(q)}&limit=500`), api.get('api/admin/unlock-requests')]);
      const pending = ur.items.filter(x => x.status === 'pending');
      view.innerHTML = head('Quản lý tài khoản đăng nhập', 'Thêm mới, đặt lại mật khẩu, khóa tài khoản học sinh và giáo viên toàn hệ thống.', `<button class="btn ghost" id="exp">${icon('download')} Xuất Excel</button><button class="btn ghost" id="imp">${icon('upload')} Nhập danh sách</button><button class="btn" id="add">${icon('plus')} Thêm tài khoản</button>`) +
      (pending.length ? `<section class="card"><div class="card-head"><h2>${icon('unlock')} Yêu cầu mở khóa tài khoản <span class="count-pill">${pending.length}</span></h2></div><div class="card-body stack" style="gap:8px">
        ${pending.map(x => `<div class="card soft row nowrap" style="padding:10px 12px;gap:10px"><div class="grow stack" style="gap:2px"><b class="small">${esc(x.userName || x.userId)}</b><span class="xs muted mono">${esc(x.userId)}</span><span class="small ink2">${esc(x.reason || '')}</span><span class="xs muted">Gửi lúc ${fmtDateTime(x.at)}</span></div><div class="row nowrap" style="gap:6px"><button class="btn sm" data-ur-approve="${x.id}">${icon('check')} Mở khóa</button><button class="btn ghost sm" data-ur-deny="${x.id}" style="color:var(--bad)">${icon('x')} Từ chối</button></div></div>`).join('')}
      </div></section>` : '') + `
      <section class="card"><div class="card-body stack">
        <div class="row between"><div class="seg">${[['student', 'Học sinh'], ['teacher', 'Giáo viên'], ['admin', 'Quản trị']].map(([k, l]) => `<button data-role="${k}" class="${role === k ? 'active' : ''}">${l}</button>`).join('')}</div>
          <div class="row">${role === 'student' ? (() => { const grades = [...new Set(S.meta.classes.map(c => c.grade).filter(g => g != null))].sort((a, b) => a - b); const visibleClasses = sortClasses(S.meta.classes.filter(c => !khoi || String(c.grade) === String(khoi))); return `<select class="select" id="khoi" style="width:auto"><option value="">Tất cả khối</option>${grades.map(g => `<option value="${g}" ${String(khoi) === String(g) ? 'selected' : ''}>Khối ${g}</option>`).join('')}</select><select class="select" id="cls" style="width:auto"><option value="">Tất cả lớp</option>${visibleClasses.map(c => `<option value="${esc(c.id)}" ${cls === c.id ? 'selected' : ''}>${esc(c.id)}</option>`).join('')}</select>`; })() : ''}<div class="input-icon" style="min-width:240px">${icon('search')}<input class="input" id="q" placeholder="Tìm theo tên, mã, email…" value="${esc(q)}"></div></div></div>
        <div class="table-wrap"><table class="tbl"><thead><tr><th>Người dùng</th><th>Mã đăng nhập</th><th>${role === 'student' ? 'Lớp' : 'Chức danh'}</th><th>Liên hệ</th>${role === 'student' ? '<th class="c">ĐRL</th>' : ''}<th>Đăng nhập gần nhất</th><th>Trạng thái</th><th class="r">Thao tác</th></tr></thead><tbody>
        ${r.items.map(u => `<tr><td><div class="row nowrap">${avatar(u, 'sm')}<div><b class="small">${esc(u.name)}</b><div class="xs muted">${esc(u.gender || '')} ${u.dob ? '· ' + fmtDate(u.dob) : ''}</div></div></div></td><td class="mono small">${esc(u.id)}</td><td class="small">${esc(role === 'student' ? u.className : u.title || '')}</td><td class="small">${u.email || u.phone ? `${u.email ? `<div class="truncate" style="max-width:210px">${esc(u.email)}</div>` : ''}${u.phone ? `<div class="xs muted">${esc(u.phone)}</div>` : ''}` : '<span class="xs muted">Chưa cập nhật</span>'}</td>${role === 'student' ? `<td class="c num"><b>${u.conduct ?? '—'}</b></td>` : ''}<td class="small muted">${u.lastLogin ? ago(u.lastLogin) : 'Chưa đăng nhập'}</td><td>${u.locked ? badge('Đã khóa', 'bad') : u.profileComplete === false ? badge('Chờ hoàn tất hồ sơ', 'warn') : u.mustChangePassword ? badge('Chờ đổi mật khẩu', 'warn') : badge('Hoạt động', 'ok')}</td>
          <td class="r"><div class="row nowrap" style="justify-content:flex-end;gap:4px"><button class="btn icon ghost sm" data-edit="${u.id}" title="Sửa">${icon('edit')}</button><button class="btn icon ghost sm" data-reset="${u.id}" title="Đặt lại mật khẩu">${icon('key')}</button><button class="btn icon ghost sm" data-lock="${u.id}" data-locked="${u.locked ? 1 : 0}" title="${u.locked ? 'Mở khóa' : 'Khóa'}">${icon(u.locked ? 'unlock' : 'lock')}</button>${isAdmin() ? `<button class="btn icon ghost sm" data-del="${u.id}" title="Xóa" style="color:var(--bad)">${icon('trash')}</button>` : ''}</div></td></tr>`).join('')}
        </tbody></table></div>${r.items.length ? '' : empty('Không có tài khoản phù hợp', '', 'users')}<div class="small muted">${r.total} tài khoản</div>
      </div></section>`;
      $$('[data-role]', view).forEach(b => b.onclick = () => { role = b.dataset.role; khoi = ''; cls = ''; draw(); });
      $('#khoi') && ($('#khoi').onchange = (e) => { khoi = e.target.value; cls = ''; draw(); });
      $('#cls') && ($('#cls').onchange = (e) => { cls = e.target.value; draw(); });
      let t; $('#q').oninput = (e) => { clearTimeout(t); t = setTimeout(() => { q = e.target.value; draw().then(() => { const i = $('#q'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }); }, 300); };
      $('#exp').onclick = () => api.download('api/admin/export/users').catch(showError);
      $('#imp').onclick = () => importModal(draw);
      $('#add').onclick = () => userModal(null, draw);
      $$('[data-edit]', view).forEach(b => b.onclick = () => userModal(r.items.find(u => u.id === b.dataset.edit), draw));
      $$('[data-reset]', view).forEach(b => b.onclick = async () => { if (!await confirmDialog({ title: 'Đặt lại mật khẩu', message: `Đặt mật khẩu của <b>${esc(b.dataset.reset)}</b> về mặc định <span class="mono">123456</span>? Người dùng sẽ được yêu cầu đổi mật khẩu khi đăng nhập.`, ok: 'Đặt lại' })) return; try { const x = await api.post(`api/admin/users/${b.dataset.reset}/reset-password`); toast(x.message, 'ok'); draw(); } catch (e) { showError(e); } });
      $$('[data-lock]', view).forEach(b => b.onclick = async () => { try { await api.post(`api/admin/users/${b.dataset.lock}/lock`, { locked: b.dataset.locked !== '1' }); toast(b.dataset.locked === '1' ? 'Đã mở khóa tài khoản.' : 'Đã khóa tài khoản.', 'ok'); draw(); } catch (e) { showError(e); } });
      $$('[data-del]', view).forEach(b => b.onclick = async () => { if (!await confirmDialog({ title: 'Xóa tài khoản', message: `Xóa vĩnh viễn tài khoản <b>${esc(b.dataset.del)}</b>? Không thể hoàn tác.`, ok: 'Xóa', tone: 'danger' })) return; try { await api.del(`api/admin/users/${b.dataset.del}`); toast('Đã xóa tài khoản.', 'ok'); draw(); } catch (e) { showError(e); } });
      $$('[data-ur-approve]', view).forEach(b => b.onclick = async () => { try { await api.post(`api/admin/unlock-requests/${b.dataset.urApprove}/approve`); toast('Đã mở khóa tài khoản.', 'ok'); refreshCounts(); draw(); } catch (e) { showError(e); } });
      $$('[data-ur-deny]', view).forEach(b => b.onclick = async () => { if (!await confirmDialog({ title: 'Từ chối yêu cầu', message: 'Tài khoản sẽ tiếp tục bị khóa.', ok: 'Từ chối', tone: 'danger' })) return; try { await api.post(`api/admin/unlock-requests/${b.dataset.urDeny}/deny`); toast('Đã từ chối yêu cầu.', 'ok'); refreshCounts(); draw(); } catch (e) { showError(e); } });
    };
    await draw();
  },

  // ---------------------------------------------------------------- Tố giác & biên bản
  async reports(view) {
    let tab = 'reports', status = '', severity = '', q = '';
    const draw = async () => {
      if (tab === 'reports') {
        const r = await api.get(`api/admin/reports?status=${status}&severity=${severity}&q=${encodeURIComponent(q)}`);
        const totalReports = Object.values(r.counts).reduce((a, b) => a + b, 0);
        view.innerHTML = head('Quản lý tố giác & biên bản vi phạm', 'Tiếp nhận, phân loại theo mức độ, cập nhật tiến độ và phản hồi kết quả cho học sinh.', `${totalReports ? `<button class="btn ghost" id="rstR" style="color:var(--bad)">${icon('refresh')} Đặt về mặc định</button>` : ''}<button class="btn ghost" id="exp">${icon('download')} Xuất Excel</button><button class="btn danger" id="rec">${icon('gavel')} Lập biên bản</button>`) + tabs() + `
        <div class="chips"><button class="chip ${!status ? 'active' : ''}" data-s="">Tất cả (${totalReports})</button>${Object.entries(S.meta.reportStatus).map(([k, v]) => `<button class="chip ${status === k ? 'active' : ''}" data-s="${k}">${v.label} (${r.counts[k] || 0})</button>`).join('')}</div>
        <section class="card"><div class="card-body stack">
          <div class="row"><select class="select" id="sev" style="width:auto"><option value="">Mọi mức độ</option>${Object.entries(S.meta.severity).map(([k, v]) => `<option value="${k}" ${severity === k ? 'selected' : ''}>${v.label}</option>`).join('')}</select><div class="input-icon grow" style="max-width:360px">${icon('search')}<input class="input" id="q" placeholder="Tìm mã hồ sơ, địa điểm, nội dung…" value="${esc(q)}"></div></div>
          <div class="stack" style="gap:8px">${r.items.map(x => `<div class="card hover row nowrap" data-r="${x.id}" style="padding:12px 14px;gap:14px;align-items:stretch;box-shadow:none"><span class="sev ${x.severity}"></span>
            <div class="grow stack" style="gap:3px;min-width:0"><div class="row" style="gap:8px"><b class="mono small">${x.id}</b>${badge(x.statusName, TONE[x.status])}${badge(S.meta.severity[x.severity].label, SEV_TONE[x.severity])}${x.anonymous ? badge('Ẩn danh', 'violet') : ''}${x.photos?.length ? `<span class="xs muted">${icon('image')} ${x.photos.length}</span>` : ''}</div><b>${esc(x.typeName)}</b><span class="small muted truncate">${icon('pin')} ${esc(x.location)} · ${esc(x.description)}</span></div>
            <div class="stack" style="align-items:flex-end;gap:4px;flex:none"><span class="xs muted">${ago(x.createdAt)}</span><span class="xs muted">${x.anonymous ? 'Người gửi ẩn danh' : esc(x.reporterName || '')}</span><div class="row nowrap" style="gap:4px"><button type="button" class="btn icon ghost sm" data-del-r="${x.id}" title="Xóa hồ sơ" style="color:var(--bad)">${icon('trash')}</button>${icon('chevronRight')}</div></div></div>`).join('') || empty('Không có hồ sơ phù hợp', '', 'shield')}</div>
        </div></section>`;
        $$('[data-s]', view).forEach(b => b.onclick = () => { status = b.dataset.s; draw(); });
        $('#sev').onchange = (e) => { severity = e.target.value; draw(); };
        let t; $('#q').oninput = (e) => { clearTimeout(t); t = setTimeout(() => { q = e.target.value; draw().then(() => { const i = $('#q'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }); }, 350); };
        $('#exp').onclick = () => api.download('api/admin/export/reports').catch(showError);
        if ($('#rstR')) $('#rstR').onclick = async () => { if (!await confirmDialog({ title: 'Đặt về mặc định', message: 'Xóa toàn bộ hồ sơ tố giác và biên bản vi phạm hiện tại để đưa về trạng thái mặc định trống?', ok: 'Đặt về mặc định', tone: 'danger' })) return; try { await api.post('api/admin/reports/reset'); toast('Đã đặt về mặc định.', 'ok'); refreshCounts(); draw(); } catch (e) { showError(e); } };
        $$('[data-del-r]', view).forEach(b => b.onclick = async (e) => { e.stopPropagation(); if (!await confirmDialog({ title: 'Xóa hồ sơ tố giác', message: `Xóa vĩnh viễn hồ sơ <b>${esc(b.dataset.delR)}</b>?`, ok: 'Xóa hồ sơ', tone: 'danger' })) return; try { await api.del(`api/admin/reports/${encodeURIComponent(b.dataset.delR)}`); toast('Đã xóa hồ sơ tố giác.', 'ok'); refreshCounts(); draw(); } catch (er) { showError(er); } });
        $$('[data-r]', view).forEach(c => c.onclick = () => reportDetail(c.dataset.r, draw));
      } else {
        const r = await api.get(`api/admin/records?q=${encodeURIComponent(q)}`);
        view.innerHTML = head('Quản lý tố giác & biên bản vi phạm', 'Sổ biên bản do giám thị, GVCN lập. Điểm rèn luyện được trừ tự động và hoàn lại khi hủy biên bản.', `${r.items.length ? `<button class="btn ghost" id="rstR" style="color:var(--bad)">${icon('refresh')} Đặt về mặc định</button>` : ''}<button class="btn ghost" id="exp">${icon('download')} Xuất Excel</button><button class="btn danger" id="rec">${icon('gavel')} Lập biên bản</button>`) + tabs() + `
        <section class="card"><div class="card-body stack"><div class="input-icon" style="max-width:360px">${icon('search')}<input class="input" id="q" placeholder="Tìm số biên bản, học sinh…" value="${esc(q)}"></div>
        <div class="table-wrap"><table class="tbl"><thead><tr><th>Số biên bản</th><th>Học sinh</th><th>Loại lỗi</th><th>Địa điểm · thời gian</th><th>Hình thức</th><th class="c">Trừ ĐRL</th><th>Người lập</th><th></th></tr></thead><tbody>
        ${r.items.map(x => `<tr><td><b class="mono small">${x.id}</b>${x.reportId ? `<div class="xs muted">Từ ${x.reportId}</div>` : ''}</td><td><div class="row nowrap">${x.photo ? `<img src="${esc(x.photo)}" alt="" style="width:40px;height:40px;border-radius:10px;object-fit:cover;background:#fff">` : avatar({ id: x.studentId, name: x.studentName, avatar: x.studentAvatar }, 'sm')}<div><b class="small">${esc(x.studentName)}</b><div class="xs muted">${esc(x.className)} · ${esc(x.studentId)}</div></div></div></td><td class="small">${esc(x.typeName)}</td><td class="small">${esc(x.location)}<div class="xs muted">${fmtDateTime(x.at)}</div></td><td>${badge(x.penalty, 'warn')}</td><td class="c num">${x.points ? `<b style="color:var(--bad)">−${x.points}</b>` : '0'}</td><td class="small">${esc(x.createdByName)}</td><td class="r"><button class="btn icon ghost sm" data-view="${x.id}" title="Xem">${icon('eye')}</button><button class="btn icon ghost sm" data-del="${x.id}" title="Hủy biên bản" style="color:var(--bad)">${icon('trash')}</button></td></tr>`).join('')}
        </tbody></table></div>${r.items.length ? '' : empty('Chưa có biên bản', '', 'gavel')}</div></section>`;
        let t; $('#q').oninput = (e) => { clearTimeout(t); t = setTimeout(() => { q = e.target.value; draw(); }, 350); };
        $('#exp').onclick = () => api.download('api/admin/export/records').catch(showError);
        if ($('#rstR')) $('#rstR').onclick = async () => { if (!await confirmDialog({ title: 'Đặt về mặc định', message: 'Xóa toàn bộ hồ sơ tố giác và biên bản vi phạm hiện tại để đưa về trạng thái mặc định trống?', ok: 'Đặt về mặc định', tone: 'danger' })) return; try { await api.post('api/admin/reports/reset'); toast('Đã đặt về mặc định.', 'ok'); refreshCounts(); draw(); } catch (e) { showError(e); } };
        $$('[data-view]', view).forEach(b => b.onclick = () => { const x = r.items.find(i => i.id === b.dataset.view); modal({ title: `Biên bản ${x.id}`, sub: `${esc(x.studentName)} · ${esc(x.className)}`, size: 'wide', body: `<div class="grid g2"><div class="stack" style="gap:4px"><span class="eyebrow">Loại lỗi</span>${esc(x.typeName)}</div><div class="stack" style="gap:4px"><span class="eyebrow">Hình thức xử lý</span>${esc(x.penalty)}${x.points ? ` · trừ ${x.points} điểm rèn luyện` : ''}</div><div class="stack" style="gap:4px"><span class="eyebrow">Địa điểm</span>${esc(x.location)}</div><div class="stack" style="gap:4px"><span class="eyebrow">Thời gian</span>${fmtDateTime(x.at)}</div></div><div class="stack" style="gap:4px"><span class="eyebrow">Nội dung</span><p class="ink2">${esc(x.description)}</p></div>${x.photo ? `<img src="${esc(x.photo)}" alt="Ảnh biên bản" style="max-height:340px;border-radius:14px;object-fit:contain;background:var(--surface-2)">` : ''}<p class="xs muted">Lập bởi ${esc(x.createdByName)} lúc ${fmtDateTime(x.createdAt)}</p>`, foot: '<button class="btn" data-close>Đóng</button>' }); });
        $$('[data-del]', view).forEach(b => b.onclick = async () => { if (!await confirmDialog({ title: 'Hủy biên bản', message: `Hủy biên bản <b>${b.dataset.del}</b>? Điểm rèn luyện đã trừ sẽ được hoàn lại.`, ok: 'Hủy biên bản', tone: 'danger' })) return; try { await api.del(`api/admin/records/${b.dataset.del}`); toast('Đã hủy biên bản.', 'ok'); draw(); } catch (e) { showError(e); } });
      }
      $('#rec').onclick = () => recordModal();
      $$('[data-tab]', view).forEach(b => b.onclick = () => { tab = b.dataset.tab; q = ''; draw(); });
    };
    const tabs = () => `<div class="tabs"><button class="tab ${tab === 'reports' ? 'active' : ''}" data-tab="reports">${icon('shieldAlert')} Hồ sơ tố giác</button><button class="tab ${tab === 'records' ? 'active' : ''}" data-tab="records">${icon('gavel')} Sổ biên bản vi phạm</button></div>`;
    await draw();
    S.cleanups.push(live.on('report:new', () => tab === 'reports' && draw()));
  },

  // ---------------------------------------------------------------- Tư vấn tâm lý
  async counseling(view) { await threadsInbox(view, 'counsel'); },

  // ---------------------------------------------------------------- Chat với giáo viên
  async 'teacher-chat'(view) { await threadsInbox(view, 'teacher'); },

  // ---------------------------------------------------------------- Kiểm duyệt chat chung
  // ---------------------------------------------------------------- Tổ tâm lý
  async team(view) {
    const DN = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'], WEEK = [1, 2, 3, 4, 5, 6, 0];
    const ROLES = ['Tổ trưởng', 'Thành viên', 'Chuyên viên tâm lý', 'Giáo viên kiêm nhiệm', 'Nhân viên y tế', 'Cộng tác viên'];
    let curYear = '';
    const dayText = (d = []) => {
      const ds = WEEK.filter(x => d.includes(x)); if (ds.length === 7) return 'Hằng ngày';
      const runs = []; for (const x of ds) { const r = runs.at(-1); if (r && WEEK.indexOf(x) === WEEK.indexOf(r.at(-1)) + 1) r.push(x); else runs.push([x]); }
      return runs.map(r => (r.length >= 3 ? `${DN[r[0]]} – ${DN[r.at(-1)]}` : r.map(x => DN[x]).join(', '))).join(', ');
    };
    const draw = async () => {
      const r = await api.get('api/admin/counsel-team');
      const years = [...new Set(['2026-2027', '2025-2026', ...r.items.map(m => m.schoolYear || '2026-2027')])].sort().reverse();
      if (!curYear || !years.includes(curYear)) curYear = years[0] || '2026-2027';
      const items = r.items.filter(m => (m.schoolYear || '2026-2027') === curYear);
      const tname = (id) => r.teachers.find(t => t.id === id)?.name;
      view.innerHTML = head('Tổ tâm lý học đường', 'Danh sách thành viên Tổ tư vấn tâm lý học đường theo năm học hiển thị trên web và app của học sinh. Liên kết tài khoản giáo viên để học sinh nhắn tin trực tiếp.', `<button class="btn" id="addM">${icon('plus')} Thêm thành viên</button>`) + `
      <div class="chips" style="margin-bottom:14px">${years.map(y => `<button class="chip ${curYear === y ? 'active' : ''}" data-yr="${esc(y)}">${icon('calendar')} Năm học ${esc(y)} (${r.items.filter(m => (m.schoolYear || '2026-2027') === y).length})</button>`).join('')}</div>
      ${items.length ? `<div class="team-grid">${items.map(m => `<article class="card team-card" style="cursor:default;${m.active === false ? 'opacity:.6' : ''}">
        <div class="team-top">${avatar(m, 'lg')}<div class="grow" style="min-width:0"><b class="truncate">${esc(m.name)}</b><div class="xs muted team-title">${esc(m.title || '')}</div><div class="team-tags">${m.role ? badge(m.role, m.role === 'Tổ trưởng' ? 'violet' : '') : ''}${m.active === false ? badge('Đang ẩn', 'warn') : ''}${m.userId ? badge('Nhắn tin được', 'ok') : ''}${m.certificate ? badge('Có chứng chỉ', 'info') : ''}</div></div></div>
        ${m.days?.length || m.hours ? `<div class="team-line">${icon('clock')}<span>${esc([dayText(m.days), (m.hours || '').replace('-', ' – ')].filter(Boolean).join(' · '))}</span></div>` : ''}
        ${m.room ? `<div class="team-line">${icon('pin')}<span>${esc(m.room)}</span></div>` : ''}
        ${m.phone || m.email ? `<div class="team-line">${icon('phone')}<span>${esc([m.phone, m.email].filter(Boolean).join(' · '))}</span></div>` : ''}
        ${m.userId ? `<div class="team-line">${icon('user')}<span>Tài khoản: ${esc(tname(m.userId) || m.userId)} <span class="mono xs muted">${esc(m.userId)}</span></span></div>` : ''}
        ${m.topics?.length ? `<div class="team-topics">${m.topics.map(t => `<span>${esc(t)}</span>`).join('')}</div>` : ''}
        <div class="team-act"><button class="btn soft sm" data-ed="${m.id}">${icon('edit')} Sửa</button>${m.certificate ? `<button class="btn ghost sm" data-cert="${m.id}">${icon('award')} Chứng chỉ</button>` : ''}<label class="switch" style="margin-left:auto"><input type="checkbox" data-act="${m.id}" ${m.active !== false ? 'checked' : ''}><span class="track"></span><span class="small">Hiển thị</span></label><button class="btn icon ghost sm" data-dl="${m.id}" style="color:var(--bad)" aria-label="Xóa">${icon('trash')}</button></div>
      </article>`).join('')}</div>` : empty('Chưa có thành viên', 'Bấm “Thêm thành viên” để tạo danh sách Tổ tâm lý cho năm học này.', 'users')}`;
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
      const form = (x) => formModal({ title: x ? 'Sửa thành viên' : 'Thêm thành viên Tổ tâm lý', size: 'wide', submit: x ? 'Lưu thay đổi' : 'Thêm', fields: [
        { name: 'name', label: 'Họ và tên', required: true, value: x?.name || '', placeholder: 'Nguyễn Văn A' },
        { name: 'role', label: 'Nhiệm vụ trong tổ', value: x?.role || 'Thành viên', list: ROLES.map(v => ({ value: v, label: v })) },
        { name: 'title', label: 'Chức vụ', value: x?.title || '', placeholder: 'Phó hiệu trưởng / Bí thư Đoàn trường / Giáo viên…' },
        { name: 'schoolYear', label: 'Năm học', value: x?.schoolYear || curYear || '2026-2027', list: years.map(y => ({ value: y, label: y })) },
        { name: 'userId', label: 'Liên kết tài khoản (để học sinh nhắn tin)', type: 'select', value: x?.userId || '', options: [{ value: '', label: '— Không liên kết —' }, ...r.teachers.map(t => ({ value: t.id, label: `${t.name} · ${t.id}` }))] },
        { name: 'room', label: 'Nơi gặp', value: x?.room || 'Phòng Tham vấn · Tầng 1 dãy B' },
        { name: 'hours', label: 'Giờ trực', value: x?.hours || '07:00-11:00', placeholder: '07:00-11:00', hint: 'Dạng giờ bắt đầu - giờ kết thúc, ví dụ 13:30-16:30.' },
        { name: 'order', label: 'Thứ tự hiển thị', type: 'number', min: 1, max: 99, value: x?.order || items.length + 1 },
        { name: 'phone', label: 'Điện thoại (không bắt buộc)', value: x?.phone || '' },
        { name: 'email', label: 'Email (không bắt buộc)', value: x?.email || '' },
        { name: 'topics', label: 'Lĩnh vực hỗ trợ', full: true, value: (x?.topics || []).join(', '), placeholder: 'Áp lực học tập, Gia đình, Bắt nạt…', hint: 'Cách nhau bằng dấu phẩy (tối đa 8).' },
        { name: 'bio', label: 'Giới thiệu ngắn', type: 'textarea', rows: 3, full: true, value: x?.bio || '' },
        { name: 'avatar', label: 'Ảnh đại diện (không bắt buộc)', type: 'image', full: true, value: x?.avatar || '' },
        { name: 'certificate', label: 'Ảnh chứng chỉ / quyết định (không bắt buộc)', type: 'image', full: true, value: x?.certificate || '' },
        { name: 'active', label: 'Hiển thị cho học sinh', type: 'switch', value: x ? x.active !== false : true },
      ], extra: `<div class="field" style="margin-top:12px"><label>Ngày trực trong tuần</label><div class="day-picks">${WEEK.map(d => `<label class="day-pick"><input type="checkbox" data-day="${d}" ${(x?.days || [1, 2, 3, 4, 5]).includes(d) ? 'checked' : ''}><span>${DN[d]}</span></label>`).join('')}</div></div>`,
      onSubmit: async (d, close, m) => {
        d.days = $$('[data-day]:checked', m).map(c => Number(c.dataset.day));
        if (!d.avatar && !x?.avatar) delete d.avatar;
        if (!d.certificate && !x?.certificate) delete d.certificate;
        await (x ? api.put(`api/admin/counsel-team/${x.id}`, d) : api.post('api/admin/counsel-team', d));
        if (d.schoolYear) curYear = d.schoolYear;
        toast('Đã lưu thành viên Tổ tâm lý.', 'ok'); close(); draw();
      } });
      $$('[data-yr]', view).forEach(b => b.onclick = () => { curYear = b.dataset.yr; draw(); });
      $('#addM').onclick = () => form(null);
      $$('[data-ed]', view).forEach(b => b.onclick = () => form(r.items.find(i => i.id === b.dataset.ed)));
      $$('[data-cert]', view).forEach(b => b.onclick = () => showCert(r.items.find(i => i.id === b.dataset.cert)));
      $$('[data-act]', view).forEach(c => c.onchange = async () => { await api.put(`api/admin/counsel-team/${c.dataset.act}`, { active: c.checked }); toast(c.checked ? 'Đã hiển thị cho học sinh.' : 'Đã ẩn khỏi danh sách.', 'ok'); draw(); });
      $$('[data-dl]', view).forEach(b => b.onclick = async () => { const m = r.items.find(i => i.id === b.dataset.dl); if (!await confirmDialog({ title: 'Xóa thành viên', message: `Xóa ${esc(m.name)} khỏi Tổ tâm lý?`, ok: 'Xóa', tone: 'danger' })) return; await api.del(`api/admin/counsel-team/${m.id}`); toast('Đã xóa.', 'ok'); draw(); });
    };
    await draw();
  },

  // ---------------------------------------------------------------- Danh sách giáo viên
  async 'teacher-list'(view) {
    const DEPTS = ['Hội đồng Sư phạm', 'Ban Giám hiệu', 'Đoàn trường', 'Ban Giám thị', 'Phòng Tham vấn Tâm lý', 'Phòng Y tế', 'Văn phòng', 'Tổ Toán – Tin', 'Tổ Ngữ văn', 'Tổ Vật lý – CN', 'Tổ Hóa – Sinh', 'Tổ Sử – Địa – GDCD', 'Tổ Ngoại ngữ', 'Tổ TD – GDQP'];
    let q = '';
    const loadAndDraw = async () => {
      const items = (await api.get('api/admin/users?role=teacher&limit=1000')).items;
      const card = (t) => `<article class="card team-card">
        <div class="team-top">${avatar(t, 'lg')}<div class="grow" style="min-width:0"><b class="truncate">${esc(t.name)}</b><div class="xs muted team-title">${esc([t.title, t.subject].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(' · '))}</div>${t.department ? `<div class="team-tags"><span class="badge">${esc(t.department)}</span></div>` : ''}</div></div>
        ${t.phone || t.email ? `<div class="team-line">${icon('phone')}<span>${esc([t.phone, t.email].filter(Boolean).join(' · '))}</span></div>` : ''}
        <div class="team-act"><button class="btn soft sm" data-ed="${t.id}">${icon('edit')} Sửa</button>${t.phone ? `<a class="btn ghost sm" href="tel:${esc(t.phone.replace(/\s/g, ''))}">${icon('phone')} Gọi</a>` : ''}${t.email ? `<a class="btn ghost sm" href="mailto:${esc(t.email)}">${icon('mail')} Email</a>` : ''}${isAdmin() ? `<button class="btn icon ghost sm" data-dl="${t.id}" style="color:var(--bad);margin-left:auto" aria-label="Xóa" title="Xóa giáo viên">${icon('trash')}</button>` : ''}</div>
      </article>`;
      const filterList = (kw) => {
        const k = kw.trim().toLowerCase();
        return !k ? items : items.filter(t => [t.name, t.title, t.subject, t.department, t.email, t.phone, t.id].some(f => (f || '').toLowerCase().includes(k)));
      };
      const drawGrid = (list) => {
        $('#tlGrid').innerHTML = list.length ? `<div class="team-grid">${list.map(card).join('')}</div>` : empty('Không tìm thấy', 'Thử từ khóa khác.', 'search');
        $$('[data-ed]', view).forEach(b => b.onclick = () => openForm(items.find(x => x.id === b.dataset.ed)));
        $$('[data-dl]', view).forEach(b => b.onclick = async () => {
          const t = items.find(x => x.id === b.dataset.dl);
          if (!await confirmDialog({ title: 'Xóa giáo viên', message: `Xóa giáo viên <b>${esc(t?.name || b.dataset.dl)}</b> khỏi hệ thống?`, ok: 'Xóa', tone: 'danger' })) return;
          try { await api.del(`api/admin/users/${b.dataset.dl}`); toast('Đã xóa giáo viên.', 'ok'); loadAndDraw(); } catch (e) { showError(e); }
        });
      };
      const openForm = (t) => formModal({
        title: t ? `Chỉnh sửa giáo viên · ${t.name}` : 'Thêm giáo viên mới',
        sub: t ? `Mã đăng nhập: ${t.id}` : 'Mật khẩu mặc định 123456 nếu để trống.',
        size: 'wide',
        submit: t ? 'Lưu thay đổi' : 'Thêm giáo viên',
        fields: [
          ...(t ? [] : [{ name: 'id', label: 'Mã giáo viên (đăng nhập)', required: true, value: `GV2026${String(items.length + 1).padStart(3, '0')}`, placeholder: 'Ví dụ: GV2026070' }]),
          { name: 'name', label: 'Họ và tên', required: true, value: t?.name || '', placeholder: 'Nguyễn Văn A' },
          { name: 'title', label: 'Chức danh / nhiệm vụ', value: t?.title || 'Giáo viên', placeholder: 'Giáo viên / Phó hiệu trưởng / GVCN 12A1…' },
          { name: 'subject', label: 'Bộ môn giảng dạy', value: t?.subject || '', placeholder: 'Toán, Ngữ văn, Tiếng Anh…' },
          { name: 'department', label: 'Tổ chuyên môn / bộ phận', value: t?.department || 'Hội đồng Sư phạm', list: DEPTS.map(v => ({ value: v, label: v })) },
          { name: 'phone', label: 'Số điện thoại', value: t?.phone || '', placeholder: '0912 345 678' },
          { name: 'email', label: 'Email', type: 'email', value: t?.email || '', placeholder: 'ten.gv@lehoan.edu.vn' },
          { name: 'gender', label: 'Giới tính', type: 'select', value: t?.gender || 'Nữ', options: ['Nam', 'Nữ', 'Khác'] },
          { name: 'dob', label: 'Ngày sinh', type: 'date', value: t?.dob || '' },
          { name: 'hometown', label: 'Quê quán', full: true, value: t?.hometown || '' },
          { name: 'avatar', label: 'Ảnh đại diện (không bắt buộc)', type: 'image', full: true, value: t?.avatar || '' },
          ...(t ? [] : [{ name: 'password', label: 'Mật khẩu ban đầu', value: '123456', placeholder: '123456' }]),
        ],
        onSubmit: async (d, close) => {
          if (!d.avatar && !t?.avatar) delete d.avatar;
          if (t) await api.put(`api/admin/users/${t.id}`, d);
          else await api.post('api/admin/users', { ...d, role: 'teacher' });
          toast(t ? 'Đã cập nhật thông tin giáo viên.' : 'Đã thêm giáo viên mới.', 'ok');
          close();
          loadAndDraw();
        },
      });
      view.innerHTML = head('Danh sách giáo viên', `${items.length} giáo viên đang công tác tại trường.`, `<button class="btn" id="addT">${icon('plus')} Thêm giáo viên</button>`) + `
      <div class="search" style="max-width:420px;margin-bottom:14px">${icon('search')}<input id="tlQ" placeholder="Tìm theo tên, chức danh, môn dạy, tổ bộ môn…" aria-label="Tìm giáo viên" value="${esc(q)}"></div>
      <div id="tlGrid"></div>`;
      drawGrid(filterList(q));
      $('#addT').onclick = () => openForm(null);
      $('#tlQ').oninput = (e) => { q = e.target.value; drawGrid(filterList(q)); };
    };
    await loadAndDraw();
  },

  async chatmod(view) {
    const draw = async () => {
      const draft = $('#ct', view)?.value || '';
      const hadFocus = document.activeElement?.id === 'ct';
      const reasonDraft = document.activeElement?.id === 'reason' ? $('#reason', view)?.value : null;
      const r = await api.get('api/admin/school-chat');
      view.innerHTML = head('Quản trị kênh chat chung toàn trường', 'Theo dõi luồng tin nhắn công cộng, gỡ tin không phù hợp, cảnh cáo hoặc tạm cấm tài khoản vi phạm.') + `
      <div class="grid g-main">
        <section class="card chat" style="height:calc(100dvh - 210px);min-height:520px"><div class="chat-head"><span class="avatar sq" style="background:linear-gradient(135deg,#1747c9,#0a84b8)">${icon('chats')}</span><div class="grow"><b>Kênh chung học sinh</b><div class="xs muted">${r.items.length} tin nhắn gần nhất · ${r.items.filter(m => m.flagged).length} bị lọc · ${r.items.filter(m => m.deleted).length} đã gỡ</div></div>${r.locked ? badge('Đang khóa', 'warn') : badge('Đang mở', 'ok')}</div>
          <div class="chat-body" id="cb">${r.items.map(m => `<div class="msg" style="max-width:100%"><span>${m.anonymous ? `<span class="avatar sm" style="background:var(--violet);color:#fff">${icon('eyeOff')}</span>` : avatar({ id: m.userId, name: m.name, avatar: m.avatar }, 'sm')}</span><div style="min-width:0;flex:1"><div class="who"><b style="color:${m.anonymous ? 'var(--violet)' : 'var(--ink)'}">${esc(m.name)}</b><span>${esc(m.className)}</span>${m.anonymous ? badge('Ẩn danh', 'violet') : ''}<span>${fmtTime(m.at)} · ${fmtDate(m.at)}</span>${m.flagged ? badge('Đã lọc từ ngữ', 'warn') : ''}${m.deleted ? badge('Đã gỡ', 'bad') : ''}${m.recalled ? badge('Đã thu hồi', 'warn') : ''}${r.warnings[m.userId] ? badge(`${r.warnings[m.userId]} cảnh cáo`, 'bad') : ''}</div><div class="row nowrap" style="gap:8px;align-items:flex-start">${m.deleted ? `<div class="bubble deleted">${bubbleBody(m)}</div>` : sbubble(m, m.flagged ? 'border-color:var(--warn)' : '')}${m.role !== 'staff' && !m.deleted ? `<div class="row nowrap" style="gap:2px;flex:none"><button class="btn icon ghost sm" data-del="${m.id}" title="Gỡ tin nhắn">${icon('trash')}</button><button class="btn icon ghost sm" data-warn="${m.userId}" title="Cảnh cáo">${icon('alert')}</button><button class="btn icon ghost sm" data-mute="${m.userId}" title="Cấm chat">${icon('volumeX')}</button></div>` : ''}</div></div></div>`).join('')}</div>
          <form class="chat-input" id="cf"><textarea id="ct" rows="1" placeholder="Gửi thông báo vào kênh với tư cách nhà trường…"></textarea><button class="btn icon">${icon('send')}</button></form></section>
        <aside class="stack lg">
          <section class="card pad stack"><b>${icon('lock')} Khóa kênh chat</b><p class="small ink2">Tạm dừng học sinh gửi tin (ví dụ trong giờ kiểm tra).</p><input class="input" id="reason" placeholder="Lý do hiển thị cho học sinh" value="${esc(reasonDraft ?? r.lockReason ?? '')}"><button class="btn ${r.locked ? 'ok' : 'danger soft'}" id="lock">${r.locked ? `${icon('unlock')} Mở lại kênh chat` : `${icon('lock')} Khóa kênh chat`}</button></section>
          <section class="card"><div class="card-head"><h2>${icon('volumeX')} Đang bị cấm chat (${r.muted.length})</h2></div><div class="card-body list">${r.muted.map(u => `<div class="item">${avatar(u, 'sm')}<div class="grow"><b class="small">${esc(u.name)}</b><div class="xs muted">${u.warnings} cảnh cáo</div></div><button class="btn soft sm" data-unmute="${u.id}">Bỏ cấm</button></div>`).join('') || '<span class="small muted">Không có tài khoản bị cấm</span>'}</div></section>
          <section class="card pad stack"><b>${icon('shieldCheck')} Bộ lọc tự động</b><p class="small ink2">Ngôn từ phản cảm được che bằng dấu *. Sau 3 lần vi phạm, tài khoản tự động bị cấm chat. Bật/tắt trong mục AI Guard.</p></section>
        </aside>
      </div>`;
      const cb = $('#cb'); cb.scrollTop = cb.scrollHeight;
      if (draft && $('#ct')) $('#ct').value = draft;
      if (hadFocus && $('#ct')) $('#ct').focus();
      $$('[data-del]', view).forEach(b => b.onclick = async () => { await api.del(`api/admin/school-chat/${b.dataset.del}`); toast('Đã gỡ tin nhắn.', 'ok'); draw(); });
      $$('[data-warn]', view).forEach(b => b.onclick = async () => { const x = await api.post(`api/admin/school-chat/users/${b.dataset.warn}/warn`); toast(`Đã cảnh cáo (lần ${x.warnings}).`, 'ok'); draw(); });
      $$('[data-mute]', view).forEach(b => b.onclick = async () => { if (!await confirmDialog({ title: 'Cấm chat', message: 'Tạm cấm tài khoản này gửi tin trên kênh chung?', ok: 'Cấm chat', tone: 'danger' })) return; await api.post(`api/admin/school-chat/users/${b.dataset.mute}/mute`, { muted: true }); toast('Đã cấm chat.', 'ok'); draw(); });
      $$('[data-unmute]', view).forEach(b => b.onclick = async () => { await api.post(`api/admin/school-chat/users/${b.dataset.unmute}/mute`, { muted: false }); toast('Đã bỏ cấm chat.', 'ok'); draw(); });
      $('#lock').onclick = async () => { await api.put('api/admin/school-chat/lock', { locked: !r.locked, reason: $('#reason').value }); toast(r.locked ? 'Đã mở kênh chat.' : 'Đã khóa kênh chat.', 'ok'); draw(); };
      $('#ct').addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#cf').requestSubmit(); } });
      const comp = attachComposer($('#cf'));
      $('#cf').onsubmit = async (e) => { e.preventDefault(); const t = $('#ct').value.trim(); if (!t && !comp.has()) return; $('#ct').value = ''; try { const attachments = comp.has() ? await comp.upload(api.upload) : []; await api.post('api/school-chat', { text: t, attachments }); comp.clear(); draw(); } catch (er) { showError(er); if (t) $('#ct').value = t; } };
    };
    await draw();
    S.cleanups.push(live.on('school-chat:message', () => draw()));
    S.cleanups.push(live.on('school-chat:recall', () => draw()));
    S.cleanups.push(live.on('school-chat:delete', () => draw()));
    S.cleanups.push(live.on('school-chat:react', () => draw()));
    S.cleanups.push(live.on('school-chat:lock', () => draw()));
  },

  // ---------------------------------------------------------------- Trắc nghiệm
  async quiz(view) {
    let tab = 'bank', topic = '';
    const toLocalDt = (iso) => {
      if (!iso) return '';
      const d = new Date(iso);
      if (isNaN(d.getTime())) return '';
      const p = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
    };
    const gateCard = (g = {}) => {
      const stateBadge = g.state === 'scheduled'
        ? badge(`Đang khóa · Tự mở lúc ${fmtDateTime(g.openAt)}`, 'info')
        : g.state === 'closed'
          ? badge(`Đã đóng đề (${fmtDateTime(g.closeAt)})`, 'warn')
          : g.locked
            ? badge('Đang khóa đấu trường', 'bad')
            : badge('Đang mở cho học sinh thi', 'ok');
      return `<section class="card pad stack" style="gap:12px">
        <div class="row between" style="gap:10px">
          <div class="row" style="gap:8px">
            <b>${icon(g.locked ? 'lock' : 'unlock')} Khóa & hẹn giờ mở Đấu trường trắc nghiệm</b>
            ${stateBadge}
          </div>
          <div class="row" style="gap:6px">
            <button type="button" class="btn sm ${g.locked ? 'ok' : 'danger soft'}" id="qzQuickToggle">
              ${icon(g.locked ? 'unlock' : 'lock')} ${g.locked ? 'Mở thi ngay' : 'Khóa ngay'}
            </button>
          </div>
        </div>
        <div class="field-row" style="grid-template-columns:repeat(auto-fit,minmax(210px,1fr));align-items:end">
          <div class="field">
            <label for="qzOpenAt">${icon('clock')} Hẹn giờ tự động mở đề</label>
            <input type="datetime-local" id="qzOpenAt" class="input" value="${esc(toLocalDt(g.openAt))}">
          </div>
          <div class="field">
            <label for="qzCloseAt">${icon('calendar')} Giờ tự động đóng đề (tùy chọn)</label>
            <input type="datetime-local" id="qzCloseAt" class="input" value="${esc(toLocalDt(g.closeAt))}">
          </div>
          <div class="field" style="grid-column:span 2;min-width:220px">
            <label for="qzNote">Thông báo hiển thị cho học sinh khi đang khóa</label>
            <input type="text" id="qzNote" class="input" maxlength="250" placeholder="Ví dụ: Đấu trường sẽ tự động mở đúng giờ thi, các em chuẩn bị sẵn sàng nhé!" value="${esc(g.note || '')}">
          </div>
        </div>
        <div class="row between" style="gap:8px">
          <div class="row" style="gap:6px">
            <span class="xs muted">Hẹn nhanh:</span>
            <button type="button" class="btn ghost sm" data-qpreset="1">+1 phút</button>
            <button type="button" class="btn ghost sm" data-qpreset="5">+5 phút</button>
            <button type="button" class="btn ghost sm" data-qpreset="15">+15 phút</button>
            <button type="button" class="btn ghost sm" data-qpreset="60">+1 giờ</button>
            ${g.openAt || g.closeAt ? `<button type="button" class="btn ghost sm" id="qzClearTime" style="color:var(--bad)">Xóa hẹn giờ</button>` : ''}
          </div>
          <button type="button" class="btn sm" id="qzSaveGate">${icon('check')} Lưu cài đặt giờ thi</button>
        </div>
      </section>`;
    };
    const bindGate = (g = {}) => {
      const saveGate = async (payload, msg) => {
        try {
          await api.put('api/admin/quiz/gate', payload);
          toast(msg, 'ok');
          draw();
        } catch (e) { showError(e); }
      };
      if ($('#qzQuickToggle', view)) {
        $('#qzQuickToggle', view).onclick = () => {
          if (g.locked) saveGate({ locked: false, openAt: '', closeAt: g.closeAt || '', note: $('#qzNote', view)?.value || '' }, 'Đã mở đấu trường cho học sinh thi ngay.');
          else saveGate({ locked: true, openAt: $('#qzOpenAt', view)?.value ? new Date($('#qzOpenAt', view).value).toISOString() : '', closeAt: $('#qzCloseAt', view)?.value ? new Date($('#qzCloseAt', view).value).toISOString() : '', note: $('#qzNote', view)?.value || '' }, 'Đã khóa đấu trường trắc nghiệm.');
        };
      }
      $$('[data-qpreset]', view).forEach(b => b.onclick = () => {
        const mins = Number(b.dataset.qpreset) || 5;
        const target = new Date(Date.now() + mins * 60000);
        $('#qzOpenAt', view).value = toLocalDt(target.toISOString());
      });
      if ($('#qzClearTime', view)) {
        $('#qzClearTime', view).onclick = () => saveGate({ locked: g.manualLock, openAt: '', closeAt: '', note: $('#qzNote', view)?.value || '' }, 'Đã xóa lịch hẹn giờ.');
      }
      if ($('#qzSaveGate', view)) {
        $('#qzSaveGate', view).onclick = () => {
          const openVal = $('#qzOpenAt', view)?.value;
          const closeVal = $('#qzCloseAt', view)?.value;
          const openIso = openVal ? new Date(openVal).toISOString() : '';
          const closeIso = closeVal ? new Date(closeVal).toISOString() : '';
          const shouldLock = openIso && new Date(openIso).getTime() > Date.now() ? true : !!g.manualLock;
          saveGate({ locked: shouldLock, openAt: openIso, closeAt: closeIso, note: $('#qzNote', view)?.value || '' }, openIso && new Date(openIso).getTime() > Date.now() ? 'Đã khóa và hẹn giờ tự động mở thi.' : 'Đã lưu cài đặt giờ thi.');
        };
      }
    };
    const draw = async () => {
      if (tab === 'bank') {
        const r = await api.get(`api/admin/quiz/questions?topic=${topic}`);
        view.innerHTML = head('Quản lý trò chơi & ngân hàng câu hỏi', 'Thêm, sửa câu hỏi trắc nghiệm an toàn học đường, khóa đấu trường và hẹn giờ mở đề tự động.', `<button class="btn ghost" id="expQ">${icon('download')} Xuất Excel</button><button class="btn" id="addQ">${icon('plus')} Thêm câu hỏi</button>`) + gateCard(r.gate) + qtabs() + `
        <div class="chips"><button class="chip ${!topic ? 'active' : ''}" data-tp="">Tất cả (${r.items.length})</button>${Object.entries(S.meta.quizTopics).map(([k, t]) => `<button class="chip ${topic === k ? 'active' : ''}" data-tp="${k}">${esc(t.short)}</button>`).join('')}</div>
        <div class="stack">${r.items.map(q => `<article class="card pad stack" style="gap:10px"><div class="row between"><div class="row" style="gap:6px"><b class="mono small">${q.id}</b>${badge(S.meta.quizTopics[q.topic]?.short || q.topic, 'info')}${badge(q.difficulty, q.difficulty === 'Khó' ? 'bad' : q.difficulty === 'Dễ' ? 'ok' : 'warn')}${q.active === false ? badge('Đang ẩn') : ''}</div><div class="row nowrap" style="gap:4px"><button class="btn icon ghost sm" data-eq="${q.id}">${icon('edit')}</button><button class="btn icon ghost sm" data-dq="${q.id}" style="color:var(--bad)">${icon('trash')}</button></div></div>
          <b>${esc(q.question)}</b><div class="grid g2" style="gap:6px">${q.options.map((o, k) => `<div class="small row nowrap" style="gap:8px;padding:8px 10px;border-radius:10px;background:${k === q.answer ? 'var(--ok-soft)' : 'var(--surface-2)'};color:${k === q.answer ? 'var(--ok)' : 'inherit'}"><b>${'ABCD'[k]}.</b><span>${esc(o)}</span>${k === q.answer ? icon('check') : ''}</div>`).join('')}</div>${q.explanation ? `<p class="xs muted">${icon('bulb')} ${esc(q.explanation)}</p>` : ''}</article>`).join('')}</div>`;
        bindGate(r.gate);
        $$('[data-tp]', view).forEach(b => b.onclick = () => { topic = b.dataset.tp; draw(); });
        $('#addQ').onclick = () => qForm(null);
        $('#expQ').onclick = () => api.download('api/admin/export/quiz-questions').catch(showError);
        $$('[data-eq]', view).forEach(b => b.onclick = () => qForm(r.items.find(q => q.id === b.dataset.eq)));
        $$('[data-dq]', view).forEach(b => b.onclick = async () => { if (!await confirmDialog({ title: 'Xóa câu hỏi', message: `Xóa câu hỏi ${b.dataset.dq}?`, ok: 'Xóa', tone: 'danger' })) return; await api.del(`api/admin/quiz/questions/${b.dataset.dq}`); toast('Đã xóa câu hỏi.', 'ok'); draw(); });
      } else {
        const r = await api.get('api/admin/quiz/attempts');
        view.innerHTML = head('Quản lý trò chơi & ngân hàng câu hỏi', 'Theo dõi kết quả thi đấu, thời gian hoàn thành và vinh danh học sinh dẫn đầu.', `${r.items.length ? `<button class="btn ghost" id="rstQuizA" style="color:var(--bad)">${icon('refresh')} Đặt về mặc định</button>` : ''}<button class="btn ghost" id="expA">${icon('download')} Xuất Excel</button>`) + gateCard(r.gate) + qtabs() + `
        <div class="grid g3"><div class="card stat"><div class="k"><span class="si">${icon('gamepad')}</span><span class="k-lbl">Tổng lượt thi</span></div><div class="v">${r.items.length}</div></div><div class="card stat"><div class="k"><span class="si" style="--c:var(--ok)">${icon('target')}</span><span class="k-lbl">Điểm trung bình</span></div><div class="v">${r.average}<small>/100</small></div></div><div class="card stat"><div class="k"><span class="si" style="--c:var(--warn)">${icon('users')}</span><span class="k-lbl">Học sinh tham gia</span></div><div class="v">${new Set(r.items.map(a => a.userId)).size}</div></div></div>
        <div class="grid g-main"><section class="card"><div class="card-head"><h2>${icon('list')} Kết quả gần đây</h2></div><div class="card-body"><div class="table-wrap"><table class="tbl"><thead><tr><th>Học sinh</th><th>Lớp</th><th class="c">Đúng</th><th class="r">Điểm</th><th class="r">Thời gian</th><th>Lúc</th><th></th></tr></thead><tbody>${r.items.slice(0, 60).map(a => `<tr><td><div class="row nowrap">${avatar({ id: a.userId, name: a.name, avatar: a.avatar }, 'sm')}<b class="small">${esc(a.name)}</b></div></td><td class="small">${esc(a.className)}</td><td class="c num">${a.correct}/${a.total}</td><td class="r num"><b style="color:${a.score >= 80 ? 'var(--ok)' : a.score >= 50 ? 'var(--brand)' : 'var(--warn)'}">${a.score}</b></td><td class="r num small">${a.duration}s</td><td class="small muted">${ago(a.at)}</td><td class="r"><button class="btn icon ghost sm" data-del-qa="${a.id}" title="Xóa lượt thi" style="color:var(--bad)">${icon('trash')}</button></td></tr>`).join('') || '<tr><td colspan="7" class="small muted">Chưa có lượt thi</td></tr>'}</tbody></table></div></div></section>
          <section class="card"><div class="card-head"><h2>${icon('crown')} Bảng vàng tuần</h2></div><div class="card-body list">${r.leaderboard.map(l => `<div class="item"><span class="medal ${l.rank <= 3 ? 'm' + l.rank : 'mx'}">${l.rank}</span>${avatar({ id: l.userId, name: l.name, avatar: l.avatar }, 'sm')}<div class="grow"><b class="small">${esc(l.name)}</b><div class="xs muted">${esc(l.className)} · ${l.duration}s · ${l.attempts} lượt</div></div><b class="num">${l.score}</b></div>`).join('') || empty('Chưa có lượt thi')}</div></section></div>`;
        bindGate(r.gate);
        $('#expA').onclick = () => api.download('api/admin/export/quiz-attempts').catch(showError);
        if ($('#rstQuizA')) $('#rstQuizA').onclick = async () => { if (!await confirmDialog({ title: 'Đặt về mặc định', message: 'Xóa toàn bộ kết quả thi trắc nghiệm và bảng vàng hiện tại để đưa về mặc định trống?', ok: 'Đặt về mặc định', tone: 'danger' })) return; try { await api.del('api/admin/quiz/attempts'); toast('Đã đặt kết quả trắc nghiệm về mặc định.', 'ok'); draw(); } catch (e) { showError(e); } };
        $$('[data-del-qa]', view).forEach(b => b.onclick = async () => { if (!await confirmDialog({ title: 'Xóa lượt thi', message: 'Xóa lượt thi trắc nghiệm này?', ok: 'Xóa', tone: 'danger' })) return; try { await api.del(`api/admin/quiz/attempts/${encodeURIComponent(b.dataset.delQa)}`); toast('Đã xóa lượt thi.', 'ok'); draw(); } catch (e) { showError(e); } });
      }
      $$('[data-tab]', view).forEach(b => b.onclick = () => { tab = b.dataset.tab; draw(); });
    };
    const qtabs = () => `<div class="tabs"><button class="tab ${tab === 'bank' ? 'active' : ''}" data-tab="bank">${icon('list')} Ngân hàng câu hỏi</button><button class="tab ${tab === 'results' ? 'active' : ''}" data-tab="results">${icon('trophy')} Kết quả thi đấu</button></div>`;
    const qForm = (q) => modal({ title: q ? `Sửa câu hỏi ${q.id}` : 'Thêm câu hỏi', size: 'wide',
      body: `<form id="qf" class="stack"><div class="field-row">${fieldHtml({ name: 'topic', label: 'Chủ đề', type: 'select', value: q?.topic, options: Object.entries(S.meta.quizTopics).map(([value, t]) => ({ value, label: t.label })) })}${fieldHtml({ name: 'difficulty', label: 'Độ khó', type: 'select', value: q?.difficulty || 'Trung bình', options: ['Dễ', 'Trung bình', 'Khó'] })}</div>
        ${fieldHtml({ name: 'question', label: 'Nội dung câu hỏi', type: 'textarea', rows: 2, value: q?.question || '', required: true })}
        <div class="stack" style="gap:8px"><span class="label">4 phương án · chọn đáp án đúng</span>${[0, 1, 2, 3].map(k => `<div class="row nowrap"><label class="chip" style="flex:none"><input type="radio" name="answer" value="${k}" ${(q?.answer ?? 0) === k ? 'checked' : ''}>${'ABCD'[k]}</label><input class="input" name="opt${k}" value="${esc(q?.options?.[k] || '')}" placeholder="Phương án ${'ABCD'[k]}"></div>`).join('')}</div>
        ${fieldHtml({ name: 'explanation', label: 'Giải thích đáp án', type: 'textarea', rows: 2, value: q?.explanation || '' })}${fieldHtml({ name: 'active', label: 'Hiển thị trong đấu trường', type: 'switch', value: q ? q.active !== false : true })}</form>`,
      foot: '<button class="btn ghost" data-close>Hủy</button><button class="btn" id="qs">Lưu câu hỏi</button>',
      onMount: (m, close) => $('#qs', m).onclick = async () => { const f = formData($('#qf', m)); const body = { topic: f.topic, difficulty: f.difficulty, question: f.question, options: [f.opt0, f.opt1, f.opt2, f.opt3], answer: Number(f.answer), explanation: f.explanation, active: f.active }; try { await (q ? api.put(`api/admin/quiz/questions/${q.id}`, body) : api.post('api/admin/quiz/questions', body)); toast('Đã lưu câu hỏi.', 'ok'); close(); draw(); } catch (e) { showError(e); } } });
    await draw();
  },

  // ---------------------------------------------------------------- Khảo sát
  async surveys(view) {
    const P = { khkt: ['Nghiên cứu khoa học', 'violet'], discipline: ['Nề nếp kỷ luật', 'warn'], mental: ['Sức khỏe tinh thần', 'sky'], other: ['Khác', ''] };
    const draw = async () => {
      const r = await api.get('api/admin/surveys');
      view.innerHTML = head('Quản lý khảo sát học đường', 'Thiết lập đợt khảo sát cho đề tài nghiên cứu, xem từng phiếu và xuất dữ liệu ra Excel để phân tích (SPSS, Excel).', `<button class="btn" id="addS">${icon('plus')} Tạo đợt khảo sát</button>`) + `
      <div class="grid g-auto" style="grid-template-columns:repeat(auto-fill,minmax(330px,1fr))">${r.items.map(s => `<article class="card pad stack" style="gap:12px"><div class="row between">${badge(P[s.purpose]?.[0] || 'Khảo sát', P[s.purpose]?.[1] || '')}${badge(s.status === 'active' ? 'Đang mở' : s.status === 'draft' ? 'Bản nháp' : 'Đã đóng', s.status === 'active' ? 'ok' : '')}</div><div><b class="mono xs muted">${s.id}</b><h3 style="font-size:var(--fs-md);margin-top:2px">${esc(s.title)}</h3></div>
        <div class="row small muted" style="gap:12px"><span>${icon('clipboard')} ${s.questions.length} câu</span><span>${icon('calendar')} Hạn ${fmtDate(s.deadline)}</span><span>${icon('users')} ${esc(s.target)}</span></div>
        <div><div class="row between small" style="margin-bottom:6px"><b class="num">${s.responses} phiếu</b><span class="muted">Mục tiêu ${s.targetCount} · ${Math.round(s.responses / s.targetCount * 100)}%</span></div><div class="meter" style="--c:var(--violet)"><i style="width:${Math.min(100, s.responses / s.targetCount * 100)}%"></i></div></div>
        <div class="row" style="gap:6px"><button class="btn sm" data-res="${s.id}">${icon('chart')} Kết quả</button><button class="btn ghost sm" data-x="${s.id}">${icon('download')} Excel</button><button class="btn ghost sm" data-ed="${s.id}">${icon('edit')}</button><button class="btn ghost sm" data-tg="${s.id}">${s.status === 'active' ? 'Đóng' : 'Mở lại'}</button><button class="btn icon ghost sm" data-dl="${s.id}" style="color:var(--bad)">${icon('trash')}</button></div></article>`).join('')}</div>`;
      $('#addS').onclick = () => surveyForm(null, draw);
      $$('[data-res]', view).forEach(b => b.onclick = () => surveyResults(b.dataset.res));
      $$('[data-x]', view).forEach(b => b.onclick = () => api.download(`api/admin/export/survey/${b.dataset.x}`).catch(showError));
      $$('[data-ed]', view).forEach(b => b.onclick = () => surveyForm(r.items.find(s => s.id === b.dataset.ed), draw));
      $$('[data-tg]', view).forEach(b => b.onclick = async () => { const s = r.items.find(x => x.id === b.dataset.tg); await api.put(`api/admin/surveys/${s.id}`, { status: s.status === 'active' ? 'closed' : 'active' }); draw(); });
      $$('[data-dl]', view).forEach(b => b.onclick = async () => { if (!await confirmDialog({ title: 'Xóa đợt khảo sát', message: 'Xóa đợt khảo sát và toàn bộ phiếu trả lời? Không thể hoàn tác.', ok: 'Xóa', tone: 'danger' })) return; await api.del(`api/admin/surveys/${b.dataset.dl}`); toast('Đã xóa.', 'ok'); draw(); });
    };
    await draw();
  },

  // ---------------------------------------------------------------- AI Guard
  async ai(view) {
    let tab = 'alerts';
    const aiSt = await api.get('api/ai/status').catch(() => ({ enabled: false }));
    const conn = () => `<section class="card pad row ai-conn" style="gap:14px;margin-bottom:4px"><span class="avatar sq" style="background:${aiSt.enabled ? 'var(--brand)' : 'var(--muted)'}">${icon('sparkles')}</span><div class="grow" style="min-width:200px"><b class="small">${aiSt.enabled ? `AI đang bật · ${esc(aiSt.label || aiSt.model || '')}` : 'AI chưa bật (đang dùng bộ luật có sẵn)'}</b><div class="xs muted">${aiSt.enabled ? 'Trợ lý AI và Tra cứu lừa đảo đang dùng mô hình ngôn ngữ thật.' : 'Điền ANTHROPIC_API_KEY, OPENAI_API_KEY hoặc GEMINI_API_KEY vào tệp .env rồi khởi động lại máy chủ.'}</div><div class="xs" id="aiTestOut"></div></div><div class="row" style="gap:6px"><button class="btn ghost sm" id="aiTest">${icon('refresh')} Kiểm tra</button><button class="btn sm" id="aiConf">${icon('key')} Cấu hình AI</button></div></section>`;
    const draw = async () => {
      let body = '';
      if (tab === 'alerts') {
        const r = await api.get('api/admin/alerts');
        body = `<div class="stack">${r.items.map(a => `<div class="card row nowrap" style="padding:14px 16px;gap:14px;align-items:stretch;${a.status === 'open' ? `border-color:color-mix(in srgb,${LEVEL[a.level][2]} 40%,transparent)` : 'opacity:.75'}"><span class="sev" style="background:${LEVEL[a.level][2]}"></span><div class="grow stack" style="gap:4px"><div class="row" style="gap:6px">${badge(LEVEL[a.level][0], LEVEL[a.level][1])}${badge({ ai: 'Trợ lý AI', report: 'Tố giác', chat: 'Chat chung', counseling: 'Hộp thư tư vấn', mood: 'Theo dõi cảm xúc' }[a.source] || a.source, 'info')}${a.status === 'open' ? badge('Chưa xử lý', 'warn') : badge('Đã xử lý', 'ok')}</div><b>${esc(a.title)}</b><p class="small ink2">${esc(a.context)}</p><div class="xs muted">${esc(a.name || '')}${a.className ? ' · ' + esc(a.className) : ''} · ${fmtDateTime(a.at)}${a.keywords?.length ? ' · Từ khóa: ' + a.keywords.map(esc).join(', ') : ''}${a.handledBy ? ' · Xử lý bởi ' + esc(a.handledBy) : ''}</div></div>${a.status === 'open' ? `<button class="btn ok sm" data-h="${a.id}" style="align-self:center">${icon('check')} Đã xử lý</button>` : ''}</div>`).join('') || empty('Không có cảnh báo', '', 'shieldCheck')}</div>`;
      } else if (tab === 'logs') {
        const r = await api.get('api/admin/ai/logs');
        body = `<section class="card"><div class="card-body"><div class="table-wrap"><table class="tbl"><thead><tr><th>Học sinh</th><th>Câu hỏi gần nhất</th><th class="c">Tin nhắn</th><th>Cảnh báo</th><th>Cập nhật</th></tr></thead><tbody>${r.items.map(c => `<tr class="click" data-log="${c.id}"><td><div class="row nowrap">${avatar({ id: c.userId, name: c.name, avatar: c.avatar }, 'sm')}<div><b class="small">${esc(c.name)}</b><div class="xs muted">${esc(c.className)}</div></div></div></td><td class="small truncate" style="max-width:340px">${esc(c.last)}</td><td class="c num">${c.count}</td><td>${c.flagged ? badge(LEVEL[c.flagged][0], LEVEL[c.flagged][1]) : '<span class="xs muted">—</span>'}</td><td class="small muted">${ago(c.updatedAt)}</td></tr>`).join('')}</tbody></table></div></div></section>`;
      } else if (tab === 'config') {
        const { config: g } = await api.get('api/admin/ai/guard');
        const CAT = { mental: ['Khủng hoảng tâm lý, tự hại', 'red'], weapons: ['Vũ khí, hung khí', 'red'], violence: ['Bạo lực, đe dọa', 'orange'], drugs: ['Chất cấm, ma túy', 'orange'], cyber: ['Lừa đảo, bắt nạt mạng', 'yellow'] };
        body = `<form class="card" id="gf"><div class="card-body stack lg"><div class="row between"><div><b>Độ nhạy phát hiện</b><p class="small muted">Độ nhạy thấp bỏ qua cảnh báo mức Theo dõi.</p></div><div class="seg">${[['low', 'Thấp'], ['medium', 'Vừa'], ['high', 'Cao']].map(([k, l]) => `<button type="button" data-sens="${k}" class="${g.sensitivity === k ? 'active' : ''}">${l}</button>`).join('')}</div></div>
          <div class="grid g3">${[['autoAlert', 'Tự động phát cảnh báo cho nhà trường'], ['autoHotline', 'Hiện đường dây nóng cho học sinh'], ['autoFilterChat', 'Lọc ngôn từ trên kênh chat chung']].map(([k, l]) => `<label class="card soft switch" style="padding:12px 14px"><input type="checkbox" name="${k}" ${g[k] ? 'checked' : ''}><span class="track"></span><span class="small">${l}</span></label>`).join('')}</div>
          <div class="grid g2">${Object.entries(CAT).map(([k, [l, lv]]) => `<div class="field"><label for="kw_${k}" class="row" style="gap:8px">${l} ${badge(LEVEL[lv][0], LEVEL[lv][1])}</label><textarea id="kw_${k}" name="kw_${k}" rows="3">${esc(g.keywords[k] || '')}</textarea><span class="hint">Các từ khóa cách nhau bởi dấu phẩy, nhận diện cả khi viết không dấu.</span></div>`).join('')}</div></div>
          <div class="card-foot"><span class="small muted grow">Cập nhật ${ago(g.updatedAt)} bởi ${esc(g.updatedBy || '')}</span><button class="btn" id="gs">${icon('check')} Lưu cấu hình</button></div></form>
          <section class="card pad stack"><b>${icon('sparkles')} Thử AI Guard</b><div class="row nowrap"><input class="input grow" id="tg" placeholder="Nhập một câu để kiểm tra, ví dụ: bị chặn đường dọa đánh"><button class="btn soft" id="tgo">Kiểm tra</button></div><div id="tres" class="small"></div></section>`;
        S._guard = g;
      } else if (tab === 'aiconf') {
        const c = await api.get('api/admin/ai/config');
        S._aiconf = c;
        const SRC = { admin: ['Đang dùng cấu hình nhập trên web', 'ok'], env: ['Đang dùng khóa trong tệp .env', 'info'], preview: ['Bản xem trước: dùng Claude của người xem', 'violet'], none: ['Chưa bật AI', 'warn'] };
        const dis = c.canEdit ? '' : 'disabled';
        const opts = [...c.providers.map(p => [p.id, p.name, p.note || '']), ...(c.envAvailable ? [['', 'Theo tệp .env', 'Dùng khóa API khai báo trong tệp .env của máy chủ']] : []), ['off', 'Tắt AI', 'Chỉ dùng bộ luật có sẵn, không gọi AI']];
        body = `<form class="card" id="acf"><div class="card-head"><div><h2>${icon('key')} Kết nối mô hình AI</h2><div class="sub">Dùng cho Trợ lý học đường AI và Tra cứu lừa đảo AI</div></div>${badge(SRC[c.source]?.[0] || '', SRC[c.source]?.[1] || '')}</div><div class="card-body stack lg">
          ${c.mode === 'demo' ? `<div class="card soft small" style="padding:10px 14px">${icon('info')} Đây là bản xem trước chạy trong trình duyệt: AI dùng tài khoản Claude của người xem. Khóa API nhập ở đây chỉ có tác dụng khi chạy máy chủ thật (<span class="mono">npm start</span>).</div>` : ''}
          ${!c.canEdit ? `<div class="card soft small" style="padding:10px 14px">${icon('lock')} Chỉ tài khoản Ban Giám hiệu (quản trị) được thay đổi cấu hình AI.</div>` : ''}
          <div class="field"><label>Nhà cung cấp AI</label><div class="ai-prov">${opts.map(([id, name, note]) => `<label class="ai-opt"><input type="radio" name="provider" value="${id}" ${c.provider === id || (!c.provider && id === '' && c.envAvailable) || (!c.provider && !c.envAvailable && id === 'mirai') ? 'checked' : ''} ${dis}><span><b>${esc(name)}</b>${note ? `<small>${esc(note)}</small>` : ''}</span></label>`).join('')}</div></div>
          <div class="field-row" id="acFields">
            <div class="field" data-need="key"><label for="acKey">Khóa API <a class="xs" id="acKeyLink" href="#" target="_blank" rel="noopener" style="margin-left:6px">Lấy khóa ↗</a></label><input id="acKey" name="apiKey" type="password" autocomplete="off" placeholder="${c.hasKey ? `Đã lưu ${esc(c.keyHint)} · để trống nếu không đổi` : 'Dán khóa API vào đây'}" ${dis}><span class="hint">Khóa chỉ lưu trên máy chủ của trường (data/db.json), không gửi lại về trình duyệt.</span></div>
            <div class="field" data-need="model"><label for="acModel">Mô hình <span class="xs muted">(không bắt buộc)</span></label><input id="acModel" name="model" list="acModels" placeholder="Để trống: dùng mô hình mặc định" value="${esc(c.model)}" ${dis}><datalist id="acModels"></datalist></div>
            <div class="field full" data-need="base"><label for="acBase">Địa chỉ máy chủ AI (Base URL)</label><input id="acBase" name="baseUrl" inputmode="url" placeholder="Ví dụ: https://api.groq.com/openai/v1 · https://openrouter.ai/api/v1 · http://localhost:11434/v1" value="${esc(c.baseUrl)}" ${dis}></div>
          </div>
          <div class="grid g2">${[['chat', 'Trợ lý học đường AI', 'Trả lời câu hỏi, phân tích tin nhắn lừa đảo trong khung chat'], ['scam', 'Tra cứu lừa đảo AI', 'Phân tích tin nhắn, đường link đáng ngờ']].map(([k, t, d]) => `<label class="card soft switch" style="padding:12px 14px;align-items:flex-start"><input type="checkbox" name="f_${k}" ${c.features[k] ? 'checked' : ''} ${dis}><span class="track"></span><span><b class="small">${t}</b><div class="xs muted">${d}</div></span></label>`).join('')}</div>
          <div id="acOut" class="small"></div>
        </div><div class="card-foot"><span class="small muted grow">${c.updatedAt ? `Cập nhật ${ago(c.updatedAt)} bởi ${esc(c.updatedBy || '')}` : 'Chưa lưu cấu hình trên web'}</span><button type="button" class="btn ghost" id="acTest">${icon('refresh')} Kiểm tra kết nối</button>${c.canEdit ? `<button class="btn" id="acSave">${icon('check')} Lưu & bật AI</button>` : ''}</div></form>
        <section class="card pad stack"><b>${icon('info')} Hướng dẫn nhanh</b><ol class="small ink2" style="margin:0;padding-left:20px;display:grid;gap:6px"><li>Chọn nhà cung cấp. <b>MiraiAPI</b> đã điền sẵn địa chỉ <span class="mono">https://api.miraiapi.com/v1</span> và mô hình <span class="mono">claude-opus-4.8</span>; <b>Google Gemini</b> có gói miễn phí.</li><li>Dán khóa API (dạng <span class="mono">sk-…</span>) vào ô Khóa API. Với Claude, Gemini, OpenAI có nút <b>Lấy khóa ↗</b> để tạo khóa.</li><li>Bấm <b>Kiểm tra kết nối</b>; thấy ✓ thì bấm <b>Lưu & bật AI</b>. Áp dụng ngay, không cần khởi động lại máy chủ.</li><li>AI lỗi hoặc hết hạn mức: hệ thống tự chuyển về bộ luật có sẵn, học sinh không bị gián đoạn.</li></ol></section>`;
      } else {
        const r = await api.get('api/admin/scam/stats');
        body = `<div class="grid g4">${[['Tổng lượt tra cứu', r.total, 'var(--brand)'], ['An toàn', r.byLevel.safe, 'var(--ok)'], ['Cảnh báo', r.byLevel.warning, 'var(--warn)'], ['Cực kỳ nguy hiểm', r.byLevel.danger, 'var(--bad)']].map(([k, v, c]) => `<div class="card stat" style="--c:${c}"><div class="k"><span class="si">${icon('shieldCheck')}</span><span class="k-lbl">${k}</span></div><div class="v" style="color:${c}">${v}</div></div>`).join('')}</div>
        <div class="grid g2"><section class="card"><div class="card-head"><h2>${icon('phone')} Số điện thoại bị báo cáo</h2></div><div class="card-body"><div class="table-wrap"><table class="tbl"><thead><tr><th>Số</th><th class="c">Báo cáo</th><th>Thủ đoạn</th></tr></thead><tbody>${r.db.phones.map(p => `<tr><td class="mono small">${esc(p.number)}</td><td class="c"><b>${p.reports}</b></td><td class="small">${esc(p.note)}</td></tr>`).join('')}</tbody></table></div></div></section>
        <section class="card"><div class="card-head"><h2>${icon('bank')} Tài khoản & tên miền</h2></div><div class="card-body"><div class="table-wrap"><table class="tbl"><thead><tr><th>Đối tượng</th><th class="c">Báo cáo</th><th>Ghi chú</th></tr></thead><tbody>${r.db.accounts.map(a => `<tr><td class="mono small">${esc(a.number)}<div class="xs muted">${esc(a.bank || '')}</div></td><td class="c"><b>${a.reports}</b></td><td class="small">${esc(a.note)}</td></tr>`).join('')}${r.db.domains.map(d => `<tr><td class="mono small">${esc(d.domain)}</td><td class="c"><b>${d.reports}</b></td><td class="small">${esc(d.note)}</td></tr>`).join('')}</tbody></table></div></div></section></div>
        <section class="card"><div class="card-head"><h2>${icon('history')} Tra cứu gần đây</h2></div><div class="card-body"><div class="table-wrap"><table class="tbl"><thead><tr><th>Loại</th><th>Nội dung</th><th>Kết quả</th><th class="r">Điểm</th><th>Lúc</th></tr></thead><tbody>${r.recent.map(c => `<tr><td class="small">${({ message: 'Tin nhắn', url: 'Đường link', phone: 'Số điện thoại', account: 'Tài khoản' })[c.kind]}</td><td class="small truncate" style="max-width:360px">${esc(c.input)}</td><td>${badge({ safe: 'An toàn', warning: 'Cảnh báo', danger: 'Nguy hiểm' }[c.level], { safe: 'ok', warning: 'warn', danger: 'bad' }[c.level])}</td><td class="r num">${c.score}</td><td class="small muted">${ago(c.at)}</td></tr>`).join('') || '<tr><td colspan="5" class="muted small">Chưa có lượt tra cứu</td></tr>'}</tbody></table></div></div></section>`;
      }
      view.innerHTML = head('Quản lý Chat AI & giám sát an toàn AI Guard', 'Theo dõi hội thoại với Trợ lý AI, cấu hình bộ lọc từ khóa nguy hiểm và xử lý cảnh báo đỏ để can thiệp kịp thời.') + conn() + `<div class="tabs">${[['alerts', 'siren', 'Cảnh báo'], ['logs', 'bot', 'Nhật ký hội thoại AI'], ['config', 'sliders', 'Cấu hình AI Guard'], ['scam', 'shieldCheck', 'Tra cứu lừa đảo'], ['aiconf', 'key', 'Kết nối AI']].map(([k, i, l]) => `<button class="tab ${tab === k ? 'active' : ''}" data-tab="${k}">${icon(i)} ${l}</button>`).join('')}</div>` + body;
      $$('[data-tab]', view).forEach(b => b.onclick = () => { tab = b.dataset.tab; draw(); });
      $('#aiTest').onclick = (ev) => withBusy(ev.currentTarget, async () => { const r = await api.post('api/admin/ai/test').catch(e => ({ ok: false, message: e.message })); $('#aiTestOut').innerHTML = r.ok ? `<span style="color:var(--ok)">✓ Kết nối tốt (${r.ms} ms): “${esc(r.reply)}”</span>` : `<span style="color:var(--bad)">✗ ${esc(r.message || 'Không kết nối được AI')}</span>`; });
      $('#aiConf').onclick = () => { tab = 'aiconf'; draw(); };
      if (tab === 'aiconf') {
        const c = S._aiconf, f = $('#acf');
        const prov = () => f.querySelector('input[name=provider]:checked')?.value ?? '';
        const sync = () => {
          const p = c.providers.find(x => x.id === prov());
          $$('[data-need]', f).forEach(el => { const need = el.dataset.need; el.hidden = !p || (need === 'base' && !p.needsBaseUrl && !p.defaultBaseUrl); });
          $('#acBase').placeholder = p?.defaultBaseUrl ? `Để trống: ${p.defaultBaseUrl}` : 'Ví dụ: https://api.groq.com/openai/v1 · https://openrouter.ai/api/v1 · http://localhost:11434/v1';
          $('#acModels').innerHTML = (p?.models || []).map(m => `<option value="${m}">`).join('');
          $('#acModel').placeholder = p?.models?.[0] ? `Để trống: ${p.models[0]}` : 'Tên mô hình, ví dụ llama-3.3-70b-versatile';
          const link = $('#acKeyLink'); link.hidden = !p?.keyUrl; if (p?.keyUrl) link.href = p.keyUrl;
          if (p && !c.hasKey) $('#acKey').placeholder = p.keyPlaceholder || 'Dán khóa API vào đây';
        };
        $$('input[name=provider]', f).forEach(r => r.onchange = sync); sync();
        const payload = () => { const d = formData(f); return { provider: prov(), apiKey: d.apiKey || '', model: d.model || '', baseUrl: d.baseUrl || '', features: { chat: !!d.f_chat, scam: !!d.f_scam } }; };
        const out = (r) => { $('#acOut').innerHTML = r.ok ? `<span style="color:var(--ok)">✓ Kết nối tốt · ${esc(r.label || r.model || '')} · ${r.ms} ms · “${esc(r.reply)}”</span>` : `<span style="color:var(--bad)">✗ ${esc(r.message || 'Không kết nối được AI')}</span>`; };
        $('#acTest').onclick = (ev) => withBusy(ev.currentTarget, async () => { try { out(await api.post('api/admin/ai/test', payload())); } catch (e) { out({ ok: false, message: e.message }); } });
        f.onsubmit = (e) => { e.preventDefault(); if (!c.canEdit) return; withBusy($('#acSave'), async () => {
          try {
            const r = await api.put('api/admin/ai/config', payload());
            toast(r.status.enabled ? `Đã bật AI: ${r.status.label}` : r.provider === 'off' ? 'Đã tắt AI.' : 'Đã lưu cấu hình AI.', 'ok');
            Object.assign(aiSt, { enabled: r.status.enabled, label: r.status.label });
            if (r.status.enabled) { const t = await api.post('api/admin/ai/test').catch(() => null); await draw(); if (t) out(t); } else draw();
          } catch (er) { showError(er); }
        }); };
      }
      $$('[data-h]', view).forEach(b => b.onclick = async () => { await api.patch(`api/admin/alerts/${b.dataset.h}`, { status: 'handled' }); toast('Đã đánh dấu xử lý.', 'ok'); refreshCounts(); draw(); });
      $$('[data-log]', view).forEach(tr => tr.onclick = async () => { const { item: c } = await api.get(`api/admin/ai/logs/${tr.dataset.log}`); modal({ title: `Hội thoại AI · ${c.name}`, sub: `${esc(c.className)} · ${c.messages.length} tin nhắn`, size: 'wide', body: `<div class="chat-body" style="border-radius:16px;max-height:60vh">${c.messages.map(m => `<div class="msg ${m.role === 'user' ? '' : 'me'}"><div><div class="who">${m.role === 'user' ? esc(c.name) : 'Trợ lý AI'}${m.guard ? badge(m.guard.levelName || '', LEVEL[m.guard.level][1]) : ''}</div><div class="bubble md" style="white-space:normal">${md(m.text)}</div><div class="time">${fmtDateTime(m.at)}</div></div></div>`).join('')}</div>`, foot: '<button class="btn" data-close>Đóng</button>' }); });
      if (tab === 'config') {
        let sens = S._guard.sensitivity;
        $$('[data-sens]', view).forEach(b => b.onclick = () => { sens = b.dataset.sens; $$('[data-sens]', view).forEach(x => x.classList.toggle('active', x === b)); });
        $('#gf').onsubmit = (e) => { e.preventDefault(); const f = formData(e.target); withBusy($('#gs'), async () => { try { await api.put('api/admin/ai/guard', { sensitivity: sens, autoAlert: f.autoAlert, autoHotline: f.autoHotline, autoFilterChat: f.autoFilterChat, keywords: Object.fromEntries(['mental', 'weapons', 'violence', 'drugs', 'cyber'].map(k => [k, f['kw_' + k]])) }); toast('Đã lưu cấu hình AI Guard.', 'ok'); } catch (er) { showError(er); } }); };
        $('#tgo').onclick = async () => { const { scanGuard } = await import('../shared/ai/guard.js').catch(() => ({})); const txt = $('#tg').value; if (!scanGuard) return; const f = formData($('#gf')); const r = scanGuard(txt, { sensitivity: sens, keywords: Object.fromEntries(['mental', 'weapons', 'violence', 'drugs', 'cyber'].map(k => [k, f['kw_' + k]])) }); $('#tres').innerHTML = r ? `${badge(r.levelName, LEVEL[r.level][1])} ${esc(r.categories.join(', '))} · từ khóa: <b>${esc(r.keywords.join(', '))}</b>` : `${badge('An toàn', 'ok')} Không phát hiện từ khóa nguy hiểm.`; };
      }
    };
    await draw();
  },

  // ---------------------------------------------------------------- Tra cứu lừa đảo AI
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
      view.innerHTML = head('Tra cứu & quét dấu hiệu lừa đảo AI', 'Công cụ 4-trong-1: kiểm tra tin nhắn, đường link, số điện thoại và số tài khoản đáng ngờ.', aiPill(ai)) + `
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
          <section class="card pad stack" style="background:var(--brand-soft);border-color:transparent"><b>${icon('shieldCheck')} Xử lý khi phát hiện lừa đảo</b><p class="small ink2">Lưu lại bằng chứng, báo cáo đối tượng lừa đảo vào cơ sở dữ liệu toàn trường và cảnh báo kịp thời cho học sinh, phụ huynh.</p></section>
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
      ${r.kind !== 'message' ? `<div class="card-foot"><span class="small muted grow">Phát hiện số điện thoại / tài khoản / đường link lừa đảo?</span><button class="btn danger soft sm" id="rep">${icon('flag')} Báo cáo lừa đảo</button></div>` : ''}</div></section>`;
    const aiCard = (r) => r.ai ? `<div class="card ai-card"><div class="card-head"><h2>${icon('sparkles')} Phân tích của AI</h2><span class="xs muted">${esc(r.ai.model || 'AI')}</span></div><div class="card-body stack">
        ${r.ai.redFlags.length ? `<div>${r.ai.redFlags.map(f => `<div class="finding"><span class="medal" style="background:var(--violet)">${icon('alert')}</span><div><b class="small">${esc(f.label)}</b>${f.detail ? `<p class="small ink2">${esc(f.detail)}</p>` : ''}</div></div>`).join('')}</div>` : ''}
        ${r.ai.advice.length ? `<div class="stack" style="gap:6px"><b class="small">${icon('checkCircle')} Việc nên làm ngay</b><ol class="ai-steps">${r.ai.advice.map(a => `<li>${esc(a)}</li>`).join('')}</ol></div>` : ''}
        ${r.ai.reply ? `<div class="leave-card"><b class="small">${icon('message')} Gợi ý phản hồi an toàn</b><div class="small">${esc(r.ai.reply)}</div></div>` : ''}
        <div class="xs muted">AI có thể nhầm lẫn. Luôn xác minh qua kênh chính thức.</div>
      </div></div>` : r.aiError ? `<div class="card pad small muted row nowrap" style="gap:8px">${icon('info')} ${esc(r.aiError)}</div>` : '';
    const bindResult = (r) => { const b = $('#rep'); if (b) b.onclick = () => modal({ title: 'Báo cáo lừa đảo', sub: 'Giúp cộng đồng học sinh và giáo viên cảnh giác hơn', body: `<div class="field"><label>Đối tượng</label><input class="input mono" value="${esc(r.normalized || r.host || r.input)}" disabled></div><div class="field"><label for="rn">Mô tả thủ đoạn</label><textarea id="rn" placeholder="Ví dụ: Gọi điện mạo danh giáo viên, báo con bị tai nạn…"></textarea></div>`, foot: '<button class="btn ghost" data-close>Hủy</button><button class="btn danger" id="rsend">Gửi báo cáo</button>', onMount: (m, close) => $('#rsend', m).onclick = async () => { try { const x = await api.post('api/ai/scam-report', { kind: r.kind, value: r.input, note: $('#rn', m).value }); toast(x.message, 'ok'); close(); } catch (e) { showError(e); } } }); };
    draw();
  },

  // ---------------------------------------------------------------- Trợ lý học đường AI
  async 'ai-chat'(view) {
    const [hist, ai] = await Promise.all([api.get('api/ai/conversations/mine'), api.get('api/ai/status').catch(() => ({ enabled: false }))]);
    let convId = hist.conversation?.id || null;
    const msgs = hist.conversation?.messages || [];
    const defaultChips = ['Kế hoạch ôn thi', 'Ứng phó bắt nạt', 'Dấu hiệu lừa đảo', 'Công thức đạo hàm'];
    let chips = [...defaultChips];
    view.innerHTML = head('Trợ lý học đường AI 24/7', 'Hỗ trợ giáo viên và học sinh tra cứu kiến thức, phân tích tình huống sư phạm, nhận diện lừa đảo và tư vấn tâm lý học đường.') + `
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
      <form class="chat-input" id="cf"><textarea id="ct" rows="1" maxlength="1500" placeholder="Hỏi Trợ lý AI bất cứ điều gì…" aria-label="Câu hỏi cho trợ lý AI"></textarea><button class="btn icon" aria-label="Gửi">${icon('send')}</button></form>
    </section>`;
    const cb = $('#cb'), chipBox = $('#aiChips');
    const mapPage = (p) => (p === 'report' ? 'reports' : p);
    const bubble = (m) => m.role === 'user' ? `<div class="msg me"><div><div class="bubble">${esc(m.text)}</div>${m.at ? `<div class="time">${fmtTime(m.at)}</div>` : ''}</div></div>`
      : `<div class="msg"><span class="avatar sm sq ai-msg-av">${icon('bot')}</span><div style="min-width:0"><div class="bubble md" style="white-space:normal">${md(m.text)}${m.guard?.showHotline ? `<div class="leave-card" style="margin-top:8px;background:var(--bad-soft);border-color:color-mix(in srgb,var(--bad) 30%,transparent)"><b style="color:var(--bad)">${icon('siren')} Đường dây hỗ trợ</b><div class="small">111 · Bảo vệ trẻ em (24/7) &nbsp;·&nbsp; 115 · Cấp cứu &nbsp;·&nbsp; 113 · Công an</div></div>` : ''}</div>${m.scan ? scanCard(m.scan) : ''}${m.actions?.length ? `<div class="row" style="gap:6px;margin-top:5px">${m.actions.map((a) => `<a class="btn soft sm" href="#${mapPage(a.page)}" ${a.page === 'scam' && m.scan ? `data-scan="${esc(JSON.stringify({ kind: m.scan.kind, input: m.scan.input }))}"` : ''}>${esc(a.label)} ${icon('arrowRight')}</a>`).join('')}</div>` : ''}${m.at || m.engine === 'llm' ? `<div class="time">${m.engine === 'llm' ? `<span class="ai-src">${icon('sparkles')} AI</span> ` : ''}${m.at ? fmtTime(m.at) : ''}</div>` : ''}</div></div>`;
    const SC = { safe: ['ok', 'An toàn'], warning: ['warn', 'Cảnh báo'], danger: ['bad', 'Nguy hiểm'] };
    const scanCard = (sc) => `<div class="scan-mini ${sc.level}">${icon('shieldAlert')}<div class="grow"><b class="small">Quét lừa đảo: ${esc(sc.label || SC[sc.level]?.[1] || '')}</b><div class="xs muted">Điểm rủi ro theo bộ luật ${sc.score}/100</div></div>${badge(SC[sc.level]?.[1] || '', SC[sc.level]?.[0] || '')}</div>`;
    const intro = { role: 'assistant', text: `Chào thầy/cô **${esc(firstName(S.user.name))}**! 👋 Mình là **Trợ lý Học đường AI**.\n- **Chuyên môn**: tra cứu kiến thức, gợi ý ôn tập & hoạt động lớp\n- **Học đường**: tình huống sư phạm, tư vấn tâm lý, phân tích lừa đảo` };
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

  // ---------------------------------------------------------------- Nội dung
  async content(view) {
    let tab = 'news';
    const draw = async () => {
      const r = await api.get(`api/admin/${tab}`);
      view.innerHTML = head('Quản lý cẩm nang học đường & bản tin', 'Đăng bài kỹ năng sống, phòng chống tệ nạn; ghim bài hướng dẫn quan trọng lên đầu trang.', `<button class="btn" id="add">${icon('plus')} ${tab === 'news' ? 'Đăng bản tin' : 'Thêm bài cẩm nang'}</button>`) + `
      <div class="tabs"><button class="tab ${tab === 'news' ? 'active' : ''}" data-tab="news">${icon('news')} Bản tin tuyên truyền (${tab === 'news' ? r.items.length : ''})</button><button class="tab ${tab === 'handbook' ? 'active' : ''}" data-tab="handbook">${icon('bookOpen')} Cẩm nang học đường</button></div>
      <section class="card"><div class="card-body"><div class="table-wrap"><table class="tbl"><thead><tr><th>Tiêu đề</th><th>Chuyên mục</th><th class="r">Lượt xem</th><th>Cập nhật</th><th class="c">Ghim</th><th class="c">Hiển thị</th><th></th></tr></thead><tbody>
      ${r.items.map(x => `<tr><td><b class="small clamp-2" style="max-width:420px">${esc(x.title)}</b><div class="xs muted">${esc(x.author || '')}</div></td><td>${badge(x.badge || x.category, 'info')}</td><td class="r num">${num(x.views)}</td><td class="small muted">${ago(x.updatedAt || x.publishedAt)}</td><td class="c"><label class="switch"><input type="checkbox" data-pin="${x.id}" ${x.pinned ? 'checked' : ''}><span class="track"></span></label></td><td class="c"><label class="switch"><input type="checkbox" data-act="${x.id}" ${x.active !== false ? 'checked' : ''}><span class="track"></span></label></td><td class="r"><button class="btn icon ghost sm" data-e="${x.id}">${icon('edit')}</button><button class="btn icon ghost sm" data-d="${x.id}" style="color:var(--bad)">${icon('trash')}</button></td></tr>`).join('')}</tbody></table></div></div></section>`;
      $$('[data-tab]', view).forEach(b => b.onclick = () => { tab = b.dataset.tab; draw(); });
      const form = (x) => formModal({ title: x ? 'Sửa bài viết' : tab === 'news' ? 'Đăng bản tin' : 'Thêm bài cẩm nang', size: 'wide', submit: x ? 'Lưu thay đổi' : 'Đăng bài', fields: [
        { name: 'title', label: 'Tiêu đề', required: true, full: true, value: x?.title || '' },
        tab === 'news' ? { name: 'category', label: 'Chuyên mục', type: 'select', value: x?.category, options: Object.entries(S.meta.newsCategories).map(([value, label]) => ({ value, label })) } : { name: 'category', label: 'Chuyên mục', required: true, value: x?.category || '', list: ['Phòng chống bạo lực', 'Kỹ năng tự vệ', 'Pháp luật học đường', 'An toàn không gian mạng', 'Tư vấn tâm lý'].map(v => ({ value: v, label: v })) },
        { name: 'author', label: 'Tác giả / đơn vị', value: x?.author || S.user.name },
        { name: 'summary', label: 'Tóm tắt', type: 'textarea', rows: 2, full: true, value: x?.summary || '' },
        { name: 'content', label: 'Nội dung', type: 'textarea', rows: 10, full: true, required: true, value: x?.content || '', hint: 'Xuống dòng để tách đoạn. Dùng “- ” đầu dòng cho danh sách.' },
        ...(tab === 'news' ? [{ name: 'cover', label: 'Ảnh bìa (không bắt buộc)', type: 'image', full: true, value: x?.cover || '' }] : []),
        { name: 'pinned', label: 'Ghim lên đầu trang', type: 'switch', value: x?.pinned }, { name: 'active', label: 'Hiển thị cho học sinh', type: 'switch', value: x ? x.active !== false : true },
      ], onSubmit: async (d, close) => { if (!d.cover && !x?.cover) delete d.cover; await (x ? api.put(`api/admin/${tab}/${x.id}`, d) : api.post(`api/admin/${tab}`, d)); toast('Đã lưu bài viết.', 'ok'); close(); draw(); } });
      $('#add').onclick = () => form(null);
      $$('[data-e]', view).forEach(b => b.onclick = async () => { const x = r.items.find(i => i.id === b.dataset.e); form(x); });
      $$('[data-d]', view).forEach(b => b.onclick = async () => { if (!await confirmDialog({ title: 'Xóa bài viết', message: 'Xóa bài viết này?', ok: 'Xóa', tone: 'danger' })) return; await api.del(`api/admin/${tab}/${b.dataset.d}`); toast('Đã xóa.', 'ok'); draw(); });
      $$('[data-pin]', view).forEach(c => c.onchange = async () => { const x = r.items.find(i => i.id === c.dataset.pin); await api.put(`api/admin/${tab}/${x.id}`, { pinned: c.checked }); toast(c.checked ? 'Đã ghim bài viết.' : 'Đã bỏ ghim.', 'ok'); });
      $$('[data-act]', view).forEach(c => c.onchange = async () => { const x = r.items.find(i => i.id === c.dataset.act); await api.put(`api/admin/${tab}/${x.id}`, { active: c.checked }); toast(c.checked ? 'Đã hiển thị.' : 'Đã ẩn bài viết.', 'ok'); });
    };
    await draw();
  },

  // ---------------------------------------------------------------- Thông báo
  async broadcast(view) {
    const r = await api.get('api/admin/notifications');
    const T = { all: 'Toàn trường', students: 'Học sinh', staff: 'Giáo viên' };
    view.innerHTML = head('Phát thông báo toàn trường', 'Gửi thông báo realtime tới toàn trường, theo đối tượng hoặc theo lớp.', `<button class="btn" id="new">${icon('megaphone')} Soạn thông báo</button>`) + `
    <section class="card"><div class="card-head"><h2>${icon('history')} Đã phát gần đây</h2></div><div class="card-body list">${r.items.map(n => `<div class="item" style="align-items:flex-start"><span class="avatar sq sm" style="background:${n.type === 'urgent' ? 'var(--bad)' : n.type === 'warning' ? 'var(--warn)' : 'var(--brand)'}">${icon('megaphone')}</span><div class="grow"><div class="row" style="gap:6px"><b class="small">${esc(n.title)}</b>${badge(T[n.target] || (n.target.startsWith('class:') ? 'Lớp ' + n.target.slice(6) : n.target), 'info')}</div><p class="small ink2">${esc(n.content)}</p><span class="xs muted">${fmtDateTime(n.createdAt)} · ${n.reads} lượt đã đọc</span></div></div>`).join('') || empty('Chưa phát thông báo nào', '', 'megaphone')}</div></section>`;
    $('#new').onclick = () => broadcastModal();
  },

  // ---------------------------------------------------------------- Cấu hình
  async settings(view) {
    const { settings: s, modules } = await api.get('api/admin/settings');
    view.innerHTML = head('Quản lý giao diện & cấu hình nhà trường', 'Cập nhật nhận diện, biểu ngữ chạy, bật/tắt từng module trên Cổng Học Sinh và danh bạ đường dây nóng.') + `
    ${!isAdmin() ? `<div class="badge warn" style="height:auto;padding:10px 14px;border-radius:12px;white-space:normal">${icon('lock')} Chỉ tài khoản Ban Giám hiệu (admin) mới lưu được cấu hình. Bạn đang xem ở chế độ chỉ đọc.</div>` : ''}
    <form id="cf" class="stack lg">
      <div class="grid g-main">
        <section class="card"><div class="card-head"><h2>${icon('building')} Nhận diện nhà trường</h2></div><div class="card-body field-row">
          ${fieldHtml({ name: 'schoolName', label: 'Tên trường', value: s.schoolName, required: true })}${fieldHtml({ name: 'shortName', label: 'Tên ngắn', value: s.shortName })}
          ${fieldHtml({ name: 'slogan', label: 'Khẩu hiệu', value: s.slogan, full: true })}
          ${fieldHtml({ name: 'location', label: 'Địa phương', value: s.location })}${fieldHtml({ name: 'schoolYear', label: 'Năm học', value: s.schoolYear })}${fieldHtml({ name: 'semester', label: 'Học kỳ', value: s.semester })}
          ${fieldHtml({ name: 'apiPin', label: 'Mã PIN bảo vệ trang REST API', value: s.apiPin || '123456', required: true })}
          ${fieldHtml({ name: 'contactPhone', label: 'Hotline chân trang đăng nhập', value: s.contactPhone || '0269 3846 359 · Khẩn cấp: 111' })}
          ${fieldHtml({ name: 'contactEmail', label: 'Email chân trang đăng nhập', value: s.contactEmail || 'thptlehoan@sgddt.gialai.gov.vn' })}
          ${fieldHtml({ name: 'contactAddress', label: 'Địa chỉ nhà trường (chân trang đăng nhập)', value: s.contactAddress || 'Đường Trần Hưng Đạo, Thị trấn Chư Ty, Huyện Đức Cơ, Tỉnh Gia Lai, Việt Nam', full: true })}
          ${fieldHtml({ name: 'facebookUrl', label: 'Link Facebook (nút f chân trang)', value: s.facebookUrl || 'https://facebook.com', placeholder: 'https://facebook.com/...' })}
          ${fieldHtml({ name: 'linkedinUrl', label: 'Link LinkedIn / Cổng thông tin (nút in chân trang)', value: s.linkedinUrl || 'https://gialai.edu.vn', placeholder: 'https://gialai.edu.vn' })}
          ${fieldHtml({ name: 'zaloUrl', label: 'Link Zalo (nút Zalo chân trang)', value: s.zaloUrl || 'https://zalo.me', placeholder: 'https://zalo.me/...' })}
          ${fieldHtml({ name: 'creatorName', label: 'Tác giả / Người tạo trang web', value: s.creatorName || 'Vũ Nguyễn An Khang', full: true })}
          ${fieldHtml({ name: 'siteIntro', label: 'Giới thiệu trang web (hiển thị ở chân trang & mục Giới thiệu)', type: 'textarea', rows: 3, value: s.siteIntro || 'Cổng Học Đường Số Trường THPT Lê Hoàn là nền tảng trực tuyến hỗ trợ học sinh tố giác vi phạm ẩn danh, tư vấn tâm lý học đường 24/7, kết nối thầy cô, thi trắc nghiệm pháp luật và tích hợp trí tuệ nhân tạo (AI) phòng chống lừa đảo không gian mạng.', full: true })}
          ${fieldHtml({ name: 'logo', label: 'Logo chính thức', type: 'image', value: s.logo, full: true })}
          ${fieldHtml({ name: 'marquee', label: 'Biểu ngữ thông báo chạy (mỗi dòng một thông điệp)', type: 'textarea', rows: 4, value: s.marquee.join('\n'), full: true })}
        </div></section>
        <section class="card"><div class="card-head"><h2>${icon('sliders')} Module trên Cổng Học Sinh</h2></div><div class="card-body stack" style="gap:10px">${Object.entries(modules).map(([k, l]) => `<label class="switch row between" style="width:100%"><span class="small">${esc(l)}</span><span class="row nowrap"><input type="checkbox" name="mod_${k}" ${s.modules[k] !== false ? 'checked' : ''}><span class="track"></span></span></label>`).join('')}</div></section>
      </div>
      <section class="card"><div class="card-head"><h2>${icon('phone')} Danh bạ đường dây nóng</h2><button type="button" class="btn ghost sm" id="addH">${icon('plus')} Thêm số</button></div><div class="card-body stack" id="hl">${s.hotlines.map(hotRow).join('')}</div></section>
      <div class="row between"><div class="row">${isAdmin() ? `<button type="button" class="btn danger soft" id="reset">${icon('refresh')} Khôi phục dữ liệu mẫu</button>` : ''}</div><button class="btn lg" id="save" ${isAdmin() ? '' : 'disabled'}>${icon('check')} Lưu cấu hình</button></div>
    </form>`;
    $$('[data-image]', view).forEach(inp => inp.onchange = async () => { const f = inp.files[0]; if (!f) return; const d = await compressImage(f, 512, .9); const k = inp.dataset.image; $(`#f_${k}`).value = d; $(`#f_${k}_pv`).innerHTML = `<img src="${d}" alt="">`; const cb = $(`[data-clr-image="${k}"]`, view); if (cb) cb.hidden = false; });
    $$('[data-clr-image]', view).forEach(btn => btn.onclick = () => { const k = btn.dataset.clrImage; $(`#f_${k}`, view).value = ''; $(`#f_${k}_pv`, view).innerHTML = ''; const fi = $(`[data-image="${k}"]`, view); if (fi) fi.value = ''; btn.hidden = true; });
    $('#addH').onclick = () => { $('#hl').insertAdjacentHTML('beforeend', hotRow({ name: '', number: '', note: '' })); bindHot(); };
    const bindHot = () => $$('[data-rmh]', view).forEach(b => b.onclick = () => b.closest('.row').remove());
    bindHot();
    $('#reset') && ($('#reset').onclick = async () => { if (!await confirmDialog({ title: 'Khôi phục dữ liệu mẫu', message: 'Toàn bộ dữ liệu hiện tại sẽ bị thay bằng dữ liệu mẫu ban đầu. Bạn sẽ cần đăng nhập lại.', ok: 'Khôi phục', tone: 'danger' })) return; await api.post('api/admin/reset-demo'); session.clear(); location.href = 'staff.html'; });
    $('#cf').onsubmit = (e) => {
      e.preventDefault(); const f = formData(e.target);
      const hotlines = $$('#hl .row').map(r => ({ name: $('[data-h="name"]', r).value, number: $('[data-h="number"]', r).value, note: $('[data-h="note"]', r).value })).filter(h => h.name && h.number);
      withBusy($('#save'), async () => { try { const r = await api.put('api/admin/settings', { schoolName: f.schoolName, shortName: f.shortName, slogan: f.slogan, location: f.location, schoolYear: f.schoolYear, semester: f.semester, apiPin: f.apiPin || '123456', contactPhone: f.contactPhone, contactEmail: f.contactEmail, contactAddress: f.contactAddress, facebookUrl: f.facebookUrl, linkedinUrl: f.linkedinUrl, zaloUrl: f.zaloUrl, creatorName: f.creatorName, siteIntro: f.siteIntro, logo: f.logo === '' ? '' : (f.logo.startsWith('data:') ? f.logo : undefined), marquee: f.marquee.split('\n'), modules: Object.fromEntries(Object.keys(modules).map(k => [k, f['mod_' + k]])), hotlines }); S.settings = { ...S.settings, ...r.settings }; toast('Đã lưu cấu hình. Cổng Học Sinh cập nhật ngay.', 'ok'); } catch (er) { showError(er); } });
    };
  },

  // ---------------------------------------------------------------- Nhật ký & góp ý
  async logs(view) {
    const draw = async () => {
      const [a, f] = await Promise.all([api.get('api/admin/audit'), api.get('api/admin/feedback')]);
      const hasAny = a.items.length > 0 || f.items.length > 0;
      view.innerHTML = head('Nhật ký hệ thống & góp ý', 'Lịch sử thao tác quản trị và đánh giá chất lượng ứng dụng từ người dùng.', `${hasAny ? `<button class="btn ghost" id="rstLogs" style="color:var(--bad)">${icon('refresh')} Đặt về mặc định</button>` : ''}<button class="btn ghost" id="expF">${icon('download')} Xuất góp ý</button><a class="btn ghost" href="docs.html" target="_blank" rel="noopener">${icon('code')} Tài liệu API</a>`) + `
      <div class="grid g-main"><section class="card"><div class="card-head"><h2>${icon('history')} Nhật ký thao tác</h2>${a.items.length ? `<button class="btn ghost sm" id="clrAudit" style="color:var(--bad)">${icon('trash')} Xóa nhật ký</button>` : ''}</div><div class="card-body"><div class="table-wrap"><table class="tbl"><thead><tr><th>Thời gian</th><th>Người thực hiện</th><th>Thao tác</th><th>Chi tiết</th></tr></thead><tbody>${a.items.map(x => `<tr><td class="small num">${fmtDateTime(x.at)}</td><td class="small"><b>${esc(x.name)}</b></td><td class="small">${esc(x.action)}</td><td class="small muted">${esc(x.detail)}</td></tr>`).join('') || '<tr><td colspan="4" class="small muted">Chưa có nhật ký</td></tr>'}</tbody></table></div></div></section>
      <section class="card"><div class="card-head"><h2>${icon('star')} Góp ý ứng dụng</h2><div class="row nowrap" style="gap:6px">${f.average ? badge(`${f.average}/5 sao`, 'warn') : ''}${f.items.length ? `<button class="btn ghost sm" id="clrFb" style="color:var(--bad)">${icon('trash')} Xóa tất cả</button>` : ''}</div></div><div class="card-body list">${f.items.map(x => `<div class="item" style="align-items:flex-start">${avatar({ id: x.userId, name: x.name, avatar: x.avatar }, 'sm')}<div class="grow"><div class="row between"><b class="small">${esc(x.name)}</b><div class="row nowrap" style="gap:6px"><span style="color:var(--warn)">${'★'.repeat(x.rating)}<span style="opacity:.25">${'★'.repeat(5 - x.rating)}</span></span><button class="btn icon ghost sm" data-del-fb="${x.id}" title="Xóa góp ý" style="color:var(--bad)">${icon('trash')}</button></div></div><p class="small ink2">${esc(x.comment)}</p><span class="xs muted">${ago(x.at)}</span></div></div>`).join('') || empty('Chưa có góp ý')}</div></section></div>`;
      $('#expF').onclick = () => api.download('api/admin/export/feedback').catch(showError);
      if ($('#rstLogs')) $('#rstLogs').onclick = async () => { if (!await confirmDialog({ title: 'Đặt về mặc định', message: 'Xóa toàn bộ nhật ký thao tác và góp ý ứng dụng hiện tại để đưa về trạng thái mặc định trống?', ok: 'Đặt về mặc định', tone: 'danger' })) return; try { await api.post('api/admin/logs/reset'); toast('Đã đặt nhật ký & góp ý về mặc định.', 'ok'); draw(); } catch (e) { showError(e); } };
      if ($('#clrAudit')) $('#clrAudit').onclick = async () => { if (!await confirmDialog({ title: 'Xóa nhật ký thao tác', message: 'Xóa toàn bộ lịch sử nhật ký thao tác hiện tại?', ok: 'Xóa nhật ký', tone: 'danger' })) return; try { await api.del('api/admin/audit'); toast('Đã xóa nhật ký thao tác.', 'ok'); draw(); } catch (e) { showError(e); } };
      if ($('#clrFb')) $('#clrFb').onclick = async () => { if (!await confirmDialog({ title: 'Xóa tất cả góp ý', message: 'Xóa toàn bộ góp ý ứng dụng hiện tại?', ok: 'Xóa tất cả', tone: 'danger' })) return; try { await api.del('api/admin/feedback'); toast('Đã xóa tất cả góp ý.', 'ok'); draw(); } catch (e) { showError(e); } };
      $$('[data-del-fb]', view).forEach(b => b.onclick = async () => { if (!await confirmDialog({ title: 'Xóa góp ý', message: 'Xóa góp ý này?', ok: 'Xóa', tone: 'danger' })) return; try { await api.del(`api/admin/feedback/${encodeURIComponent(b.dataset.delFb)}`); toast('Đã xóa góp ý.', 'ok'); draw(); } catch (e) { showError(e); } });
    };
    await draw();
  },

  // ---------------------------------------------------------------- Hướng dẫn tải App
  async 'app-guide'(view) {
    return renderAppGuide(view, { api, head, canEdit: true, showError });
  },

  // ---------------------------------------------------------------- Giới thiệu trang web
  async about(view) {
    return renderAboutPage(view, { head, settings: S.settings });
  },
};

const hotRow = (h) => `<div class="row nowrap" style="gap:8px"><input class="input" data-h="name" value="${esc(h.name)}" placeholder="Tên đường dây" style="flex:2"><input class="input mono" data-h="number" value="${esc(h.number)}" placeholder="Số điện thoại" style="flex:1"><input class="input" data-h="note" value="${esc(h.note)}" placeholder="Ghi chú" style="flex:1"><button type="button" class="btn icon ghost sm" data-rmh aria-label="Xóa">${icon('x')}</button></div>`;

// ---------------------------------------------------------------------------
async function reportDetail(id, after) {
  const { item: r, records } = await api.get(`api/admin/reports/${id}`);
  modal({ title: `Hồ sơ tố giác ${r.id}`, sub: `${esc(r.typeName)} · gửi ${fmtDateTime(r.createdAt)}`, size: 'xwide',
    body: `<div class="grid g-main" style="gap:20px">
      <div class="stack">
        <div class="row" style="gap:6px">${badge(r.statusName, TONE[r.status])}${badge('Mức ' + S.meta.severity[r.severity].label.toLowerCase(), SEV_TONE[r.severity])}${r.anonymous ? badge('Người gửi ẩn danh', 'violet') : badge(`${r.reporterName || ''} · ${r.reporterClass || ''}`, 'info')}</div>
        <div class="grid g2"><div class="stack" style="gap:4px"><span class="eyebrow">Địa điểm</span><span>${esc(r.location)}</span></div><div class="stack" style="gap:4px"><span class="eyebrow">Thời điểm xảy ra</span><span>${fmtDateTime(r.occurredAt)}</span></div></div>
        <div class="stack" style="gap:4px"><span class="eyebrow">Mô tả sự việc</span><p class="ink2">${esc(r.description)}</p></div>
        ${r.photos?.length ? `<div class="stack" style="gap:6px"><span class="eyebrow">Bằng chứng hình ảnh</span><div class="thumbs">${r.photos.map(p => `<a class="thumb" href="${esc(p)}" target="_blank" rel="noopener" style="width:150px;height:110px"><img src="${esc(p)}" alt="Bằng chứng"></a>`).join('')}</div></div>` : ''}
        ${records.length ? `<div class="card soft" style="padding:12px 14px"><b class="small">${icon('gavel')} Biên bản liên quan</b>${records.map(x => `<div class="small">${x.id} · ${esc(x.studentName)} · ${esc(x.penalty)}</div>`).join('')}</div>` : ''}
        <div class="stack"><span class="eyebrow">Tiến trình</span><div class="timeline">${r.timeline.map(t => `<div class="tl done"><b>${esc(S.meta.reportStatus[t.status]?.label || t.status)}</b><p>${esc(t.note)}</p><time>${fmtDateTime(t.at)} · ${esc(t.by)}</time></div>`).join('')}</div></div>
      </div>
      <form class="card soft stack" id="uf" style="padding:16px;align-self:start"><b>${icon('edit')} Cập nhật xử lý</b>
        ${fieldHtml({ name: 'status', label: 'Trạng thái', type: 'select', value: r.status, options: Object.entries(S.meta.reportStatus).map(([value, v]) => ({ value, label: v.label })) })}
        ${fieldHtml({ name: 'severity', label: 'Mức độ nghiêm trọng', type: 'select', value: r.severity, options: Object.entries(S.meta.severity).map(([value, v]) => ({ value, label: v.label })) })}
        ${fieldHtml({ name: 'note', label: 'Ghi chú tiến trình (nội bộ)', placeholder: 'Ví dụ: Đã trích xuất camera cổng phụ' })}
        ${fieldHtml({ name: 'feedback', label: 'Kết luận / phản hồi cho học sinh', type: 'textarea', rows: 3, value: r.feedback })}
        <button class="btn" id="usave">${icon('check')} Lưu cập nhật</button>
        <button type="button" class="btn danger soft" id="toRec">${icon('gavel')} Lập biên bản từ hồ sơ này</button>
        <button type="button" class="btn ghost" id="delRep" style="color:var(--bad)">${icon('trash')} Xóa hồ sơ tố giác</button>
      </form></div>`,
    onMount: (m, close) => {
      $('#uf', m).onsubmit = (e) => { e.preventDefault(); withBusy($('#usave', m), async () => { try { await api.patch(`api/admin/reports/${r.id}`, formData(e.target)); toast('Đã cập nhật hồ sơ.', 'ok'); close(); refreshCounts(); after ? after() : render(); } catch (er) { showError(er); } }); };
      $('#toRec', m).onclick = () => { close(); recordModal({ reportId: r.id, location: r.location, description: `Theo tố giác ${r.id}: ${r.description}` }); };
      $('#delRep', m).onclick = async () => { if (!await confirmDialog({ title: 'Xóa hồ sơ tố giác', message: `Xóa vĩnh viễn hồ sơ <b>${esc(r.id)}</b>?`, ok: 'Xóa hồ sơ', tone: 'danger' })) return; try { await api.del(`api/admin/reports/${encodeURIComponent(r.id)}`); toast('Đã xóa hồ sơ tố giác.', 'ok'); close(); refreshCounts(); after ? after() : render(); } catch (er) { showError(er); } };
    } });
}

function userModal(u, after) {
  formModal({ title: u ? `Sửa tài khoản ${u.id}` : 'Thêm tài khoản', sub: u ? '' : 'Mật khẩu mặc định 123456 nếu để trống; người dùng phải đổi khi đăng nhập lần đầu.', size: 'wide', fields: [
    ...(u ? [] : [{ name: 'role', label: 'Vai trò', type: 'select', options: [{ value: 'student', label: 'Học sinh' }, { value: 'teacher', label: 'Giáo viên' }, ...(isAdmin() ? [{ value: 'admin', label: 'Quản trị' }] : [])] }, { name: 'id', label: 'Mã đăng nhập (MSHS / mã GV)', required: true, placeholder: 'Ví dụ: 2126229999' }]),
    { name: 'name', label: 'Họ và tên', required: true, value: u?.name || '' },
    ...(!u || u.role === 'student' ? [{ name: 'classId', label: 'Lớp (học sinh)', type: 'select', value: u?.classId, options: S.meta.classes.map(c => c.id) }] : [{ name: 'title', label: 'Chức danh', value: u?.title || '' }, { name: 'subject', label: 'Bộ môn', value: u?.subject || '' }, { name: 'department', label: 'Tổ chuyên môn / bộ phận', value: u?.department || 'Hội đồng Sư phạm' }]),
    { name: 'gender', label: 'Giới tính', type: 'select', value: u?.gender || 'Nam', options: ['Nam', 'Nữ', 'Khác'] }, { name: 'dob', label: 'Ngày sinh', type: 'date', value: u?.dob || '' },
    { name: 'email', label: 'Email', type: 'email', value: u?.email || '' }, { name: 'phone', label: 'Điện thoại', value: u?.phone || '' },
    { name: 'hometown', label: 'Quê quán', value: u?.hometown || '' },
    ...(u?.role === 'student' ? [{ name: 'conduct', label: 'Điểm rèn luyện', type: 'number', value: u.conduct, min: 0, max: 100 }] : []),
    { name: 'avatar', label: 'Ảnh đại diện', type: 'image', full: true, value: u?.avatar || '' },
    ...(u ? [] : [{ name: 'password', label: 'Mật khẩu ban đầu', type: 'text', placeholder: '123456' }]),
  ], onSubmit: async (d, close) => { if (!d.avatar && !u?.avatar) delete d.avatar; const r = u ? await api.put(`api/admin/users/${u.id}`, d) : await api.post('api/admin/users', d); toast(r.message || 'Đã lưu tài khoản.', 'ok'); close(); after(); } });
}

// Nhập danh sách học sinh có sẵn (dán/tải Họ tên + Lớp) → tạo tài khoản đầy đủ ngay (khác nút "Thêm tài khoản"
// vốn chỉ thêm từng người, và khác bulk-generate vốn chỉ tạo mã trống chưa có tên). 3 bước: dán/tải → xem trước → kết quả.
function importModal(after) {
  const nowYear = new Date().getFullYear();
  const state = { text: '', year: nowYear, password: '123456', parsed: null, result: null };

  const parseRoster = (text) => {
    const existingClasses = new Set(S.meta.classes.map(c => c.id));
    const rows = [], errors = [];
    let skippedLines = 0;
    text.split('\n').forEach((raw, i) => {
      const line = raw.trim();
      if (!line) return;
      const parts = line.includes('|') ? line.split('|') : line.includes('\t') ? line.split('\t') : line.includes(',') ? line.split(',') : null;
      if (!parts) { skippedLines++; return; }
      const name = (parts[0] || '').trim(), classId = (parts[1] || '').trim();
      if (!name || !classId) { skippedLines++; return; }
      if (!/^\d{1,2}/.test(classId)) { errors.push({ line: i + 1, text: line, reason: `Lớp "${classId}" phải bắt đầu bằng số khối, ví dụ "10A1"` }); return; }
      rows.push({ name, classId });
    });
    const byGrade = {}, byClass = {};
    rows.forEach(r => { const grade = r.classId.match(/^\d{1,2}/)[0]; byGrade[grade] = (byGrade[grade] || 0) + 1; byClass[r.classId] = (byClass[r.classId] || 0) + 1; });
    const newClasses = Object.keys(byClass).filter(c => !existingClasses.has(c)).sort();
    return { rows, errors, skippedLines, byGrade, newClasses };
  };

  const m = modal({ title: 'Nhập danh sách học sinh có sẵn', sub: 'Dán hoặc tải danh sách Họ tên + Lớp — tạo tài khoản đầy đủ ngay, học sinh không cần tự khai lại.', size: 'wide', body: '<div id="impBox"></div>', foot: '<div id="impFoot"></div>' });
  const box = $('#impBox', m.el), foot = $('#impFoot', m.el);

  const drawPaste = () => {
    box.innerHTML = `<div class="stack" style="gap:12px">
      <div class="field"><label for="impText">Danh sách (mỗi dòng: Họ tên|Lớp)</label>
        <textarea id="impText" class="textarea mono" rows="12" placeholder="Nguyễn Văn A|10A1
Trần Thị B|10A1">${esc(state.text)}</textarea>
        <span class="hint">Phân cách bằng dấu “|”, dấu phẩy hoặc Tab đều được. Dòng trống hoặc không đúng khuôn dạng sẽ tự bỏ qua.</span></div>
      <input type="file" id="impFile" accept=".txt,.csv" style="display:none">
      <div class="row" style="gap:8px"><button type="button" class="btn ghost sm" id="impPick">${icon('upload')} Chọn tệp .txt/.csv</button><span class="xs muted" id="impFileName"></span></div>
      <div class="field-row"><div class="field"><label for="impYear">Năm (dùng trong mã đăng nhập)</label><input id="impYear" class="input" type="number" value="${state.year}" min="2000" max="2100"></div>
      <div class="field"><label for="impPass">Mật khẩu ban đầu</label><input id="impPass" class="input" value="${esc(state.password)}" placeholder="123456"></div></div>
    </div>`;
    foot.innerHTML = `<button class="btn ghost" id="impCancel">Hủy</button><button class="btn" id="impNext">${icon('eye')} Xem trước</button>`;
    $('#impCancel', foot).onclick = () => m.close();
    $('#impPick', box).onclick = () => $('#impFile', box).click();
    $('#impFile', box).onchange = (e) => {
      const f = e.target.files[0]; if (!f) return;
      $('#impFileName', box).textContent = f.name;
      const fr = new FileReader();
      fr.onload = () => { $('#impText', box).value = fr.result; };
      fr.readAsText(f, 'utf-8');
    };
    $('#impNext', foot).onclick = () => {
      state.text = $('#impText', box).value;
      state.year = +$('#impYear', box).value || nowYear;
      state.password = $('#impPass', box).value.trim() || '123456';
      state.parsed = parseRoster(state.text);
      if (!state.parsed.rows.length) { toast('Chưa có học sinh hợp lệ nào trong danh sách.', 'warn'); return; }
      drawPreview();
    };
  };

  const drawPreview = () => {
    const p = state.parsed;
    const gradeRows = Object.entries(p.byGrade).sort((a, b) => +a[0] - +b[0]).map(([g, n]) => `<div class="row between small" style="padding:4px 0"><span>Khối ${esc(g)}</span><b>${n} học sinh</b></div>`).join('');
    box.innerHTML = `<div class="stack" style="gap:14px">
      <div class="grid g3">
        <div class="card soft pad stack" style="gap:2px"><span class="xs muted">Học sinh hợp lệ</span><b style="font-family:var(--font-display);font-size:1.4rem">${p.rows.length}</b></div>
        <div class="card soft pad stack" style="gap:2px"><span class="xs muted">Lớp mới sẽ tạo</span><b style="font-family:var(--font-display);font-size:1.4rem">${p.newClasses.length}</b></div>
        <div class="card soft pad stack" style="gap:2px"><span class="xs muted">Dòng bỏ qua / lỗi</span><b style="font-family:var(--font-display);font-size:1.4rem${p.errors.length ? ';color:var(--bad)' : ''}">${p.skippedLines + p.errors.length}</b></div>
      </div>
      <div class="card soft pad stack" style="gap:0">${gradeRows}</div>
      ${p.newClasses.length ? `<p class="small"><b>Lớp mới:</b> <span class="ink2">${p.newClasses.map(esc).join(', ')}</span></p>` : ''}
      ${p.errors.length ? `<div class="card soft pad stack" style="gap:6px;border:1px solid var(--bad)"><b class="small" style="color:var(--bad)">${icon('alertCircle')} ${p.errors.length} dòng lỗi (sẽ không tạo)</b><div class="stack" style="gap:3px;max-height:140px;overflow:auto">${p.errors.slice(0, 50).map(e => `<span class="xs mono muted">Dòng ${e.line}: ${esc(e.text)} — ${esc(e.reason)}</span>`).join('')}${p.errors.length > 50 ? `<span class="xs muted">… và ${p.errors.length - 50} dòng khác</span>` : ''}</div></div>` : ''}
      <p class="small muted">Mã đăng nhập tự sinh theo khối (năm ${state.year}), mật khẩu ban đầu <span class="mono">${esc(state.password)}</span> — học sinh bắt buộc đổi khi đăng nhập lần đầu.</p>
    </div>`;
    foot.innerHTML = `<button class="btn ghost" id="impBack">${icon('arrowLeft')} Quay lại</button><button class="btn" id="impGo">${icon('check')} Tạo ${p.rows.length} tài khoản</button>`;
    $('#impBack', foot).onclick = () => drawPaste();
    $('#impGo', foot).onclick = (e) => withBusy(e.currentTarget, async () => {
      try {
        const r = await api.post('api/admin/users/bulk-import', { items: p.rows.map(x => ({ name: x.name, classId: x.classId })), year: state.year, password: state.password });
        state.result = r; drawDone();
      } catch (err) { showError(err); }
    });
  };

  const drawDone = () => {
    const r = state.result;
    box.innerHTML = `<div class="stack" style="gap:14px">
      <div class="card soft pad row" style="gap:10px;align-items:center"><span class="avatar sq" style="background:var(--ok)">${icon('checkCircle')}</span><b>${esc(r.message)}</b></div>
      ${r.skipped?.length ? `<p class="small muted">${r.skipped.length} dòng bị bỏ qua khi tạo — chi tiết trong tệp tải về.</p>` : ''}
      <p class="small ink2">Mật khẩu ban đầu chỉ hiển thị được một lần, ngay bây giờ — hãy tải danh sách để lưu lại và phát cho học sinh.</p>
    </div>`;
    foot.innerHTML = `<button class="btn ghost" id="impDl">${icon('download')} Tải danh sách tài khoản (CSV)</button><button class="btn" id="impDone">Xong</button>`;
    $('#impDl', foot).onclick = () => {
      const esc2 = (v) => `"${String(v).replaceAll('"', '""')}"`;
      const lines = ['Mã đăng nhập,Họ tên,Lớp,Mật khẩu ban đầu', ...r.created.map(c => [c.id, c.name, c.classId, c.password].map(esc2).join(','))];
      if (r.skipped?.length) { lines.push('', 'Bỏ qua:', 'Họ tên,Lớp,Lý do', ...r.skipped.map(s => [s.name, s.classId, s.reason].map(esc2).join(','))); }
      const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `tai-khoan-hoc-sinh-${state.year}.csv`; document.body.appendChild(a); a.click(); a.remove();
    };
    $('#impDone', foot).onclick = () => { m.close(); after(); };
  };

  drawPaste();
}

function surveyForm(s, after) {
  const qs = s ? JSON.parse(JSON.stringify(s.questions)) : [{ type: 'single', text: '', options: ['', ''] }];
  const m = modal({ title: s ? `Sửa khảo sát ${s.id}` : 'Tạo đợt khảo sát mới', size: 'xwide', body: '<div id="sb"></div>', foot: '<button class="btn ghost" data-close>Hủy</button><button class="btn" id="ss">Lưu khảo sát</button>' });
  const box = $('#sb', m.el);
  const draw = () => {
    box.innerHTML = `<form id="smeta" class="field-row">${fieldHtml({ name: 'title', label: 'Tiêu đề', required: true, full: true, value: s?.title || '' })}${fieldHtml({ name: 'description', label: 'Mô tả', type: 'textarea', rows: 2, full: true, value: s?.description || '' })}${fieldHtml({ name: 'purpose', label: 'Mục đích', type: 'select', value: s?.purpose || 'khkt', options: [{ value: 'khkt', label: 'Nghiên cứu khoa học' }, { value: 'discipline', label: 'Nề nếp kỷ luật' }, { value: 'mental', label: 'Sức khỏe tinh thần' }, { value: 'other', label: 'Khác' }] })}${fieldHtml({ name: 'target', label: 'Đối tượng', value: s?.target || 'Toàn trường' })}${fieldHtml({ name: 'targetCount', label: 'Chỉ tiêu số phiếu', type: 'number', value: s?.targetCount || 150 })}${fieldHtml({ name: 'deadline', label: 'Hạn chót', type: 'date', required: true, value: s?.deadline || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10) })}${fieldHtml({ name: 'anonymous', label: 'Phiếu ẩn danh', type: 'switch', value: s ? s.anonymous : true })}</form>
      <div class="hr"></div><div class="row between"><b>Danh sách câu hỏi (${qs.length})</b><button type="button" class="btn soft sm" id="addq">${icon('plus')} Thêm câu hỏi</button></div>
      <div class="stack">${qs.map((q, i) => `<div class="card soft stack" style="padding:12px 14px;gap:8px" data-qi="${i}"><div class="row nowrap"><b class="small" style="width:28px">C${i + 1}</b><input class="input grow" data-f="text" value="${esc(q.text)}" placeholder="Nội dung câu hỏi"><select class="select" data-f="type" style="width:auto"><option value="single" ${q.type === 'single' ? 'selected' : ''}>Một lựa chọn</option><option value="multi" ${q.type === 'multi' ? 'selected' : ''}>Nhiều lựa chọn</option><option value="scale" ${q.type === 'scale' ? 'selected' : ''}>Thang đo 1–5</option><option value="text" ${q.type === 'text' ? 'selected' : ''}>Tự luận</option></select><button type="button" class="btn icon ghost sm" data-rq="${i}">${icon('trash')}</button></div>${q.type === 'single' || q.type === 'multi' ? `<textarea class="textarea" data-f="options" rows="3" placeholder="Mỗi dòng một phương án" style="min-height:70px">${esc((q.options || []).join('\n'))}</textarea>` : ''}</div>`).join('')}</div>`;
    $('#addq', box).onclick = () => { sync(); qs.push({ type: 'single', text: '', options: ['', ''] }); draw(); };
    $$('[data-rq]', box).forEach(b => b.onclick = () => { sync(); qs.splice(+b.dataset.rq, 1); draw(); });
    $$('[data-f="type"]', box).forEach(sel => sel.onchange = () => { sync(); draw(); });
  };
  const sync = () => $$('[data-qi]', box).forEach(el => { const q = qs[+el.dataset.qi]; q.text = $('[data-f="text"]', el).value; q.type = $('[data-f="type"]', el).value; const o = $('[data-f="options"]', el); if (o) q.options = o.value.split('\n').map(x => x.trim()).filter(Boolean); });
  draw();
  $('#ss', m.el).onclick = (e) => withBusy(e.currentTarget, async () => { sync(); const meta = formData($('#smeta', box)); try { await (s ? api.put(`api/admin/surveys/${s.id}`, { ...meta, questions: qs }) : api.post('api/admin/surveys', { ...meta, questions: qs })); toast('Đã lưu đợt khảo sát.', 'ok'); m.close(); after(); } catch (er) { showError(er); } });
}

async function surveyResults(id) {
  const r = await api.get(`api/admin/surveys/${id}/results`);
  const COLORS = ['#1747c9', '#0f8f67', '#e8513a', '#6a4fe0', '#c27c0e', '#0a84b8', '#b0367a'];
  modal({ title: r.survey.title, sub: `${r.total} phiếu trả lời · ${r.survey.anonymous ? 'ẩn danh' : 'có ghi tên'}`, size: 'xwide',
    body: `<div class="grid g2">${r.summary.map((q, i) => `<section class="card pad stack" style="gap:10px"><b class="small">C${i + 1}. ${esc(q.text)}</b>${q.type === 'text' ? `<div class="stack" style="gap:6px;max-height:220px;overflow:auto">${q.answers.map(a => `<div class="small ink2" style="padding:8px 10px;border-radius:10px;background:var(--surface-2)">“${esc(a)}”</div>`).join('') || '<span class="small muted">Chưa có câu trả lời</span>'}</div>` : `${q.average !== null ? `<div class="row" style="gap:8px"><span class="small muted">Điểm trung bình</span><b style="font-family:var(--font-display);font-size:1.3rem">${num(q.average, 2)}</b><span class="small muted">/5</span></div>` : ''}${Object.entries(q.counts).map(([o, n], k) => `<div class="hbar"><span class="small truncate" title="${esc(o)}">${esc(o)}</span><div class="meter" style="--c:${COLORS[k % COLORS.length]}"><i style="width:${q.answered ? n / Math.max(...Object.values(q.counts), 1) * 100 : 0}%"></i></div><b class="small num">${n} <span class="muted" style="font-weight:400">(${r.total ? Math.round(n / r.total * 100) : 0}%)</span></b></div>`).join('')}`}</section>`).join('')}</div>`,
    foot: `<button class="btn ghost" id="xls">${icon('download')} Xuất Excel</button><button class="btn" data-close>Đóng</button>`,
    onMount: (m) => $('#xls', m).onclick = () => api.download(`api/admin/export/survey/${id}`).catch(showError) });
}

boot().catch(showError);
