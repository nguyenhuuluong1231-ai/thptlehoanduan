// Đóng gói giao diện web (../public + ../shared) vào thư mục www/ cho app Android (Capacitor).
// App dùng CHUNG mã giao diện với trang web nên mọi chức năng đều có, và gọi API tới máy chủ của trường
// nên dữ liệu luôn đồng bộ với web.
//
//   node scripts/build-www.mjs                      → dùng serverUrl trong app.config.json
//   SERVER_URL=https://lehoan.edu.vn node scripts/build-www.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const mobile = path.resolve(here, '..');
const root = path.resolve(mobile, '..');
const www = path.join(mobile, 'www');

const cfg = JSON.parse(fs.readFileSync(path.join(mobile, 'app.config.json'), 'utf8'));
const serverUrl = String(process.env.SERVER_URL ?? cfg.serverUrl ?? '').trim().replace(/\/+$/, '');
const version = JSON.parse(fs.readFileSync(path.join(mobile, 'package.json'), 'utf8')).version;

fs.rmSync(www, { recursive: true, force: true });
fs.cpSync(path.join(root, 'public'), www, { recursive: true, filter: (src) => !/(sw\.js|phone\.html|phone\.js)$/.test(src) });
fs.cpSync(path.join(root, 'shared'), path.join(www, 'shared'), { recursive: true, filter: (src) => !src.endsWith('providers.js') });

fs.writeFileSync(path.join(www, 'config.js'), `// Tự sinh bởi scripts/build-www.mjs — cấu hình app điện thoại
window.LH_CONFIG = ${JSON.stringify({ app: true, apiBase: serverUrl, version }, null, 2)};
`);

let pages = 0;
for (const f of fs.readdirSync(www).filter(f => f.endsWith('.html'))) {
  const p = path.join(www, f);
  let html = fs.readFileSync(p, 'utf8');
  if (!html.includes('src="config.js"')) {
    html = html.replace(/<script type="module"/, '<script src="config.js"></script>\n<script type="module"');
    fs.writeFileSync(p, html);
    pages++;
  }
}
console.log(`✓ Đã đóng gói ${pages} trang vào mobile/www`);
console.log(serverUrl ? `✓ Máy chủ mặc định: ${serverUrl}` : '• Chưa đặt máy chủ: người dùng nhập trong app (trang đăng nhập → Máy chủ trường), hoặc dùng bản trải nghiệm.');
