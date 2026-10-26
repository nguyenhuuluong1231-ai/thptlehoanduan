# 🔐 GIẢI THÍCH BẢO MẬT & MÃ HÓA HỆ THỐNG
## Cổng Học Đường Số THPT Lê Hoàn
> **Tác giả:** Vũ Nguyễn An Khang — Lớp 12A1 — THPT Lê Hoàn, Gia Lai

---

## 🏰 MÔ HÌNH BẢO MẬT 3 TẦNG

```
┌─────────────────────────────────────────────────┐
│  TẦNG 3 — Bảo vệ đường truyền                  │
│  HTTPS + AES-256-GCM                            │
├─────────────────────────────────────────────────┤
│  TẦNG 2 — Bảo vệ danh tính ẩn danh             │
│  HMAC-SHA256 (tố giác)                          │
├─────────────────────────────────────────────────┤
│  TẦNG 1 — Bảo vệ mật khẩu & phiên đăng nhập    │
│  scrypt + HMAC-SHA256 Token                     │
└─────────────────────────────────────────────────┘
```

---

## 🔑 TẦNG 1 — Bảo Vệ Mật Khẩu & Đăng Nhập

### Mật khẩu: Hàm băm `scrypt`
- Khi học sinh tạo mật khẩu → hệ thống **không lưu mật khẩu gốc**
- Thay vào đó dùng thuật toán **`scrypt`** (chuẩn NIST) + **muối ngẫu nhiên (salt)** để tạo "dấu vân tay số"
- Kết quả lưu trông giống: `a3f9d2...8c1e` (64 ký tự hex vô nghĩa)
- **Ý nghĩa:** Dù hacker lấy được database, **không thể đọc ngược ra mật khẩu**

> 🎤 **Nói trước Ban Giám khảo:**  
> *"Mật khẩu được băm bằng scrypt — giống như băm thịt, không thể ráp lại thành miếng thịt ban đầu. Kể cả Admin cũng không biết mật khẩu của học sinh là gì."*

---

### Token đăng nhập: `HMAC-SHA256`
- Sau khi đăng nhập thành công → hệ thống cấp **Token** (như thẻ thành viên tạm thời)
- Token được ký bằng **HMAC-SHA256** với khóa bí mật 256-bit
- Token có **thời hạn** (tự hết hạn sau N ngày)
- Khi đổi mật khẩu / "Đăng xuất mọi thiết bị" → **toàn bộ token cũ bị vô hiệu hóa ngay lập tức**

> 🎤 **Nói trước Ban Giám khảo:**  
> *"Token như vé vào cửa có thời hạn — sau khi hết hạn hoặc bị thu hồi, không ai dùng lại được, kể cả người đang giữ vé đó."*

---

### Bảo vệ chống đăng nhập sai hàng loạt (Brute-force)
- Sai mật khẩu **3 lần** → tài khoản tự động bị khoá tạm thời
- **Rate limiting:** Giới hạn số lần gọi API trong 1 phút
- **CAPTCHA 5 số:** Giao diện web máy tính yêu cầu xác thực người thật

---

## 🕵️ TẦNG 2 — Bảo Vệ Danh Tính Tố Giác Ẩn Danh

### Cơ chế: `HMAC-SHA256` một chiều
Khi học sinh gửi tố giác:

```
MSHS (ví dụ: 2126220004)
          ↓  HMAC-SHA256 + khóa bí mật
"mã tố giác" = a7f3c9d2... (chuỗi 64 ký tự)
          ↓
Lưu vào database: CHỈ lưu "mã tố giác", KHÔNG lưu MSHS
```

- **Database không chứa MSHS** → không ai truy vết danh tính
- Học sinh nhập lại MSHS → hệ thống tạo lại "mã tố giác" → tìm đúng hồ sơ của mình
- **Ngay cả Admin** không thể biết hồ sơ tố giác đó là của học sinh nào

> 🎤 **Nói trước Ban Giám khảo:**  
> *"Giống như mã vạch ẩn — học sinh có chìa khóa (MSHS), mở được hồ sơ của mình. Nhưng người khác nhìn vào database chỉ thấy chuỗi ký tự vô nghĩa, không tìm được chủ nhân."*

---

## 🔒 TẦNG 3 — Bảo Vệ Đường Truyền Dữ Liệu

### HTTPS bắt buộc (TLS 1.2/1.3)
- Toàn bộ dữ liệu truyền giữa điện thoại ↔ server được **mã hóa hoàn toàn**
- File `.htaccess` tự động chuyển `http://` → `https://` (301 Permanent)
- Không thể nghe lén bằng cách bắt gói tin trên mạng

---

### Đồng bộ Server: `AES-256-GCM`
Khi deploy bản cập nhật từ máy tính lên hosting:
- Toàn bộ gói tin được mã hóa **AES-256-GCM** (Advanced Encryption Standard, 256-bit)
- **GCM** (Galois/Counter Mode) = vừa mã hóa vừa xác thực toàn vẹn — nếu gói tin bị giả mạo giữa đường → server từ chối
- Đây là **chuẩn mã hóa quân sự** — được NATO, NSA, ngân hàng dùng

> 🎤 **Nói trước Ban Giám khảo:**  
> *"AES-256 nghĩa là có 2 mũ 256 cách giải mã — con số đó lớn hơn tổng số nguyên tử trong vũ trụ. Siêu máy tính mạnh nhất thế giới cần hàng tỷ tỷ năm để bẻ khóa."*

---

### Database: Mã hóa tại chỗ `AES-256-GCM`
- File `data/db.json` (chứa toàn bộ dữ liệu) được mã hóa AES-256-GCM
- Khóa giải mã lưu riêng tại `data/db.key` (trên server riêng biệt)
- Dù hacker lấy được file `db.json` → **không đọc được** vì không có `db.key`

---

### Mã nguồn JavaScript: Obfuscation + XOR
- Code JavaScript được **làm rối (obfuscate)** + mã hóa **XOR + Base64** trước khi phát hành
- Nhúng thẳng vào HTML → tab Network của trình duyệt không thể đọc logic
- Bảo vệ bí quyết kỹ thuật, ngăn sao chép trái phép

---

## 📋 BẢNG TỔNG HỢP BẢO MẬT

| Lớp bảo vệ | Kỹ thuật | Mục đích |
|------------|----------|---------|
| Mật khẩu | `scrypt` + salt | Không thể đọc ngược mật khẩu |
| Phiên đăng nhập | `HMAC-SHA256` Token | Xác thực, thu hồi được |
| Chống brute-force | Rate limit + Lockout | Ngăn đoán mật khẩu hàng loạt |
| Tố giác ẩn danh | `HMAC-SHA256` 1 chiều | Ẩn danh thật sự kỹ thuật |
| Đường truyền | `HTTPS / TLS 1.3` | Mã hóa kết nối mạng |
| Deploy server | `AES-256-GCM` | Chuẩn quân sự, toàn vẹn dữ liệu |
| Database | `AES-256-GCM` | Dữ liệu mã hóa tại chỗ |
| Mã nguồn JS | `XOR + Base64` Obfuscation | Bảo vệ bí quyết kỹ thuật |

---

## 🎯 CÂU TRẢ LỜI NHANH KHI BAN GIÁM KHẢO HỎI

**"Hệ thống bảo mật bằng gì?"**
> *"Hệ thống dùng 3 tầng bảo mật: Tầng 1 — mật khẩu băm bằng scrypt không thể đảo ngược; Tầng 2 — danh tính tố giác được HMAC-SHA256 ẩn danh hoàn toàn; Tầng 3 — toàn bộ truyền dẫn dùng AES-256-GCM chuẩn quân sự và HTTPS bắt buộc."*

**"Tính ẩn danh đảm bảo chỗ nào?"**
> *"Database không lưu mã số học sinh, chỉ lưu giá trị HMAC-SHA256 của nó — là hàm một chiều, không thể đảo ngược. Ngay cả Admin truy cập database trực tiếp cũng không biết hồ sơ đó thuộc học sinh nào."*

