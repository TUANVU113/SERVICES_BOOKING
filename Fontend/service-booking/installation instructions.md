# 💈 GENTLEMAN BARBER - HỆ THỐNG ĐẶT LỊCH CẮT TÓC ONLINE


1. clone Repository GitHub chứa source backend và frontend
https://github.com/TUANVU113/SERVICES_BOOKING


2. Cài đặt
## 🛠️ Công Nghệ Sử Dụng

### 1. Backend (API Server)
Yêu cầu môi trường - Công cụ	Phiên bản
.NET SDK	.10
SQL Server	2019 trở lên (bản Developer/Express đều được)
SSMS	Để xem/thao tác database (không bắt buộc)
Visual Studio 2022	Hoặc VS Code + C# Dev Kit
Postman	Để test API
Địa chỉ API mặc định: `https://localhost:7118`

2. Cài đặt
# Clone / giải nén project, sau đó vào thư mục gốc
cd Backend

# Khôi phục các package NuGet
dotnet restore

3. Cấu hình kết nối Database
Mở file appsettings.json, sửa lại ConnectionStrings cho đúng SQL Server máy bạn

4. Tạo Database bằng Migration (Code First)

Mở Package Manager Console (Tools → NuGet Package Manager → Package Manager Console):

Add-Migration InitialCreate
Update-Database

5. Nạp dữ liệu demo

Mở file data.sql bằng SSMS (kết nối tới BookingSystemDB vừa tạo), bấm Execute (F5) để có sẵn dữ liệu mẫu dùng test ngay: 1 Admin, 3 Customer, 4 nhân viên, 5 dịch vụ, lịch làm việc 7 ngày, 10 booking đủ 4 trạng thái.

Tài khoản demo (mật khẩu đều là 123456):

Vai trò	Email
Admin	admin@gmail.com
Customer	user1@gmail.com, user2@gmail.com, user3@gmail.com

6. Các địa chỉ quan trọng sau khi chạy
Chức năng	URL
Swagger (xem & test toàn bộ API)	https://localhost:<port>/swagger
Hangfire Dashboard (xem job xử lý booking quá hạn)	https://localhost:<port>/hangfire
SignalR Hub (real-time)	https://localhost:<port>/hubs/booking

7. Import Postman Collection

Mở Postman → Import → chọn file BookingSystem API.postman_collection.json đi kèm. Sửa biến baseUrl trong tab Variables của collection cho khớp đúng port bạn đang chạy.

### 2. Frontend (Client Web App)
- **Framework:** Next.js 16 (React 19 App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Lucide React Icons
- **HTTP Proxy:** Next.js API Routes Proxy
- **Địa chỉ Web mặc định:** `http://localhost:3000`

## 📋 Yêu Cầu Môi Trường (Prerequisites)

Trước khi bắt đầu cài đặt, hãy đảm bảo máy tính của bạn đã cài sẵn:
1. **Node.js:** Phiên bản `>= 18.x` ([Tải Node.js](https://nodejs.org/))
2. **.NET SDK:** Phiên bản `.NET 8.0` SDK ([Tải .NET SDK](https://dotnet.microsoft.com/download))
3. **SQL Server:** SQL Server Express / Developer / SSMS hoặc LocalDB.


## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### Khởi Chạy Frontend (Next.js Web App)

1. Mở một cửa sổ Terminal mới và di chuyển vào thư mục Frontend:
   ```bash
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

### 3. Docker-compose 

# Booking System Backend

## Requirements

- Docker Desktop
- Git

## Run project

Clone source:

git clone <GIT_URL>


Build:

docker compose build

Start:

docker compose up -d

Check:

docker compose ps

## Database

Install EF Core CLI:

dotnet tool install --global dotnet-ef

Go to Backend project:

cd Backend

Run migration:

dotnet ef database update --connection "Server=localhost,1433;Database=BookingSystemDB;User Id=sa;Password=YourStrongPassword123!;TrustServerCertificate=True;"
(Mật khẩu đặt tùy ý)

## Swagger

http://localhost:5000/swagger

## SQL Server

Server: localhost,1433
Username: sa
Password: YourStrongPassword123!
Database: BookingSystemDB

## Stop

docker compose stop

## Remove containers

docker compose down
✨ *Chúc mọi người thành công!* Ký tên DŨ
