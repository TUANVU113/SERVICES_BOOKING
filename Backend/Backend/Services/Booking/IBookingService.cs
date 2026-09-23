using Backend.DTOs.Booking;
using Backend.DTOs.Common;
using Backend.DTOs.WorkSchedule;

namespace Backend.Services.Booking
{
    public interface IBookingService
    {
        Task<(bool Success, string? ErrorMessage, BookingDto? Data)> CreateBookingAsync(int customerId, CreateBookingDto dto);

        Task<PagedResultDto<BookingDto>> GetBookingsAsync(
            int currentUserId, bool isAdmin, string? status, DateOnly? date, int pageNumber, int pageSize);

        Task<(bool Success, string? ErrorMessage, BookingDto? Data)> GetBookingByIdAsync(int id, int currentUserId, bool isAdmin);

        Task<(bool Success, string? ErrorMessage)> CancelBookingAsync(int id, int currentUserId, bool isAdmin, CancelBookingDto dto);

        Task<(bool Success, string? ErrorMessage)> ConfirmBookingAsync(int id);

        Task<(bool Success, string? ErrorMessage)> CompleteBookingAsync(int id);

        Task<(bool Success, string? ErrorMessage, List<string>? Slots)> GetAvailableSlotsAsync(int serviceId, int staffId, DateOnly date);

        Task ProcessOverdueBookingsAsync();
    }
}
