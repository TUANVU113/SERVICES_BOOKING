# 💈 GENTLEMAN BARBER - HỆ THỐNG ĐẶT LỊCH CẮT TÓC ONLINE

Dự án website đặt lịch cắt tóc trực tuyến **Gentleman Barber Shop**, bao gồm hệ thống **Backend RESTful API (ASP.NET Core)** và **Frontend Web App (Next.js 16)** với giao diện hiện đại, tối ưu cho trải nghiệm người dùng trên cả máy tính và điện thoại.

---

## 🛠️ Công Nghệ Sử Dụng

### 1. Backend (API Server)
- **Framework:** ASP.NET Core Web API (.NET 8)
- **Database:** Microsoft SQL Server
- **ORM:** Entity Framework Core (EF Core)
- **Authentication:** JWT (JSON Web Token) / Cookie-based session
- **Địa chỉ API mặc định:** `https://localhost:7118`

### 2. Frontend (Client Web App)
- **Framework:** Next.js 16 (React 19 App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Lucide React Icons
- **HTTP Proxy:** Next.js API Routes Proxy
- **Địa chỉ Web mặc định:** `http://localhost:3000`

---

## 📋 Yêu Cầu Môi Trường (Prerequisites)

Trước khi bắt đầu cài đặt, hãy đảm bảo máy tính của bạn đã cài sẵn:
1. **Node.js:** Phiên bản `>= 18.x` ([Tải Node.js](https://nodejs.org/))
2. **.NET SDK:** Phiên bản `.NET 8.0` SDK ([Tải .NET SDK](https://dotnet.microsoft.com/download))
3. **SQL Server:** SQL Server Express / Developer / SSMS hoặc LocalDB.

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 🔴 BƯỚC 1: Khởi Chạy Backend (ASP.NET Core API)

1. Mở Terminal / PowerShell và di chuyển vào thư mục Backend:
   ```bash
   cd Backend/Backend
   ```

2. Cấu hình chuỗi kết nối Database trong file `appsettings.json`:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=YOUR_SERVER_NAME;Database=ServiceBookingDb;Trusted_Connection=True;TrustServerCertificate=True;"
   }
   ```

3. Cập nhật Database (Tạo bảng và dữ liệu mẫu):
   ```bash
   dotnet ef database update
   ```
   *(Nếu chưa cài EF Core CLI, chạy: `dotnet tool install --global dotnet-ef`)*

4. Khởi chạy Backend Server:
   ```bash
   dotnet run
   ```
   => Backend API sẽ hoạt động tại: **`https://localhost:7118`** (Bạn có thể truy cập Swagger tại `https://localhost:7118/swagger` để kiểm tra các API).

---

### 🟢 BƯỚC 2: Khởi Chạy Frontend (Next.js Web App)

1. Mở một cửa sổ Terminal mới và di chuyển vào thư mục Frontend:
   ```bash
   cd Fontend/service-booking
   ```

2. Cài đặt các gói thư viện phụ thuộc (Dependencies):
   ```bash
   npm install
   ```

3. Khởi chạy môi trường phát triển (Development Mode):
   ```bash
   npm run dev
   ```

4. Mở trình duyệt web và truy cập địa chỉ:
   => **`http://localhost:3000`**

---

## 📁 Cấu Trúc Thư Mục Dự Án (Frontend)

```text
service-booking/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API Proxy Routes trung gian kết nối Backend API
│   │   │   ├── auth/           # API Đăng nhập / Đăng ký
│   │   │   ├── bookings/       # API Đặt lịch, Xem lịch, Hủy lịch, Khung giờ trống
│   │   │   ├── services/       # API Quản lý Dịch vụ (Xem/Thêm/Khóa)
│   │   │   └── staffs/         # API Quản lý Nhân viên & Ca làm việc theo ngày
│   │   ├── admin/              # Trang Quản trị viên (Admin Dashboard)
│   │   └── page.tsx            # Trang chủ Client
│   ├── components/             # UI Components
│   │   ├── auth/               # Modal Đăng nhập
│   │   ├── home/               # Các phần Trang chủ, Form Đặt lịch BookingModal, Lịch sử đặt
│   │   ├── layout/             # Header, Footer
│   │   └── ui/                 # Toast, Loading spinner
│   ├── context/                # AuthContext (Quản lý trạng thái đăng nhập)
│   ├── services/               # API Service Clients (fetch wrapper)
│   └── types/                  # TypeScript Data Types / Interfaces
├── public/                     # Static assets (hình ảnh, favicon)
├── package.json
└── README.md
```

---

## 🔑 Tài Khoản Thử Nghiệm Mẫu

- **Tài khoản Khách hàng (User):**
  - **Email:** `user1@gmail.com`
  - **Mật khẩu:** `123456`
- **Tài khoản Quản trị (Admin):**
  - **Email:** `admin@gmail.com`
  - **Mật khẩu:** `admin123` *(hoặc tài khoản Admin được tạo trong Database)*

---

## ⚠️ Lưu Ý Khi Bàn Giao & Vận Hành

1. **Khởi chạy đúng thứ tự:** Bật **Backend API (`https://localhost:7118`) trước**, sau đó mới bật **Frontend (`http://localhost:3000`)**.
2. **Cơ chế SSL Localhost:** Trên môi trường dev local, Frontend đã được cấu hình tự động bỏ qua chứng chỉ SSL tự ký của localhost (`process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"`).
3. **CORS:** Đảm bảo Backend ASP.NET Core đã bật `UseCors` cho phép nguồn `http://localhost:3000` truy cập API.

---
✨ *Chúc bạn bàn giao dự án thành công!*
