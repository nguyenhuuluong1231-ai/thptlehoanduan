// Chỉnh dự án Android do Capacitor sinh ra: quyền camera / vị trí / ảnh, cho phép http trong mạng LAN,
// biểu tượng app theo logo trường, số phiên bản. Chạy sau `npx cap add android` (an toàn khi chạy lại nhiều lần).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const mobile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = path.join(mobile, 'android', 'app');
if (!fs.existsSync(app)) { console.error('Chưa có thư mục android/. Chạy: npx cap add android'); process.exit(1); }

// 1) AndroidManifest.xml
const manifestPath = path.join(app, 'src', 'main', 'AndroidManifest.xml');
let mf = fs.readFileSync(manifestPath, 'utf8');
const perms = [
  '<uses-permission android:name="android.permission.CAMERA" />',
  '<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />',
  '<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />',
  '<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />',
  '<uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />',
  '<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />',
  '<uses-feature android:name="android.hardware.camera" android:required="false" />',
  '<uses-feature android:name="android.hardware.location.gps" android:required="false" />',
];
const add = perms.filter(p => !mf.includes(p.match(/android:name="([^"]+)"/)[1]));
if (add.length) mf = mf.replace('</manifest>', `    ${add.join('\n    ')}\n</manifest>`);
if (!mf.includes('usesCleartextTraffic')) mf = mf.replace('<application', '<application\n        android:usesCleartextTraffic="true"');
fs.writeFileSync(manifestPath, mf);
console.log(`✓ AndroidManifest: thêm ${add.length} quyền, cho phép kết nối http trong mạng nội bộ`);

// 2) Biểu tượng app (logo trường)
const resSrc = path.join(mobile, 'resources', 'android');
const resDst = path.join(app, 'src', 'main', 'res');
let icons = 0;
for (const dir of fs.existsSync(resSrc) ? fs.readdirSync(resSrc) : []) {
  const from = path.join(resSrc, dir), to = path.join(resDst, dir);
  if (!fs.statSync(from).isDirectory()) continue;
  fs.mkdirSync(to, { recursive: true });
  for (const f of fs.readdirSync(from)) { fs.copyFileSync(path.join(from, f), path.join(to, f)); icons++; }
}
const bg = path.join(resDst, 'values', 'ic_launcher_background.xml');
if (fs.existsSync(bg)) fs.writeFileSync(bg, fs.readFileSync(bg, 'utf8').replace(/#[0-9A-Fa-f]{6,8}/, '#FFFFFF'));
console.log(`✓ Đã chép ${icons} tệp biểu tượng`);

// 3) Số phiên bản theo package.json
const gradle = path.join(app, 'build.gradle');
if (fs.existsSync(gradle)) {
  const v = JSON.parse(fs.readFileSync(path.join(mobile, 'package.json'), 'utf8')).version;
  const code = v.split('.').reduce((a, n) => a * 100 + Number(n || 0), 0) || 1;
  let g = fs.readFileSync(gradle, 'utf8');
  g = g.replace(/versionCode \d+/, `versionCode ${code}`).replace(/versionName "[^"]*"/, `versionName "${v}"`);
  fs.writeFileSync(gradle, g);
  console.log(`✓ Phiên bản ${v} (${code})`);
}
