using Backend.Data;
using Backend.DTOs.Booking;
using Backend.DTOs.Common;
using Backend.Services.Booking.BookingNotification;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.Booking
{
    public class BookingService : IBookingService
    {
        private readonly ApplicationDbContext _context;
        private readonly IBookingNotificationService _notificationService;

        private static readonly TimeOnly ShopOpenTime = new(8, 0);
        private static readonly TimeOnly ShopCloseTime = new(18, 0);

        private const int SlotStepMinutes = 30;

        public BookingService(ApplicationDbContext context, IBookingNotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        public async Task<(bool Success, string? ErrorMessage, BookingDto? Data)> CreateBookingAsync(int customerId, CreateBookingDto dto)
        {
            var service = await _context.Services.FindAsync(dto.ServiceId);
            if (service == null || !service.IsActive)
                return (false, "Dịch vụ không tồn tại hoặc đã ngừng hoạt động", null);

            var staff = await _context.Staffs.FindAsync(dto.StaffId);
            if (staff == null || !staff.IsActive)
                return (false, "Nhân viên không tồn tại hoặc đã bị khóa", null);

            var endTime = dto.StartTime.AddMinutes(service.DurationMinutes);

            if (dto.StartTime <= DateTime.Now)
                return (false, "Không thể đặt lịch trong quá khứ", null);

            var startTimeOfDay = TimeOnly.FromDateTime(dto.StartTime);
            var endTimeOfDay = TimeOnly.FromDateTime(endTime);
            if (startTimeOfDay < ShopOpenTime || endTimeOfDay > ShopCloseTime || endTime.Date != dto.StartTime.Date)
                return (false, "Booking phải nằm trong giờ làm việc (8:00 - 18:00)", null);

            await using var transaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);

            try
            {
                var lockedBookings = await _context.Bookings
                    .FromSqlInterpolated($@"
                        SELECT * FROM Bookings WITH (UPDLOCK, HOLDLOCK)
                        WHERE StaffId = {dto.StaffId} AND Status != 'Cancelled'")
                    .ToListAsync();

                // Giả lập delay để test 
                //await Task.Delay(5000);

                var isOverlapped = lockedBookings.Any(b =>
                    dto.StartTime < b.EndTime && endTime > b.StartTime);

                if (isOverlapped)
                {
                    await transaction.RollbackAsync();
                    return (false, "Nhân viên đã có lịch trùng trong khoảng thời gian này", null);
                }

                var bookingCode = $"BK{DateTime.UtcNow:yyyyMMddHHmmssfff}";

                var booking = new Models.Booking
                {
                    BookingCode = bookingCode,
                    CustomerId = customerId,
                    ServiceId = dto.ServiceId,
                    StaffId = dto.StaffId,
                    StartTime = dto.StartTime,
                    EndTime = endTime,
                    Status = "Pending",
                    CustomerNote = dto.CustomerNote,
                    CreatedAt = DateTime.Now
                };

                _context.Bookings.Add(booking);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                var result = await MapToDtoAsync(booking.Id);
                if (result != null)
                    await _notificationService.NotifyBookingCreatedAsync(result);

                return (true, null, await MapToDtoAsync(booking.Id));
            }
            catch (Microsoft.Data.SqlClient.SqlException ex) when (ex.Number is 1205 or 1222)
            {
                await transaction.RollbackAsync();
                return (false, "Hệ thống đang xử lý một yêu cầu khác cho cùng khung giờ, vui lòng thử lại", null);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<PagedResultDto<BookingDto>> GetBookingsAsync(
            int currentUserId, bool isAdmin, string? status, DateOnly? date, int pageNumber, int pageSize)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 10;

            var query = _context.Bookings.AsQueryable();

            
            if (!isAdmin)
                query = query.Where(b => b.CustomerId == currentUserId);

            if (!string.IsNullOrEmpty(status))
                query = query.Where(b => b.Status == status);

            if (date.HasValue)
                query = query.Where(b => DateOnly.FromDateTime(b.StartTime) == date.Value);

            query = query.OrderByDescending(b => b.StartTime); 

            var totalCount = await query.CountAsync();

            var bookings = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(b => new BookingDto
                {
                    Id = b.Id,
                    BookingCode = b.BookingCode,
                    CustomerId = b.CustomerId,
                    CustomerName = b.Customer.FullName,
                    ServiceId = b.ServiceId,
                    ServiceName = b.Service.Name,
                    StaffId = b.StaffId,
                    StaffName = b.Staff.FullName,
                    StartTime = b.StartTime,
                    EndTime = b.EndTime,
                    Status = b.Status,
                    CustomerNote = b.CustomerNote,
                    CancellationReason = b.CancellationReason,
                    CreatedAt = b.CreatedAt
                })
                .ToListAsync();

            return new PagedResultDto<BookingDto>
            {
                Data = bookings,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };
        }

        public async Task<(bool Success, string? ErrorMessage, BookingDto? Data)> GetBookingByIdAsync(int id, int currentUserId, bool isAdmin)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
                return (false, "Không tìm thấy booking", null);

            if (!isAdmin && booking.CustomerId != currentUserId)
                return (false, "Không tìm thấy booking", null); 

            return (true, null, await MapToDtoAsync(id));
        }

        public async Task<(bool Success, string? ErrorMessage)> CancelBookingAsync(int id, int currentUserId, bool isAdmin, CancelBookingDto dto)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
                return (false, "Không tìm thấy booking");

            if (!isAdmin && booking.CustomerId != currentUserId)
                return (false, "Không tìm thấy booking");

            if (booking.Status != "Pending")
                return (false, "Chỉ có thể hủy booking khi đang ở trạng thái chờ xác nhận (Pending)");

            if (booking.StartTime <= DateTime.Now)
                return (false, "Không thể hủy booking đã bắt đầu");

            booking.Status = "Cancelled";
            booking.CancellationReason = dto.CancellationReason;

            await _context.SaveChangesAsync();

            var result = await MapToDtoAsync(id);
            if (result != null)
                await _notificationService.NotifyBookingStatusChangedAsync(result);
            return (true, null);
        }

        public async Task<(bool Success, string? ErrorMessage)> ConfirmBookingAsync(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
                return (false, "Không tìm thấy booking");

            if (booking.Status != "Pending")
                return (false, "Chỉ có thể xác nhận booking đang ở trạng thái Pending");

            booking.Status = "Confirmed";
            await _context.SaveChangesAsync();

            var result = await MapToDtoAsync(id);
            if (result != null)
                await _notificationService.NotifyBookingStatusChangedAsync(result);

            return (true, null);
        }

        public async Task<(bool Success, string? ErrorMessage)> CompleteBookingAsync(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
                return (false, "Không tìm thấy booking");

            if (booking.Status != "Confirmed")
                return (false, "Chỉ có thể hoàn thành booking đang ở trạng thái Confirmed");

            booking.Status = "Completed";
            await _context.SaveChangesAsync();

            var result = await MapToDtoAsync(id);
            if (result != null)
                await _notificationService.NotifyBookingStatusChangedAsync(result);

            return (true, null);
        }

        public async Task<(bool Success, string? ErrorMessage, List<string>? Slots)> GetAvailableSlotsAsync(int serviceId, int staffId, DateOnly date)
        {
            var service = await _context.Services.FindAsync(serviceId);
            if (service == null || !service.IsActive)
                return (false, "Dịch vụ không tồn tại hoặc đã ngừng hoạt động", null);

            var staff = await _context.Staffs.FindAsync(staffId);
            if (staff == null || !staff.IsActive)
                return (false, "Nhân viên không tồn tại hoặc đã bị khóa", null);

            var schedules = await _context.WorkSchedules
                .Where(w => w.StaffId == staffId && w.WorkDate == date)
                .ToListAsync();

            if (schedules.Count == 0)
                return (true, null, new List<string>()); 

            
            var existingBookings = await _context.Bookings
                .Where(b => b.StaffId == staffId && b.Status != "Cancelled" && b.StartTime.Date == date.ToDateTime(TimeOnly.MinValue).Date)
                .Select(b => new { b.StartTime, b.EndTime })
                .ToListAsync();

            var duration = service.DurationMinutes;
            var availableSlots = new List<string>();
            var now = DateTime.Now;

            foreach (var schedule in schedules)
            {
                var effectiveStart = schedule.StartTime < ShopOpenTime ? ShopOpenTime : schedule.StartTime;
                var effectiveEnd = schedule.EndTime > ShopCloseTime ? ShopCloseTime : schedule.EndTime;

                var slotStart = effectiveStart;
                while (slotStart.AddMinutes(duration) <= effectiveEnd)
                {
                    var slotEnd = slotStart.AddMinutes(duration);
                    var slotStartDateTime = date.ToDateTime(slotStart);
                    var slotEndDateTime = date.ToDateTime(slotEnd);

                    var isPast = slotStartDateTime <= now;

                    var isOverlapped = existingBookings.Any(b =>
                        slotStartDateTime < b.EndTime && slotEndDateTime > b.StartTime);

                    if (!isPast && !isOverlapped)
                        availableSlots.Add(slotStart.ToString("HH:mm"));

                    slotStart = slotStart.AddMinutes(SlotStepMinutes);
                }
            }

            return (true, null, availableSlots);
        }

        public async Task ProcessOverdueBookingsAsync()
        {
            var now = DateTime.Now;

            var overduePending = await _context.Bookings
                .Where(b => b.Status == "Pending" && b.StartTime <= now)
                .ToListAsync();

            foreach (var booking in overduePending)
            {
                booking.Status = "Cancelled";
                booking.CancellationReason = "Tự động hủy do quá hạn xác nhận";
            }

            var overdueConfirmed = await _context.Bookings
                .Where(b => b.Status == "Confirmed" && b.EndTime <= now)
                .ToListAsync();

            foreach (var booking in overdueConfirmed)
            {
                booking.Status = "Completed";
            }

            if (overduePending.Count > 0 || overdueConfirmed.Count > 0)
            {
                await _context.SaveChangesAsync();
            }
        }

        //  load lại booking 
        private async Task<BookingDto?> MapToDtoAsync(int id)
        {
            return await _context.Bookings
                .Where(b => b.Id == id)
                .Select(b => new BookingDto
                {
                    Id = b.Id,
                    BookingCode = b.BookingCode,
                    CustomerId = b.CustomerId,
                    CustomerName = b.Customer.FullName,
                    ServiceId = b.ServiceId,
                    ServiceName = b.Service.Name,
                    StaffId = b.StaffId,
                    StaffName = b.Staff.FullName,
                    StartTime = b.StartTime,
                    EndTime = b.EndTime,
                    Status = b.Status,
                    CustomerNote = b.CustomerNote,
                    CancellationReason = b.CancellationReason,
                    CreatedAt = b.CreatedAt
                })
                .FirstOrDefaultAsync();
        }
    }
}
