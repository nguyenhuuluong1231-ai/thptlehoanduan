# App Android · Cổng Học Đường Số THPT Lê Hoàn

App dùng **chung giao diện và chung máy chủ** với trang web:

- Học sinh, thầy cô đăng nhập bằng tài khoản như trên web.
- Tin nhắn, thông báo, tố giác, khảo sát… **đồng bộ tức thời** giữa app và web (realtime).
- Đầy đủ chức năng, giao diện tự chuyển sang **bản gọn cho điện thoại**: thanh tab dưới cùng, tin nhắn gom một chỗ, chấm đỏ báo tin mới.
- Chụp ảnh tố giác, gửi ảnh, video, tệp trong chat, định vị GPS đều chạy trong app.
- Chưa kết nối máy chủ? App vẫn mở được ở **bản trải nghiệm** (dữ liệu mẫu lưu trên máy).

## Cách 1 · Không cần cài gì: build APK bằng GitHub (khuyên dùng)

1. Tạo kho (repository) trên GitHub và tải **toàn bộ thư mục dự án** lên (có thư mục `.github`).
2. Vào tab **Actions** → chọn **Build APK Android** → **Run workflow**.
   Ô *Địa chỉ máy chủ trường* có thể điền sẵn, ví dụ `https://lehoan.edu.vn` hoặc `http://192.168.1.10:3000`.
3. Đợi 5–8 phút. Mở lần chạy vừa xong → mục **Artifacts** → tải **LeHoan-APK** (tệp .zip chứa tệp `.apk`).
4. Chép tệp `.apk` vào điện thoại Android → mở để cài (cho phép *Cài ứng dụng không rõ nguồn gốc* nếu được hỏi).

## Cách 2 · Build trên máy tính bằng Android Studio

Cần: Node.js 20+, [Android Studio](https://developer.android.com/studio) (đã có sẵn JDK 21 và Android SDK).

```bash
cd mobile
npm install
npm run android:init      # lần đầu: tạo thư mục android/, quyền camera/GPS, biểu tượng app
npm run android:open      # mở Android Studio → Build → Build App Bundle(s) / APK(s) → Build APK(s)
```

Hoặc build thẳng bằng dòng lệnh: `npm run apk` (Windows: `npm run apk:win`).
Tệp tạo ra: `mobile/android/app/build/outputs/apk/debug/app-debug.apk`.

Mỗi lần sửa giao diện web, chạy lại `npm run android:sync` rồi build lại.

## Kết nối máy chủ trường

App cần gọi tới máy chủ Node.js của trường (`npm start` ở thư mục gốc dự án):

| Máy chủ đặt ở | Địa chỉ điền vào app |
|---|---|
| Máy tính trong trường, điện thoại cùng Wi-Fi | `http://<IP máy tính>:3000`, ví dụ `http://192.168.1.10:3000` (xem IP bằng lệnh `ipconfig` trên Windows) |
| Máy chủ có tên miền | `https://lehoan.edu.vn` |

Có 3 cách đặt địa chỉ:

- Sửa `serverUrl` trong `mobile/app.config.json` trước khi build.
- Điền ô *Địa chỉ máy chủ trường* khi chạy workflow, hoặc đặt biến `SERVER_URL` trên GitHub.
- Người dùng tự nhập trong app: trang đăng nhập → **Máy chủ trường → Đổi**.

## Cài như ứng dụng mà không cần APK (iPhone & Android)

Khi trang web chạy qua **HTTPS** (hoặc `localhost`), mở bằng Chrome/Safari rồi chọn **Thêm vào màn hình chính**.
App sẽ mở toàn màn hình, có biểu tượng riêng, giao diện giống hệt bản APK. Trong app cũng có nút **Cài app lên điện thoại** ở mục Cá nhân.

## Ghi chú kỹ thuật

- Đóng gói bằng [Capacitor 7](https://capacitorjs.com): `scripts/build-www.mjs` chép `public/` + `shared/` vào `www/` và sinh `www/config.js` chứa địa chỉ máy chủ.
- `scripts/patch-android.mjs` thêm quyền CAMERA, vị trí, đọc ảnh/video, cho phép `http` trong mạng nội bộ, chép biểu tượng từ `resources/android/`.
- Máy chủ đã bật CORS cho API, kênh realtime (SSE) và tệp tải lên nên app gọi được từ `http://localhost` của WebView.
- APK debug dùng để cài trực tiếp trong trường. Muốn đưa lên Google Play cần ký bản release (`./gradlew bundleRelease` với keystore riêng).
