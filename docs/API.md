# Tài liệu REST API · Cổng Học Đường Số v2.0.0

Tổng cộng **117 endpoint**. Dữ liệu trao đổi dạng JSON (UTF-8). Khi chạy máy chủ, xem bản tương tác tại `/docs`.

## Xác thực

1. Gọi `POST /api/auth/login` với `{ "username": "2126220004", "password": "123456" }` để nhận `token`.
2. Gửi kèm header `Authorization: Bearer <token>` cho các API cần đăng nhập.
3. Token ký HMAC-SHA256, hết hạn sau 1 ngày (hoặc 30 ngày nếu `remember: true`).

## Realtime (Server-Sent Events)

`GET /api/stream?token=<token>` phát các sự kiện: `notification`, `alert`, `school-chat:message`, `school-chat:react`, `school-chat:delete`, `school-chat:lock`, `teacher-chat:message`, `counseling:message`, `counseling:reply`, `report:new`, `report:update`, `quiz:attempt`, `sync`, `settings`.

## Mã lỗi

| Mã | Ý nghĩa |
|---|---|
| 400 | Dữ liệu gửi lên không hợp lệ (thông báo lỗi bằng tiếng Việt trong `error`) |
| 401 | Chưa đăng nhập hoặc token hết hạn |
| 403 | Không đủ quyền hoặc chức năng đang tắt |
| 404 | Không tìm thấy |
| 409 | Trùng lặp (đã gửi phiếu, đã tồn tại…) |
| 413 | Dữ liệu quá lớn |
| 423 | Kênh chat đang khóa |
| 429 | Gửi quá nhanh / nhập sai mật khẩu quá nhiều lần |

## Nhóm chức năng

- Xác thực & tài khoản (7)
- Công khai (9)
- Trang chủ học sinh (1)
- Cá nhân & tiện ích (11)
- An toàn học đường (8)
- Trắc nghiệm & khảo sát (7)
- Chat toàn trường (3)
- Chat giáo viên (4)
- Trí tuệ nhân tạo (AI) (5)
- Quản trị · Tổng quan (6)
- Quản trị · Tài khoản (7)
- Quản trị · Tố giác & biên bản (6)
- Quản trị · Trắc nghiệm & khảo sát (10)
- Quản trị · Tư vấn & AI Guard (19)
- Quản trị · Nội dung & giao diện (12)
- Quản trị · Xuất dữ liệu (2)

## Xác thực & tài khoản

| Phương thức | Đường dẫn | Quyền | Mô tả |
|---|---|---|---|
| `POST` | `/api/auth/login` | Công khai | Đăng nhập bằng MSHS / mã giáo viên và mật khẩu. Trả về token Bearer. |
| `POST` | `/api/auth/logout` | Đã đăng nhập | Đăng xuất phiên hiện tại. |
| `POST` | `/api/auth/logout-all` | Đã đăng nhập | Đăng xuất khỏi tất cả thiết bị (vô hiệu mọi token). |
| `GET` | `/api/auth/me` | Đã đăng nhập | Thông tin tài khoản đang đăng nhập. |
| `POST` | `/api/auth/change-password` | Đã đăng nhập | Đổi mật khẩu. |
| `POST` | `/api/auth/face/enroll` | Đã đăng nhập | Đăng ký Face ID (giả lập) cho thiết bị hiện tại. Trả về khóa thiết bị. |
| `POST` | `/api/auth/face/login` | Công khai | Đăng nhập bằng Face ID (giả lập) với khóa thiết bị đã đăng ký. |

<details><summary>Ví dụ body</summary>

**POST /api/auth/login**

```json
{
  "username": "2126220004",
  "password": "123456",
  "remember": true
}
```

**POST /api/auth/change-password**

```json
{
  "currentPassword": "123456",
  "newPassword": "MatKhauMoi@2026"
}
```

**POST /api/auth/face/enroll**

```json
{
  "device": "iPhone của Lượng"
}
```

**POST /api/auth/face/login**

```json
{
  "userId": "2126220004",
  "faceKey": "…"
}
```

</details>

## Công khai

| Phương thức | Đường dẫn | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/health` | Công khai | Kiểm tra máy chủ hoạt động. |
| `GET` | `/api/server-info` | Công khai | Địa chỉ máy chủ trong mạng nội bộ (Wi-Fi) để mở app trên điện thoại thật. |
| `GET` | `/api/settings/public` | Công khai | Thông tin nhận diện nhà trường, biểu ngữ chạy, module đang bật, đường dây nóng. |
| `GET` | `/api/news` | Công khai | Danh sách bản tin tuyên truyền. Lọc: ?category=&q= |
| `GET` | `/api/news/:id` | Công khai | Chi tiết bản tin (tăng lượt xem). |
| `GET` | `/api/handbook` | Công khai | Cẩm nang học đường & kỹ năng ứng phó. |
| `GET` | `/api/handbook/:id` | Công khai | Chi tiết bài cẩm nang. |
| `GET` | `/api/meta` | Công khai | Danh mục dùng chung: loại cảm xúc… |
| `GET` | `/api` | Công khai | Danh mục toàn bộ endpoint (dùng cho trang tài liệu API). |

## Trang chủ học sinh

| Phương thức | Đường dẫn | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/me/dashboard` | Học sinh | Dữ liệu tổng hợp cho trang chủ học sinh: cảm xúc hôm nay, tố giác của tôi, khảo sát đang mở, bảng vàng, thông báo, tin mới. |

## Cá nhân & tiện ích

| Phương thức | Đường dẫn | Quyền | Mô tả |
|---|---|---|---|
| `POST` | `/api/uploads` | Đã đăng nhập | Tải lên một tệp đính kèm cho tin nhắn: ảnh, video, ghi âm, PDF, Word, Excel, PowerPoint, ZIP (tối đa 25 MB). Gửi JSON {name, type, data: data URL base64}. |
| `GET` | `/api/me/badges` | Đã đăng nhập | Số tin nhắn / thông báo chưa đọc để hiện chấm đỏ trên menu: thông báo, chat toàn trường, chat giáo viên, tư vấn. |
| `POST` | `/api/me/seen` | Đã đăng nhập | Đánh dấu đã xem một mục (tắt chấm đỏ). key: schoolChat |
| `GET` | `/api/notifications` | Đã đăng nhập | Thông báo của tôi. |
| `POST` | `/api/notifications/:id/read` | Đã đăng nhập | Đánh dấu đã đọc một thông báo. |
| `POST` | `/api/notifications/read-all` | Đã đăng nhập | Đánh dấu tất cả thông báo đã đọc. |
| `GET` | `/api/profile` | Đã đăng nhập | Hồ sơ cá nhân đầy đủ. |
| `PUT` | `/api/profile` | Đã đăng nhập | Cập nhật số điện thoại, email liên hệ, ảnh đại diện. |
| `GET` | `/api/my-records` | Học sinh | Biên bản vi phạm của bản thân (nếu có). |
| `POST` | `/api/feedback` | Đã đăng nhập | Đánh giá, góp ý chất lượng ứng dụng. |
| `GET` | `/api/teachers` | Đã đăng nhập | Danh sách giáo viên có thể nhắn tin. |

<details><summary>Ví dụ body</summary>

**POST /api/uploads**

```json
{
  "name": "bai-tap.pdf",
  "type": "application/pdf",
  "data": "data:application/pdf;base64,JVBERi0xLjQK"
}
```

**POST /api/me/seen**

```json
{
  "key": "schoolChat"
}
```

**PUT /api/profile**

```json
{
  "phone": "0987 654 321",
  "email": "hs@lehoan.edu.vn",
  "avatar": "data:image/jpeg;base64,…"
}
```

**POST /api/feedback**

```json
{
  "rating": 5,
  "comment": "Ứng dụng rất hữu ích!"
}
```

</details>

## An toàn học đường

| Phương thức | Đường dẫn | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/report-types` | Công khai | Danh mục loại vi phạm và trạng thái xử lý. |
| `GET` | `/api/reports` | Học sinh | Sổ theo dõi tố giác của tôi (kể cả tố giác ẩn danh). |
| `GET` | `/api/reports/:id` | Học sinh | Chi tiết một tố giác của tôi. |
| `POST` | `/api/reports` | Học sinh | Gửi tố giác vi phạm (có thể ẩn danh, đính kèm tối đa 4 ảnh dạng data URL). |
| `GET` | `/api/mood` | Học sinh | Cảm xúc hôm nay, lịch sử 30 ngày và thống kê. |
| `POST` | `/api/mood` | Học sinh | Ghi lại cảm xúc hôm nay. |
| `GET` | `/api/counseling` | Học sinh | Hộp thư tâm sự của tôi với chuyên viên tư vấn (bảo mật, có thể ẩn danh). |
| `POST` | `/api/counseling/messages` | Học sinh | Gửi tâm sự tới chuyên viên tư vấn. anonymous chỉ áp dụng khi mở hộp thư lần đầu. |

<details><summary>Ví dụ body</summary>

**POST /api/reports**

```json
{
  "type": "violence",
  "location": "Cổng phụ",
  "occurredAt": "2026-10-18T10:30",
  "description": "Mô tả sự việc…",
  "anonymous": true,
  "photos": [
    "data:image/jpeg;base64,…"
  ]
}
```

**POST /api/mood**

```json
{
  "mood": "calm",
  "note": "Hôm nay học khá ổn"
}
```

**POST /api/counseling/messages**

```json
{
  "text": "Em đang thấy áp lực…",
  "anonymous": true,
  "topic": "stress"
}
```

</details>

## Trắc nghiệm & khảo sát

| Phương thức | Đường dẫn | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/quiz/topics` | Đã đăng nhập | Chủ đề trắc nghiệm và số câu hỏi mỗi chủ đề. |
| `GET` | `/api/quiz/questions` | Đã đăng nhập | Lấy bộ câu hỏi ngẫu nhiên (không kèm đáp án). ?topic=all&count=10 |
| `POST` | `/api/quiz/submit` | Đã đăng nhập | Nộp bài, chấm điểm tức thì kèm đáp án & giải thích. |
| `GET` | `/api/quiz/leaderboard` | Đã đăng nhập | Bảng vàng: ?period=week\|all |
| `GET` | `/api/surveys` | Học sinh | Các đợt khảo sát đang mở và trạng thái đã tham gia. |
| `GET` | `/api/surveys/:id` | Học sinh | Chi tiết phiếu khảo sát. |
| `POST` | `/api/surveys/:id/responses` | Học sinh | Gửi phiếu trả lời khảo sát. |

<details><summary>Ví dụ body</summary>

**POST /api/quiz/submit**

```json
{
  "topic": "all",
  "duration": 95,
  "answers": [
    {
      "id": "CH-01",
      "choice": 2
    }
  ]
}
```

**POST /api/surveys/:id/responses**

```json
{
  "answers": {
    "q1": "Khối 12",
    "q4": [
      "Cô lập, tẩy chay"
    ],
    "q6": "4"
  }
}
```

</details>

## Chat toàn trường

| Phương thức | Đường dẫn | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/school-chat` | Đã đăng nhập | Tin nhắn kênh chung (mới nhất). ?since=<ISO> để lấy tin mới. |
| `POST` | `/api/school-chat` | Đã đăng nhập | Gửi tin nhắn kênh chung (tự động lọc ngôn từ phản cảm). |
| `POST` | `/api/school-chat/:id/react` | Đã đăng nhập | Thả / bỏ biểu cảm cho tin nhắn. |

<details><summary>Ví dụ body</summary>

**POST /api/school-chat**

```json
{
  "text": "Chào cả nhà!"
}
```

**POST /api/school-chat/:id/react**

```json
{
  "emoji": "❤️"
}
```

</details>

## Chat giáo viên

| Phương thức | Đường dẫn | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/teacher-chat/threads` | Đã đăng nhập | Danh sách cuộc trò chuyện 1-1 (học sinh hoặc giáo viên). |
| `POST` | `/api/teacher-chat/threads` | Học sinh | Bắt đầu (hoặc mở lại) cuộc trò chuyện với một giáo viên. |
| `GET` | `/api/teacher-chat/threads/:id` | Đã đăng nhập | Tin nhắn trong một cuộc trò chuyện (đánh dấu đã đọc). |
| `POST` | `/api/teacher-chat/threads/:id/messages` | Đã đăng nhập | Gửi tin nhắn. kind: text \| leave (đơn xin nghỉ phép). |

<details><summary>Ví dụ body</summary>

**POST /api/teacher-chat/threads**

```json
{
  "teacherId": "GV2024089"
}
```

**POST /api/teacher-chat/threads/:id/messages**

```json
{
  "text": "Em chào cô ạ",
  "kind": "text",
  "leave": {
    "date": "2026-10-20",
    "session": "Sáng",
    "reason": "Đi khám bệnh"
  }
}
```

</details>

## Trí tuệ nhân tạo (AI)

| Phương thức | Đường dẫn | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/ai/status` | Đã đăng nhập | Trạng thái kết nối mô hình ngôn ngữ (AI) của hệ thống. |
| `POST` | `/api/ai/scam-check` | Đã đăng nhập | Quét dấu hiệu lừa đảo 4-trong-1 bằng bộ luật + AI (khi đã cấu hình LLM). kind: message \| url \| phone \| account |
| `POST` | `/api/ai/scam-report` | Đã đăng nhập | Cộng đồng báo cáo số điện thoại / tài khoản / tên miền lừa đảo. |
| `POST` | `/api/ai/chat` | Đã đăng nhập | Trò chuyện với Trợ lý Học đường AI (có AI Guard giám sát an toàn). |
| `GET` | `/api/ai/conversations/mine` | Đã đăng nhập | Lịch sử hội thoại gần nhất với Trợ lý AI. |

<details><summary>Ví dụ body</summary>

**POST /api/ai/scam-check**

```json
{
  "kind": "message",
  "input": "Chúc mừng bạn trúng thưởng xe SH, nộp phí 2 triệu để nhận quà…",
  "bank": ""
}
```

**POST /api/ai/scam-report**

```json
{
  "kind": "phone",
  "value": "0120555014",
  "note": "Gọi mạo danh giáo viên",
  "bank": ""
}
```

**POST /api/ai/chat**

```json
{
  "message": "Công thức đạo hàm của hàm hợp là gì?",
  "conversationId": null
}
```

</details>

## Quản trị · Tổng quan

| Phương thức | Đường dẫn | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | Giáo viên / Quản trị | Số liệu tổng hợp, biểu đồ và hoạt động gần đây. |
| `GET` | `/api/admin/meta` | Giáo viên / Quản trị | Danh mục dùng cho form quản trị. |
| `POST` | `/api/admin/sync` | Giáo viên / Quản trị | Đồng bộ toàn bộ dữ liệu: ghi xuống ổ đĩa và yêu cầu mọi thiết bị tải lại. |
| `GET` | `/api/admin/audit` | Giáo viên / Quản trị | Nhật ký hoạt động hệ thống. |
| `GET` | `/api/admin/feedback` | Giáo viên / Quản trị | Đánh giá, góp ý của người dùng. |
| `POST` | `/api/admin/reset-demo` | Ban Giám hiệu | Khôi phục dữ liệu mẫu ban đầu (chỉ Ban Giám hiệu). |

## Quản trị · Tài khoản

| Phương thức | Đường dẫn | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/admin/classes` | Giáo viên / Quản trị | Danh sách lớp và sĩ số. |
| `GET` | `/api/admin/users` | Giáo viên / Quản trị | Danh sách tài khoản. ?role=student\|teacher\|admin&classId=&q=&page=&limit= |
| `POST` | `/api/admin/users` | Giáo viên / Quản trị | Thêm tài khoản học sinh / giáo viên. |
| `PUT` | `/api/admin/users/:id` | Giáo viên / Quản trị | Cập nhật thông tin tài khoản. |
| `DELETE` | `/api/admin/users/:id` | Ban Giám hiệu | Xóa tài khoản (chỉ Ban Giám hiệu). |
| `POST` | `/api/admin/users/:id/reset-password` | Giáo viên / Quản trị | Đặt lại mật khẩu mặc định 123456 (bắt buộc đổi khi đăng nhập). |
| `POST` | `/api/admin/users/:id/lock` | Giáo viên / Quản trị | Khóa / mở khóa tài khoản. |

<details><summary>Ví dụ body</summary>

**POST /api/admin/users**

```json
{
  "id": "2126229999",
  "name": "Nguyễn Văn A",
  "role": "student",
  "classId": "12A1",
  "email": "",
  "phone": "",
  "gender": "Nam",
  "dob": "2009-05-01",
  "password": "123456"
}
```

**PUT /api/admin/users/:id**

```json
{
  "name": "Nguyễn Văn A",
  "classId": "12A2",
  "phone": "",
  "email": ""
}
```

**POST /api/admin/users/:id/lock**

```json
{
  "locked": true
}
```

</details>

## Quản trị · Tố giác & biên bản

| Phương thức | Đường dẫn | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/admin/reports` | Giáo viên / Quản trị | Danh sách tố giác. ?status=&severity=&type=&q= |
| `GET` | `/api/admin/reports/:id` | Giáo viên / Quản trị | Chi tiết tố giác kèm bằng chứng và tiến trình. |
| `PATCH` | `/api/admin/reports/:id` | Giáo viên / Quản trị | Cập nhật tiến độ xử lý, mức độ, phản hồi cho học sinh. |
| `GET` | `/api/admin/records` | Giáo viên / Quản trị | Sổ biên bản vi phạm. ?studentId=&classId=&q= |
| `POST` | `/api/admin/records` | Giáo viên / Quản trị | Thầy cô lập biên bản vi phạm (kèm ảnh hiện trường / biên bản giấy). |
| `DELETE` | `/api/admin/records/:id` | Giáo viên / Quản trị | Hủy biên bản (hoàn lại điểm rèn luyện đã trừ). |

<details><summary>Ví dụ body</summary>

**PATCH /api/admin/reports/:id**

```json
{
  "status": "verifying",
  "severity": "high",
  "note": "Đang trích xuất camera",
  "feedback": "Nhà trường đã tiếp nhận…"
}
```

**POST /api/admin/records**

```json
{
  "studentId": "2126220028",
  "type": "fight",
  "location": "Sân sau",
  "at": "2026-10-18T09:40",
  "description": "…",
  "penalty": "Viết bản tự kiểm điểm",
  "points": 5,
  "photo": "data:image/jpeg;base64,…",
  "reportId": ""
}
```

</details>

## Quản trị · Trắc nghiệm & khảo sát

| Phương thức | Đường dẫn | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/admin/quiz/questions` | Giáo viên / Quản trị | Ngân hàng câu hỏi (kèm đáp án). ?topic=&q= |
| `POST` | `/api/admin/quiz/questions` | Giáo viên / Quản trị | Thêm câu hỏi. |
| `PUT` | `/api/admin/quiz/questions/:id` | Giáo viên / Quản trị | Sửa câu hỏi, phương án, đáp án. |
| `DELETE` | `/api/admin/quiz/questions/:id` | Giáo viên / Quản trị | Xóa câu hỏi. |
| `GET` | `/api/admin/quiz/attempts` | Giáo viên / Quản trị | Kết quả thi đấu của học sinh và bảng vàng. |
| `GET` | `/api/admin/surveys` | Giáo viên / Quản trị | Danh sách đợt khảo sát và tiến độ thu phiếu. |
| `POST` | `/api/admin/surveys` | Giáo viên / Quản trị | Thiết lập đợt khảo sát mới. |
| `PUT` | `/api/admin/surveys/:id` | Giáo viên / Quản trị | Sửa / đóng đợt khảo sát. |
| `DELETE` | `/api/admin/surveys/:id` | Giáo viên / Quản trị | Xóa đợt khảo sát và toàn bộ phiếu trả lời. |
| `GET` | `/api/admin/surveys/:id/results` | Giáo viên / Quản trị | Kết quả tổng hợp theo từng câu và danh sách phiếu trả lời. |

<details><summary>Ví dụ body</summary>

**POST /api/admin/quiz/questions**

```json
{
  "topic": "law",
  "question": "…?",
  "options": [
    "A",
    "B",
    "C",
    "D"
  ],
  "answer": 0,
  "difficulty": "Dễ",
  "explanation": ""
}
```

**POST /api/admin/surveys**

```json
{
  "title": "Khảo sát…",
  "description": "",
  "purpose": "khkt",
  "deadline": "2026-11-30",
  "targetCount": 150,
  "questions": [
    {
      "type": "single",
      "text": "Bạn học khối nào?",
      "options": [
        "10",
        "11",
        "12"
      ]
    }
  ]
}
```

</details>

## Quản trị · Tư vấn & AI Guard

| Phương thức | Đường dẫn | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/admin/counseling` | Giáo viên / Quản trị | Hộp thư tư vấn: danh sách học sinh gửi tâm sự / xin trợ giúp. |
| `GET` | `/api/admin/counseling/:id` | Giáo viên / Quản trị | Nội dung một hộp thư (đánh dấu đã đọc). |
| `POST` | `/api/admin/counseling/:id/messages` | Giáo viên / Quản trị | Chuyên viên phản hồi học sinh. |
| `PATCH` | `/api/admin/counseling/:id` | Giáo viên / Quản trị | Đánh dấu cần gặp trực tiếp để can thiệp / đóng hộp thư. |
| `GET` | `/api/admin/ai/logs` | Giáo viên / Quản trị | Nhật ký hội thoại học sinh ↔ Trợ lý AI. ?flagged=1 chỉ lấy hội thoại có cảnh báo. |
| `GET` | `/api/admin/ai/logs/:id` | Giáo viên / Quản trị | Chi tiết một hội thoại AI. |
| `GET` | `/api/admin/ai/config` | Giáo viên / Quản trị | Cấu hình kết nối AI hiện tại (không trả về khóa API, chỉ 4 ký tự cuối). |
| `PUT` | `/api/admin/ai/config` | Ban Giám hiệu | Lưu cấu hình AI: nhà cung cấp, khóa API, mô hình, bật/tắt từng chức năng. provider: mirai \| anthropic \| gemini \| openai \| custom \| off \| "" (dùng tệp .env). Để trống apiKey để giữ khóa cũ. |
| `POST` | `/api/admin/ai/test` | Giáo viên / Quản trị | Kiểm tra kết nối AI: gửi một câu hỏi ngắn và đo thời gian phản hồi. Gửi kèm cấu hình (provider, apiKey, model, baseUrl) để thử trước khi lưu. |
| `GET` | `/api/admin/ai/guard` | Giáo viên / Quản trị | Cấu hình AI Guard: từ khóa nguy hiểm, độ nhạy, hành động tự động. |
| `PUT` | `/api/admin/ai/guard` | Giáo viên / Quản trị | Lưu cấu hình AI Guard. |
| `GET` | `/api/admin/alerts` | Giáo viên / Quản trị | Cảnh báo đỏ / cam / vàng từ AI Guard, tố giác, chat. ?status=open |
| `PATCH` | `/api/admin/alerts/:id` | Giáo viên / Quản trị | Đánh dấu cảnh báo đã xử lý. |
| `GET` | `/api/admin/scam/stats` | Giáo viên / Quản trị | Thống kê tra cứu lừa đảo và cơ sở dữ liệu cảnh báo. |
| `GET` | `/api/admin/school-chat` | Giáo viên / Quản trị | Luồng tin nhắn kênh chung (cả tin đã xóa / bị gắn cờ) và danh sách bị cấm chat. |
| `DELETE` | `/api/admin/school-chat/:id` | Giáo viên / Quản trị | Gỡ tin nhắn không phù hợp. |
| `POST` | `/api/admin/school-chat/users/:userId/warn` | Giáo viên / Quản trị | Cảnh cáo tài khoản vi phạm quy tắc chat. |
| `POST` | `/api/admin/school-chat/users/:userId/mute` | Giáo viên / Quản trị | Cấm / bỏ cấm chat một tài khoản. |
| `PUT` | `/api/admin/school-chat/lock` | Giáo viên / Quản trị | Khóa / mở kênh chat chung. |

<details><summary>Ví dụ body</summary>

**POST /api/admin/counseling/:id/messages**

```json
{
  "text": "Thầy đã đọc tin nhắn của em…"
}
```

**PATCH /api/admin/counseling/:id**

```json
{
  "flagged": true,
  "status": "open"
}
```

**PUT /api/admin/ai/config**

```json
{
  "provider": "mirai",
  "apiKey": "sk-…",
  "model": "claude-opus-4.8",
  "baseUrl": "https://api.miraiapi.com/v1",
  "features": {
    "chat": true,
    "scam": true
  }
}
```

**POST /api/admin/ai/test**

```json
{}
```

**PUT /api/admin/ai/guard**

```json
{
  "sensitivity": "high",
  "autoAlert": true,
  "autoHotline": true,
  "autoFilterChat": true,
  "keywords": {
    "mental": "tự tử, …",
    "violence": "…",
    "weapons": "…",
    "drugs": "…",
    "cyber": "…"
  }
}
```

**PATCH /api/admin/alerts/:id**

```json
{
  "status": "handled",
  "note": "Đã gặp trực tiếp học sinh"
}
```

**POST /api/admin/school-chat/users/:userId/mute**

```json
{
  "muted": true
}
```

**PUT /api/admin/school-chat/lock**

```json
{
  "locked": true,
  "reason": "Tạm khóa trong giờ kiểm tra"
}
```

</details>

## Quản trị · Nội dung & giao diện

| Phương thức | Đường dẫn | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/admin/handbook` | Giáo viên / Quản trị | Danh sách bài cẩm nang (kể cả đang ẩn). |
| `POST` | `/api/admin/handbook` | Giáo viên / Quản trị | Đăng bài cẩm nang mới. |
| `PUT` | `/api/admin/handbook/:id` | Giáo viên / Quản trị | Sửa / ghim / ẩn bài cẩm nang. |
| `DELETE` | `/api/admin/handbook/:id` | Giáo viên / Quản trị | Xóa bài cẩm nang. |
| `GET` | `/api/admin/news` | Giáo viên / Quản trị | Danh sách bản tin (kể cả đang ẩn). |
| `POST` | `/api/admin/news` | Giáo viên / Quản trị | Đăng bản tin mới. |
| `PUT` | `/api/admin/news/:id` | Giáo viên / Quản trị | Sửa / ghim / ẩn bản tin. |
| `DELETE` | `/api/admin/news/:id` | Giáo viên / Quản trị | Xóa bản tin. |
| `GET` | `/api/admin/settings` | Giáo viên / Quản trị | Cấu hình nhà trường: tên, khẩu hiệu, logo, biểu ngữ, module, đường dây nóng. |
| `PUT` | `/api/admin/settings` | Ban Giám hiệu | Lưu cấu hình (chỉ Ban Giám hiệu). |
| `GET` | `/api/admin/notifications` | Giáo viên / Quản trị | Lịch sử thông báo đã phát. |
| `POST` | `/api/admin/notifications` | Giáo viên / Quản trị | Phát thông báo toàn trường / theo đối tượng / theo lớp. |

<details><summary>Ví dụ body</summary>

**PUT /api/admin/settings**

```json
{
  "schoolName": "Trường THPT Lê Hoàn",
  "slogan": "…",
  "marquee": [
    "…"
  ],
  "modules": {
    "aiChat": true
  },
  "logo": "data:image/png;base64,…"
}
```

**POST /api/admin/notifications**

```json
{
  "target": "all",
  "title": "Thông báo nghỉ học",
  "content": "…",
  "type": "info"
}
```

</details>

## Quản trị · Xuất dữ liệu

| Phương thức | Đường dẫn | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/admin/export/:dataset` | Giáo viên / Quản trị | Xuất Excel (.xlsx): users \| reports \| records \| quiz-attempts \| quiz-questions \| feedback |
| `GET` | `/api/admin/export/survey/:id` | Giáo viên / Quản trị | Xuất toàn bộ phiếu khảo sát ra Excel để phân tích định lượng (SPSS, Excel). |

