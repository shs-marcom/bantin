# Hướng dẫn vận hành Bản tin nội bộ SHS (trang lật)

Gồm 3 trang:

| Trang | Ai dùng | Đường dẫn |
|---|---|---|
| Trang công khai | Toàn bộ CBNV | `https://<tài-khoản>.github.io/bantin/` |
| Trang quản trị | Marcom (đăng, sửa, ẩn, xóa bản tin) | `.../bantin/admin.html` |
| Trang thiết lập | Chỉ quản trị viên (cấp tài khoản, thay mã) | `.../bantin/setup.html` |

Trang quản trị và thiết lập không có link từ trang chủ, không lên Google. Người ngoài vào cũng không làm được gì nếu không có mật khẩu.

---

## PHẦN 1. DÀNH CHO QUẢN TRỊ VIÊN

### A. Đưa site lên GitHub (làm 1 lần, khoảng 10 phút)

1. Đăng nhập GitHub bằng tài khoản chung của Marcom.
2. **New repository** → tên `bantin` → chọn **Public** → **Create repository**.
3. Bấm **uploading an existing file**, kéo toàn bộ nội dung bên trong thư mục `bantin-shs` (đã giải nén) vào → **Commit changes**.
   Kéo các file và thư mục bên trong, không kéo cả thư mục cha. File `.nojekyll` bị ẩn trên một số máy: bật hiển thị file ẩn hoặc tạo tay file rỗng tên `.nojekyll` trên GitHub (**Add file → Create new file**).
4. **Settings → Pages** → *Source*: **Deploy from a branch**, branch **main**, thư mục **/ (root)** → **Save**.
5. Chờ 1 đến 2 phút, link hiện ở đầu trang Pages.

### B. Tạo mã truy cập GitHub (khoảng 5 phút)

1. Ảnh đại diện góc phải → **Settings** → cuối menu trái **Developer settings** → **Personal access tokens** → **Fine-grained tokens** → **Generate new token**.
2. Điền:
   - *Token name*: `bantin-admin`
   - *Expiration*: **Custom**, chọn ngày xa nhất GitHub cho phép (thường 1 năm). **Ghi lại ngày này.**
   - *Repository access*: **Only select repositories** → chọn `bantin`. Chỉ chọn repo này, không chọn repo khác.
   - *Permissions → Repository permissions* → **Contents**: **Read and write**. Các mục khác để nguyên.
3. **Generate token** → copy mã (dạng `github_pat_...`). GitHub chỉ hiện mã 1 lần.

### C. Thiết lập lần đầu (khoảng 3 phút)

1. Mở `.../bantin/setup.html`.
2. Điền repo (đã tự điền sẵn), dán mã vừa tạo, ngày hết hạn đã ghi, tên của anh/chị, mật khẩu tối thiểu 12 ký tự.
3. Bấm **Kiểm tra mã và lưu thiết lập**. Mã được mã hóa bằng mật khẩu trước khi lưu, rồi trang chuyển sang màn quản lý.
4. Sau bước này có thể xóa mã khỏi clipboard, không cần giữ ở đâu khác.

### D. Cấp tài khoản cho nhân viên

1. `setup.html` → đăng nhập → khung **Thêm người dùng**: tên, vai trò, mật khẩu.
   - **Biên tập viên**: đăng, sửa, ẩn, xóa bản tin.
   - **Quản trị viên**: thêm quyền vào trang thiết lập. Nên có 2 người (anh/chị và 1 người dự phòng) để không bị khóa ngoài khi quên mật khẩu.
2. Gửi link `admin.html` và mật khẩu cho nhân viên qua kênh riêng (Zalo cá nhân, không gửi vào nhóm).
3. Chờ 1 đến 2 phút trước khi nhân viên đăng nhập lần đầu.

Mật khẩu nên là cụm 4 từ nối bằng gạch, vd `bantin-hoa-sen-thang-muoi`: dễ nhớ, khó dò.

### E. Việc định kỳ và khi có biến động

| Tình huống | Làm gì |
|---|---|
| Nhân viên quên mật khẩu | `setup.html` → **Đặt lại mật khẩu** cạnh tên người đó |
| Nhân viên nghỉ việc | **Xóa** người đó. Nếu người này rành kỹ thuật, làm thêm **Thu hồi triệt để** |
| Mã GitHub sắp hết hạn (trang quản trị báo trước 30 ngày) | Tạo mã mới theo mục B → `setup.html` → **Kiểm tra và thay mã** → xóa mã cũ trên GitHub. Mật khẩu mọi người giữ nguyên |
| Nghi lộ mật khẩu | **Thu hồi triệt để**: cần mã GitHub mới và đặt mật khẩu mới cho mọi người |
| Quản trị viên duy nhất quên mật khẩu | Xóa file `auth.json` trên GitHub, tạo lại file với nội dung `{"v":1,"users":[]}`, rồi làm lại mục C và D |

**Giao 1 người phụ trách gia hạn mã hằng năm**, đặt lịch nhắc trước 1 tháng. Mã hết hạn là cả team không đăng được bài.

---

## PHẦN 2. DÀNH CHO NHÂN VIÊN MARCOM

### Đăng nhập

Mở `admin.html` → chọn tên → nhập mật khẩu. Đóng tab trình duyệt là tự đăng xuất.

### Đăng số mới (khoảng 2 phút)

1. Xuất PDF từ Canva: **Share → Download → PDF Standard**. Nên dưới 10MB, tối đa 25MB. File nặng thì nén qua ilovepdf.com hoặc Smallpdf.
2. Bấm **+ Thêm số mới** → điền tên, số (vd "Số 11/2026"), ngày đăng, mô tả ngắn → kéo thả PDF → **Lưu**.
3. Khoảng 1 đến 2 phút sau số mới lên đầu trang công khai. Tên file và link do hệ thống tự đặt.

### Sửa, ẩn, xóa

- **Sửa**: đổi tên, số, ngày, mô tả, hoặc thay file PDF. Link đã gửi CBNV giữ nguyên.
- **Ẩn**: gỡ tạm khỏi trang chủ, link cũ vẫn mở được. Bấm **Hiện lại** để đưa về.
- **Xóa**: xóa hẳn, link đã gửi sẽ không mở được. Chỉ dùng khi chắc chắn.

### Sổ tay VHDN

Sổ tay là mục riêng: hiện thành khối riêng trên trang chủ, có nút **Sổ tay VHDN** trên thanh menu, và link ngắn để gửi CBNV: `https://<tài-khoản>.github.io/bantin/so-tay.html`

- **Đăng lần đầu**: trang quản trị → khu **Sổ tay VHDN** → **Đăng Sổ tay VHDN** → điền tên, ngày, mô tả → kéo thả PDF → **Lưu**.
- **Cập nhật phiên bản mới**: bấm **Sửa** ở khu Sổ tay → kéo thả PDF mới. Link giữ nguyên.
- Chỉ có 1 Sổ tay, không có nút Xóa. Muốn gỡ tạm thì dùng **Ẩn**.
- File in ấn thường rất nặng (bản in gốc là 32MB). Phải nén dưới 25MB trước khi đăng, nên khoảng 10MB.

### Gửi cho CBNV

- Mở số cần gửi trên trang công khai → nút **Chia sẻ** để copy link (giữ cả trang đang xem).
- Gửi Zalo/Teams dạng link text thường.
- Gửi toàn công ty thì **chia đợt theo khối**, không bắn cùng lúc, tránh GitHub giới hạn truy cập.

---

## PHẦN 3. LƯU Ý CHUNG

- Trang để **Public**: ai có link đều xem được. Chỉ đăng nội dung đã duyệt để công khai.
- **Dung lượng**: GitHub Pages giới hạn 1GB. Thanh dung lượng ở trang quản trị cho biết đã dùng bao nhiêu. Xóa bản tin **không** giải phóng dung lượng (GitHub giữ lịch sử), nên duyệt kỹ bản cuối trước khi đăng, hạn chế thay file nhiều lần. Chạm khoảng 70% thì báo quản trị viên để tách repo lưu trữ theo năm.
- **Lịch sử**: mọi thao tác ghi tên người làm, xem ở cuối trang quản trị. Khôi phục bản cũ của một file: vào GitHub, mở file đó → **History**.
- Mở file `index.html` trực tiếp trên máy sẽ báo lỗi. Xem trên link GitHub Pages là chạy bình thường.
- Chuyển sang server nội bộ SHS sau này: IT copy nguyên thư mục lên web server là trang công khai chạy được. Trang quản trị vẫn ghi vào GitHub, cần IT điều chỉnh nếu đổi nơi lưu.
