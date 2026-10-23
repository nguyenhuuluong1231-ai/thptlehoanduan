// Trang đăng nhập.
// - Trên bản web máy tính: tách riêng 2 trang đăng nhập độc lập (index.html → Cổng Học Sinh, staff.html → Cổng Quản Trị / Giáo Viên) kèm CAPTCHA, không có nút chuyển qua lại giữa 2 trang.
// - Trên giao diện mobile (/mobile, khung điện thoại hoặc màn hình nhỏ): gộp chung Học sinh · Giáo viên · Quản trị, bỏ CAPTCHA, thiết kế nhỏ gọn.
import { api, session, setPortal, detect, getMode, showError, ApiError } from './core/api.js';
import { icon, drumArt } from './core/icons.js';
import { $, $$, esc, toast, store, modal, withBusy, initTheme, initDevToolsGuard, toggleTheme, sleep, avatar, apiBase, isNativeApp, installApp, aboutPortalHtml } from './core/ui.js';

initTheme(); initDevToolsGuard();
const root = $('#root');
const urlPortal = new URLSearchParams(location.search).get('portal');
const portal = (document.body.dataset.portal === 'staff' || document.body.dataset.portal === 'admin' || urlPortal === 'staff' || urlPortal === 'admin') ? 'staff' : 'student';
const STAFF = portal === 'staff';
const IS_MOBILE = window.self !== window.top || isNativeApp() || /[?&]mobile/.test(location.search) || matchMedia('(max-width: 760px)').matches || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
setPortal(portal);
document.title = IS_MOBILE
  ? 'Đăng nhập · Cổng Học Đường Số Trường THPT Lê Hoàn'
  : (STAFF ? 'Đăng nhập Cổng Quản Trị & Giáo Viên · Trường THPT Lê Hoàn' : 'Đăng nhập Cổng Học Sinh · Trường THPT Lê Hoàn');
let settings = null, captcha = null;

async function boot() {
  root.innerHTML = '<div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:24px;text-align:center"><img src="assets/school_logo.png" alt="Trường THPT Lê Hoàn" style="width:96px;height:96px;object-fit:contain;border-radius:50%;background:#fff;padding:6px;box-shadow:0 12px 32px rgba(23,71,201,.28)"><div style="font-weight:700;font-size:16px">Trường THPT Lê Hoàn</div><div class="skel" style="width:180px;height:8px;border-radius:99px"></div></div>';
  await detect();
  if (IS_MOBILE && !/[?&]switch=1/.test(location.search)) {
    for (const p of (STAFF ? ['staff', 'student'] : ['student', 'staff'])) {
      setPortal(p);
      if (!session.token) continue;
      try {
        const { user } = await api.get('api/auth/me');
        if (user) { go(user.role === 'student' ? 'student' : 'staff'); return; }
      } catch { /* phiên không hợp lệ */ }
    }
    setPortal(portal);
  }
  if (!IS_MOBILE && !STAFF && getMode() === 'server' && (location.pathname === '/' || location.pathname === '/index.html')) {
    try { history.replaceState(null, '', '/loginhocinh' + location.search + location.hash); } catch { /* bỏ qua */ }
  }
  try { settings = await api.get('api/settings/public'); } catch { settings = { schoolName: 'Trường THPT Lê Hoàn', slogan: '', logo: 'assets/logo-mark.svg', hotlines: [] }; }
  if (!IS_MOBILE) await loadCaptcha();
  render();
}

/** Lấy mã xác nhận (CAPTCHA) mới — chỉ dùng trên bản web máy tính. */
async function loadCaptcha() {
  if (IS_MOBILE) return;
  try { captcha = await api.get('api/auth/captcha'); } catch { captcha = null; }
  const box = $('#capImg');
  if (box) box.innerHTML = captcha ? captcha.svg : '<span class="xs muted">Không tải được mã xác nhận</span>';
  const code = $('#cap'); if (code) code.value = '';
}

function renderStudentFooter(s) {
  const creator = s.creatorName || 'Vũ Nguyễn An Khang';
  const intro = s.siteIntro || 'Cổng Học Đường Số Trường THPT Lê Hoàn là nền tảng trực tuyến hỗ trợ học sinh tố giác vi phạm ẩn danh, tư vấn tâm lý học đường 24/7, kết nối thầy cô, thi trắc nghiệm pháp luật và tích hợp trí tuệ nhân tạo (AI) phòng chống lừa đảo không gian mạng.';
  const phone = s.contactPhone || '0269 3846 359 · Khẩn cấp: 111';
  const email = s.contactEmail || 'thptlehoan@sgddt.gialai.gov.vn';
  const address = s.contactAddress || 'Đường Trần Hưng Đạo, Thị trấn Chư Ty, Huyện Đức Cơ, Tỉnh Gia Lai, Việt Nam';
  return `
  <footer class="login-corp-footer">
    <div class="lcf-inner">
      <div class="lcf-bar-top">
        <div class="lcf-org-head">
          <img src="${esc(s.logo || 'assets/logo-mark.svg')}" alt="" class="lcf-org-logo">
          <div class="lcf-org-titles">
            <h3 class="lcf-org-title">${esc((s.schoolName || 'TRƯỜNG THPT LÊ HOÀN').toUpperCase())}</h3>
            <span class="lcf-org-sub">SỞ GIÁO DỤC VÀ ĐÀO TẠO TỈNH GIA LAI</span>
          </div>
          <span class="lcf-head-sep"></span>
          <button type="button" class="lcf-creator-pill" data-lcf-modal="about" title="Xem giới thiệu chi tiết về trang web & tác giả">
            ${icon('sparkles')} <span>Trang web này được tạo bởi <b>${esc(creator)}</b></span>
          </button>
        </div>

        <div class="lcf-social-bar">
          <div class="lcf-social-group">
            <span class="lcf-eyebrow">KẾT NỐI NHÀ TRƯỜNG</span>
            <div class="lcf-social-icons">
              <a href="${esc(s.facebookUrl || 'https://facebook.com')}" target="_blank" rel="noopener" class="lcf-s-btn fb" title="Facebook Trường THPT Lê Hoàn" aria-label="Facebook">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12z"/></svg>
              </a>
              <a href="${esc(s.linkedinUrl || 'https://gialai.edu.vn')}" target="_blank" rel="noopener" class="lcf-s-btn in" title="LinkedIn / Cổng thông tin Sở GD&ĐT Gia Lai" aria-label="LinkedIn / Sở GD&ĐT">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M19 3A2 2 0 0 1 21 5v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
              </a>
              <a href="${esc(s.zaloUrl || 'https://zalo.me')}" target="_blank" rel="noopener" class="lcf-s-btn zl" title="Zalo Hỗ trợ Học đường" aria-label="Zalo">
                <span style="font-weight:800;font-size:10px;letter-spacing:-.02em">Zalo</span>
              </a>
            </div>
          </div>
          <div class="lcf-lang-box" title="Ngôn ngữ hiển thị: Tiếng Việt">
            <svg viewBox="0 0 28 20" width="18" height="13" style="border-radius:2.5px;flex:none"><rect width="28" height="20" fill="#da251d"/><polygon points="14,4 15.8,9.5 21.5,9.5 16.9,12.8 18.6,18.3 14,15 9.4,18.3 11.1,12.8 6.5,9.5 12.2,9.5" fill="#ffff00"/></svg>
            <span>Việt Nam</span>
          </div>
          <div class="lcf-verified-pill" title="Đã đăng ký & xác thực hệ thống Cổng Học Đường Số">
            <span class="lcf-v-ico"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>
            <div class="lcf-v-txt">
              <b>ĐÃ ĐĂNG KÝ</b>
              <span>CỔNG HỌC ĐƯỜNG SỐ</span>
            </div>
          </div>
        </div>
      </div>

      <div class="lcf-cards-grid">
        <div class="lcf-info-card intro">
          <span class="lcf-ic-ico">${icon('info')}</span>
          <div class="lcf-ic-body">
            <div class="lcf-ic-head">
              <span class="lcf-ic-lbl">GIỚI THIỆU TRANG WEB</span>
              <button type="button" class="lcf-intro-more" data-lcf-modal="about">Xem chi tiết →</button>
            </div>
            <p class="lcf-ic-desc">${esc(intro)}</p>
          </div>
        </div>

        <div class="lcf-info-card">
          <span class="lcf-ic-ico"><svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.25 1.01l-2.2 2.2z"/></svg></span>
          <div class="lcf-ic-body">
            <span class="lcf-ic-lbl">HOTLINE & KHẨN CẤP 24/7</span>
            <b class="lcf-ic-val">${esc(phone)}</b>
            <span class="lcf-ic-sub">Tiếp nhận hỗ trợ & tư vấn trực tuyến</span>
          </div>
        </div>

        <div class="lcf-info-card">
          <span class="lcf-ic-ico"><svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4.2-8 5-8-5V6l8 5 8-5v2.2z"/></svg></span>
          <div class="lcf-ic-body">
            <span class="lcf-ic-lbl">HỘP THƯ ĐIỆN TỬ</span>
            <a href="mailto:${esc(email)}" class="lcf-ic-val link">${esc(email)}</a>
            <span class="lcf-ic-sub">Ban Giám hiệu & Tổ Tư vấn học đường</span>
          </div>
        </div>

        <div class="lcf-info-card">
          <span class="lcf-ic-ico"><svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg></span>
          <div class="lcf-ic-body">
            <span class="lcf-ic-lbl">ĐỊA CHỈ NHÀ TRƯỜNG</span>
            <b class="lcf-ic-val">${esc(address)}</b>
            <span class="lcf-ic-sub">Sở Giáo dục và Đào tạo tỉnh Gia Lai</span>
          </div>
        </div>
      </div>
    </div>

    <div class="lcf-bot">
      <div class="lcf-bot-inner">
        <div class="lcf-copy">
          <span>© ${new Date().getFullYear()} ${esc(s.schoolName || 'Trường THPT Lê Hoàn')}. All rights reserved</span>
          <span class="sep">·</span>
          <button type="button" class="lcf-plink" data-lcf-modal="about">Giới thiệu trang web</button>
          <span class="sep">·</span>
          <button type="button" class="lcf-plink" data-lcf-modal="terms">Điều khoản & Pháp lý</button>
          <span class="sep">·</span>
          <button type="button" class="lcf-plink" data-lcf-modal="privacy">Chính sách bảo vệ dữ liệu cá nhân</button>
          <span class="sep">·</span>
          <button type="button" class="lcf-plink" data-lcf-modal="cookies">Cài đặt cookies</button>
        </div>
        <div class="lcf-bot-right">
          <span>Trang web này được tạo bởi <b>${esc(creator)}</b></span>
        </div>
      </div>
    </div>
  </footer>`;
}
function render() {
  if (IS_MOBILE) return renderMobile();
  const s = settings;
  const studentHref = getMode() === 'server' ? '/loginhocinh' : './';
  const staffHref = getMode() === 'server' ? '/quan-tri' : 'staff.html';
  const homeHref = STAFF ? staffHref : studentHref;
  const heroPoints = STAFF
    ? [['shieldAlert', 'Xử lý tố giác', 'Tiếp nhận, xác minh & phản hồi'], ['heartHand', 'Tư vấn & chat', 'Hộp thư tâm lý & chat realtime'], ['siren', 'AI Guard cảnh báo', 'Phát hiện sớm khủng hoảng, lừa đảo'], ['download', 'Báo cáo & Excel', 'Thống kê, khảo sát & xuất dữ liệu']]
    : [['shieldCheck', 'Tố giác ẩn danh', 'Bảo mật danh tính, theo dõi tiến độ'], ['trophy', 'Đấu trường & khảo sát', 'Thi trắc nghiệm pháp luật, góp ý'], ['heartHand', 'Tư vấn tâm lý 24/7', 'Nhắn riêng chuyên viên, nhật ký cảm xúc'], ['sparkles', 'AI chống lừa đảo', 'Quét tin nhắn, link, SĐT, tài khoản']];
  root.innerHTML = `
  <div class="auth ${STAFF ? 'auth-staff' : 'auth-student-web'}">
    <div class="auth-box">
      <section class="auth-hero">
        ${drumArt(420, 'drum')}
        <div class="auth-hero-top">
          <a class="brand" href="${homeHref}"><img src="${esc(s.logo)}" alt=""><div><b>${esc(s.schoolName)}</b><span>${esc(s.slogan || 'Trường học an toàn · Thân thiện · Hạnh phúc')}</span></div></a>
          <span class="auth-sem-pill"><span class="pulse"></span>${esc(s.semester || 'Học kỳ I')} · ${esc(s.schoolYear || '2026 – 2027')}</span>
        </div>
        <div class="auth-hero-mid">
          ${STAFF ? `<h1>Cổng Quản Trị & Giáo Viên.<br><em>Quản lý học đường</em> an toàn, kịp thời.</h1>
          <p class="lead">Dành riêng cho Ban Giám hiệu, quản trị viên, giáo viên và chuyên viên tâm lý: tiếp nhận tố giác, tư vấn học sinh, giám sát cảnh báo AI và điều hành hệ thống.</p>`
          : `<h1>Cổng Học Đường Số.<br><em>Học tập an tâm,</em> trường học an toàn.</h1>
          <p class="lead">Tố giác ẩn danh, tư vấn tâm lý, chat với thầy cô, đấu trường trắc nghiệm pháp luật, khảo sát và trợ lý AI chống lừa đảo.</p>`}
        </div>
        <div class="auth-points">
          ${heroPoints.map(([i, t, d], k) => `<div class="auth-point ${k > 1 ? 'hide-sm' : ''}"><span class="ap-ico">${icon(i)}</span><div><b>${t}</b><span>${d}</span></div></div>`).join('')}
        </div>
        <div class="foot">
          <span>${icon('phone')} Khẩn cấp: <b style="color:#fff">111</b> (24/7)</span>
          <span>${icon('info')} <button type="button" class="lcf-plink" data-lcf-modal="about" style="color:#fff;font-weight:600">Giới thiệu trang web</button></span>
          <span>${icon('smartphone')} <a href="phone.html" style="color:#fff">App điện thoại</a></span>
          <span>${icon('code')} <a href="docs.html" style="color:#fff">REST API</a></span>
        </div>
      </section>
      <section class="auth-panel">
        <div class="auth-card">
          <div class="auth-top-bar">
            <span class="badge info" style="height:30px;padding:0 12px;font-size:12px">${icon(STAFF ? 'shield' : 'grad')} ${STAFF ? 'Dành cho Quản trị & Giáo viên' : 'Dành cho Học sinh'}</span>
            <button class="icon-btn sm" id="theme" aria-label="Đổi giao diện sáng/tối" title="Đổi giao diện sáng/tối">${icon('moon')}</button>
          </div>
          <div id="cont"></div>
          <div class="auth-head">
            <h2>${STAFF ? 'Cổng Quản Trị & Giáo Viên' : 'Cổng Học Sinh'}</h2>
            <p class="muted">${STAFF ? 'Đăng nhập bằng tài khoản quản trị hoặc mã giáo viên.' : 'Đăng nhập bằng mã học sinh (MSHS) do nhà trường cấp.'}</p>
          </div>
          <form id="f" class="auth-form" novalidate>
            <div class="field"><label for="u">${STAFF ? 'Tài khoản quản trị / Mã giáo viên' : 'Mã học sinh (MSHS)'}</label>
              <div class="input-icon">${icon(STAFF ? 'shield' : 'user')}<input id="u" name="username" autocomplete="username" inputmode="${STAFF ? 'text' : 'numeric'}" placeholder="${STAFF ? 'Ví dụ: admin hoặc GV2024089' : 'Ví dụ: 2126220004'}" value="${esc(store.get('lh_remember_' + portal, ''))}" required></div></div>
            <div class="field"><label for="p">Mật khẩu</label>
              <div class="input-icon">${icon('lock')}<input id="p" name="password" type="password" autocomplete="current-password" placeholder="Nhập mật khẩu" required><button type="button" class="btn icon ghost sm suffix" id="eye" aria-label="Hiện mật khẩu" style="border:0">${icon('eye')}</button></div></div>
            <div class="field"><label for="cap">Mã xác nhận</label>
              <div class="captcha-row"><span class="captcha-img" id="capImg" aria-live="polite">${captcha ? captcha.svg : ''}</span><button type="button" class="btn icon ghost sm" id="capRefresh" aria-label="Lấy mã khác" title="Lấy mã khác">${icon('refresh')}</button><input id="cap" name="captcha" inputmode="numeric" autocomplete="off" maxlength="5" placeholder="Nhập 5 số" required></div></div>
            <div class="row between auth-meta-row"><label class="switch"><input type="checkbox" id="rem" checked><span class="track"></span><span class="small">Ghi nhớ đăng nhập</span></label><button type="button" class="btn plain sm" id="forgot">Quên mật khẩu?</button></div>
            <div id="err" class="badge bad" hidden style="height:auto;padding:8px 12px;white-space:normal;border-radius:10px"></div>
            <div class="auth-actions">
              <button class="btn block auth-submit" id="go">${icon('arrowRight')} Đăng nhập</button>
            </div>
          </form>
        </div>
      </section>
    </div>
    ${!STAFF ? renderStudentFooter(s) : ''}
  </div>
  ${getMode() === 'demo' ? `<div class="demo-ribbon"><i></i>Bản xem trước · dữ liệu lưu trên trình duyệt này</div>` : ''}`;
  bind();
  showContinue();
}

function renderMobile() {
  const s = settings;
  const savedUser = store.get('lh_remember_user', '') || store.get('lh_remember_student', '') || store.get('lh_remember_staff', '');
  root.innerHTML = `
  <div class="auth auth-mobile">
    <header class="m-login-hero">
      <div class="m-login-top">
        <a class="m-login-brand" href="./">
          <img src="${esc(s.logo)}" alt="">
          <div>
            <b>${esc(s.schoolName)}</b>
            <span>Cổng Học Đường Số · ${esc(s.schoolYear || '2026 – 2027')}</span>
          </div>
        </a>
        <button class="icon-btn m-login-theme" id="theme" aria-label="Đổi giao diện sáng/tối">${icon('moon')}</button>
      </div>
    </header>
    <section class="m-login-body">
      <div class="m-login-card">
        <div class="m-login-pills">
          <span class="m-login-pill">${icon('grad')} Học sinh</span>
          <span class="m-login-pill">${icon('school')} Giáo viên</span>
          <span class="m-login-pill">${icon('shield')} Quản trị</span>
        </div>
        ${isNativeApp() ? `<button type="button" class="server-card" id="srv">${icon('globe')}<div class="grow" style="min-width:0"><div class="xs muted">Máy chủ trường</div><b class="small truncate">${getMode() === 'server' ? esc(apiBase()) : 'Chưa kết nối · đang dùng bản trải nghiệm'}</b></div><span class="btn plain sm">Đổi</span></button>` : ''}
        <div id="cont"></div>
        <div class="m-login-head">
          <h2>Đăng nhập hệ thống</h2>
          <p>Dùng chung cho Học sinh, Giáo viên & Quản trị viên</p>
        </div>
        <form id="f" class="m-login-form" novalidate>
          <div class="field">
            <label for="u">Tài khoản</label>
            <div class="input-icon">${icon('user')}<input id="u" name="username" autocomplete="username" placeholder="Mã HS, mã GV hoặc admin" value="${esc(savedUser)}" required></div>
          </div>
          <div class="field">
            <label for="p">Mật khẩu</label>
            <div class="input-icon">${icon('lock')}<input id="p" name="password" type="password" autocomplete="current-password" placeholder="Nhập mật khẩu" required><button type="button" class="btn icon ghost sm suffix" id="eye" aria-label="Hiện mật khẩu" style="border:0">${icon('eye')}</button></div>
          </div>
          <div class="row between m-login-meta">
            <label class="switch"><input type="checkbox" id="rem" checked><span class="track"></span><span class="small">Ghi nhớ</span></label>
            <button type="button" class="btn plain sm" id="forgot">Quên mật khẩu?</button>
          </div>
          <div id="err" class="badge bad" hidden style="height:auto;padding:7px 10px;white-space:normal;border-radius:10px;font-size:12px"></div>
          <div class="m-login-actions">
            <button class="btn block m-btn-submit" id="go">${icon('arrowRight')} Đăng nhập</button>
          </div>
        </form>
      </div>
      <div class="m-login-foot">
        <span>${icon('phone')} Khẩn cấp: <b>111</b> (24/7)</span>
        <span>·</span>
        <button type="button" class="lcf-plink" data-lcf-modal="about" style="font-size:12px;font-weight:600;color:var(--brand)">Giới thiệu · Tạo bởi ${esc(s.creatorName || 'Vũ Nguyễn An Khang')}</button>
      </div>
    </section>
  </div>
  ${getMode() === 'demo' ? `<div class="demo-ribbon"><i></i>${isNativeApp() ? 'Bản trải nghiệm · dữ liệu lưu trên máy này' : 'Bản xem trước · dữ liệu lưu trên trình duyệt này'}</div>` : ''}`;
  bind();
  showContinue();
}

async function showContinue() {
  const list = IS_MOBILE ? (STAFF ? ['staff', 'student'] : ['student', 'staff']) : [portal];
  for (const p of list) {
    setPortal(p);
    if (!session.token) continue;
    try {
      const { user } = await api.get('api/auth/me');
      if (!IS_MOBILE) {
        if (!STAFF && user.role !== 'student') continue;
        if (STAFF && user.role === 'student') continue;
      }
      const el = $('#cont');
      if (!el) return;
      el.innerHTML = `<button class="demo-acc" style="width:100%;border-color:var(--brand-line);background:var(--brand-soft);padding:8px 10px" id="contBtn">${avatar(user)}<div class="grow" style="min-width:0"><div class="xs muted">Đang đăng nhập</div><b class="small truncate" style="display:block">${esc(user.name)}</b></div><span class="btn sm">Tiếp tục ${icon('arrowRight')}</span></button>`;
      $('#contBtn').onclick = () => go(user.role === 'student' ? 'student' : 'staff');
      break;
    } catch { /* phiên hết hạn */ }
  }
  setPortal(portal);
}

// App điện thoại: nhập địa chỉ máy chủ của trường (dữ liệu đồng bộ với web)
function serverDialog() {
  modal({ title: 'Kết nối máy chủ trường', sub: 'App dùng chung tài khoản và dữ liệu với trang web của trường',
    body: `<div class="field"><label for="srvUrl">Địa chỉ máy chủ</label><input id="srvUrl" class="input" inputmode="url" autocomplete="url" placeholder="Ví dụ: https://lehoan.edu.vn hoặc http://192.168.1.10:3000" value="${esc(apiBase())}"><span class="hint">Hỏi thầy cô phụ trách để lấy địa chỉ. Điện thoại cần cùng mạng Wi-Fi nếu máy chủ đặt trong trường.</span></div><div id="srvMsg" class="small"></div>`,
    foot: '<button class="btn ghost" id="srvDemo">Dùng bản trải nghiệm</button><button class="btn" id="srvSave">Kiểm tra & lưu</button>',
    onMount: (m) => {
      $('#srvDemo', m).onclick = () => { store.set('lh_api_base', ''); location.reload(); };
      $('#srvSave', m).onclick = (ev) => withBusy(ev.currentTarget, async () => {
        let url = $('#srvUrl', m).value.trim().replace(/\/+$/, '');
        if (!url) return;
        if (!/^https?:\/\//i.test(url)) url = 'http://' + url;
        const msg = $('#srvMsg', m);
        try {
          const r = await fetch(url + '/api/health', { cache: 'no-store', signal: AbortSignal.timeout(8000) });
          const j = await r.json();
          if (j.app !== 'lehoan-portal') throw new Error();
          store.set('lh_api_base', url); msg.innerHTML = '<span style="color:var(--ok)">✓ Kết nối thành công</span>';
          await sleep(400); location.reload();
        } catch { msg.innerHTML = '<span style="color:var(--bad)">Không kết nối được. Kiểm tra địa chỉ, mạng Wi-Fi và máy chủ đã bật chưa.</span>'; }
      });
    } });
}

function go(p) { location.href = p === 'student' ? 'app.html' : 'admin.html'; }

function bind() {
  $('#theme').onclick = () => toggleTheme();
  if ($('#srv')) $('#srv').onclick = serverDialog;
  $$('[data-store-install]').forEach(b => b.onclick = () => installApp());
  $$('[data-lcf-modal]').forEach(b => b.onclick = () => {
    const k = b.dataset.lcfModal;
    if (k === 'about') {
      modal({ title: 'Giới thiệu trang web & Tác giả', sub: `Trang web này được tạo bởi ${settings?.creatorName || 'Vũ Nguyễn An Khang'}`, size: 'xwide', body: aboutPortalHtml(settings), foot: '<button class="btn" data-close>Đóng</button>' });
      return;
    }
    const info = {
      terms: ['Điều khoản & Pháp lý', `<p class="ink2">Cổng Học Đường Số được xây dựng và vận hành phục vụ công tác giáo dục, tư vấn tâm lý và bảo đảm an toàn trường học tại <b>${esc(settings?.schoolName || 'Trường THPT Lê Hoàn')}</b>.</p><p class="small muted">Học sinh sử dụng đúng mã số cá nhân, không chia sẻ mật khẩu và tuân thủ quy tắc ứng xử văn minh trên không gian mạng.</p>`],
      privacy: ['Chính sách bảo vệ dữ liệu cá nhân', `<p class="ink2">Mọi thông tin cá nhân, nhật ký cảm xúc, nội dung tư vấn tâm lý và hồ sơ tố giác ẩn danh của học sinh đều được mã hóa ở tầng ứng dụng (ECDH P-256 + AES-256-GCM) và bảo mật tuyệt đối.</p><p class="small muted">Nhà trường chỉ sử dụng dữ liệu nhằm mục đích hỗ trợ, bảo vệ học sinh và nâng cao chất lượng giáo dục theo quy định hiện hành.</p>`],
      cookies: ['Cài đặt Cookies & Lưu trữ phiên', `<p class="ink2">Hệ thống chỉ sử dụng bộ nhớ cục bộ (LocalStorage / SessionStorage) cần thiết để duy trì phiên đăng nhập an toàn, chế độ giao diện Sáng/Tối và bảo vệ tài khoản khi không hoạt động.</p><p class="small muted">Không sử dụng bất kỳ cookie quảng cáo hay theo dõi của bên thứ ba.</p>`],
    }[k];
    if (info) modal({ title: info[0], body: info[1], foot: '<button class="btn" data-close>Đã hiểu</button>' });
  });
  $('#eye').onclick = () => { const p = $('#p'); p.type = p.type === 'password' ? 'text' : 'password'; $('#eye').innerHTML = icon(p.type === 'password' ? 'eye' : 'eyeOff'); };
  $('#forgot').onclick = () => modal({ title: 'Quên mật khẩu', body: `<p class="ink2">Vì lý do bảo mật, học sinh vui lòng liên hệ <b>GVCN</b> hoặc <b>Văn phòng nhà trường</b> để được đặt lại mật khẩu mặc định. Thầy cô thực hiện trong mục <i>Quản lý tài khoản → Đặt lại mật khẩu</i>.</p><p class="small muted">Sau khi đăng nhập bằng mật khẩu mặc định, hãy đổi mật khẩu mới ngay trong mục Hồ sơ cá nhân.</p>`, foot: '<button class="btn" data-close>Đã hiểu</button>' });
  if ($('#capRefresh')) $('#capRefresh').onclick = () => loadCaptcha();
  $('#f').onsubmit = async (e) => {
    e.preventDefault();
    const err = $('#err'); err.hidden = true;
    const username = $('#u').value.trim(), password = $('#p').value;
    if (!username || !password) { err.textContent = 'Vui lòng nhập đầy đủ mã đăng nhập và mật khẩu.'; err.hidden = false; return; }
    if (IS_MOBILE) {
      await withBusy($('#go'), async () => {
        try {
          const res = await api.post('api/auth/login', { username, password, remember: $('#rem').checked, portal: 'mobile' });
          const targetPortal = res.user.role === 'student' ? 'student' : 'staff';
          setPortal(targetPortal);
          session.set(res.token, true, true);
          store.set('lh_remember_user', $('#rem').checked ? username : '');
          store.set('lh_remember_' + targetPortal, $('#rem').checked ? username : '');
          toast(`Xin chào ${res.user.name}!`, 'ok', 1500);
          await sleep(300);
          go(targetPortal);
        } catch (ex) {
          if (ex instanceof ApiError && ex.details?.locked) {
            err.innerHTML = `${esc(ex.message)} <button type="button" class="btn plain sm" id="askUnlock" style="padding:0">Gửi yêu cầu mở khóa</button>`;
            err.hidden = false;
            $('#askUnlock', err).onclick = () => unlockRequestDialog(ex.details.userId);
          } else { err.textContent = ex.message; err.hidden = false; }
        }
      });
      return;
    }
    const captchaCode = $('#cap').value.trim();
    if (!captchaCode) { err.textContent = 'Vui lòng nhập mã xác nhận trong ảnh.'; err.hidden = false; return; }
    await withBusy($('#go'), async () => {
      try {
        setPortal(portal);
        const res = await api.post('api/auth/login', { username, password, captchaId: captcha?.id, captchaCode, remember: $('#rem').checked, portal });
        if (portal === 'student' && res.user.role !== 'student') {
          err.innerHTML = 'Tài khoản này thuộc <b>Cổng Quản Trị / Giáo Viên</b>. Vui lòng đăng nhập tại trang dành riêng cho Quản trị và Giáo viên.';
          err.hidden = false; await loadCaptcha(); return;
        }
        if (portal === 'staff' && res.user.role === 'student') {
          err.innerHTML = 'Đây là trang đăng nhập dành cho <b>Quản trị / Giáo viên</b>. Học sinh vui lòng đăng nhập ở <b>Cổng Học Sinh</b>.';
          err.hidden = false; await loadCaptcha(); return;
        }
        session.set(res.token, $('#rem').checked);
        store.set('lh_remember_' + portal, $('#rem').checked ? username : '');
        toast(`Xin chào ${res.user.name}!`, 'ok', 1500);
        await sleep(350);
        go(res.user.role === 'student' ? 'student' : 'staff');
      } catch (ex) {
        if (ex instanceof ApiError && ex.details?.locked) {
          err.innerHTML = `${esc(ex.message)} <button type="button" class="btn plain sm" id="askUnlock" style="padding:0">Gửi yêu cầu mở khóa</button>`;
          err.hidden = false;
          $('#askUnlock', err).onclick = () => unlockRequestDialog(ex.details.userId);
        } else { err.textContent = ex.message; err.hidden = false; }
        await loadCaptcha();
      }
    });
  };
  $('#face') && ($('#face').onclick = faceLogin);
}

/** Hộp thoại gửi yêu cầu mở khóa tài khoản (tài khoản đã tự khóa do nhập sai mật khẩu 3 lần). */
async function unlockRequestDialog(userId) {
  if (IS_MOBILE) {
    const m = modal({ title: 'Gửi yêu cầu mở khóa tài khoản', sub: `Mã tài khoản: ${esc(userId)}`,
      body: `<p class="ink2 small">Yêu cầu sẽ được gửi tới Ban Giám hiệu / giám thị để xem xét mở khóa.</p>
        <div id="umsg" class="small" style="min-height:18px"></div>`,
      foot: '<button class="btn ghost" data-close>Đóng</button><button class="btn" id="usend">Gửi yêu cầu</button>' });
    $('#usend', m.el).onclick = (ev) => withBusy(ev.currentTarget, async () => {
      const msg = $('#umsg', m.el);
      try {
        const r = await api.post('api/auth/unlock-request', { userId, portal: 'mobile' });
        msg.innerHTML = `<span style="color:var(--ok)">${esc(r.message)}</span>`;
        await sleep(1200); m.close();
      } catch (ex) { msg.innerHTML = `<span style="color:var(--bad)">${esc(ex.message)}</span>`; }
    });
    return;
  }
  let ucap = null;
  const load = async (m) => { try { ucap = await api.get('api/auth/captcha'); } catch { ucap = null; } $('#ucapImg', m).innerHTML = ucap ? ucap.svg : ''; $('#ucap', m).value = ''; };
  const m = modal({ title: 'Gửi yêu cầu mở khóa tài khoản', sub: `Mã tài khoản: ${esc(userId)}`,
    body: `<p class="ink2 small">Yêu cầu sẽ được gửi tới Ban Giám hiệu / giám thị để xem xét mở khóa.</p>
      <div class="field"><label for="ucap">Mã xác nhận</label><div class="captcha-row"><span class="captcha-img" id="ucapImg"></span><button type="button" class="btn icon ghost sm" id="ucapRefresh" aria-label="Lấy mã khác">${icon('refresh')}</button><input id="ucap" inputmode="numeric" maxlength="5" placeholder="Nhập các số"></div></div>
      <div id="umsg" class="small" style="min-height:18px"></div>`,
    foot: '<button class="btn ghost" data-close>Đóng</button><button class="btn" id="usend">Gửi yêu cầu</button>' });
  await load(m.el);
  $('#ucapRefresh', m.el).onclick = () => load(m.el);
  $('#usend', m.el).onclick = (ev) => withBusy(ev.currentTarget, async () => {
    const msg = $('#umsg', m.el);
    try {
      const r = await api.post('api/auth/unlock-request', { userId, captchaId: ucap?.id, captchaCode: $('#ucap', m.el).value.trim() });
      msg.innerHTML = `<span style="color:var(--ok)">${esc(r.message)}</span>`;
      await sleep(1400); m.close();
    } catch (ex) { msg.innerHTML = `<span style="color:var(--bad)">${esc(ex.message)}</span>`; await load(m.el); }
  });
}

async function faceLogin() {
  const saved = store.get('lh_face');
  let stream = null;
  const m = modal({
    title: 'Đăng nhập bằng Face ID', sub: 'Giữ khuôn mặt trong khung, nhìn thẳng vào camera',
    body: `<div class="faceid"><div class="scan" id="scan"><video id="vid" autoplay playsinline muted></video><div class="frame"></div><div class="line"></div><div id="ph" style="position:absolute;color:#9db7ff">${icon('face', '').replace('class="ico ', 'style="width:72px;height:72px" class="ico ')}</div></div><p class="small muted" id="fstat" style="text-align:center">Đang khởi động camera…</p></div>`,
    foot: '<button class="btn ghost" data-close>Hủy</button>',
    onClose: () => stream?.getTracks().forEach(t => t.stop()),
  });
  const stat = $('#fstat', m.el);
  if (!saved) {
    stat.innerHTML = 'Thiết bị này chưa bật Face ID. Hãy đăng nhập bằng mật khẩu, sau đó vào <b>Hồ sơ → Bảo mật → Bật Face ID</b>.';
    $('.line', m.el).style.display = 'none';
    return;
  }
  try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } }); $('#vid', m.el).srcObject = stream; $('#ph', m.el).remove(); } catch { /* Không có camera: mô phỏng */ }
  stat.textContent = 'Đang quét và đối chiếu khuôn mặt…';
  await sleep(2200);
  try {
    const res = await api.post('api/auth/face/login', saved);
    const targetPortal = res.user.role === 'student' ? 'student' : 'staff';
    setPortal(targetPortal);
    $('#scan', m.el).classList.add('ok'); stat.innerHTML = `<b style="color:var(--ok)">Đã nhận diện: ${esc(res.user.name)}</b>`;
    session.set(res.token, true);
    await sleep(700); m.close(); go(targetPortal);
  } catch (e) { stat.textContent = e.message; $('.line', m.el).style.display = 'none'; }
}

window.addEventListener('auth:expired', () => {});
boot().catch(showError);
