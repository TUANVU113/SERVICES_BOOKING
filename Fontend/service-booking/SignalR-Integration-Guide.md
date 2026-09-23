# Hướng dẫn tích hợp SignalR - Booking Real-time

Tài liệu này dành cho Frontend để kết nối nhận thông báo real-time khi booking được tạo mới hoặc đổi trạng thái, không cần polling/F5 lại trang.

---

## 1. Cài đặt thư viện

```bash
npm install @microsoft/signalr
```

## 2. Thông tin kết nối

| Thông tin | Giá trị |
|---|---|
| Địa chỉ Hub | `https://<domain-backend>/hubs/booking` (VD local: `https://localhost:7118/hubs/booking`) |
| Yêu cầu xác thực | Bắt buộc phải có JWT token hợp lệ (token lấy được sau khi gọi API `/api/auth/login`) |
| Cách gửi token | Không dùng header `Authorization` thông thường — phải dùng `accessTokenFactory` (SignalR tự gắn token vào query string khi kết nối) |

## 3. Cách kết nối

```javascript
import * as signalR from "@microsoft/signalr";

const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7118/hubs/booking", {
        accessTokenFactory: () => localStorage.getItem("token") // lấy token đã lưu sau khi login
    })
    .withAutomaticReconnect() // tự kết nối lại nếu mất mạng
    .build();

await connection.start();
console.log("Đã kết nối SignalR");
```

## 4. Các sự kiện cần lắng nghe

Có **2 sự kiện**, đăng ký lắng nghe **trước khi** gọi `connection.start()`:

### Sự kiện `BookingCreated`
- **Ai nhận được**: chỉ tài khoản có `Role = Admin` đang kết nối
- **Khi nào bắn ra**: ngay khi có Customer tạo booking mới (trạng thái `Pending`)
- **Mục đích**: cập nhật dashboard Admin ngay lập tức, không cần F5 để thấy booking chờ xác nhận

```javascript
connection.on("BookingCreated", (booking) => {
    console.log("Có booking mới:", booking);
    // VD: hiện toast thông báo + thêm vào đầu danh sách booking đang hiển thị
});
```

### Sự kiện `BookingStatusChanged`
- **Ai nhận được**: Customer sở hữu booking đó + tất cả Admin đang kết nối
- **Khi nào bắn ra**: khi booking chuyển trạng thái — Xác nhận (`Confirmed`), Hoàn thành (`Completed`), hoặc Hủy (`Cancelled`)
- **Mục đích**: Customer thấy ngay trạng thái đơn của mình đổi mà không cần F5; Admin thấy dashboard tự cập nhật

```javascript
connection.on("BookingStatusChanged", (booking) => {
    console.log("Booking đổi trạng thái:", booking);
    // VD: cập nhật lại state/store đang giữ danh sách booking, hoặc hiện toast
});
```

## 5. Cấu trúc dữ liệu (`booking` object) nhận được trong cả 2 sự kiện

```json
{
  "id": 5,
  "bookingCode": "BK20260925103015123",
  "customerId": 1,
  "customerName": "Nguyễn Văn A",
  "serviceId": 1,
  "serviceName": "Cắt tóc nam",
  "staffId": 1,
  "staffName": "Lê Văn Nhân",
  "startTime": "2026-09-25T09:00:00",
  "endTime": "2026-09-25T09:30:00",
  "status": "Confirmed",
  "customerNote": "Muốn cắt kiểu undercut",
  "cancellationReason": null,
  "createdAt": "2026-09-24T20:15:00"
}
```

`status` chỉ nhận 1 trong 4 giá trị: `"Pending"`, `"Confirmed"`, `"Completed"`, `"Cancelled"`.

## 6. Ví dụ React Hook đầy đủ (dùng lại được)

```javascript
import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";

export function useBookingHub(token) {
    const connectionRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!token) return;

        const connection = new signalR.HubConnectionBuilder()
            .withUrl("https://localhost:7118/hubs/booking", {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();

        connection.on("BookingCreated", (booking) => {
            // TODO: xử lý theo state/store của bạn (VD: Redux, Zustand, Context...)
        });

        connection.on("BookingStatusChanged", (booking) => {
            // TODO: xử lý theo state/store của bạn
        });

        connection.start()
            .then(() => setIsConnected(true))
            .catch((err) => console.error("Lỗi kết nối SignalR:", err));

        connectionRef.current = connection;

        return () => {
            connection.stop();
        };
    }, [token]);

    return { isConnected };
}
```

Cách dùng trong component:
```javascript
function App() {
    const token = localStorage.getItem("token");
    const { isConnected } = useBookingHub(token);

    return <div>{isConnected ? "🟢 Real-time đang bật" : "🔴 Chưa kết nối"}</div>;
}
```

## 7. Những điểm FE cần lưu ý

| Điểm | Giải thích |
|---|---|
| Phải đăng nhập trước mới kết nối được | Hub yêu cầu token hợp lệ — gọi API login lấy token trước, không kết nối được ở trang public |
| Ngắt kết nối khi Logout | Gọi `connection.stop()` khi user đăng xuất, tránh giữ kết nối thừa |
| Không cần tự động F5/polling API nữa | Danh sách booking nên cập nhật trực tiếp từ dữ liệu nhận được qua sự kiện, không cần gọi lại `GET /api/bookings` mỗi vài giây |
| Role quyết định nhận được sự kiện nào | Customer sẽ KHÔNG bao giờ nhận `BookingCreated` (chỉ Admin nhận) — đây là thiết kế có chủ đích, không phải thiếu sót |
| CORS | Backend hiện đang cho phép origin `http://localhost:3000` — nếu FE chạy port/domain khác, báo lại BE để cập nhật, nếu không sẽ bị chặn kết nối |
