// Sinh tài liệu docs/API.md từ khai báo route: node scripts/gen-api-docs.js
import fs from 'node:fs';
import { buildApi, API_VERSION } from '../shared/api.js';

const AUTH = { public: 'Công khai', user: 'Đã đăng nhập', student: 'Học sinh', staff: 'Giáo viên / Quản trị', admin: 'Ban Giám hiệu' };
const eps = buildApi().describe();
const groups = [...new Set(eps.map(e => e.group))];
let md = `# Tài liệu REST API · Cổng Học Đường Số v${API_VERSION}\n\n`;
md += `Tổng cộng **${eps.length} endpoint**. Dữ liệu trao đổi dạng JSON (UTF-8). Khi chạy máy chủ, xem bản tương tác tại \`/docs\`.\n\n`;
md += `## Xác thực\n\n1. Gọi \`POST /api/auth/login\` với \`{ "username": "2126220004", "password": "123456" }\` để nhận \`token\`.\n2. Gửi kèm header \`Authorization: Bearer <token>\` cho các API cần đăng nhập.\n3. Token ký HMAC-SHA256, hết hạn sau 1 ngày (hoặc 30 ngày nếu \`remember: true\`).\n\n`;
md += `## Realtime (Server-Sent Events)\n\n\`GET /api/stream?token=<token>\` phát các sự kiện: \`notification\`, \`alert\`, \`school-chat:message\`, \`school-chat:react\`, \`school-chat:delete\`, \`school-chat:lock\`, \`teacher-chat:message\`, \`counseling:message\`, \`counseling:reply\`, \`report:new\`, \`report:update\`, \`quiz:attempt\`, \`sync\`, \`settings\`.\n\n`;
md += `## Mã lỗi\n\n| Mã | Ý nghĩa |\n|---|---|\n| 400 | Dữ liệu gửi lên không hợp lệ (thông báo lỗi bằng tiếng Việt trong \`error\`) |\n| 401 | Chưa đăng nhập hoặc token hết hạn |\n| 403 | Không đủ quyền hoặc chức năng đang tắt |\n| 404 | Không tìm thấy |\n| 409 | Trùng lặp (đã gửi phiếu, đã tồn tại…) |\n| 413 | Dữ liệu quá lớn |\n| 423 | Kênh chat đang khóa |\n| 429 | Gửi quá nhanh / nhập sai mật khẩu quá nhiều lần |\n\n`;
md += `## Nhóm chức năng\n\n${groups.map(g => `- ${g} (${eps.filter(e => e.group === g).length})`).join('\n')}\n\n`;
for (const g of groups) {
  md += `## ${g}\n\n| Phương thức | Đường dẫn | Quyền | Mô tả |\n|---|---|---|---|\n`;
  for (const e of eps.filter(x => x.group === g)) md += `| \`${e.method}\` | \`${e.path}\` | ${AUTH[e.auth]} | ${e.desc.replace(/\|/g, '\\|')} |\n`;
  const withBody = eps.filter(x => x.group === g && x.body);
  if (withBody.length) {
    md += `\n<details><summary>Ví dụ body</summary>\n\n`;
    for (const e of withBody) md += `**${e.method} ${e.path}**\n\n\`\`\`json\n${JSON.stringify(e.body, null, 2)}\n\`\`\`\n\n`;
    md += `</details>\n\n`;
  } else md += '\n';
}
fs.mkdirSync(new URL('../docs/', import.meta.url), { recursive: true });
fs.writeFileSync(new URL('../docs/API.md', import.meta.url), md);
console.log(`Đã ghi docs/API.md (${eps.length} endpoint)`);
