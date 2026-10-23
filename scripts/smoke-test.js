// Kiểm thử nhanh toàn bộ luồng API chính: node scripts/smoke-test.js
import { spawn } from 'node:child_process';
import { webcrypto } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const subtle = webcrypto.subtle;

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 3900 + Math.floor(Math.random() * 90);
const DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'lehoan-test-'));
const BASE = `http://127.0.0.1:${PORT}`;
const srv = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT), DATA_DIR: DATA, LOG: 'off', HOST: '127.0.0.1', ALLOW_TEST_CAPTCHA: '1' }, stdio: ['ignore', 'pipe', 'inherit'] });

let pass = 0, failCount = 0;
const ok = (name, cond, extra = '') => { if (cond) { pass++; console.log('  ✓', name); } else { failCount++; console.log('  ✗', name, extra); } };
async function call(method, p, body, token) {
  const r = await fetch(BASE + p, { method, headers: { 'content-type': 'application/json', ...(token ? { authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const ct = r.headers.get('content-type') || '';
  return { status: r.status, body: ct.includes('json') ? await r.json() : new Uint8Array(await r.arrayBuffer()), headers: r.headers };
}
// Máy chủ kiểm thử chạy với ALLOW_TEST_CAPTCHA=1 nên /api/auth/captcha trả thêm mã thật (chỉ dành cho
// kiểm thử tự động trên máy chủ riêng) — nhờ vậy script có thể tự "điền" CAPTCHA như người dùng thật.
async function captcha() { return (await call('GET', '/api/auth/captcha')).body; }
async function login(body) { const cap = await captcha(); return call('POST', '/api/auth/login', { ...body, captchaId: cap.id, captchaCode: cap.code }); }
async function unlockRequest(body) { const cap = await captcha(); return call('POST', '/api/auth/unlock-request', { ...body, captchaId: cap.id, captchaCode: cap.code }); }

// Mã hóa dữ liệu API ở tầng ứng dụng (ECDH P-256 + AES-256-GCM, xem shared/channel.js) — mô phỏng lại
// chính xác những gì public/js/core/api.js làm trong trình duyệt thật, để kiểm chứng máy chủ giải mã/
// mã hóa đúng và KHÔNG BAO GIỜ trả dữ liệu thật dưới dạng JSON đọc được khi có kênh.
const b64 = (buf) => Buffer.from(buf).toString('base64');
const unb64 = (s) => Uint8Array.from(Buffer.from(s, 'base64'));
async function openChannel() {
  const kp = await subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const rawPub = await subtle.exportKey('raw', kp.publicKey);
  const r = await call('POST', '/api/handshake', { pub: b64(rawPub) });
  const serverPubKey = await subtle.importKey('raw', unb64(r.body.pub), { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const bits = await subtle.deriveBits({ name: 'ECDH', public: serverPubKey }, kp.privateKey, 256);
  const hash = await subtle.digest('SHA-256', bits);
  const key = await subtle.importKey('raw', hash, 'AES-GCM', false, ['encrypt', 'decrypt']);
  return { cid: r.body.cid, key };
}
async function encBody(key, value) {
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(JSON.stringify(value === undefined ? null : value));
  const enc = new Uint8Array(await subtle.encrypt({ name: 'AES-GCM', iv }, key, data));
  return { iv: b64(iv), data: b64(enc.slice(0, enc.length - 16)), tag: b64(enc.slice(enc.length - 16)) };
}
async function decBody(key, env) {
  const combined = new Uint8Array([...unb64(env.data), ...unb64(env.tag)]);
  const dec = await subtle.decrypt({ name: 'AES-GCM', iv: unb64(env.iv) }, key, combined);
  const text = new TextDecoder().decode(dec);
  return text && text !== 'null' ? JSON.parse(text) : undefined;
}
async function encCall(ch, method, p, body, token) {
  const hasBody = !['GET', 'HEAD'].includes(method);
  const r = await fetch(BASE + p, { method, headers: { 'content-type': 'application/json', 'x-channel-id': ch.cid, ...(token ? { authorization: 'Bearer ' + token } : {}) }, body: hasBody ? JSON.stringify(await encBody(ch.key, body ?? {})) : undefined });
  const envelope = await r.json();
  return { status: r.status, envelope, body: envelope?.iv ? await decBody(ch.key, envelope).catch(() => envelope) : envelope };
}

try {
  for (let i = 0; i < 60; i++) { try { if ((await fetch(BASE + '/api/health')).ok) break; } catch { } await new Promise(r => setTimeout(r, 150)); }
  console.log('\nCông khai');
  ok('GET /api/health', (await call('GET', '/api/health')).body.ok);
  const docs = await call('GET', '/api'); ok(`GET /api liệt kê ${docs.body.endpoints?.length} endpoint`, docs.body.endpoints?.length > 100);
  ok('GET /api/news', (await call('GET', '/api/news')).body.items.length > 5);
  ok('Trang / trả về HTML', (await fetch(BASE + '/')).headers.get('content-type').includes('html'));

  console.log('\nXác thực');
  ok('Sai mật khẩu → 401', (await login({ username: '2126220004', password: 'sai' })).status === 401);
  const st = (await login({ username: '2126220004', password: '123456' })).body; ok('Học sinh đăng nhập', !!st.token);
  const gv = (await login({ username: 'GV2024089', password: '123456', portal: 'staff' })).body; ok('Giáo viên đăng nhập', !!gv.token);
  const ad = (await login({ username: 'admin', password: 'admin123' })).body; ok('Quản trị đăng nhập', !!ad.token);
  ok('Học sinh vào cổng GV → 403', (await login({ username: '2126220004', password: '123456', portal: 'staff' })).status === 403);
  ok('Giáo viên vào cổng HS → 403', (await login({ username: 'GV2024089', password: '123456', portal: 'student' })).status === 403);
  ok('Không token → 401', (await call('GET', '/api/mood')).status === 401);
  ok('Học sinh gọi API quản trị → 403', (await call('GET', '/api/admin/dashboard', null, st.token)).status === 403);
  const face = (await call('POST', '/api/auth/face/enroll', { device: 'Test' }, st.token)).body;
  ok('Face ID đăng nhập', !!(await call('POST', '/api/auth/face/login', { userId: face.userId, faceKey: face.faceKey })).body.token);
  ok('Sai CAPTCHA → 400', (await call('POST', '/api/auth/login', { username: '2126220004', password: '123456', captchaId: 'x', captchaCode: '00000' })).status === 400);
  const reuseCap = await captcha();
  await call('POST', '/api/auth/login', { username: '2126220004', password: 'sai', captchaId: reuseCap.id, captchaCode: reuseCap.code });
  ok('CAPTCHA dùng 1 lần: dùng lại mã cũ → 400', (await call('POST', '/api/auth/login', { username: '2126220004', password: '123456', captchaId: reuseCap.id, captchaCode: reuseCap.code })).status === 400);

  console.log('\nKhóa tài khoản sau 3 lần sai & duyệt mở khóa');
  const LOCK_USER = '2126220033';
  for (let i = 0; i < 2; i++) ok(`Sai mật khẩu lần ${i + 1} → còn cảnh báo`, (await login({ username: LOCK_USER, password: 'sai' })).status === 401);
  const lockRes = await login({ username: LOCK_USER, password: 'sai' });
  ok('Sai mật khẩu lần 3 → tự khóa (403 + locked:auto)', lockRes.status === 403 && lockRes.body.details?.locked === 'auto');
  ok('Tài khoản đã khóa: đăng nhập đúng mật khẩu cũng bị chặn', (await login({ username: LOCK_USER, password: '123456' })).status === 403);
  const urList1 = (await call('GET', '/api/admin/unlock-requests', null, ad.token)).body.items;
  ok('Yêu cầu mở khóa tự động xuất hiện cho quản trị', urList1.some(x => x.userId === LOCK_USER && x.status === 'pending'));
  const urItem = urList1.find(x => x.userId === LOCK_USER && x.status === 'pending');
  ok('Quản trị duyệt mở khóa', (await call('POST', `/api/admin/unlock-requests/${urItem.id}/approve`, {}, ad.token)).body.user?.locked === false);
  const afterUnlock = await login({ username: LOCK_USER, password: '123456' });
  ok('Đăng nhập lại được sau khi duyệt mở khóa', !!afterUnlock.body.token);

  console.log('\nToken xác thực tự đổi để chống dùng lại token cũ bị lộ');
  const rotMe = await call('GET', '/api/auth/me', null, st.token);
  ok('Token hợp lệ dùng được API cần xác thực', rotMe.body.user?.id === '2126220004');
  const tmpSess = (await login({ username: '2126220018', password: '123456' })).body;
  await call('POST', '/api/auth/logout', {}, tmpSess.token);
  ok('Đăng xuất làm mất hiệu lực token ngay (không chỉ hết hạn tự nhiên)', (await call('GET', '/api/auth/me', null, tmpSess.token)).status === 401);

  console.log('\nMã hóa dữ liệu API ở tầng ứng dụng (ECDH P-256 + AES-256-GCM)');
  const ch = await openChannel();
  const rawResp = await fetch(BASE + '/api/settings/public', { headers: { 'x-channel-id': ch.cid } });
  const rawJson = await rawResp.json();
  ok('Có kênh mã hóa: dữ liệu trên dây chỉ gồm iv/tag/data (không lộ trường thật)', Object.keys(rawJson).sort().join(',') === 'data,iv,tag' && !('schoolName' in rawJson));
  const decSettings = await decBody(ch.key, rawJson);
  ok('Giải mã đúng bằng khóa của kênh', typeof decSettings.schoolName === 'string' && decSettings.schoolName.length > 0);
  const encLoginCap = await captcha();
  const encLogin = await encCall(ch, 'POST', '/api/auth/login', { username: '2126220004', password: '123456', captchaId: encLoginCap.id, captchaCode: encLoginCap.code });
  ok('Đăng nhập qua kênh mã hóa (request + response đều mã hóa) vẫn hoạt động đúng', encLogin.status === 200 && !!encLogin.body.token);
  const encMe = await encCall(ch, 'GET', '/api/auth/me', undefined, encLogin.body.token);
  ok('Gọi API cần xác thực qua kênh mã hóa trả đúng dữ liệu đã giải mã', encMe.body.user?.id === '2126220004');
  const badChResp = await fetch(BASE + '/api/settings/public', { headers: { 'x-channel-id': 'khong-ton-tai-0000000000000000' } });
  ok('Kênh không hợp lệ/hết hạn → 409 kèm tín hiệu X-Channel-Expired riêng (không lẫn với lỗi nghiệp vụ 409 khác)', badChResp.status === 409 && badChResp.headers.get('x-channel-expired') === '1');

  console.log('\nTrang chủ học sinh');
  const dash = (await call('GET', '/api/me/dashboard', null, st.token)).body; ok(`Trang chủ: ${dash.reports?.total} tố giác · ${dash.surveys?.open} khảo sát mở`, dash.user?.id === '2126220004' && dash.news.length && dash.quiz.top.length);
  ok('Đã gỡ API lịch học / điểm số / điểm danh / học phí', (await call('GET', '/api/grades', null, st.token)).status === 404 && (await call('GET', '/api/invoices', null, st.token)).status === 404 && (await call('POST', '/api/attendance/check-in', {}, st.token)).status === 404);

  console.log('\nAn toàn học đường');
  const rep = (await call('POST', '/api/reports', { type: 'bullying', location: 'Nhà xe', description: 'Bị nhóm bạn chặn đòi tiền sau giờ học', anonymous: true, photos: ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='] }, st.token)).body;
  ok('Gửi tố giác ẩn danh', rep.item?.id && rep.item.photos[0].startsWith('uploads/'));
  const adminRep = (await call('GET', `/api/admin/reports/${rep.item.id}`, null, gv.token)).body.item;
  ok('Quản trị không thấy danh tính người gửi ẩn danh', adminRep.reporterId === null && !('reporterKey' in adminRep));
  ok('Học sinh vẫn thấy tố giác ẩn danh của mình', (await call('GET', '/api/reports', null, st.token)).body.items.some(x => x.id === rep.item.id));
  ok('Cập nhật trạng thái tố giác', (await call('PATCH', `/api/admin/reports/${rep.item.id}`, { status: 'verifying', note: 'Đang xác minh' }, gv.token)).body.item.status === 'verifying');
  ok('Lập biên bản', (await call('POST', '/api/admin/records', { studentId: '2126220028', type: 'fight', location: 'Sân sau', description: 'Xô xát với bạn cùng lớp', penalty: 'Viết bản tự kiểm điểm', points: 5 }, gv.token)).body.item?.id);
  ok('Ghi cảm xúc', (await call('POST', '/api/mood', { mood: 'stressed' }, st.token)).body.advice);
  const cth = (await call('GET', '/api/counseling/threads', null, st.token)).body.items;
  ok('Học sinh có sẵn hộp thư với từng chuyên viên (2 người mặc định)', cth.length === 2 && cth.every(x => x.counselor));
  const cth1 = cth.find(x => x.counselor.id === 'GV2024012');
  ok('Gửi tâm sự', (await call('POST', `/api/counseling/threads/${cth1.id}/messages`, { text: 'Em đang áp lực thi cử' }, st.token)).body.item);

  console.log('\nTrắc nghiệm & khảo sát');
  const qs = (await call('GET', '/api/quiz/questions?count=5', null, st.token)).body.items; ok('Lấy câu hỏi không lộ đáp án', qs.length === 5 && qs[0].answer === undefined);
  const sub = (await call('POST', '/api/quiz/submit', { answers: qs.map(q => ({ id: q.id, choice: 0 })), duration: 60 }, st.token)).body; ok(`Nộp bài: ${sub.attempt?.score} điểm`, sub.results?.length === 5);
  const sv = (await call('GET', '/api/surveys/KS-2026-03', null, st.token)).body.item;
  const answers = Object.fromEntries(sv.questions.map(q => [q.id, q.type === 'multi' ? [q.options[0]] : q.type === 'text' ? '' : q.options[0]]));
  ok('Gửi phiếu khảo sát', (await call('POST', '/api/surveys/KS-2026-03/responses', { answers }, st.token)).body.ok);
  ok('Gửi lặp → 409', (await call('POST', '/api/surveys/KS-2026-03/responses', { answers }, st.token)).status === 409);
  ok('Kết quả khảo sát', (await call('GET', '/api/admin/surveys/KS-2026-01/results', null, gv.token)).body.total > 100);

  console.log('\nChat & AI');
  const msg = (await call('POST', '/api/school-chat', { text: 'đm bài khó quá' }, st.token)).body; ok('Lọc ngôn từ phản cảm', msg.filtered && msg.item.text.startsWith('**'));
  const th = (await call('POST', '/api/teacher-chat/threads', { teacherId: 'GV2024089' }, st.token)).body.item; ok('Mở chat giáo viên', !!th.id);
  ok('Gửi đơn xin nghỉ', (await call('POST', `/api/teacher-chat/threads/${th.id}/messages`, { kind: 'leave', leave: { date: '2026-10-20', session: 'Sáng', reason: 'Đi khám răng' } }, st.token)).body.message.kind === 'leave');
  const scam = (await call('POST', '/api/ai/scam-check', { kind: 'message', input: 'Chúc mừng bạn trúng thưởng xe SH! Chuyển khoản phí 2 triệu và gửi mã OTP để nhận quà gấp trong 24h' }, st.token)).body;
  ok(`Quét tin nhắn lừa đảo: ${scam.label} (${scam.score})`, scam.level === 'danger');
  ok('Quét URL giả mạo', (await call('POST', '/api/ai/scam-check', { kind: 'url', input: 'http://vietcombank-xacthuc.top/login' }, st.token)).body.level === 'danger');
  ok('URL chính thức an toàn', (await call('POST', '/api/ai/scam-check', { kind: 'url', input: 'https://vietcombank.com.vn' }, st.token)).body.level === 'safe');
  ok('Tra số điện thoại trong danh sách đen', (await call('POST', '/api/ai/scam-check', { kind: 'phone', input: '+1 202 555 0147' }, st.token)).body.reports > 0);
  const ai = (await call('POST', '/api/ai/chat', { message: 'Cho mình công thức đạo hàm với' }, st.token)).body; ok(`Trợ lý AI (${ai.intent})`, ai.intent === 'study');
  const crisis = (await call('POST', '/api/ai/chat', { message: 'mình thấy tuyệt vọng, không thiết sống nữa' }, st.token)).body; ok('AI Guard phát hiện khủng hoảng', crisis.guard?.level === 'red' && crisis.reply.includes('111'));
  ok('Cảnh báo đỏ cho nhà trường', (await call('GET', '/api/admin/alerts?status=open', null, gv.token)).body.items.some(a => a.level === 'red'));

  console.log('\nTin nhắn, tệp đính kèm & chấm đỏ');
  ok('Trạng thái AI', typeof (await call('GET', '/api/ai/status', null, st.token)).body.enabled === 'boolean');
  const up = (await call('POST', '/api/uploads', { name: 'ghi-chu.txt', type: 'text/plain', data: 'data:text/plain;base64,' + Buffer.from('Xin chào').toString('base64') }, st.token)).body;
  ok('Tải tệp đính kèm', up.file?.url?.startsWith('uploads/') && up.file.kind === 'file');
  ok('Chặn tệp không hỗ trợ (.exe)', (await call('POST', '/api/uploads', { name: 'a.exe', type: 'application/x-msdownload', data: 'data:application/x-msdownload;base64,AAAA' }, st.token)).status === 415);
  ok('Gửi tin chỉ có tệp (chat giáo viên)', (await call('POST', `/api/teacher-chat/threads/${th.id}/messages`, { attachments: [up.file] }, st.token)).body.message?.attachments?.length === 1);
  ok('Chặn đường dẫn tệp giả mạo', (await call('POST', '/api/school-chat', { attachments: [{ url: '../../server.js', name: 'x' }] }, st.token)).status === 400);
  const gvBadge = (await call('GET', '/api/me/badges', null, gv.token)).body; ok(`Chấm đỏ giáo viên (${gvBadge.teacherChat} tin)`, gvBadge.teacherChat >= 1);
  await call('POST', '/api/school-chat', { text: 'Tin mới cho chấm đỏ' }, gv.token);
  ok('Chấm đỏ chat toàn trường', (await call('GET', '/api/me/badges', null, st.token)).body.schoolChat >= 1);
  await call('POST', '/api/me/seen', { key: 'schoolChat' }, st.token);
  ok('Đánh dấu đã xem tắt chấm đỏ', (await call('GET', '/api/me/badges', null, st.token)).body.schoolChat === 0);

  console.log('\nThu hồi tin nhắn');
  const st2 = (await login({ username: '2126220018', password: '123456' })).body;
  const rm = (await call('POST', '/api/school-chat', { text: 'Tin nhắn sẽ thu hồi 123' }, st.token)).body.item;
  ok('Không thu hồi tin của người khác', (await call('POST', `/api/school-chat/${rm.id}/recall`, null, st2.token)).status === 403);
  ok('Thu hồi tin nhắn của mình', (await call('POST', `/api/school-chat/${rm.id}/recall`, null, st.token)).body.item?.recalled === true);
  const seen2 = (await call('GET', '/api/school-chat', null, st2.token)).body.items.find(x => x.id === rm.id);
  ok('Học sinh khác chỉ thấy “đã thu hồi”', seen2?.recalled && seen2.text === '');
  ok('Giáo viên cũng không thấy nội dung đã thu hồi', (await call('GET', '/api/admin/school-chat', null, gv.token)).body.items.find(x => x.id === rm.id)?.text === '');
  ok('Quản trị vẫn thấy nội dung gốc', (await call('GET', '/api/admin/school-chat', null, ad.token)).body.items.find(x => x.id === rm.id)?.text === 'Tin nhắn sẽ thu hồi 123');
  const tm = (await call('POST', `/api/teacher-chat/threads/${th.id}/messages`, { text: 'Em nhắn nhầm ạ' }, st.token)).body.message;
  await call('POST', `/api/teacher-chat/threads/${th.id}/messages/${tm.id}/recall`, null, st.token);
  ok('Giáo viên nhận chỉ thấy “đã thu hồi” (chat 1-1)', (await call('GET', `/api/teacher-chat/threads/${th.id}`, null, gv.token)).body.item.messages.find(x => x.id === tm.id)?.text === '');
  ok('Quản trị vẫn thấy tin 1-1 đã thu hồi', (await call('GET', `/api/teacher-chat/threads/${th.id}`, null, ad.token)).body.item.messages.find(x => x.id === tm.id)?.text === 'Em nhắn nhầm ạ');

  console.log('\nXóa cuộc trò chuyện (học sinh)');
  ok('Giáo viên không xóa được cuộc trò chuyện (không phải của mình)', (await call('DELETE', `/api/teacher-chat/threads/${th.id}`, null, gv.token)).status === 403);
  ok('Học sinh xóa cuộc trò chuyện khỏi danh sách của mình', (await call('DELETE', `/api/teacher-chat/threads/${th.id}`, null, st.token)).body.ok === true);
  ok('Cuộc trò chuyện đã xóa không còn trong danh sách học sinh', !(await call('GET', '/api/teacher-chat/threads', null, st.token)).body.items.some(x => x.id === th.id));
  ok('Giáo viên vẫn thấy cuộc trò chuyện (không bị ảnh hưởng)', (await call('GET', '/api/teacher-chat/threads', null, gv.token)).body.items.some(x => x.id === th.id));
  ok('Quản trị vẫn thấy cuộc trò chuyện (không bị ảnh hưởng)', (await call('GET', '/api/teacher-chat/threads', null, ad.token)).body.items.some(x => x.id === th.id));
  await call('POST', '/api/teacher-chat/threads', { teacherId: 'GV2024089' }, st.token);
  ok('Học sinh nhắn lại giáo viên → cuộc trò chuyện tự hiện lại', (await call('GET', '/api/teacher-chat/threads', null, st.token)).body.items.some(x => x.id === th.id));
  await call('DELETE', `/api/teacher-chat/threads/${th.id}`, null, st.token);
  await call('POST', `/api/teacher-chat/threads/${th.id}/messages`, { text: 'Thầy trả lời em nhé' }, gv.token);
  ok('Giáo viên trả lời → cuộc trò chuyện đã xóa tự hiện lại cho học sinh', (await call('GET', '/api/teacher-chat/threads', null, st.token)).body.items.some(x => x.id === th.id));

  const cs = (await call('GET', `/api/counseling/threads/${cth1.id}`, null, st.token)).body.item; const cm = cs.messages.filter(x => x.from === 'student').at(-1);
  ok('Thu hồi tin gửi chuyên viên', (await call('POST', `/api/counseling/threads/${cs.id}/messages/${cm.id}/recall`, null, st.token)).body.item.messages.find(x => x.id === cm.id)?.text === '');
  ok('Quản trị vẫn đọc được tin tư vấn đã thu hồi', (await call('GET', `/api/admin/counseling/${cs.id}`, null, ad.token)).body.item.messages.find(x => x.id === cm.id)?.text === cm.text);

  console.log('\nTổ tâm lý');
  const team = (await call('GET', '/api/counsel-team', null, st.token)).body.items;
  ok(`Học sinh xem danh sách Tổ tâm lý (${team?.length} người)`, team?.length >= 3 && team[0].userId === 'GV2024012' && !('active' in team[0]));
  const nm = (await call('POST', '/api/admin/counsel-team', { name: 'Cô Thử Nghiệm', role: 'Cộng tác viên', days: [1, 3], hours: '08:00-10:00', topics: 'Gia đình, Bạn bè' }, gv.token)).body.item;
  ok('Thêm thành viên Tổ tâm lý', nm?.topics?.length === 2 && nm.days.join() === '1,3');
  ok('Giờ trực sai định dạng → 400', (await call('PUT', `/api/admin/counsel-team/${nm.id}`, { hours: '8h-10h' }, gv.token)).status === 400);
  await call('PUT', `/api/admin/counsel-team/${nm.id}`, { active: false }, gv.token);
  ok('Ẩn thành viên khỏi danh sách học sinh', !(await call('GET', '/api/counsel-team', null, st.token)).body.items.some(x => x.id === nm.id));
  ok('Học sinh không sửa được Tổ tâm lý', (await call('POST', '/api/admin/counsel-team', { name: 'X' }, st.token)).status === 403);
  ok('Xóa thành viên', (await call('DELETE', `/api/admin/counsel-team/${nm.id}`, null, gv.token)).body.ok);

  console.log('\nCấu hình AI');
  ok('Giáo viên không được đổi cấu hình AI', (await call('PUT', '/api/admin/ai/config', { provider: 'off' }, gv.token)).status === 403);
  ok('Bắt buộc khóa API khi chọn Gemini', (await call('PUT', '/api/admin/ai/config', { provider: 'gemini' }, ad.token)).status === 400);
  const acfg = (await call('PUT', '/api/admin/ai/config', { provider: 'gemini', apiKey: 'AIza-test-key-9876', features: { chat: true, scam: false } }, ad.token)).body;
  ok('Lưu cấu hình AI, che khóa API', acfg.keyHint === '••••9876' && !JSON.stringify(acfg).includes('test-key'));
  ok('Tắt AI', (await call('PUT', '/api/admin/ai/config', { provider: 'off' }, ad.token)).body.status.enabled === false);

  console.log('\nQuản trị');
  const d2 = (await call('GET', '/api/admin/dashboard', null, gv.token)).body; ok('Bảng điều khiển', d2.stats.students > 5);
  const nu = await call('POST', '/api/admin/users', { id: 'HS-TEST-01', name: 'Học Sinh Thử', role: 'student', classId: '10A4' }, gv.token); ok('Thêm tài khoản', nu.body.item?.id === 'HS-TEST-01');
  ok('Đặt lại mật khẩu', (await call('POST', '/api/admin/users/HS-TEST-01/reset-password', null, gv.token)).body.password === '123456');
  ok('Giáo viên không được xóa tài khoản', (await call('DELETE', '/api/admin/users/HS-TEST-01', null, gv.token)).status === 403);
  ok('Quản trị xóa tài khoản', (await call('DELETE', '/api/admin/users/HS-TEST-01', null, ad.token)).body.ok);
  ok('Lưu cấu hình (admin)', (await call('PUT', '/api/admin/settings', { slogan: 'Khẩu hiệu thử', modules: { quiz: true } }, ad.token)).body.settings.slogan === 'Khẩu hiệu thử');
  ok('Phát thông báo theo lớp', (await call('POST', '/api/admin/notifications', { target: 'class:12A1', title: 'Họp lớp', content: 'Họp lớp 15h' }, gv.token)).body.item);
  ok('Học sinh 12A1 nhận thông báo lớp', (await call('GET', '/api/notifications', null, st.token)).body.items.some(n => n.title === 'Họp lớp'));
  const xl = await call('GET', '/api/admin/export/users', null, gv.token); ok(`Xuất Excel (${xl.body.length} byte)`, xl.body[0] === 0x50 && xl.body[1] === 0x4b);
  fs.writeFileSync(path.join(DATA, 'users.xlsx'), xl.body);
  const xs = await call('GET', '/api/admin/export/survey/KS-2026-01', null, gv.token); ok('Xuất Excel khảo sát', xs.body[0] === 0x50);
  fs.writeFileSync(path.join(DATA, 'survey.xlsx'), xs.body);
  ok('Đồng bộ dữ liệu', (await call('POST', '/api/admin/sync', null, gv.token)).body.ok);
  const byGrade12 = (await call('GET', '/api/admin/users?role=student&grade=12', null, gv.token)).body.items;
  ok('Lọc theo khối 12 chỉ trả về lớp 12A1/12A2', byGrade12.length > 0 && byGrade12.every(u => u.className === '12A1' || u.className === '12A2'));
  const byGrade10 = (await call('GET', '/api/admin/users?role=student&grade=10', null, gv.token)).body.items;
  ok('Lọc theo khối 10 chỉ trả về lớp 10A4', byGrade10.length > 0 && byGrade10.every(u => u.className === '10A4'));
  const classOverridesGrade = (await call('GET', '/api/admin/users?role=student&classId=11A2&grade=12', null, gv.token)).body.items;
  ok('classId ưu tiên hơn grade khi truyền cả hai', classOverridesGrade.length > 0 && classOverridesGrade.every(u => u.className === '11A2'));

  console.log('\nTạo hàng loạt tài khoản & hoàn tất hồ sơ lần đầu');
  const bulk = await call('POST', '/api/admin/users/bulk-generate', { grade: 10, count: 2, year: 2099, startSeq: 1, password: 'TamThoi123' }, ad.token);
  ok('Tạo hàng loạt 2 tài khoản khối 10', bulk.body.created?.length === 2);
  const genId = bulk.body.created[0]?.id;
  ok('Mã sinh ra đúng mẫu Khối+SốThứTự+Năm (100012099)', genId === '100012099');
  const bulkAgain = await call('POST', '/api/admin/users/bulk-generate', { grade: 10, count: 2, year: 2099, startSeq: 1, password: 'TamThoi123' }, ad.token);
  ok('Tạo lại cùng dải số → bỏ qua mã trùng, không tạo đè', bulkAgain.body.skipped?.length === 2 && bulkAgain.body.created?.length === 0);
  ok('Học sinh không được tạo hàng loạt tài khoản', (await call('POST', '/api/admin/users/bulk-generate', { grade: 11, count: 1, year: 2099 }, st.token)).status === 403);
  const bulkByTeacher = await call('POST', '/api/admin/users/bulk-generate', { grade: 11, count: 1, year: 2099, startSeq: 90 }, gv.token);
  ok('Giáo viên (staff) cũng được tạo hàng loạt, như thêm tài khoản đơn lẻ', bulkByTeacher.body.created?.length === 1);
  for (const c of bulkByTeacher.body.created || []) await call('DELETE', `/api/admin/users/${c.id}`, null, ad.token);

  const genLoginFirst = await login({ username: genId, password: 'TamThoi123' });
  ok('Tài khoản mới sinh: đăng nhập được ngay với mật khẩu ban đầu', genLoginFirst.status === 200);
  ok('Tài khoản mới sinh: mustChangePassword=true', genLoginFirst.body.user?.mustChangePassword === true);
  ok('Tài khoản mới sinh: profileComplete=false (chưa có tên/lớp thật)', genLoginFirst.body.user?.profileComplete === false);
  const classesForNew = await call('GET', '/api/classes', null, genLoginFirst.body.token);
  ok('Lớp tạm "chưa xếp lớp" KHÔNG hiện trong danh sách cho học sinh chọn', !classesForNew.body.items.some(c => c.id.includes('CHUAXEP')));

  const cpRes = await call('POST', '/api/auth/change-password', { currentPassword: 'TamThoi123', newPassword: 'MatKhauMoi@2026' }, genLoginFirst.body.token);
  ok('Đổi mật khẩu lần đầu (bắt buộc bước 1) thành công', cpRes.status === 200 && !!cpRes.body.token);
  const meAfterPw = (await call('GET', '/api/auth/me', null, cpRes.body.token)).body.user;
  ok('Sau khi đổi mật khẩu: mustChangePassword=false nhưng profileComplete vẫn false', meAfterPw.mustChangePassword === false && meAfterPw.profileComplete === false);

  ok('Chưa hoàn tất hồ sơ: không chọn lớp tạm "chưa xếp lớp" được', (await call('PUT', '/api/auth/complete-profile', { name: 'X', classId: '10-CHUAXEP' }, cpRes.body.token)).status === 400);
  const completeRes = await call('PUT', '/api/auth/complete-profile', { name: 'Học Sinh Thử Sinh Hàng Loạt', classId: '10A4', gender: 'Nam', dob: '2010-01-01' }, cpRes.body.token);
  ok('Hoàn tất hồ sơ (bắt buộc bước 2): lưu đúng tên + lớp thật', completeRes.status === 200 && completeRes.body.user?.name === 'Học Sinh Thử Sinh Hàng Loạt' && completeRes.body.user?.className === '10A4');
  ok('profileComplete=true sau khi hoàn tất hồ sơ', completeRes.body.user?.profileComplete === true);

  for (const c of bulk.body.created) await call('DELETE', `/api/admin/users/${c.id}`, null, ad.token);

  console.log('\nNhập danh sách học sinh có sẵn (Tên + Lớp)');
  ok('Học sinh không được nhập danh sách', (await call('POST', '/api/admin/users/bulk-import', { items: [{ name: 'X', classId: '10Z1' }], year: 2098 }, st.token)).status === 403);
  ok('Lớp không bắt đầu bằng số khối → 400', (await call('POST', '/api/admin/users/bulk-import', { items: [{ name: 'Nguyễn Văn X', classId: 'ZZ' }], year: 2098 }, ad.token)).status === 400);
  const imp1 = await call('POST', '/api/admin/users/bulk-import', { items: [
    { name: 'Nguyễn Thị Nhập Một', classId: '10Z1' }, { name: 'Trần Văn Nhập Hai', classId: '10Z1' }, { name: 'Lê Thị Nhập Ba', classId: '10Z2' },
  ], year: 2098, password: 'NhapDS123' }, ad.token);
  ok('Nhập 3 học sinh, 2 lớp mới', imp1.body.created?.length === 3 && imp1.body.createdClasses?.length === 2);
  ok('Mã sinh đúng mẫu Khối+STT+Năm, nối tiếp trong cùng khối', imp1.body.created.map(c => c.id).join(',') === '100012098,100022098,100032098');
  ok('Lớp mới đúng tên đã nhập', imp1.body.createdClasses.sort().join(',') === '10Z1,10Z2');
  ok('Tên thật + lớp thật được gán đúng từng dòng', imp1.body.created[2].name === 'Lê Thị Nhập Ba' && imp1.body.created[2].classId === '10Z2');
  const impClasses = (await call('GET', '/api/admin/classes', null, ad.token)).body.items;
  ok('Lớp mới xuất hiện trong danh sách lớp (sĩ số đúng)', impClasses.find(c => c.id === '10Z1')?.size === 2 && impClasses.find(c => c.id === '10Z2')?.size === 1);
  const imp2 = await call('POST', '/api/admin/users/bulk-import', { items: [{ name: 'Phạm Văn Nhập Bốn', classId: '10Z1' }], year: 2098, password: 'NhapDS123' }, ad.token);
  ok('Nhập tiếp cùng khối+năm → số thứ tự tiếp nối, không trùng mã cũ', imp2.body.created[0]?.id === '100042098');
  const impLogin = await login({ username: imp1.body.created[0].id, password: 'NhapDS123' });
  ok('Tài khoản nhập danh sách: đăng nhập được ngay', impLogin.status === 200);
  ok('profileComplete=true ngay (có tên thật + lớp thật, không cần tự khai lại)', impLogin.body.user?.profileComplete === true && impLogin.body.user?.name === 'Nguyễn Thị Nhập Một' && impLogin.body.user?.className === '10Z1');
  ok('mustChangePassword=true (vẫn bắt buộc đổi mật khẩu lần đầu)', impLogin.body.user?.mustChangePassword === true);
  for (const c of [...imp1.body.created, ...imp2.body.created]) await call('DELETE', `/api/admin/users/${c.id}`, null, ad.token);
} catch (e) { failCount++; console.error(e); }
finally {
  srv.kill();
  console.log(`\n${failCount ? '✗' : '✓'} ${pass} đạt · ${failCount} lỗi   (dữ liệu thử: ${DATA})\n`);
  process.exit(failCount ? 1 : 0);
}
