// Chỉnh dự án Android do Capacitor sinh ra: tên ứng dụng "Tư vấn tâm lý học đường",
// quyền camera / vị trí / ảnh, cho phép http/https, biểu tượng app theo logo trường,
// chữ ký số cố định (tránh lỗi INSTALL_FAILED_UPDATE_INCOMPATIBLE khi cài đè bản mới).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const mobile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = path.join(mobile, 'android', 'app');
if (!fs.existsSync(app)) { console.error('Chưa có thư mục android/. Chạy: npx cap add android'); process.exit(1); }

const capCfg = JSON.parse(fs.readFileSync(path.join(mobile, 'capacitor.config.json'), 'utf8'));
const appName = capCfg.appName || 'Tư vấn tâm lý học đường';

// 1) AndroidManifest.xml
const manifestPath = path.join(app, 'src', 'main', 'AndroidManifest.xml');
let mf = fs.readFileSync(manifestPath, 'utf8');
const perms = [
  '<uses-permission android:name="android.permission.INTERNET" />',
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
if (!mf.includes('android:screenOrientation=')) {
  mf = mf.replace('<activity', '<activity\n            android:screenOrientation="portrait"');
}
fs.writeFileSync(manifestPath, mf);
console.log(`✓ AndroidManifest: thêm ${add.length} quyền, cho phép kết nối mạng`);

// 1b) strings.xml — đặt tên hiển thị "Tư vấn tâm lý học đường"
const stringsPath = path.join(app, 'src', 'main', 'res', 'values', 'strings.xml');
if (fs.existsSync(stringsPath)) {
  let st = fs.readFileSync(stringsPath, 'utf8');
  st = st.replace(/<string name="app_name">[^<]*<\/string>/, `<string name="app_name">${appName}</string>`);
  st = st.replace(/<string name="title_activity_main">[^<]*<\/string>/, `<string name="title_activity_main">${appName}</string>`);
  fs.writeFileSync(stringsPath, st);
  console.log(`✓ Tên ứng dụng Android: ${appName}`);
}

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
for (const d of ['drawable', 'drawable-v24']) {
  const fgXml = path.join(resDst, d, 'ic_launcher_foreground.xml');
  if (fs.existsSync(fgXml)) fs.rmSync(fgXml, { force: true });
}
const anydpi = path.join(resDst, 'mipmap-anydpi-v26');
fs.mkdirSync(anydpi, { recursive: true });
const adaptiveXml = `<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n    <background android:drawable="@color/ic_launcher_background"/>\n    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>\n</adaptive-icon>\n`;
fs.writeFileSync(path.join(anydpi, 'ic_launcher.xml'), adaptiveXml);
fs.writeFileSync(path.join(anydpi, 'ic_launcher_round.xml'), adaptiveXml);
const bg = path.join(resDst, 'values', 'ic_launcher_background.xml');
if (fs.existsSync(bg)) fs.writeFileSync(bg, fs.readFileSync(bg, 'utf8').replace(/#[0-9A-Fa-f]{6,8}/, '#FFFFFF'));
console.log(`✓ Đã chép ${icons} tệp biểu tượng logo Trường THPT Lê Hoàn`);

// 3) Số phiên bản & Chữ ký cố định (lehoan-release.keystore)
const ksSrc = path.join(mobile, 'lehoan-release.keystore');
const ksDst = path.join(app, 'lehoan-release.keystore');
if (fs.existsSync(ksSrc)) {
  fs.copyFileSync(ksSrc, ksDst);
}
const gradle = path.join(app, 'build.gradle');
if (fs.existsSync(gradle)) {
  const v = JSON.parse(fs.readFileSync(path.join(mobile, 'package.json'), 'utf8')).version;
  const code = v.split('.').reduce((a, n) => a * 100 + Number(n || 0), 0) || 1;
  let g = fs.readFileSync(gradle, 'utf8');
  g = g.replace(/versionCode \d+/, `versionCode ${code}`).replace(/versionName "[^"]*"/, `versionName "${v}"`);
  if (fs.existsSync(ksDst) && !g.includes('lehoan-release.keystore')) {
    g = g.replace(
      /buildTypes\s*\{/,
      `signingConfigs {\n        debug {\n            storeFile file('lehoan-release.keystore')\n            storePassword 'lehoan2026'\n            keyAlias 'lehoan'\n            keyPassword 'lehoan2026'\n            v1SigningEnabled true\n            v2SigningEnabled true\n        }\n    }\n    buildTypes {`
    );
  }
  fs.writeFileSync(gradle, g);
  console.log(`✓ Phiên bản ${v} (${code}) kèm chữ ký số cố định`);
}
