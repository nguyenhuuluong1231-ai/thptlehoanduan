// AI Scam Scanner 4-trong-1: tin nhắn · đường dẫn · số điện thoại · số tài khoản ngân hàng.
// Mô hình chấm điểm theo luật (rule-based) có trọng số, kèm giải thích cho từng dấu hiệu.

const norm = (s) => s.toLowerCase().normalize('NFC');
const strip = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();

const MESSAGE_RULES = [
  { id: 'authority', w: 32, label: 'Mạo danh cơ quan chức năng', re: /(cong an|toa an|vien kiem sat|canh sat|co quan dieu tra|lenh bat|trieu tap|ho so vu an|rua tien|bo cong an)/, why: 'Công an, tòa án không bao giờ làm việc, yêu cầu chuyển tiền hay cung cấp thông tin qua điện thoại hoặc tin nhắn.' },
  { id: 'money', w: 22, label: 'Yêu cầu chuyển tiền / nạp tiền', re: /(chuyen khoan|chuyen tien|nap tien|dat coc|phi (nhan|xu ly|kich hoat|bao hiem)|nop phi|thanh toan truoc|ck truoc|stk)/, why: 'Bất kỳ ai yêu cầu bạn chuyển tiền trước để nhận quà, việc làm hay giải quyết sự cố đều có dấu hiệu lừa đảo.' },
  { id: 'urgent', w: 14, label: 'Tạo áp lực khẩn cấp', re: /(gap|khan cap|ngay lap tuc|trong vong \d+ ?(phut|gio|h)|truoc \d+h|het han|bi khoa|se bi xu ly|cuoi cung|nhanh len)/, why: 'Kẻ gian thường hối thúc để bạn không kịp suy nghĩ hay hỏi ý kiến người lớn.' },
  { id: 'prize', w: 20, label: 'Trúng thưởng / quà tặng bất ngờ', re: /(trung thuong|qua tang|tri an khach hang|giai thuong|xe sh|iphone mien phi|nhan qua|may man duoc chon|voucher \d)/, why: 'Bạn không tham gia chương trình nào mà lại “trúng thưởng” thì gần như chắc chắn là lừa đảo.' },
  { id: 'job', w: 24, label: 'Bẫy “việc nhẹ lương cao”', re: /(viec nhe luong cao|ctv|cong tac vien|lam nhiem vu|like video|tha tim|danh gia san pham|hoa hong|thu nhap \d+.{0,6}(ngay|thang)|tuyen dung online|lam tai nha)/, why: 'Công việc online yêu cầu nạp tiền làm nhiệm vụ để nhận hoa hồng là chiêu lừa phổ biến nhắm vào học sinh, sinh viên.' },
  { id: 'otp', w: 34, label: 'Đòi mã OTP / mật khẩu', re: /(otp|ma xac (nhan|thuc)|mat khau|password|ma pin|cung cap ma|doc ma|gui ma)/, why: 'Mã OTP và mật khẩu là chìa khóa tài khoản của bạn. Không ai có quyền yêu cầu bạn cung cấp.' },
  { id: 'family', w: 22, label: 'Báo tin người thân gặp nạn', re: /(tai nan|cap cuu|vien phi|dang mo|nguy kich|con ban|bo ban|me ban).{0,40}(chuyen|tien|gap)/, why: 'Chiêu “người thân đang cấp cứu” khiến bạn hoảng loạn. Hãy gọi trực tiếp cho người thân hoặc GVCN để xác minh.' },
  { id: 'loan', w: 16, label: 'Vay tiền dễ dàng qua app', re: /(vay nhanh|vay online|khong the chap|giai ngan trong|chi can cccd|lai suat 0)/, why: 'App vay “dễ dàng” thường là tín dụng đen với lãi suất cắt cổ và đòi nợ khủng bố.' },
  { id: 'blackmail', w: 30, label: 'Đe dọa, tống tiền', re: /(tung clip|tung anh|boc phot|phat tan|neu khong (chuyen|gui|nop)|tong tien|anh nhay cam)/, why: 'Đừng làm theo yêu cầu của kẻ đe dọa. Lưu bằng chứng và báo ngay cho thầy cô, cha mẹ hoặc công an.' },
  { id: 'account', w: 18, label: 'Cảnh báo tài khoản giả', re: /(tai khoan (cua ban )?(bi khoa|bi tam khoa|se bi khoa|bat thuong)|xac minh tai khoan|cap nhat thong tin|dang nhap de)/, why: 'Thông báo khóa tài khoản kèm đường dẫn đăng nhập là thủ đoạn đánh cắp tài khoản ngân hàng, mạng xã hội.' },
  { id: 'gambling', w: 20, label: 'Mời chào cờ bạc, cá độ', re: /(ca do|nha cai|tai xiu|casino|lo de|xoc dia|keo bong|bet\b|nap \d+k nhan)/, why: 'Cờ bạc, cá độ trực tuyến là hành vi vi phạm pháp luật và thường gắn với lừa đảo chiếm đoạt tiền.' },
];

const BRANDS = ['vietcombank', 'techcombank', 'mbbank', 'bidv', 'agribank', 'vietinbank', 'tpbank', 'vpbank', 'sacombank', 'acb', 'momo', 'zalopay', 'shopee', 'lazada', 'tiktok', 'facebook', 'zalo', 'garena', 'evn', 'vnpt', 'viettel', 'chinhphu', 'dichvucong', 'bocongan'];
const OFFICIAL = ['vietcombank.com.vn', 'techcombank.com', 'mbbank.com.vn', 'bidv.com.vn', 'agribank.com.vn', 'vietinbank.vn', 'tpb.vn', 'vpbank.com.vn', 'sacombank.com.vn', 'acb.com.vn', 'momo.vn', 'zalopay.vn', 'shopee.vn', 'lazada.vn', 'tiktok.com', 'facebook.com', 'zalo.me', 'garena.vn', 'evn.com.vn', 'vnpt.vn', 'viettel.vn', 'chinhphu.vn', 'dichvucong.gov.vn', 'bocongan.gov.vn', 'moet.gov.vn', 'google.com', 'youtube.com', 'gov.vn', 'edu.vn'];
const BAD_TLDS = ['xyz', 'top', 'club', 'icu', 'online', 'site', 'vip', 'cc', 'tk', 'ml', 'ga', 'cf', 'gq', 'buzz', 'live', 'click', 'link', 'shop', 'work', 'rest', 'fun'];
const SHORTENERS = ['bit.ly', 'tinyurl.com', 'cutt.ly', 'shorturl.at', 't.ly', 'rb.gy', 'is.gd', 'goo.su', 'tiny.cc'];
const PHISH_WORDS = ['login', 'dang-nhap', 'dangnhap', 'verify', 'xac-thuc', 'xacthuc', 'xac-minh', 'nhan-qua', 'nhanqua', 'trung-thuong', 'khuyen-mai', 'update', 'secure', 'account', 'otp', 'wallet', 'bonus', 'free'];
const GAMBLE_WORDS = ['bet', 'casino', 'nhacai', 'nha-cai', 'taixiu', 'tai-xiu', 'xoso', 'lode', 'w88', 'fb88', '188bet', 'kubet', 'jun88', 'okvip', 'slot'];

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  const d = Array.from({ length: m + 1 }, (_, i) => [i]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}

export function level(score) {
  if (score >= 60) return { level: 'danger', label: 'Cực kỳ nguy hiểm', advice: 'Dừng mọi liên lạc. Tuyệt đối không chuyển tiền, không bấm đường dẫn, không cung cấp mã OTP. Báo ngay cho GVCN, Ban Giám thị hoặc gọi 113.' };
  if (score >= 25) return { level: 'warning', label: 'Cảnh báo', advice: 'Có dấu hiệu đáng ngờ. Hãy xác minh qua kênh chính thức (gọi trực tiếp số tổng đài in trên thẻ, website chính thức) và hỏi ý kiến người lớn trước khi làm theo.' };
  return { level: 'safe', label: 'An toàn', advice: 'Chưa phát hiện dấu hiệu lừa đảo rõ ràng. Dù vậy, hãy luôn cảnh giác với yêu cầu chuyển tiền hoặc cung cấp thông tin cá nhân.' };
}

export function scanMessage(text) {
  const t = strip(text);
  const findings = [];
  for (const r of MESSAGE_RULES) if (r.re.test(t)) findings.push({ label: r.label, detail: r.why, weight: r.w });
  const urls = text.match(/https?:\/\/[^\s]+|\b[a-z0-9-]+\.(?:xyz|top|club|vip|online|site|link|click|cc|tk)\b[^\s]*/gi) || [];
  let urlScore = 0;
  for (const u of urls.slice(0, 3)) {
    const r = scanUrl(u);
    if (r.score >= 25) { urlScore = Math.max(urlScore, Math.round(r.score * 0.6)); findings.push({ label: `Đường dẫn đáng ngờ: ${r.host || u}`, detail: r.findings[0]?.detail || 'Đường dẫn có dấu hiệu giả mạo.', weight: Math.round(r.score * 0.6) }); }
  }
  if (/\b\d{9,14}\b/.test(text.replace(/[ .-]/g, '')) && findings.some(f => f.label.includes('chuyển tiền'))) findings.push({ label: 'Kèm số tài khoản nhận tiền', detail: 'Tin nhắn vừa yêu cầu chuyển tiền vừa cung cấp sẵn số tài khoản là dấu hiệu rất điển hình.', weight: 10 });
  let score = findings.reduce((a, f) => a + f.weight, 0);
  if (findings.length >= 3) score += 10;
  score = Math.min(100, score);
  return { kind: 'message', score, ...level(score), findings };
}

export function scanUrl(input, blacklist = []) {
  const findings = [];
  let s = input.trim();
  if (!/^[a-z]+:\/\//i.test(s)) s = 'http://' + s;
  let url;
  try { url = new URL(s); } catch { return { kind: 'url', score: 40, ...level(40), host: input, findings: [{ label: 'Đường dẫn không hợp lệ', detail: 'Không phân tích được địa chỉ này. Đừng mở các đường dẫn bị cắt xén hoặc khó đọc.', weight: 40 }] }; }
  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  const full = norm(url.href);
  const add = (label, detail, weight) => findings.push({ label, detail, weight });

  const official = OFFICIAL.find(d => host === d || host.endsWith('.' + d));
  if (official) {
    if (url.protocol !== 'https:') add('Không dùng HTTPS', 'Trang chính thức nhưng đang mở bằng HTTP không mã hóa. Hãy dùng https://.', 10);
    const score = findings.reduce((a, f) => a + f.weight, 0);
    return { kind: 'url', score, ...level(score), host, official: true, findings: findings.length ? findings : [{ label: 'Tên miền chính thức', detail: `“${host}” thuộc danh sách tên miền chính thức đã xác minh.`, weight: 0 }] };
  }
  const bl = blacklist.find(d => host === d.domain || host.endsWith('.' + d.domain));
  if (bl) add('Có trong danh sách đen', `Tên miền này đã bị cộng đồng báo cáo ${bl.reports} lần${bl.note ? ': ' + bl.note : ''}.`, 70);
  if (url.protocol !== 'https:') add('Không mã hóa (HTTP)', 'Trang không dùng HTTPS nên dữ liệu bạn nhập có thể bị đánh cắp.', 12);
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) add('Dùng địa chỉ IP thay cho tên miền', 'Trang web hợp pháp hầu như không dùng địa chỉ IP trần.', 30);
  if (host.includes('xn--')) add('Tên miền dùng ký tự đặc biệt (punycode)', 'Có thể là tên miền giả dạng bằng ký tự trông giống chữ cái thật.', 30);
  if (url.username || input.includes('@')) add('Chứa ký tự @ trong đường dẫn', 'Thủ thuật che giấu địa chỉ thật phía sau ký tự @.', 25);
  const tld = host.split('.').pop();
  if (BAD_TLDS.includes(tld)) add(`Đuôi tên miền rủi ro (.${tld})`, 'Đuôi tên miền giá rẻ thường bị dùng để dựng trang lừa đảo ngắn hạn.', 18);
  if (SHORTENERS.includes(host)) add('Đường dẫn rút gọn', 'Link rút gọn che giấu trang đích thật. Chỉ mở khi biết rõ người gửi.', 20);
  if (host.split('.').length > 4) add('Quá nhiều tên miền con', 'Kẻ gian thường lồng tên thương hiệu vào nhiều tầng tên miền con để đánh lừa.', 12);
  const label = host.split('.').slice(0, -1).join('.');
  const flat = label.replace(/[^a-z0-9]/g, '');
  for (const b of BRANDS) {
    const parts = label.split(/[.-]/);
    if (flat.includes(b) || parts.some(p => p.length > 3 && levenshtein(p, b) <= (b.length > 6 ? 2 : 1))) {
      add(`Giả mạo thương hiệu “${b}”`, `Tên miền chứa hoặc gần giống “${b}” nhưng không phải trang chính thức.`, 45);
      break;
    }
  }
  if (PHISH_WORDS.some(w => full.includes(w))) add('Từ khóa đánh cắp thông tin', 'Đường dẫn chứa từ như “đăng nhập”, “xác thực”, “nhận quà”… thường gặp trong trang giả mạo.', 15);
  if (GAMBLE_WORDS.some(w => full.includes(w))) add('Dấu hiệu web cờ bạc, cá độ', 'Truy cập web cờ bạc là vi phạm pháp luật và dễ bị chiếm đoạt tiền.', 40);
  if (url.href.length > 120) add('Đường dẫn quá dài', 'Đường dẫn dài bất thường thường dùng để che giấu mục đích thật.', 6);
  const score = Math.min(100, findings.reduce((a, f) => a + f.weight, 0));
  return { kind: 'url', score, ...level(score), host, findings: findings.length ? findings : [{ label: 'Không thấy dấu hiệu bất thường', detail: 'Tên miền chưa có trong danh sách đen và không có đặc điểm giả mạo phổ biến.', weight: 0 }] };
}

const CARRIERS = [
  ['Viettel', ['086', '096', '097', '098', '032', '033', '034', '035', '036', '037', '038', '039']],
  ['Vinaphone', ['088', '091', '094', '081', '082', '083', '084', '085']],
  ['MobiFone', ['089', '090', '093', '070', '076', '077', '078', '079']],
  ['Vietnamobile', ['092', '056', '058']],
  ['Gmobile', ['099', '059']],
  ['iTel', ['087']],
  ['Reddi', ['055']],
];

export function scanPhone(input, db = []) {
  const findings = [];
  let n = input.replace(/[^\d+]/g, '');
  let intl = false;
  if (n.startsWith('+84')) n = '0' + n.slice(3);
  else if (n.startsWith('84') && n.length === 11) n = '0' + n.slice(2);
  else if (n.startsWith('+') || n.startsWith('00')) intl = true;
  const add = (label, detail, weight) => findings.push({ label, detail, weight });
  const hit = db.find(p => p.number === n);
  if (hit) add(`Bị báo cáo ${hit.reports} lần`, hit.note || 'Số điện thoại có trong cơ sở dữ liệu lừa đảo do cộng đồng báo cáo.', Math.min(90, 50 + hit.reports * 4));
  let carrier = null;
  if (intl) add('Cuộc gọi quốc tế', 'Số có mã quốc gia nước ngoài. Kẻ gian thường giả mạo cơ quan nhà nước, ngân hàng bằng số quốc tế. Hãy cẩn trọng khi nghe máy.', 35);
  else if (/^1900\d{4,6}$/.test(n)) { carrier = 'Tổng đài dịch vụ 1900'; add('Đầu số thu phí 1900', 'Gọi lại số 1900 lạ có thể bị tính cước cao. Chỉ gọi khi biết rõ đơn vị sở hữu.', 15); }
  else if (/^0\d{9}$/.test(n)) { carrier = CARRIERS.find(([, ps]) => ps.includes(n.slice(0, 3)))?.[0] || null; if (!carrier && !/^02\d/.test(n)) add('Đầu số không xác định', 'Đầu số không thuộc nhà mạng di động nào đang hoạt động tại Việt Nam.', 25); if (/^02\d/.test(n)) carrier = 'Điện thoại cố định'; }
  else add('Độ dài số không hợp lệ', 'Số điện thoại Việt Nam có 10 chữ số. Số bất thường có thể là số ảo hoặc giả mạo.', 25);
  if (/(\d)\1{6,}/.test(n)) add('Dãy số lặp bất thường', 'Số có quá nhiều chữ số lặp lại thường là số ảo dùng để quấy rối.', 10);
  const score = Math.min(100, findings.reduce((a, f) => a + f.weight, 0));
  return { kind: 'phone', score, ...level(score), normalized: n, carrier, reports: hit?.reports || 0, findings: findings.length ? findings : [{ label: 'Chưa có báo cáo', detail: `Số ${n}${carrier ? ' (' + carrier + ')' : ''} chưa bị báo cáo trong cơ sở dữ liệu. Vẫn nên cẩn trọng nếu người gọi đòi tiền hoặc mã OTP.`, weight: 0 }] };
}

export function scanAccount(input, bank = '', db = []) {
  const n = input.replace(/\D/g, '');
  const findings = [];
  const add = (label, detail, weight) => findings.push({ label, detail, weight });
  const hit = db.find(a => a.number === n);
  if (hit) add(`Nằm trong danh sách đen (${hit.reports} báo cáo)`, `${hit.bank ? hit.bank + ' · ' : ''}${hit.note || 'Tài khoản đã bị cộng đồng báo cáo liên quan đến lừa đảo.'}`, Math.min(95, 55 + hit.reports * 4));
  if (n.length < 6 || n.length > 19) add('Độ dài số tài khoản bất thường', 'Số tài khoản ngân hàng tại Việt Nam thường có từ 6 đến 19 chữ số.', 20);
  const score = Math.min(100, findings.reduce((a, f) => a + f.weight, 0));
  return { kind: 'account', score, ...level(score), normalized: n, bank: hit?.bank || bank, reports: hit?.reports || 0, findings: findings.length ? findings : [{ label: 'Chưa có báo cáo', detail: 'Tài khoản chưa có trong danh sách đen. Hãy chỉ chuyển tiền khi đã xác minh trực tiếp người nhận.', weight: 0 }] };
}
