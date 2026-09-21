using Backend.Data;
using Backend.DTOs.Booking;
using Backend.DTOs.Common;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.Booking
{
    public class BookingService : IBookingService
    {
        private readonly ApplicationDbContext _context;

        // Giờ làm việc cố định của cửa hàng: 8h sáng - 18h tối
        private static readonly TimeOnly ShopOpenTime = new(8, 0);
        private static readonly TimeOnly ShopCloseTime = new(18, 0);

        // Bước nhảy khi sinh khung giờ trống
        private const int SlotStepMinutes = 30;

        public BookingService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<(bool Success, string? ErrorMessage, BookingDto? Data)> CreateBookingAsync(int customerId, CreateBookingDto dto)
        {
            var service = await _context.Services.FindAsync(dto.ServiceId);
            if (service == null || !service.IsActive)
                return (false, "Dịch vụ không tồn tại hoặc đã ngừng hoạt động", null);

            var staff = await _context.Staffs.FindAsync(dto.StaffId);
            if (staff == null || !staff.IsActive)
                return (false, "Nhân viên không tồn tại hoặc đã bị khóa", null);

            // Backend tự tính EndTime, không nhận từ client
            var endTime = dto.StartTime.AddMinutes(service.DurationMinutes);

            // Không đặt lịch trong quá khứ
            if (dto.StartTime <= DateTime.Now)
                return (false, "Không thể đặt lịch trong quá khứ", null);

            // Phải nằm trong giờ làm việc 8h - 18h
            var startTimeOfDay = TimeOnly.FromDateTime(dto.StartTime);
            var endTimeOfDay = TimeOnly.FromDateTime(endTime);
            if (startTimeOfDay < ShopOpenTime || endTimeOfDay > ShopCloseTime || endTime.Date != dto.StartTime.Date)
                return (false, "Booking phải nằm trong giờ làm việc (8:00 - 18:00)", null);

            // ===== XỬ LÝ RACE CONDITION: 2 request đặt cùng khung giờ =====
            // Dùng transaction + khóa (UPDLOCK, HOLDLOCK) ở tầng SQL Server để đảm bảo
            // chỉ 1 request được đọc + ghi tại 1 thời điểm cho cùng StaffId.
            // Request thứ 2 sẽ phải CHỜ request thứ 1 commit xong mới được đọc tiếp,
            // nên lúc đó sẽ thấy đúng booking vừa tạo và phát hiện trùng lịch chính xác.
            await using var transaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);

            try
            {
                // Khóa toàn bộ booking (chưa hủy) của nhân viên này lại trong lúc kiểm tra + insert
                var lockedBookings = await _context.Bookings
                    .FromSqlInterpolated($@"
                        SELECT * FROM Bookings WITH (UPDLOCK, HOLDLOCK)
                        WHERE StaffId = {dto.StaffId} AND Status != 'Cancelled'")
                    .ToListAsync();

                // Giả lập delay để test deadlock/timeout khi 2 request cùng đặt trùng khung giờ
                await Task.Delay(5000);

                // Kiểm tra trùng lịch: NewStart < ExistingEnd AND NewEnd > ExistingStart
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

                return (true, null, await MapToDtoAsync(booking.Id));
            }
            catch (Microsoft.Data.SqlClient.SqlException ex) when (ex.Number is 1205 or 1222)
            {
                // 1205 = Deadlock, 1222 = Lock request timeout - đúng là do tranh chấp khóa, yêu cầu thử lại
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

            // Customer chỉ thấy booking của chính mình; Admin thấy tất cả
            if (!isAdmin)
                query = query.Where(b => b.CustomerId == currentUserId);

            if (!string.IsNullOrEmpty(status))
                query = query.Where(b => b.Status == status);

            if (date.HasValue)
                query = query.Where(b => DateOnly.FromDateTime(b.StartTime) == date.Value);

            query = query.OrderByDescending(b => b.StartTime); // bắt buộc có ORDER BY khi Skip/Take

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

            // Customer chỉ xem được booking của chính mình
            if (!isAdmin && booking.CustomerId != currentUserId)
                return (false, "Không tìm thấy booking", null); // trả 404 thay vì 403 để tránh lộ thông tin tồn tại

            return (true, null, await MapToDtoAsync(id));
        }

        public async Task<(bool Success, string? ErrorMessage)> CancelBookingAsync(int id, int currentUserId, bool isAdmin, CancelBookingDto dto)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
                return (false, "Không tìm thấy booking");

            if (!isAdmin && booking.CustomerId != currentUserId)
                return (false, "Không tìm thấy booking");

            // Chỉ được hủy khi đang Pending - Confirmed/Completed đều không được hủy nữa (áp dụng cho cả Admin)
            if (booking.Status != "Pending")
                return (false, "Chỉ có thể hủy booking khi đang ở trạng thái chờ xác nhận (Pending)");

            // Phòng trường hợp đã quá giờ bắt đầu nhưng chưa ai xác nhận/hủy
            if (booking.StartTime <= DateTime.Now)
                return (false, "Không thể hủy booking đã bắt đầu");

            booking.Status = "Cancelled";
            booking.CancellationReason = dto.CancellationReason;

            await _context.SaveChangesAsync();
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

            // Lấy lịch làm việc của nhân viên trong ngày được yêu cầu
            var schedules = await _context.WorkSchedules
                .Where(w => w.StaffId == staffId && w.WorkDate == date)
                .ToListAsync();

            if (schedules.Count == 0)
                return (true, null, new List<string>()); // nhân viên không làm việc ngày này

            // Lấy các booking đã tồn tại (chưa hủy) của nhân viên trong ngày đó để loại trừ
            var existingBookings = await _context.Bookings
                .Where(b => b.StaffId == staffId && b.Status != "Cancelled" && b.StartTime.Date == date.ToDateTime(TimeOnly.MinValue).Date)
                .Select(b => new { b.StartTime, b.EndTime })
                .ToListAsync();

            var duration = service.DurationMinutes;
            var availableSlots = new List<string>();
            var now = DateTime.Now;

            foreach (var schedule in schedules)
            {
                // Giao giữa lịch làm việc của nhân viên và giờ mở cửa của shop (8h-18h)
                var effectiveStart = schedule.StartTime < ShopOpenTime ? ShopOpenTime : schedule.StartTime;
                var effectiveEnd = schedule.EndTime > ShopCloseTime ? ShopCloseTime : schedule.EndTime;

                var slotStart = effectiveStart;
                while (slotStart.AddMinutes(duration) <= effectiveEnd)
                {
                    var slotEnd = slotStart.AddMinutes(duration);
                    var slotStartDateTime = date.ToDateTime(slotStart);
                    var slotEndDateTime = date.ToDateTime(slotEnd);

                    // Bỏ qua slot đã ở quá khứ (nếu date là hôm nay)
                    var isPast = slotStartDateTime <= now;

                    // Kiểm tra giao với booking đã có: NewStart < ExistingEnd AND NewEnd > ExistingStart
                    var isOverlapped = existingBookings.Any(b =>
                        slotStartDateTime < b.EndTime && slotEndDateTime > b.StartTime);

                    if (!isPast && !isOverlapped)
                        availableSlots.Add(slotStart.ToString("HH:mm"));

                    slotStart = slotStart.AddMinutes(SlotStepMinutes);
                }
            }

            return (true, null, availableSlots);
        }

        // Helper: load lại booking kèm thông tin liên quan (tên khách, dịch vụ, nhân viên) để trả về DTO
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
