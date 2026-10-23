// Đóng gói giao diện mobile (../public) vào thư mục www/ cho app Android (Capacitor).
// App hiển thị CỐ ĐỊNH giao diện mobile (https://tuvantamlihocduonglehoan.com/mobile)
// kể cả trên giả lập màn hình ngang (BlueStacks/LDPlayer), trong khi bản web giữ nguyên 100%.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const mobile = path.resolve(here, '..');
const root = path.resolve(mobile, '..');
const www = path.join(mobile, 'www');

const cfg = JSON.parse(fs.readFileSync(path.join(mobile, 'app.config.json'), 'utf8'));
const serverUrl = String(process.env.SERVER_URL || cfg.serverUrl || 'https://tuvantamlihocduonglehoan.com').trim().replace(/\/+$/, '');
const version = JSON.parse(fs.readFileSync(path.join(mobile, 'package.json'), 'utf8')).version;

fs.rmSync(www, { recursive: true, force: true });
fs.cpSync(path.join(root, 'public'), www, {
  recursive: true,
  filter: (src) => !/(sw\.js|phone\.html|phone\.js|sync\.php|\.htaccess|[/\\]data([/\\]|$))$/.test(src),
});
if (fs.existsSync(path.join(root, 'shared'))) {
  fs.cpSync(path.join(root, 'shared'), path.join(www, 'shared'), {
    recursive: true,
    filter: (src) => !src.endsWith('providers.js'),
  });
}

// Khóa cứng bộ CSS trong mobile/www luôn hiển thị giao diện điện thoại (/mobile) ở mọi độ phân giải màn hình giả lập
const cssPath = path.join(www, 'css', 'app.css');
if (fs.existsSync(cssPath)) {
  let css = fs.readFileSync(cssPath, 'utf8');
  css = css
    .replace(/@media\s*\(\s*min-width:\s*1024px\s*\)/g, '@media (min-width: 99999px)')
    .replace(/@media\s*\(\s*max-width:\s*(1023|960|760|720)px\s*\)/g, '@media (min-width: 0px)');
  fs.writeFileSync(cssPath, css);
}

fs.writeFileSync(path.join(www, 'config.js'), `// Tự sinh bởi scripts/build-www.mjs — cấu hình app điện thoại
window.LH_CONFIG = ${JSON.stringify({ app: true, apiBase: serverUrl, version }, null, 2)};
`);

let pages = 0;
for (const f of fs.readdirSync(www).filter(f => f.endsWith('.html'))) {
  const p = path.join(www, f);
  let html = fs.readFileSync(p, 'utf8');
  if (!html.includes('src="config.js"')) {
    if (/<head>/i.test(html)) {
      html = html.replace(/<head>/i, '<head>\n  <script src="config.js"></script>');
    } else {
      html = '<script src="config.js"></script>\n' + html;
    }
    fs.writeFileSync(p, html);
    pages++;
  }
}
console.log(`✓ Đã đóng gói ${pages} trang giao diện /mobile vào mobile/www`);
console.log(`✓ Máy chủ đồng bộ mặc định: ${serverUrl}`);
