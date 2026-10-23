// Trang tài liệu REST API: sinh tự động từ khai báo route, có khung "Thử ngay"
import { api, session, setPortal, detect, getMode, showError } from './core/api.js';
import { icon, drumArt } from './core/icons.js';
import { $, $$, esc, toast, copyText, initTheme, initDevToolsGuard, toggleTheme, store, withBusy } from './core/ui.js';

initTheme(); initDevToolsGuard();
const root = $('#root');
let portal = store.get('lh_docs_portal', 'student');
setPortal(portal);

const AUTH = { public: ['Công khai', ''], user: ['Đã đăng nhập', 'info'], student: ['Học sinh', 'ok'], staff: ['Giáo viên / Quản trị', 'violet'], admin: ['Ban Giám hiệu', 'bad'] };
const highlight = (json) => esc(json).replace(/(&quot;[^&]*?&quot;)(\s*:)/g, '<span class="k">$1</span>$2').replace(/:\s(&quot;.*?&quot;)/g, ': <span class="s">$1</span>').replace(/:\s(-?\d+\.?\d*|true|false|null)/g, ': <span class="n">$1</span>');

async function boot() {
  await detect();
  const isUnlocked = () => { try { return sessionStorage.getItem('lh_docs_unlocked') === '1'; } catch { return false; } };
  if (!isUnlocked()) {
    renderPinGate();
    return;
  }
  await renderDocs();
}

function renderPinGate() {
  root.innerHTML = `
  <div style="min-height:100vh;display:grid;place-items:center;padding:20px;background:var(--bg)">
    <section class="card pad stack" style="width:100%;max-width:400px;gap:16px;box-shadow:var(--shadow-2)">
      <div class="row between">
        <div class="row" style="gap:10px">
          <span class="avatar sq" style="background:var(--brand)">${icon('lock')}</span>
          <div>
            <b style="font-size:1.05rem;display:block">Tài liệu REST API</b>
            <span class="xs muted">Yêu cầu mã PIN bảo mật để truy cập</span>
          </div>
        </div>
        <button class="icon-btn sm" id="theme" aria-label="Đổi giao diện">${icon('moon')}</button>
      </div>
      <form id="gateForm" class="stack" style="gap:12px" novalidate>
        <div class="field">
          <label for="gatePin">Mã PIN</label>
          <div class="input-icon">${icon('key')}<input id="gatePin" type="password" inputmode="numeric" maxlength="32" placeholder="Nhập mã PIN" autocomplete="off" autofocus required></div>
        </div>
        <div id="gateErr" class="badge bad" hidden style="height:auto;padding:8px 12px;white-space:normal;border-radius:10px"></div>
        <div class="row" style="gap:8px;justify-content:flex-end;margin-top:4px">
          <a class="btn ghost" href="./">Quay lại</a>
          <button class="btn grow" id="gateBtn">${icon('arrowRight')} Mở khóa REST API</button>
        </div>
      </form>
    </section>
  </div>`;
  $('#theme').onclick = toggleTheme;
  $('#gateForm').onsubmit = (e) => {
    e.preventDefault();
    withBusy($('#gateBtn'), async () => {
      const err = $('#gateErr');
      err.hidden = true;
      const pin = $('#gatePin').value.trim();
      if (!pin) { err.textContent = 'Vui lòng nhập mã PIN.'; err.hidden = false; return; }
      try {
        await api.post('api/docs/verify-pin', { pin });
        try { sessionStorage.setItem('lh_docs_unlocked', '1'); } catch { /* bỏ qua */ }
        toast('Đã mở khóa tài liệu REST API.', 'ok', 1600);
        await renderDocs();
      } catch (ex) {
        err.textContent = ex.message || 'Mã PIN không đúng.';
        err.hidden = false;
        $('#gatePin').select();
      }
    });
  };
}

async function renderDocs() {
  const doc = await api.get('api');
  const groups = [...new Set(doc.endpoints.map(e => e.group))];
  const counts = doc.endpoints.reduce((a, e) => (a[e.method] = (a[e.method] || 0) + 1, a), {});
  root.innerHTML = `
  <div class="page">
    <section class="hero" style="padding:clamp(22px,4vw,36px);margin-top:12px">
      ${drumArt(460, 'drum').replace('class="drum"', 'class="drum" style="right:-120px;top:-140px"')}
      <div class="row between"><a class="brand" href="./" style="padding:0"><img src="assets/logo-mark.svg" alt=""><div><b>Cổng Học Đường Số · Trường THPT Lê Hoàn</b><span style="color:rgba(255,255,255,.7)">Tài liệu REST API v${esc(doc.version)}</span></div></a><div class="row" style="gap:8px"><button class="btn sm" id="lockDocs" style="background:rgba(255,255,255,.14);border-color:rgba(255,255,255,.22);color:#fff">${icon('lock')} Khóa lại</button><button class="icon-btn" id="theme" style="background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.2);color:#fff" aria-label="Đổi giao diện">${icon('moon')}</button></div></div>
      <h1 style="font-size:clamp(1.6rem,3.6vw,2.4rem);margin-top:22px;max-width:24ch">${doc.endpoints.length} endpoint cho an toàn học đường, tư vấn tâm lý và AI</h1>
      <p class="muted" style="margin-top:8px;max-width:70ch">${esc(doc.auth)}. Dữ liệu trao đổi dạng JSON (UTF-8). Kênh realtime: <span class="mono">${esc(doc.realtime.split(' (')[0])}</span>.</p>
      <div class="row" style="margin-top:16px;gap:8px">${Object.entries(counts).map(([m, n]) => `<span class="method ${m}" style="background:rgba(255,255,255,.95)">${m} · ${n}</span>`).join('')}<span class="badge" style="background:rgba(255,255,255,.14);color:#fff">${getMode() === 'demo' ? 'Đang chạy trong trình duyệt (demo)' : 'Máy chủ Node.js đang chạy'}</span></div>
    </section>
    <div class="grid" style="grid-template-columns:minmax(0,1fr) minmax(0,380px);align-items:start" id="lay">
      <div class="stack lg">
        <div class="row"><div class="input-icon grow">${icon('search')}<input class="input" id="q" placeholder="Lọc theo đường dẫn hoặc mô tả, ví dụ: tố giác, /api/quiz…"></div></div>
        <div id="list" class="stack lg"></div>
      </div>
      <aside class="stack lg" style="position:sticky;top:16px">
        <section class="card"><div class="card-head"><h2>${icon('key')} Phiên thử nghiệm</h2></div><div class="card-body stack">
          <div class="seg" style="width:100%">${[['student', 'Học sinh'], ['staff', 'Giáo viên'], ['admin', 'Quản trị']].map(([k, l]) => `<button data-p="${k}" class="${portal === k ? 'active' : ''}" style="flex:1">${l}</button>`).join('')}</div>
          <button class="btn block" id="login">${icon('arrowRight')} Lấy token dùng thử</button>
          <div class="small muted" id="tok">${session.token ? 'Đã có token, các yêu cầu sẽ gửi kèm Authorization.' : 'Chưa có token. Endpoint công khai vẫn gọi được.'}</div>
        </div></section>
        <section class="card" id="try"><div class="card-head"><h2>${icon('play')} Thử ngay</h2></div><div class="card-body stack">
          <div class="row nowrap"><select class="select" id="m" style="width:110px"><option>GET</option><option>POST</option><option>PUT</option><option>PATCH</option><option>DELETE</option></select><input class="input mono" id="p" value="/api/health" style="font-size:13px"></div>
          <textarea class="textarea mono" id="b" placeholder="Body JSON (với POST/PUT/PATCH)" style="font-size:12.5px;min-height:110px"></textarea>
          <button class="btn" id="send">${icon('send')} Gửi yêu cầu</button>
          <div class="row between small"><span id="st" class="muted">Chưa gửi</span><button class="btn plain sm" id="copy">${icon('copy')} Sao chép cURL</button></div>
          <pre class="code" id="out">// Kết quả hiển thị tại đây</pre>
        </div></section>
      </aside>
    </div>
  </div>`;
  if (innerWidth < 980) $('#lay').style.gridTemplateColumns = 'minmax(0,1fr)';
  const draw = (q = '') => {
    q = q.toLowerCase();
    $('#list').innerHTML = groups.map(g => {
      const eps = doc.endpoints.filter(e => e.group === g && (!q || (e.path + e.desc).toLowerCase().includes(q)));
      if (!eps.length) return '';
      return `<section class="card"><div class="card-head"><h2>${esc(g)}</h2><span class="small muted">${eps.length}</span></div><div class="card-body" style="padding-top:8px">${eps.map((e, i) => `<div class="ep" data-ep="${doc.endpoints.indexOf(e)}"><span class="method ${e.method}">${e.method}</span><div style="min-width:0"><code>${esc(e.path)}</code><div class="small muted">${esc(e.desc)}</div></div>${e.auth !== 'public' ? `<span class="badge ${AUTH[e.auth][1]}">${icon('lock')} ${AUTH[e.auth][0]}</span>` : '<span class="badge">Công khai</span>'}</div>`).join('')}</div></section>`;
    }).join('') || '<div class="card pad small muted">Không có endpoint phù hợp.</div>';
    $$('[data-ep]').forEach(el => el.onclick = () => {
      const e = doc.endpoints[+el.dataset.ep];
      $('#m').value = e.method;
      let p = e.path.replace(':id', e.path.includes('/reports/') ? 'TG-2610-0007' : e.path.includes('surveys') ? 'KS-2026-01' : e.path.includes('news') ? 'N101' : e.path.includes('handbook') ? 'CD-01' : e.path.includes('users') ? '2126220015' : 'ID').replace(':studentId', '2126220015').replace(':code', 'TOAN').replace(':dataset', 'users').replace(':userId', '2126220015');
      if (e.query) p += '?' + new URLSearchParams(Object.fromEntries(Object.entries(e.query).map(([k, v]) => [k, String(v)]))).toString();
      $('#p').value = p;
      $('#b').value = e.body ? JSON.stringify(e.body, null, 2) : '';
      $('#try').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };
  draw();
  $('#q').oninput = (e) => draw(e.target.value);
  $('#theme').onclick = toggleTheme;
  $('#lockDocs').onclick = () => {
    try { sessionStorage.removeItem('lh_docs_unlocked'); } catch { /* bỏ qua */ }
    renderPinGate();
  };
  $$('[data-p]').forEach(b => b.onclick = () => { portal = b.dataset.p; store.set('lh_docs_portal', portal); setPortal(portal === 'student' ? 'student' : 'staff'); $$('[data-p]').forEach(x => x.classList.toggle('active', x === b)); $('#tok').textContent = session.token ? 'Đã có token của phiên này.' : 'Chưa có token.'; });
  $('#login').onclick = (ev) => withBusy(ev.currentTarget, async () => {
    const cred = { student: ['2126220004', '123456'], staff: ['GV2024089', '123456'], admin: ['admin', 'admin123'] }[portal];
    setPortal(portal === 'student' ? 'student' : 'staff');
    try { const r = await api.post('api/auth/login', { username: cred[0], password: cred[1] }); session.set(r.token, false); $('#tok').innerHTML = `Đã đăng nhập <b>${esc(r.user.name)}</b>. Token: <span class="mono">${esc(r.token.slice(0, 22))}…</span>`; toast('Đã lấy token dùng thử.', 'ok'); } catch (e) { showError(e); }
  });
  $('#send').onclick = (ev) => withBusy(ev.currentTarget, async () => {
    const m = $('#m').value, p = $('#p').value.trim(); let body;
    if (['POST', 'PUT', 'PATCH'].includes(m) && $('#b').value.trim()) { try { body = JSON.parse($('#b').value); } catch { return toast('Body không phải JSON hợp lệ.', 'warn'); } }
    const t0 = performance.now();
    try {
      const r = await ({ GET: api.get, POST: api.post, PUT: api.put, PATCH: api.patch, DELETE: api.del })[m](p, body);
      $('#st').innerHTML = `<span class="badge ok">200 OK</span> ${Math.round(performance.now() - t0)} ms`;
      $('#out').innerHTML = r?.raw ? '// Tệp nhị phân (Excel). Dùng trình duyệt hoặc cURL để tải.' : highlight(JSON.stringify(r, null, 2).slice(0, 60000));
    } catch (e) { $('#st').innerHTML = `<span class="badge bad">${e.status || 'Lỗi'}</span> ${Math.round(performance.now() - t0)} ms`; $('#out').innerHTML = highlight(JSON.stringify({ error: e.message, details: e.details }, null, 2)); }
  });
  $('#copy').onclick = () => { const m = $('#m').value, p = $('#p').value.trim(); const b = $('#b').value.trim(); copyText(`curl -X ${m} "${location.origin}${p.startsWith('/') ? p : '/' + p}"${session.token ? ` -H "Authorization: Bearer ${session.token}"` : ''}${b && m !== 'GET' ? ` -H "Content-Type: application/json" -d '${b.replace(/\s+/g, ' ')}'` : ''}`); };
}
boot().catch(showError);
