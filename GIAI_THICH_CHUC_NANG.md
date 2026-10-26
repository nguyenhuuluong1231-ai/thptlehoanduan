# 🎓 GIẢI THÍCH CÁC CHỨC NĂNG HỆ THỐNG
## Cổng Học Đường Số THPT Lê Hoàn
> **Tác giả:** Vũ Nguyễn An Khang — Lớp 12A1 — THPT Lê Hoàn, Gia Lai  
> **Năm học:** 2025–2026

---

## 🗂️ TỔNG QUAN HỆ THỐNG

Hệ thống gồm **3 phân hệ** phục vụ cho:
- 👨‍🎓 **Học sinh** — giao diện điện thoại (ứng dụng PWA/APK)
- 👩‍🏫 **Giáo viên / Chuyên viên tư vấn** — giao diện riêng
- 🛡️ **Quản trị viên (BGH, Admin)** — bảng điều khiển toàn trường

---

## 👨‍🎓 NHÓM 1 — BẢO VỆ HỌC SINH AN TOÀN

### 🔒 1. Tố Giác Vi Phạm Ẩn Danh
- Học sinh gửi tố giác hành vi bạo lực học đường, vi phạm nội quy mà **không lộ danh tính**
- Hệ thống dùng mã hóa HMAC-SHA256 để tạo "mã tố giác" — không ai (kể cả Admin) biết ai đã gửi
- Học sinh vẫn có thể theo dõi tiến trình xử lý hồ sơ của mình qua mã cá nhân

**🎤 Nói gọn:** *"Học sinh tố cáo vi phạm mà không sợ bị lộ tên, hệ thống xử lý kín hoàn toàn."*

---

### 💙 2. Tư Vấn Tâm Lý Học Đường 24/7
- Chat trực tiếp với **chuyên viên tư vấn tâm lý** của trường — ẩn danh hoặc có tên
- Trò chuyện bảo mật, giáo viên không đọc được nội dung (chỉ chuyên viên tư vấn)
- Hỗ trợ ngoài giờ học, cuối tuần, kỳ nghỉ — **hoạt động 24/7**

**🎤 Nói gọn:** *"Học sinh có thể tâm sự với chuyên viên tâm lý bất cứ lúc nào, kể cả lúc 2 giờ sáng, hoàn toàn bí mật."*

---

### 😊 3. Theo Dõi Cảm Xúc Hàng Ngày
- Mỗi ngày học sinh "check-in" cảm xúc: vui 😊 / bình thường 😐 / buồn 😔 / căng thẳng 😰
- Hệ thống AI phân tích xu hướng cảm xúc theo thời gian
- Nếu phát hiện học sinh liên tục trạng thái tiêu cực → **tự động cảnh báo** chuyên viên tư vấn

**🎤 Nói gọn:** *"Giống như 'nhiệt kế cảm xúc' — theo dõi sức khỏe tinh thần học sinh hàng ngày."*

---

## 📡 NHÓM 2 — KẾT NỐI NHÀ TRƯỜNG

### 💬 4. Chat Với Giáo Viên Chủ Nhiệm
- Nhắn tin trực tiếp với GVCN, hỏi bài, xin phép — **không cần số điện thoại cá nhân**
- Lịch sử tin nhắn được lưu trữ, không mất khi đổi điện thoại
- Giáo viên có thể nhắn cho từng học sinh hoặc cả lớp

**🎤 Nói gọn:** *"Thay thế Zalo cá nhân — liên lạc thầy cô qua kênh chính thức của trường."*

---

### 📋 5. Gửi & Theo Dõi Đơn Nghỉ Học
- Gửi đơn nghỉ học trực tuyến kèm ảnh chụp giấy phép
- GVCN duyệt đơn → học sinh nhận thông báo ngay lập tức
- Lưu lịch sử tất cả đơn nghỉ theo năm học

**🎤 Nói gọn:** *"Không cần photo giấy tờ hay đến trường sớm — gửi đơn từ nhà, theo dõi trực tuyến."*

---

### 📢 6. Bản Tin Trường & Chat Chung
- Nhà trường đăng thông báo, bản tin → học sinh nhận ngay trên app
- Phòng chat chung theo lớp để thảo luận học tập
- Học sinh nhận thông báo Push Notification khi có bản tin mới

**🎤 Nói gọn:** *"Bảng tin điện tử — thay thế bảng tin giấy ngoài hành lang, không bỏ sót thông báo nào."*

---

## 🤖 NHÓM 3 — AI PHÒNG CHỐNG LỪA ĐẢO

### 🔍 7. Tra Cứu Lừa Đảo 4-Trong-1
Kiểm tra nghi ngờ lừa đảo qua **4 nguồn cùng lúc**:
1. 🗄️ **Database nội bộ** (do nhà trường xây dựng)
2. 🌐 **Google Safe Browsing API** (cơ sở dữ liệu của Google)
3. 📱 **Cảnh báo số điện thoại lừa đảo** (nguồn cộng đồng)
4. 🤖 **AI phân tích ngữ nghĩa** (đọc hiểu nội dung tin nhắn)

Học sinh chỉ cần paste link/số điện thoại/đoạn văn → hệ thống trả lời ngay

**🎤 Nói gọn:** *"Như 'bộ lọc lừa đảo' — học sinh nhận tin nhắn lạ thì kiểm tra ngay, tránh bẫy scam."*

---

### 🧠 8. Trợ Lý AI 24/7 (Gemini AI)
- Tích hợp **Google Gemini AI** — trả lời mọi câu hỏi học tập, cuộc sống
- Được "huấn luyện" thêm thông tin về trường THPT Lê Hoàn, Gia Lai
- Hỗ trợ giải thích bài tập, tư vấn hướng nghiệp, giải đáp thắc mắc

**🎤 Nói gọn:** *"Gia sư AI cá nhân hoạt động 24/7 — không cần internet tốc độ cao, chỉ cần điện thoại."*

---

### 🛡️ 9. AI Guard — Lọc Nội Dung Độc Hại
- Tự động quét nội dung chat, bản tin → phát hiện ngôn ngữ thù địch, nội dung 18+
- Nếu phát hiện → xóa tin nhắn + ghi log để Admin xem xét
- Không cần con người ngồi kiểm duyệt từng tin nhắn

**🎤 Nói gọn:** *"Bảo vệ tự động — không để nội dung xấu lan truyền trong môi trường học đường."*

---

## 🎮 NHÓM 4 — GIÁO DỤC & VUI HỌC

### ⚔️ 10. Đấu Trường Trắc Nghiệm
- Học sinh thi trắc nghiệm theo chủ đề: phòng chống lừa đảo, an toàn mạng, kỹ năng sống
- Hệ thống tính điểm, xếp hạng bảng vàng toàn trường
- Giáo viên tạo bộ đề mới bất kỳ lúc nào

**🎤 Nói gọn:** *"Gamification giáo dục — học mà chơi, thi mà vui, cạnh tranh lành mạnh."*

---

### 📊 11. Khảo Sát Ý Kiến Học Sinh
- BGH/GVCN tạo khảo sát nhanh → học sinh trả lời ngay trên app
- Kết quả thống kê thời gian thực, xuất báo cáo Excel
- Bảo đảm ẩn danh nếu khảo sát nhạy cảm

**🎤 Nói gọn:** *"Hộp thư góp ý điện tử — nhanh hơn phiếu giấy 100 lần."*

---

## 🛠️ NHÓM 5 — QUẢN TRỊ NHÀ TRƯỜNG

### 📊 12. Bảng Điều Khiển (Dashboard)
- BGH thấy toàn bộ hoạt động: số học sinh online, số tố giác chờ xử lý, cảm xúc toàn trường
- Biểu đồ thống kê theo ngày/tuần/tháng
- Cảnh báo đỏ khi có tình huống khẩn cấp cần xử lý ngay

---

### 🔐 13. Quản Lý Tài Khoản & Phân Quyền
- Admin tạo tài khoản hàng loạt cho toàn trường (import từ Excel)
- Phân quyền chi tiết: Học sinh / GVCN / Chuyên viên / BGH / Admin
- Reset mật khẩu, khoá tài khoản vi phạm

---

### 💾 14. Sao Lưu & Xuất Dữ Liệu
- Tự động sao lưu database mỗi ngày
- Xuất báo cáo Excel: danh sách tố giác, thống kê cảm xúc, lịch sử đơn nghỉ
- Khôi phục dữ liệu chỉ bằng 1 click

---

## 📌 TÓM TẮT NHANH (học thuộc để trình bày)

| # | Chức năng | Ý nghĩa |
|---|-----------|---------|
| 1 | Tố giác ẩn danh | An toàn khi tố cáo |
| 2 | Tư vấn tâm lý 24/7 | Hỗ trợ sức khỏe tinh thần |
| 3 | Check-in cảm xúc | Phát hiện sớm học sinh có vấn đề |
| 4 | Chat giáo viên | Liên lạc chính thức, có lưu trữ |
| 5 | Đơn nghỉ học online | Thủ tục không cần giấy tờ |
| 6 | Bản tin trường | Thông báo tức thì |
| 7 | Tra cứu lừa đảo | Phòng vệ 4-trong-1 |
| 8 | Trợ lý AI | Gia sư 24/7 |
| 9 | AI Guard | Lọc nội dung tự động |
| 10 | Đấu trường trắc nghiệm | Học qua trò chơi |
| 11 | Khảo sát ý kiến | Phản hồi nhanh |
| 12–14 | Quản trị, Sao lưu | Vận hành hiệu quả |

