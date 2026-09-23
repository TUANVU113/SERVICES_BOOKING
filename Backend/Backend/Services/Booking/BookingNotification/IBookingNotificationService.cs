using Backend.DTOs.Booking;

namespace Backend.Services.Booking.BookingNotification
{
    public interface IBookingNotificationService
    {
        Task NotifyBookingCreatedAsync(BookingDto booking);

        Task NotifyBookingStatusChangedAsync(BookingDto booking);

    }
}
