// ============================================================================
//  TỰ ĐỘNG ĐẨY CODE LÊN HOSTING CPANEL: tuvantamlihocduonglehoan.com (103.18.6.91)
//  Chạy: node scripts/upload-cpanel.mjs [username] [password]
// ============================================================================
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ZIP_FILE = path.join(ROOT, 'lehoan-portal-cpanel.zip');
const HOST = process.env.CPANEL_HOST || '103.18.6.91';
const PORT = process.env.CPANEL_PORT || '2083';
const BASE_URL = `https://${HOST}:${PORT}`;

async function ask(rl, prompt) {
  const ans = await rl.question(prompt);
  return ans.trim();
}

async function main() {
  console.log('\n====================================================================');
  console.log('  ĐẨY CODE TỰ ĐỘNG LÊN: https://tuvantamlihocduonglehoan.com');
  console.log(`  Máy chủ Hosting: ${HOST}:${PORT} (LiteSpeed / cPanel Tenten)`);
  console.log('====================================================================\n');

  if (!fs.existsSync(ZIP_FILE)) {
    console.error('✗ Không tìm thấy tệp nén:', ZIP_FILE);
    process.exit(1);
  }

  let user = process.argv[2] || process.env.CPANEL_USER || '';
  let pass = process.argv[3] || process.env.CPANEL_PASS || '';

  if (!user || !pass) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    if (!user) user = await ask(rl, '• Nhập Tài khoản cPanel / Hosting (Username): ');
    if (!pass) pass = await ask(rl, '• Nhập Mật khẩu cPanel / Hosting (Password): ');
    rl.close();
  }

  if (!user || !pass) {
    console.error('\n✗ Vui lòng nhập đầy đủ Tài khoản và Mật khẩu cPanel.');
    process.exit(1);
  }

  const authHeader = 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64');

  console.log('\n1. Đang kiểm tra đăng nhập cPanel...');
  const checkRes = await fetch(`${BASE_URL}/execute/DomainInfo/list_domains`, {
    headers: { Authorization: authHeader },
  });

  if (checkRes.status === 401 || checkRes.status === 403) {
    console.error('✗ Sai tài khoản hoặc mật khẩu cPanel! Vui lòng kiểm tra lại.');
    process.exit(1);
  }

  console.log('   ✓ Đăng nhập cPanel thành công!');

  console.log('2. Đang tải gói mã nguồn lehoan-portal-cpanel.zip lên thư mục public_html...');
  const fileBuffer = fs.readFileSync(ZIP_FILE);
  const form = new FormData();
  form.append('dir', 'public_html');
  form.append('overwrite', '1');
  form.append('file-1', new Blob([fileBuffer], { type: 'application/zip' }), 'lehoan-portal-cpanel.zip');

  const upRes = await fetch(`${BASE_URL}/execute/Fileman/upload_files`, {
    method: 'POST',
    headers: { Authorization: authHeader },
    body: form,
  });
  const upJson = await upRes.json().catch(() => ({}));
  if (!upRes.ok || upJson.status === 0) {
    console.error('✗ Lỗi tải tệp lên:', JSON.stringify(upJson));
    process.exit(1);
  }
  console.log('   ✓ Đã tải xong lehoan-portal-cpanel.zip lên public_html!');

  console.log('3. Đang giải nén mã nguồn vào public_html...');
  const extUrl = new URL(`${BASE_URL}/json-api/cpanel`);
  extUrl.searchParams.set('cpanel_jsonapi_apiversion', '2');
  extUrl.searchParams.set('cpanel_jsonapi_module', 'Fileman');
  extUrl.searchParams.set('cpanel_jsonapi_func', 'fileop');
  extUrl.searchParams.set('op', 'extract');
  extUrl.searchParams.set('sourcefiles', 'public_html/lehoan-portal-cpanel.zip');
  extUrl.searchParams.set('destfiles', 'public_html');
  extUrl.searchParams.set('doubledecode', '0');

  const extRes = await fetch(extUrl, { headers: { Authorization: authHeader } });
  const extJson = await extRes.json().catch(() => ({}));
  if (!extRes.ok) {
    console.error('✗ Lỗi giải nén:', JSON.stringify(extJson));
    process.exit(1);
  }
  console.log('   ✓ Đã giải nén toàn bộ mã nguồn vào public_html!');

  // Xóa file zip sau khi giải nén để gọn và bảo mật
  const rmUrl = new URL(`${BASE_URL}/json-api/cpanel`);
  rmUrl.searchParams.set('cpanel_jsonapi_apiversion', '2');
  rmUrl.searchParams.set('cpanel_jsonapi_module', 'Fileman');
  rmUrl.searchParams.set('cpanel_jsonapi_func', 'fileop');
  rmUrl.searchParams.set('op', 'unlink');
  rmUrl.searchParams.set('sourcefiles', 'public_html/lehoan-portal-cpanel.zip');
  await fetch(rmUrl, { headers: { Authorization: authHeader } }).catch(() => {});

  console.log('\n====================================================================');
  console.log('  ✓ HOÀN TẤT! Trang web của bạn đã hoạt động tại:');
  console.log('    • Cổng Học sinh   : https://tuvantamlihocduonglehoan.com');
  console.log('    • Cổng Giáo viên  : https://tuvantamlihocduonglehoan.com/quan-tri');
  console.log('    • App Điện thoại  : https://tuvantamlihocduonglehoan.com/mobile');
  console.log('====================================================================\n');
}

main().catch((err) => {
  console.error('\n✗ Có lỗi xảy ra:', err.message);
  process.exit(1);
});

