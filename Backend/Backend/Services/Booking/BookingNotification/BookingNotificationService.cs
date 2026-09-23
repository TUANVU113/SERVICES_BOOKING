using Backend.DTOs.Booking;
using Backend.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Services.Booking.BookingNotification
{
    public class BookingNotificationService : IBookingNotificationService
    {
        private readonly IHubContext<BookingHub> _hubContext;

        public BookingNotificationService(IHubContext<BookingHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task NotifyBookingCreatedAsync(BookingDto booking)
        {
            // Chỉ Admin cần biết ngay khi có booking mới để vào xác nhận
            await _hubContext.Clients.Group("Admins")
                .SendAsync("BookingCreated", booking);
        }

        public async Task NotifyBookingStatusChangedAsync(BookingDto booking)
        {
            // Báo cho đúng khách hàng sở hữu booking này
            await _hubContext.Clients.Group($"Customer-{booking.CustomerId}")
                .SendAsync("BookingStatusChanged", booking);

            // Đồng thời báo cho mọi Admin để cập nhật dashboard
            await _hubContext.Clients.Group("Admins")
                .SendAsync("BookingStatusChanged", booking);
        }
    }
}
