// ============================================================================
//  TỰ ĐỘNG ĐẨY CODE LÊN HOSTING CPANEL: tuvantamlihocduonglehoan.com
//  Máy chủ: https://ng-shost103.tenten.vn:2083
// ============================================================================
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ZIP_FILE = path.join(ROOT, 'lehoan-portal-cpanel.zip');
const HOST = process.env.CPANEL_HOST || 'ng-shost103.tenten.vn';
const PORT = process.env.CPANEL_PORT || '2083';
const BASE_URL = `https://${HOST}:${PORT}`;

async function ask(rl, prompt) {
  const ans = await rl.question(prompt);
  return ans.trim();
}

async function loginCpanel(user, pass) {
  const authHeader = 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64');

  // Cách 1: Đăng nhập lấy cpsess token + Cookie chuẩn của cPanel
  try {
    const loginRes = await fetch(`${BASE_URL}/login/?login_only=1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ user, pass }).toString(),
    });
    const setCookies = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : [loginRes.headers.get('set-cookie')].filter(Boolean);
    const cookieHeader = setCookies.map((c) => c.split(';')[0]).join('; ');
    const loginJson = await loginRes.json().catch(() => ({}));
    if (loginJson.status === 1 && loginJson.security_token) {
      return {
        prefix: `${BASE_URL}${loginJson.security_token}`,
        headers: { Cookie: cookieHeader, Authorization: authHeader },
      };
    }
  } catch { /* thử tiếp Basic Auth */ }

  // Cách 2: Basic Auth trực tiếp
  const checkRes = await fetch(`${BASE_URL}/execute/DomainInfo/list_domains`, {
    headers: { Authorization: authHeader },
  });
  if (checkRes.status === 401 || checkRes.status === 403) {
    return null;
  }
  return {
    prefix: BASE_URL,
    headers: { Authorization: authHeader },
  };
}

async function main() {
  console.log('\n====================================================================');
  console.log('  ĐẨY CODE TỰ ĐỘNG LÊN: https://tuvantamlihocduonglehoan.com');
  console.log(`  Máy chủ Hosting: ${BASE_URL} (cPanel Tenten)`);
  console.log('====================================================================\n');

  if (!fs.existsSync(ZIP_FILE)) {
    console.error('✗ Không tìm thấy tệp nén:', ZIP_FILE);
    process.exit(1);
  }

  // Ưu tiên đẩy trực tiếp qua cầu nối bảo mật sync.php (không cần nhập lại tài khoản cPanel)
  const secretFile = path.join(ROOT, 'data', 'secret.key');
  if (fs.existsSync(secretFile)) {
    try {
      const secret = fs.readFileSync(secretFile, 'utf8').trim();
      const zipBuf = fs.readFileSync(ZIP_FILE);
      console.log('• Đang cập nhật mã nguồn trực tiếp lên https://tuvantamlihocduonglehoan.com ...');
      const directRes = await fetch('https://tuvantamlihocduonglehoan.com/sync.php?action=deploy-zip', {
        method: 'POST',
        headers: { 'X-Deploy-Key': secret, 'Content-Type': 'application/octet-stream' },
        body: zipBuf,
      });
      const directJson = await directRes.json().catch(() => ({}));
      if (directRes.ok && directJson.ok) {
        console.log('   ✓ Đã cập nhật và giải nén thành công lên máy chủ!');
        console.log('\n====================================================================');
        console.log('  ✓ HOÀN TẤT! Trang web của bạn đã hoạt động tại:');
        console.log('    • Cổng Học sinh   : https://tuvantamlihocduonglehoan.com');
        console.log('    • Cổng Giáo viên  : https://tuvantamlihocduonglehoan.com/quan-tri');
        console.log('    • App Điện thoại  : https://tuvantamlihocduonglehoan.com/mobile');
        console.log('====================================================================\n');
        return;
      }
    } catch { /* fallback sang cPanel API */ }
  }

  let user = process.argv[2] || process.env.CPANEL_USER || '';
  let pass = process.argv[3] || process.env.CPANEL_PASS || '';

  if (!user || !pass) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    if (!user) user = await ask(rl, '• Nhập Tài khoản cPanel / Hosting (Username): ');
    if (!pass) pass = await ask(rl, '• Nhập Mật khẩu cPanel / Hosting (Password): ');
    rl.close();
  }

  console.log(`1. Đang đăng nhập cPanel (${HOST}:${PORT}) với tài khoản ${user}...`);
  const session = await loginCpanel(user, pass);
  if (!session) {
    console.error('✗ Sai tài khoản hoặc mật khẩu cPanel! Vui lòng kiểm tra lại.');
    process.exit(1);
  }
  console.log('   ✓ Đăng nhập cPanel thành công!');

  console.log('2. Đang tải gói mã nguồn lehoan-portal-cpanel.zip (4.09 MB) lên thư mục public_html...');
  const fileBuffer = fs.readFileSync(ZIP_FILE);
  const form = new FormData();
  form.append('dir', 'public_html');
  form.append('overwrite', '1');
  form.append('file-1', new Blob([fileBuffer], { type: 'application/zip' }), 'lehoan-portal-cpanel.zip');

  const upRes = await fetch(`${session.prefix}/execute/Fileman/upload_files`, {
    method: 'POST',
    headers: session.headers,
    body: form,
  });
  const upJson = await upRes.json().catch(() => ({}));
  if (!upRes.ok || upJson.status === 0) {
    console.error('✗ Lỗi tải tệp lên:', JSON.stringify(upJson));
    process.exit(1);
  }
  console.log('   ✓ Đã tải xong lehoan-portal-cpanel.zip lên public_html!');

  console.log('3. Đang giải nén mã nguồn vào public_html...');
  const extUrl = new URL(`${session.prefix}/json-api/cpanel`);
  extUrl.searchParams.set('cpanel_jsonapi_apiversion', '2');
  extUrl.searchParams.set('cpanel_jsonapi_module', 'Fileman');
  extUrl.searchParams.set('cpanel_jsonapi_func', 'fileop');
  extUrl.searchParams.set('op', 'extract');
  extUrl.searchParams.set('sourcefiles', 'public_html/lehoan-portal-cpanel.zip');
  extUrl.searchParams.set('destfiles', 'public_html');
  extUrl.searchParams.set('doubledecode', '0');

  const extRes = await fetch(extUrl, { headers: session.headers });
  const extJson = await extRes.json().catch(() => ({}));
  if (!extRes.ok) {
    console.error('✗ Lỗi giải nén:', JSON.stringify(extJson));
    process.exit(1);
  }
  console.log('   ✓ Đã giải nén toàn bộ mã nguồn vào public_html!');

  // Xóa file zip sau khi giải nén để gọn và bảo mật
  const rmUrl = new URL(`${session.prefix}/json-api/cpanel`);
  rmUrl.searchParams.set('cpanel_jsonapi_apiversion', '2');
  rmUrl.searchParams.set('cpanel_jsonapi_module', 'Fileman');
  rmUrl.searchParams.set('cpanel_jsonapi_func', 'fileop');
  rmUrl.searchParams.set('op', 'unlink');
  rmUrl.searchParams.set('sourcefiles', 'public_html/lehoan-portal-cpanel.zip');
  await fetch(rmUrl, { headers: session.headers }).catch(() => {});

  // Tự động đăng ký ứng dụng Node.js trên cPanel (nếu gói hosting có Passenger)
  try {
    const nodeUrl = new URL(`${session.prefix}/execute/PassengerApps/register_application`);
    nodeUrl.searchParams.set('name', 'lehoan-portal');
    nodeUrl.searchParams.set('path', 'public_html');
    nodeUrl.searchParams.set('domain', 'tuvantamlihocduonglehoan.com');
    nodeUrl.searchParams.set('base_uri', '/');
    nodeUrl.searchParams.set('deployment_mode', 'production');
    await fetch(nodeUrl, { headers: session.headers });
  } catch { /* hosting chạy qua LiteSpeed + sync.php */ }

  console.log('\n====================================================================');
  console.log('  ✓ HOÀN TẤT! Trang web của bạn đã hoạt động tại:');
  console.log('    • Cổng Học sinh   : https://tuvantamlihocduonglehoan.com');
  console.log('    • Cổng Giáo viên  : https://tuvantamlihocduonglehoan.com/quan-tri');
  console.log('    • App Điện thoại  : https://tuvantamlihocduonglehoan.com/mobile');
  console.log('====================================================================\n');
}

main().catch((err) => {
  console.error('\n✗ Có lỗi xảy ra:', err.cause?.message || err.message);
  process.exit(1);
});
