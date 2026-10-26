// ============================================================================
//  ĐÓNG GÓI MÃ NGUỒN (GỘP + MÃ HÓA JS/API) CHO HOSTING CPANEL
//  - Ẩn toàn bộ tệp .js và .php khỏi tab Network của trình duyệt
//  - Mã hóa chuỗi + đóng gói XOR/Base64 trực tiếp vào HTML
//  - Chuẩn quyền Linux (0755 cho thư mục, 0644 cho tệp)
// ============================================================================
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { transform as obfuscateTransform } from './obfuscate.mjs';
import { migrateData } from '../shared/migrate.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const DB_KEY_FILE = path.join(DATA_DIR, 'db.key');
const DB_LIVE_FILE = path.join(DATA_DIR, 'db-live.json');
const STAGE_DIR = path.join(ROOT, '_tmp_cpanel_stage');
const ZIP_OUT = path.join(ROOT, 'lehoan-portal-cpanel.zip');

// 1. Hàm gộp toàn bộ ES Module (client-src/js/** + shared/**) thành 1 khối duy nhất & mã hóa
const bundleCache = new Map();
function buildEncryptedInlineScript(entryRel) {
  if (bundleCache.has(entryRel)) return bundleCache.get(entryRel);
  const entryAbs = path.resolve(ROOT, 'client-src', 'js', entryRel);
  const idMap = new Map();
  const defs = [];

  function register(absPath) {
    const norm = path.resolve(absPath);
    if (idMap.has(norm)) return idMap.get(norm);
    const id = 'm' + idMap.size;
    idMap.set(norm, id);
    let code = fs.readFileSync(norm, 'utf8');

    code = code.replace(/^\s*import\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"]\s*;?/gm, (_m, clause, spec) => {
      const cleanSpec = spec.split('?')[0];
      let depAbs = path.resolve(path.dirname(norm), cleanSpec);
      if (!fs.existsSync(depAbs)) {
        depAbs = depAbs.replace(path.join(ROOT, 'client-src', 'shared'), path.join(ROOT, 'shared'));
      }
      const depId = register(depAbs);
      const c = clause.trim();
      if (c.startsWith('*')) {
        const ns = c.replace(/^\*\s+as\s+/, '').trim();
        return `const ${ns}=_R("${depId}");`;
      }
      if (c.startsWith('{')) {
        const inner = c.slice(1, -1).replace(/\b([A-Za-z_$][A-Za-z0-9_$]*)\s+as\s+([A-Za-z_$][A-Za-z0-9_$]*)\b/g, '$1:$2');
        return `const {${inner}}=_R("${depId}");`;
      }
      return `const ${c}=_R("${depId}").default;`;
    });

    const named = [];
    let defName = null;
    code = code.replace(/^(\s*)export\s+default\s+function\s+([A-Za-z_$][A-Za-z0-9_$]*)/gm, (_m, ws, name) => {
      defName = name;
      return `${ws}function ${name}`;
    });
    code = code.replace(/^(\s*)export\s+(async\s+function|function|class)\s+([A-Za-z_$][A-Za-z0-9_$]*)/gm, (_m, ws, kw, name) => {
      named.push(name);
      return `${ws}${kw} ${name}`;
    });
    code = code.replace(/^(\s*)export\s+(const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=/gm, (_m, ws, kw, name) => {
      named.push(name);
      return `${ws}${kw} ${name}=`;
    });

    const getters = [...new Set(named)].map(n => `${n}:{enumerable:true,get:()=>${n}}`).join(',');
    if (getters) code += `\nObject.defineProperties(_E,{${getters}});`;
    if (defName) code += `\n_E.default=${defName};`;

    defs.push(`${id}(_E,_R){\n${code}\n}`);
    return id;
  }

  const entryId = register(entryAbs);
  const rawBundle = `(()=>{const _M={\n${defs.join(',\n')}\n},_C={};function _R(i){if(_C[i])return _C[i].exports;const m=_C[i]={exports:{}}; _M[i](m.exports,_R);return m.exports;}_R("${entryId}");})();`;
  const obfBundle = obfuscateTransform(rawBundle);

  // Kiểm tra cú pháp JS của gói đã làm rối ngay lúc đóng gói
  new vm.Script(obfBundle, { filename: entryRel });

  // Mã hóa toàn bộ gói JS bằng khóa XOR 16 byte ngẫu nhiên + Base64 để ẩn hoàn toàn mã nguồn
  const xorKey = crypto.randomBytes(16);
  const rawBytes = Buffer.from(obfBundle, 'utf8');
  const encBytes = Buffer.alloc(rawBytes.length);
  for (let i = 0; i < rawBytes.length; i++) encBytes[i] = rawBytes[i] ^ xorKey[i & 15];
  const b64Payload = encBytes.toString('base64');
  const keyArr = JSON.stringify([...xorKey]);
  const scriptTag = `<script data-lh-bundle="1">(()=>{const k=${keyArr},b=atob("${b64Payload}"),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i)^k[i&15];const run=()=>(0,eval)(new TextDecoder().decode(u));if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run,{once:true});else run();})();</script>`;

  console.log(`✓ Đã gộp & mã hóa gói ${entryRel} (${idMap.size} module → ${(b64Payload.length / 1024).toFixed(1)} KB mã hóa)`);
  bundleCache.set(entryRel, scriptTag);
  return scriptTag;
}

const HTML_ENTRIES = {
  'index.html': 'login.js',
  'staff.html': 'login.js',
  'admin-login.html': 'login.js',
  'app.html': 'student.js',
  'admin.html': 'admin.js',
  'teacher.html': 'admin.js',
  'phone.html': 'phone.js',
  'docs.html': 'docs.js',
};

const ver = 'v=' + Date.now().toString(36);
const pubDir = path.join(ROOT, 'public');
const inlineFix = '<script>window.process=window.process||{env:{}};if(location.protocol==="http:"&&location.hostname!=="localhost"&&location.hostname!=="127.0.0.1")location.replace("https://"+location.host+location.pathname+location.search+location.hash);if(location.pathname==="/"&&window.self===window.top&&!window.Capacitor&&!window.LH_CONFIG?.app&&!/[?&](mobile|switch)=/.test(location.search)){location.replace((/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent||"")||innerWidth<=760?"/mobile":"/hocsinhlogin")+location.search+location.hash);}if(navigator.serviceWorker)navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.update()));</script><style>.demo-ribbon{display:none!important}</style>';
const rootSplash = '<div id="root"><div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:24px;text-align:center"><img src="assets/school_logo.png" alt="Trường THPT Lê Hoàn" style="width:96px;height:96px;object-fit:contain;border-radius:50%;background:#fff;padding:6px;box-shadow:0 12px 32px rgba(23,71,201,.28)"><div style="font-weight:700;font-size:16px">Trường THPT Lê Hoàn</div><div class="skel" style="width:180px;height:8px;border-radius:99px"></div></div></div>';

for (const [f, entryRel] of Object.entries(HTML_ENTRIES)) {
  const p = path.join(pubDir, f);
  if (!fs.existsSync(p)) continue;
  let html = fs.readFileSync(p, 'utf8');
  html = html.replace(/<script>window\.process=window\.process[\s\S]*?<\/script>(?:<style>\.demo-ribbon\{display:none!important\}<\/style>)?\s*/g, '');
  html = html.replace(/<script type="module" src="js\/[^"]+"><\/script>\s*/g, '');
  html = html.replace(/<script data-lh-bundle="1">[\s\S]*?<\/script>\s*/g, '');
  html = html.replace('<head>', '<head>\n  ' + inlineFix);
  html = html.replace(/<link rel="icon"[^>]*>/g, '<link rel="icon" href="assets/school_logo.png" type="image/png">');
  html = html.replace(/<meta name="apple-mobile-web-app-title"[^>]*>/g, '<meta name="apple-mobile-web-app-title" content="LeHoan ShareLove">');
  html = html.replace(/<div id="root">[\s\S]*?<\/div>\s*(?=<(?:noscript|script|\/body))/i, rootSplash + '\n');
  html = html.replace(/(href="css\/[a-zA-Z0-9_.\-/]+\.css)(?:\?[^"]*)?(")/g, `$1?${ver}$2`);
  html = html.replace(/(href="manifest\.webmanifest)(?:\?[^"]*)?(")/g, `$1?${ver}$2`);
  const inlineBundle = buildEncryptedInlineScript(entryRel);
  html = html.replace('</body>', inlineBundle + '\n</body>');
  fs.writeFileSync(p, html, 'utf8');
}

// 2. Giải mã data/db.json ra data/db-live.json & chạy migrateData sẵn trên đĩa
if (fs.existsSync(DB_FILE) && fs.existsSync(DB_KEY_FILE)) {
  const raw = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  let plain = '';
  if (raw?.enc === 'aes-256-gcm') {
    const key = Buffer.from(fs.readFileSync(DB_KEY_FILE, 'utf8').trim(), 'hex');
    const dec = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(raw.iv, 'base64'));
    dec.setAuthTag(Buffer.from(raw.tag, 'base64'));
    plain = Buffer.concat([dec.update(Buffer.from(raw.data, 'base64')), dec.final()]).toString('utf8');
  } else {
    plain = fs.readFileSync(DB_FILE, 'utf8');
  }
  const dbObj = JSON.parse(plain);
  migrateData(dbObj);
  fs.writeFileSync(DB_LIVE_FILE, JSON.stringify(dbObj), 'utf8');
  console.log('✓ Đã xuất & chuẩn hóa dữ liệu thật sang data/db-live.json cho Hosting cPanel.');
}

// 3. Dọn thư mục tạm và gom tệp cần thiết cho public_html (KHÔNG đưa thư mục js/ và shared/ lên host)
fs.rmSync(STAGE_DIR, { recursive: true, force: true });
fs.mkdirSync(STAGE_DIR, { recursive: true });

fs.cpSync(path.join(ROOT, 'public'), STAGE_DIR, { recursive: true });
fs.rmSync(path.join(STAGE_DIR, 'js'), { recursive: true, force: true });

fs.mkdirSync(path.join(STAGE_DIR, 'data'), { recursive: true });
for (const item of fs.readdirSync(DATA_DIR)) {
  if (item === 'db.json' || item === 'db.key') continue;
  fs.cpSync(path.join(DATA_DIR, item), path.join(STAGE_DIR, 'data', item), { recursive: true });
}

if (fs.existsSync(ZIP_OUT)) fs.unlinkSync(ZIP_OUT);

// Dùng Python zipfile để đóng gói chuẩn đường dẫn "/" (không có "./") và quyền Unix 0644/0755 chuẩn LiteSpeed
const pyScript = `
import os, time, zipfile
stage = ${JSON.stringify(STAGE_DIR)}
out = ${JSON.stringify(ZIP_OUT)}
now = time.localtime()[:6]
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(stage):
        rel_root = os.path.relpath(root, stage).replace('\\\\', '/')
        if rel_root != '.':
            zi = zipfile.ZipInfo(rel_root + '/', date_time=now)
            zi.create_system = 3
            zi.external_attr = (0o40755 << 16) | 0x10
            zf.writestr(zi, b'')
        for f in files:
            full = os.path.join(root, f)
            rel = os.path.relpath(full, stage).replace('\\\\', '/')
            with open(full, 'rb') as fp:
                data = fp.read()
            zi = zipfile.ZipInfo(rel, date_time=now)
            zi.compress_type = zipfile.ZIP_DEFLATED
            zi.create_system = 3
            zi.external_attr = (0o100644 << 16)
            zf.writestr(zi, data)
`;
execFileSync('python', ['-c', pyScript], { stdio: 'inherit' });
fs.rmSync(STAGE_DIR, { recursive: true, force: true });

const sizeMb = (fs.statSync(ZIP_OUT).size / (1024 * 1024)).toFixed(2);
console.log(`✓ Đã tạo gói cài đặt cPanel bảo mật (0644/0755): ${ZIP_OUT} (${sizeMb} MB)`);
