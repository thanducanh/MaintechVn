# HƯỚNG DẪN TRIỂN KHAI SAU KHI CẬP NHẬT

## 1. Những gì đã thay đổi
- Đã xóa toàn bộ module nội bộ: chấm công, hợp đồng, kanban, kế toán, khách hàng,
  chat, HR, jobs, leave, meeting, help, hệ thống phân quyền/logs/IT-support.
- Trang quản trị giờ chỉ còn: **Website (nội dung/ảnh/dịch vụ/sản phẩm/tin tức/liên hệ)**,
  **Liên hệ & Cuộc gọi**, **Thống kê truy cập**, **Cài đặt cá nhân**, **Hồ sơ**.
- Thêm thống kê khách truy cập THẬT theo quốc gia/thành phố (dùng header định vị IP
  miễn phí có sẵn của Vercel), thay số liệu giả trước đây.
- Thêm đếm số liên hệ (form) và số lượt bấm gọi điện.
- Thêm màn hình chọn ngôn ngữ khi khách vào web lần đầu (VN/EN), vẫn giữ nút chuyển
  nhanh không tải lại trang.
- Giới hạn hệ thống chỉ 1 tài khoản admin đăng nhập được.
- Bắt buộc đổi mật khẩu ở lần đăng nhập đầu tiên.

## 2. Các bước triển khai (chạy trên máy bạn, nơi có kết nối mạng)

### Bước 1 — Cài lại thư viện (nếu cần)
```
npm install
```

### Bước 2 — Cập nhật database (Supabase)
Schema Prisma có 2 bảng mới (`PageViewLog`, `CallClickLog`) và 1 cột mới
(`mustChangePassword` trong bảng User). Chạy:
```
npx prisma generate
npx prisma migrate dev --name add_visitor_stats_and_password_flag
```
(Nếu bạn deploy thẳng lên Supabase production, dùng `npx prisma migrate deploy` thay vì `dev`.)

### Bước 3 — Tạo tài khoản admin duy nhất
```
node scripts/create-admin.js "thanhnd" "MatKhauTamThoiCuaBan123" "Nguyễn Đình Thanh"
```
Ghi nhớ lại username/mật khẩu tạm này để đăng nhập lần đầu — hệ thống sẽ bắt bạn đổi
mật khẩu ngay sau khi đăng nhập.

### Bước 4 — Thêm biến môi trường trên Vercel
Vào Project Settings → Environment Variables, thêm:
```
ADMIN_USERNAME=thanhnd
```
(phải trùng username bạn tạo ở Bước 3 — chỉ tài khoản này mới đăng nhập được).

### Bước 5 — Đẩy code lên GitHub → Vercel tự deploy
```
git add .
git commit -m "Thu gọn hệ thống: chỉ giữ website công khai + quản trị nội dung, thêm thống kê thật, song ngữ, 1 admin"
git push
```

## 3. Việc bạn có thể làm sau (không bắt buộc ngay)
- Các bảng dữ liệu cũ (chấm công, hợp đồng, kế toán...) vẫn còn tồn tại trong database
  (không bị xóa) để an toàn — chỉ giao diện quản lý bị gỡ. Nếu muốn xóa hẳn các bảng
  đó khỏi database để gọn nhẹ hơn, nói với mình ở lượt sau, mình sẽ viết migration xóa.
- Có thể muốn thêm bản đồ trực quan (thay vì danh sách) cho phần thống kê quốc gia.
