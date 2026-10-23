# Cổng Học Đường Số · THPT Lê Hoàn

Ứng dụng web an toàn học đường cho học sinh và thầy cô: **tố giác vi phạm ẩn danh**, **tư vấn tâm lý**, **theo dõi cảm xúc**, **đấu trường trắc nghiệm pháp luật**, **khảo sát**, **chat toàn trường / chat giáo viên**, **AI quét lừa đảo 4-trong-1** và **Trợ lý AI 24/7 có AI Guard**.

- Máy chủ **Node.js thuần**, không cần `npm install` (không có thư viện phụ thuộc).
- **117 REST API** có phân quyền (học sinh / giáo viên / Ban Giám hiệu), realtime bằng Server-Sent Events.
- Giao diện tự co giãn cho **điện thoại và máy tính**, có **chế độ tối**.
- Xuất **Excel (.xlsx) thật** cho tài khoản, tố giác, biên bản, trắc nghiệm, khảo sát, góp ý.

## Chạy thử

**Windows:** bấm đúp tệp `CHAY-WEB.bat`, trình duyệt tự mở http://localhost:3000 (cần cài [Node.js](https://nodejs.org) bản LTS).


Yêu cầu: Node.js **18.17 trở lên** (khuyên dùng bản 20 hoặc 22).

```bash
cd lehoan-portal
node server.js          # hoặc: npm start
```

Mở trình duyệt:

| Trang | Địa chỉ |
|---|---|
| Đăng nhập học sinh | http://localhost:3000 |
| Cổng Học Sinh | http://localhost:3000/app |
| Đăng nhập giáo viên / quản trị (trang riêng) | http://localhost:3000/quan-tri |
| Cổng Giáo Viên / Quản trị | http://localhost:3000/admin |
| App điện thoại (khung Android) | http://localhost:3000/mobile |
| Tài liệu API (bấm thử trực tiếp) | http://localhost:3000/docs |

Tài khoản dùng thử:

| Vai trò | Tài khoản | Mật khẩu |
|---|---|---|
| Học sinh | `2126220004` | `123456` |
| Giáo viên (GVCN 12A1) | `GV2024089` | `123456` |
| Chuyên viên tâm lý | `GV2024012` | `123456` |
| Ban Giám hiệu (quản trị) | `admin` | `admin123` |

Lần chạy đầu tiên, máy chủ tự tạo dữ liệu mẫu tại `data/db.json`. Muốn làm lại từ đầu: `npm run reset` (hoặc xóa `data/db.json`).

Truy cập từ điện thoại cùng mạng Wi-Fi: mở `http://<địa-chỉ-IP-máy-tính>:3000`. Camera và định vị chỉ hoạt động trên `localhost` hoặc HTTPS.

## Chức năng

### Cổng Học Sinh
| Chức năng | Mô tả |
|---|---|
| Đăng nhập & Face ID | Mã học sinh + mật khẩu (băm scrypt), ghi nhớ phiên, Face ID giả lập bằng khóa thiết bị |
| Trang chủ | Biểu ngữ chạy, hành động nhanh, thẻ học sinh điện tử, cảm xúc hôm nay, khảo sát, bảng vàng, bản tin |
| Tố giác vi phạm | Gửi ẩn danh hoặc công khai, tối đa 4 ảnh (tự nén), theo dõi tiến trình xử lý và phản hồi |
| Tư vấn tâm lý | Hộp thư bảo mật với chuyên viên, có thể ẩn danh; AI Guard cảnh báo khi có dấu hiệu khủng hoảng |
| Cảm xúc & thư giãn | 6 trạng thái cảm xúc, lời khuyên, bài thở 4-7-8 có hoạt ảnh, nhật ký 14 ngày |
| Cẩm nang & đường dây nóng | Bài kỹ năng ứng phó, 5 bước khi bị bắt nạt, danh bạ 111 / 113 / 115… |
| Bản tin tuyên truyền | Phòng chống bạo lực, lừa đảo, ma túy, vật liệu nổ, pháp luật, an toàn giao thông |
| Chat toàn trường | Realtime, thả biểu cảm, mẫu tin lịch sự, lọc ngôn từ phản cảm (3 lần vi phạm tự cấm chat) |
| Chat giáo viên | Trò chuyện 1-1, gửi **đơn xin nghỉ học** để thầy cô duyệt |
| Đấu trường trắc nghiệm | Chọn chủ đề, tính giờ, chấm điểm tức thì kèm giải thích, bảng vàng tuần, huy hiệu |
| Khảo sát | Phiếu ẩn danh (một lựa chọn, nhiều lựa chọn, thang 1–5, tự luận), chống gửi trùng |
| Tra cứu lừa đảo AI | Quét tin nhắn, đường link, số điện thoại, số tài khoản; chấm điểm rủi ro 0–100 và giải thích |
| Trợ lý AI 24/7 | Giải thích kiến thức, mẹo ôn thi, hỗ trợ tâm lý, hướng dẫn an toàn; có AI Guard |
| Hồ sơ cá nhân | Thông tin, đổi mật khẩu, Face ID, đăng xuất mọi thiết bị, sổ nề nếp, góp ý |

### Cổng Giáo Viên / Quản trị
| Chức năng | Mô tả |
|---|---|
| Bảng điều khiển | Số liệu tổng hợp, chỉ số cảm xúc tích cực 7 ngày, tố giác theo loại, cảnh báo, hoạt động gần đây |
| Tài khoản đăng nhập | Thêm / sửa / khóa / xóa, đặt lại mật khẩu mặc định, xuất Excel |
| Tố giác & biên bản | Lọc theo trạng thái và mức độ, cập nhật tiến trình, phản hồi học sinh, **lập biên bản** kèm ảnh, trừ điểm rèn luyện |
| Tư vấn & chat học sinh | Trả lời hộp thư tâm lý realtime, đánh dấu cần gặp trực tiếp, duyệt đơn xin nghỉ |
| Kiểm duyệt chat chung | Gỡ tin, cảnh cáo, cấm chat, khóa kênh |
| Trò chơi trắc nghiệm | Ngân hàng câu hỏi (4 phương án), kết quả thi đấu, bảng vàng, xuất Excel |
| Khảo sát | Tạo đợt khảo sát với trình dựng câu hỏi, xem kết quả theo từng câu, xuất Excel cho SPSS |
| AI Guard & cảnh báo | Cảnh báo đỏ / cam / vàng, nhật ký hội thoại AI, cấu hình từ khóa, thống kê tra cứu lừa đảo |
| Cẩm nang & bản tin | Đăng, sửa, ghim, ẩn bài viết, ảnh bìa |
| Phát thông báo | Gửi toàn trường, theo đối tượng hoặc theo lớp (realtime) |
| Giao diện & cấu hình | Tên trường, khẩu hiệu, logo, biểu ngữ chạy, bật/tắt từng module, danh bạ đường dây nóng |
| Nhật ký & góp ý | Lịch sử thao tác quản trị, đánh giá ứng dụng |

## Cấu trúc thư mục

```
lehoan-portal/
├── server.js              Máy chủ HTTP: REST API, realtime SSE, web tĩnh, lưu dữ liệu, tải ảnh
├── shared/                Lõi nghiệp vụ dùng chung (chạy được cả trên Node.js và trình duyệt)
│   ├── api.js             Lắp ráp toàn bộ route
│   ├── router.js          Bộ định tuyến + phân quyền + mô tả endpoint
│   ├── routes/            auth · portal · safety · engage · chat · admin
│   ├── ai/                scam.js (quét lừa đảo) · guard.js (AI Guard) · assistant.js (trợ lý)
│   ├── xlsx.js            Trình xuất Excel thuần JavaScript
│   ├── seed.js            Dữ liệu mẫu
│   └── content.js         Bản tin, câu hỏi trắc nghiệm, cẩm nang lấy từ dự án gốc
├── public/                Giao diện: index.html (đăng nhập) · app.html · admin.html · docs.html
│   ├── css/app.css        Hệ thống thiết kế (sáng / tối, co giãn)
│   └── js/                login.js · student.js · admin.js · docs.js · core/ (api, ui, icons, demo)
├── scripts/               smoke-test.js (kiểm thử 47 kịch bản) · gen-api-docs.js
├── docs/API.md            Tài liệu API đầy đủ
├── mobile/                App Android (Capacitor) + hướng dẫn build APK
├── .github/workflows/     Tự build APK trên GitHub Actions
└── data/                  Tự tạo khi chạy: db.json, secret.key, uploads/
```

## Bảo mật & quyền riêng tư

- Mật khẩu băm **scrypt** có muối; token ký **HMAC-SHA256**, có hạn dùng; đổi mật khẩu hoặc "đăng xuất mọi thiết bị" sẽ vô hiệu token cũ.
- Tố giác và hộp thư ẩn danh **không lưu mã học sinh**; hệ thống chỉ giữ một khóa HMAC để học sinh tự xem lại hồ sơ của mình.
- Giới hạn đăng nhập sai (8 lần / 10 phút), giới hạn tốc độ chat, kiểm tra dữ liệu đầu vào, giới hạn kích thước ảnh, chống truy cập ngoài thư mục, header bảo mật (CSP, nosniff…).
- Dữ liệu ghi xuống đĩa an toàn (ghi tệp tạm rồi đổi tên).

## Tùy chỉnh

Sao chép `.env.example` thành `.env` để đổi cổng, thư mục dữ liệu, khóa bí mật.

### Bật AI thật (Trợ lý AI + phân tích lừa đảo)

**Cách 1 · Ngay trên web (khuyên dùng):** đăng nhập tài khoản Ban Giám hiệu → **AI Guard & cảnh báo → Kết nối AI** (hoặc nút **Cấu hình AI**) → chọn nhà cung cấp (**MiraiAPI** — đã điền sẵn `https://api.miraiapi.com/v1` và mô hình `claude-opus-4.8`; Claude, Gemini, OpenAI, hoặc Groq/OpenRouter/Ollama…) → dán khóa API → **Kiểm tra kết nối** → **Lưu & bật AI**. Áp dụng ngay, không cần khởi động lại; bật/tắt riêng Trợ lý AI và Tra cứu lừa đảo AI. Khóa chỉ lưu trên máy chủ (data/db.json) và không bao giờ gửi về trình duyệt.

**Kiểm tra nhanh trên máy (không cần mở web):** bấm đúp `KIEM-TRA-AI.bat` rồi dán khóa MiraiAPI (hoặc Enter để dùng cấu hình đã lưu), hoặc chạy `npm run test:ai`. Công cụ thử cả trò chuyện lẫn phân tích lừa đảo và báo lỗi dễ hiểu.

**Cách 2 · Tệp .env:** điền một dòng như `MIRAI_API_KEY=sk-...`, `GEMINI_API_KEY=AIza...` hoặc `ANTHROPIC_API_KEY=sk-ant-...` rồi khởi động lại `npm start` (cấu hình nhập trên web được ưu tiên hơn tệp .env).

Khi AI bật:
- **Trợ lý học đường AI** trả lời mọi câu hỏi bằng mô hình ngôn ngữ, nhớ ngữ cảnh cuộc trò chuyện. Học sinh dán tin nhắn hoặc link đáng ngờ vào khung chat thì AI phân tích lừa đảo ngay và gắn nút "Phân tích chi tiết".
- **Tra cứu lừa đảo AI** kết hợp bộ luật chấm điểm với AI: AI nêu thủ đoạn, dấu hiệu cụ thể trong nội dung, việc cần làm ngay và gợi ý phản hồi an toàn. Số điện thoại và số tài khoản vẫn tra theo danh sách đen của trường (AI không có dữ liệu để đoán).
- Tình huống khủng hoảng, bạo lực (AI Guard phát hiện) luôn dùng câu trả lời an toàn soạn sẵn kèm đường dây nóng. Mọi hội thoại vẫn được AI Guard giám sát.
- Nếu AI lỗi hoặc hết hạn mức, hệ thống tự chuyển về bộ luật có sẵn, học sinh không bị gián đoạn.

Dùng được cả Groq, OpenRouter, DeepSeek hay **Ollama chạy ngay trên máy trường** (không cần Internet) qua `AI_PROVIDER=openai` + `AI_BASE_URL`; xem `.env.example`.

## App điện thoại (Android APK & cài từ web)

Thư mục `mobile/` là app Android dùng chung giao diện và máy chủ với web: cùng tài khoản, tin nhắn và thông báo đồng bộ tức thời. Trên điện thoại, giao diện tự chuyển sang bản gọn (thanh tab dưới, trung tâm Tin nhắn, chấm đỏ báo tin mới).

- **Xem trước trong khung điện thoại Android**: mở `http://localhost:3000/mobile` (trang có mã QR để mở ngay trên điện thoại thật cùng Wi-Fi; máy chủ in sẵn địa chỉ Wi-Fi khi khởi động).
- **Build APK không cần cài gì**: đưa dự án lên GitHub → tab **Actions** → **Build APK Android** → Run workflow → tải tệp APK ở mục Artifacts.
- **Build bằng Android Studio**: `cd mobile && npm install && npm run android:init && npm run android:open`.
- **Cài từ web (iPhone & Android)**: mở trang qua HTTPS → *Thêm vào màn hình chính*.

Chi tiết xem [mobile/README.md](mobile/README.md).

**Đồng bộ app ↔ web:** app dùng chung máy chủ, tài khoản và dữ liệu với web nên mọi thứ đồng bộ tức thời qua kênh realtime: tin nhắn, thông báo, chấm đỏ, tố giác, bản tin, cẩm nang, khảo sát, cấu hình giao diện, hồ sơ cá nhân và **cấu hình AI** (Ban Giám hiệu bật AI trên web là app dùng được ngay; khóa API chỉ nằm trên máy chủ, không nằm trong app). Khi điện thoại mất mạng hoặc app chạy nền rồi mở lại, app tự tải lại dữ liệu mới nhất.

## Gửi ảnh, video, tệp trong chat

Chat với giáo viên, chat toàn trường và hộp thư tư vấn đều gửi được ảnh, video, ghi âm, PDF, Word, Excel, PowerPoint, ZIP (tối đa 25 MB mỗi tệp, 6 tệp mỗi tin). Bấm nút kẹp giấy, dán ảnh (Ctrl+V) hoặc kéo thả tệp vào khung chat. Ảnh lớn được nén tự động, bấm ảnh để phóng to, video tua được. Tệp lưu ở `data/uploads/`.

## Lệnh hữu ích

```bash
npm start        # chạy máy chủ
npm run dev      # chạy và tự khởi động lại khi sửa mã (Node 18.11+)
npm test         # kiểm thử nhanh toàn bộ API
npm run docs     # sinh lại docs/API.md
npm run reset    # xóa dữ liệu, tạo lại dữ liệu mẫu ở lần chạy sau
```
