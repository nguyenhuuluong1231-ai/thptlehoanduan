# ❓ CÂU HỎI BAN GIÁM KHẢO THƯỜNG HỎI
## + Gợi Ý Trả Lời Mẫu
### Đề tài NCKH KT: Cổng Học Đường Số THPT Lê Hoàn
> **Tác giả:** Vũ Nguyễn An Khang — Lớp 12A1 — THPT Lê Hoàn, Gia Lai  
> **Năm học:** 2025–2026

---

> [!IMPORTANT]
> Học thuộc ý chính, **không đọc y chang** — nói bằng lời của mình sẽ tự nhiên và thuyết phục hơn.

---

## 🔴 NHÓM 1 — CÂU HỎI VỀ LÝ DO & Ý TƯỞNG

### ❓ Q1: "Tại sao em chọn đề tài này?"

**✅ Gợi ý trả lời:**
> *"Thưa Ban Giám khảo, em nhận thấy trường mình chưa có kênh chính thức nào để học sinh tố giác bạo lực học đường một cách an toàn. Nhiều bạn bị bắt nạt nhưng sợ bị trả thù nên không dám lên tiếng. Song song đó, tình trạng lừa đảo qua mạng nhắm vào học sinh ngày càng nhiều. Em muốn dùng công nghệ để giải quyết 2 vấn đề thực tế này — tạo ra một nơi học sinh cảm thấy an toàn cả trong thế giới thực lẫn thế giới số."*

---

### ❓ Q2: "Em đặt tên 'Cổng Học Đường Số' nghĩa là gì?"

**✅ Gợi ý trả lời:**
> *"'Cổng' là điểm vào chính thức — như cổng trường thật. Mọi học sinh đều đi qua đó để vào trường. 'Học Đường Số' là môi trường học đường trên không gian số. Ý em muốn nói: hệ thống này là cổng vào môi trường học đường số, tập trung tất cả dịch vụ hỗ trợ học sinh vào một nơi duy nhất — như một ngôi trường thu nhỏ trên điện thoại."*

---

## 🔴 NHÓM 2 — CÂU HỎI VỀ KỸ THUẬT

### ❓ Q3: "Em xây dựng bằng ngôn ngữ/công nghệ gì?"

**✅ Gợi ý trả lời:**
> *"Hệ thống dùng ba lớp công nghệ: Phần giao diện (Frontend) viết bằng HTML, CSS, JavaScript thuần — không dùng framework nặng để tải nhanh trên điện thoại 4G. Phần xử lý (Backend) chạy Node.js với Bun runtime — nhanh gấp 3 lần Node.js thông thường. Phần trí tuệ nhân tạo dùng Google Gemini AI API. Toàn bộ deploy trên hosting cPanel thông thường — không cần thuê server đắt tiền."*

---

### ❓ Q4: "Hệ thống bảo mật thông tin học sinh như thế nào?"

**✅ Gợi ý trả lời:**
> *"Hệ thống có 3 tầng bảo mật: Tầng 1 — mật khẩu băm bằng thuật toán scrypt, không lưu mật khẩu gốc, kể cả Admin cũng không biết mật khẩu học sinh là gì. Tầng 2 — danh tính tố giác được HMAC-SHA256 ẩn danh hoàn toàn, database không chứa mã số học sinh. Tầng 3 — toàn bộ dữ liệu truyền qua HTTPS bắt buộc, database mã hóa AES-256-GCM — cùng chuẩn bảo mật ngân hàng."*

---

### ❓ Q5: "Tính ẩn danh kỹ thuật đảm bảo ở chỗ nào?"

**✅ Gợi ý trả lời:**
> *"Khi học sinh gửi tố giác, hệ thống lấy mã số học sinh, chạy qua hàm HMAC-SHA256 kết hợp với khóa bí mật — cho ra chuỗi ký tự 64 chữ số ngẫu nhiên. Hệ thống lưu chuỗi này vào database, không lưu mã số gốc. HMAC-SHA256 là hàm một chiều — không có cách nào tính ngược từ chuỗi ký tự đó ra mã số học sinh ban đầu. Học sinh muốn xem hồ sơ của mình thì nhập lại mã số, hệ thống tính lại hash, tìm đúng hồ sơ — nhưng người khác nhìn database chỉ thấy ký tự vô nghĩa."*

---

### ❓ Q6: "PWA là gì? Tại sao không làm app Android/iOS thật?"

**✅ Gợi ý trả lời:**
> *"PWA — Progressive Web App — là công nghệ cho phép website hoạt động như ứng dụng di động. Học sinh cài từ trình duyệt, dùng như app thật, có icon trên màn hình, không cần mạng vẫn mở được giao diện. Lý do em chọn PWA thay vì app native: Một — không cần đăng ký Google Play/App Store mất phí và thời gian. Hai — cùng một code chạy được trên cả Android, iOS, Windows. Ba — cập nhật tức thì không cần người dùng tải version mới. Em có kèm thêm file APK Android để trường có thể phát hành trực tiếp cho những bạn muốn cài từ file."*

---

### ❓ Q7: "AI trong hệ thống của em làm gì? Em tự xây dựng AI không?"

**✅ Gợi ý trả lời:**
> *"Em tích hợp Google Gemini AI thông qua API chính thức — em không tự xây dựng mô hình AI vì điều đó vượt quá phạm vi đề tài. Công việc của em là: Một — thiết kế prompt phù hợp với học sinh THPT và ngữ cảnh Lê Hoàn. Hai — tích hợp AI vào 3 chức năng: trợ lý 24/7, phát hiện lừa đảo qua ngữ nghĩa, và AI Guard lọc nội dung độc hại. Ba — xây dựng logic kết hợp AI với các nguồn dữ liệu khác như Google Safe Browsing."*

---

## 🔴 NHÓM 3 — CÂU HỎI PHẢN BIỆN KHÓ

### ❓ Q8: "Ai thật sự viết code hệ thống này? Em có tự viết không?"

**✅ Gợi ý trả lời:**
> *"Thưa Ban Giám khảo, em sử dụng AI (Claude/Gemini) như một công cụ hỗ trợ — tương tự như học sinh dùng máy tính để tính toán, hay dùng Google để tra cứu tài liệu. AI giúp em viết code nhanh hơn, nhưng em là người: thiết kế toàn bộ kiến trúc hệ thống, đặt ra các yêu cầu kỹ thuật, kiểm thử từng tính năng, phát hiện và sửa lỗi, và đưa ra quyết định về trải nghiệm người dùng. Em hiểu rõ từng dòng code, Ban Giám khảo có thể hỏi về bất kỳ phần nào."*

---

### ❓ Q9: "So với Zalo/Facebook, hệ thống của em có gì hơn?"

**✅ Gợi ý trả lời:**
> *"Zalo và Facebook là mạng xã hội cá nhân — không thiết kế cho môi trường trường học. Hệ thống của em có 4 điểm khác biệt: Một — tố giác ẩn danh kỹ thuật thật sự, Zalo/Facebook luôn biết bạn là ai. Hai — tích hợp AI phát hiện lừa đảo ngay trong ứng dụng. Ba — quản lý bởi nhà trường, dữ liệu thuộc về trường không thuộc về công ty nước ngoài. Bốn — CAPTCHA và giới hạn tốc độ chống bot — Zalo group không có tính năng này."*

---

### ❓ Q10: "Nếu học sinh dùng tố giác để vu khống người khác thì sao?"

**✅ Gợi ý trả lời:**
> *"Đây là vấn đề em đã cân nhắc trong thiết kế. Hệ thống có 2 biện pháp: Một — tố giác ẩn danh chỉ che danh tính với Admin thông thường, nhưng nếu có tình huống pháp lý nghiêm trọng (vu khống, đe dọa tính mạng), Hiệu trưởng có thể yêu cầu trích xuất log server kết hợp với thời điểm gửi để điều tra — đây là lớp bảo vệ cuối. Hai — AI Guard tự động phát hiện nội dung mang tính chất vu khống, kích động — và gắn cờ để Admin xem xét trước khi xử lý."*

---

### ❓ Q11: "Chi phí triển khai thực tế bao nhiêu tiền?"

**✅ Gợi ý trả lời:**
> *"Chi phí rất thấp — đây là điểm em tự hào: Hosting cPanel 1 năm khoảng 500.000–800.000 đồng, tên miền .com khoảng 300.000 đồng/năm, API Google Gemini AI có gói miễn phí đủ dùng cho quy mô một trường. Tổng cộng khoảng 1–1,5 triệu đồng mỗi năm — rẻ hơn 1 cuốn sách giáo khoa. Nếu nhà trường muốn dùng, có thể xin tài trợ từ hội phụ huynh hoặc quỹ CNTT của Sở."*

---

### ❓ Q12: "Hệ thống có thể mở rộng cho trường khác không?"

**✅ Gợi ý trả lời:**
> *"Có — em thiết kế từ đầu với tư duy đa trường. Admin có thể thay logo, tên trường, thông tin liên hệ trực tiếp trên giao diện quản trị mà không cần sửa code. Khi triển khai cho trường mới: cài lên hosting, nhập file Excel danh sách học sinh, cấu hình thông tin trường — xong trong vòng 1–2 tiếng. Mô hình giống như WordPress — một nền tảng, nhiều trường dùng."*

---

### ❓ Q13: "Hạn chế/điểm yếu của đề tài là gì?"

**✅ Gợi ý trả lời:**
> *"Thưa Ban Giám khảo, em thấy có 3 hạn chế chính: Một — hệ thống cần internet để dùng đầy đủ, vùng sâu vùng xa sóng yếu có thể gặp khó khăn — dù giao diện có chế độ offline cơ bản. Hai — Gemini AI đôi khi trả lời chưa chính xác 100% với ngữ cảnh đặc thù Việt Nam — cần người dùng phân biệt và kiểm chứng. Ba — việc phổ biến để toàn trường dùng cần có sự hỗ trợ từ BGH và GVCN — công nghệ tốt mà không ai dùng thì cũng vô nghĩa. Hướng phát triển tiếp theo của em là tích hợp thông báo SMS để hỗ trợ vùng sóng yếu."*

---

### ❓ Q14: "Em học lập trình từ khi nào? Trình độ của em ở đâu?"

**✅ Gợi ý trả lời:**
> *"Em bắt đầu tự học lập trình web từ năm lớp 10 qua YouTube và các khóa học online miễn phí. Đến nay em hiểu về HTML/CSS/JavaScript cơ bản, đọc hiểu được code Node.js và PHP, biết cách sử dụng API của bên thứ ba. Em không phải lập trình viên chuyên nghiệp — nhưng đủ để hiểu hệ thống mình xây dựng hoạt động như thế nào và trả lời câu hỏi kỹ thuật."*

---

## 💡 MẸO TRÌNH BÀY TRƯỚC BAN GIÁM KHẢO

| Tình huống | Cách xử lý |
|-----------|-----------|
| Không biết câu trả lời | *"Thưa Ban Giám khảo, em chưa nghiên cứu kỹ phần đó — em sẽ tìm hiểu thêm."* (Không bịa) |
| Bị hỏi kỹ thuật quá sâu | Giải thích bằng phép ẩn dụ đơn giản, kết thúc bằng *"Về mặt kỹ thuật chi tiết hơn, em có thể gửi tài liệu bổ sung."* |
| Bị ngắt lời | Dừng lại, gật đầu nhẹ, lắng nghe câu hỏi hoàn chỉnh rồi mới trả lời |
| Câu hỏi về tính thực tế | Luôn dẫn chứng: *"Hiện tại web đã live tại tuvantamlihocduonglehoan.com — Ban Giám khảo có thể truy cập kiểm tra ngay."* |

---

## 🌟 CÂU MỞ ĐẦU ĐỀ XUẤT (khi trình bày)

> *"Kính thưa Ban Giám khảo, đề tài của em xuất phát từ một câu hỏi đơn giản: 'Nếu một học sinh đang bị bắt nạt, bị lừa đảo, hoặc đang rất tệ về mặt tâm lý — em ấy có thể tìm đến ai, vào lúc nào, mà không sợ bị phán xét hay lộ danh tính?' Hệ thống Cổng Học Đường Số là câu trả lời của em cho câu hỏi đó."*

