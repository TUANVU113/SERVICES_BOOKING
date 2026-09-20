using Backend.DTOs.Booking;
using Backend.Services.Booking;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Backend.Controllers.Booking
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : Controller
    {
        private readonly IBookingService _bookingService;

        public BookingsController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        // Lấy UserId từ token đã đăng nhập
        private int GetCurrentUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        }

        // POST api/bookings
        // Customer tạo booking cho chính mình - CustomerId lấy từ token, không nhận từ body
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var customerId = GetCurrentUserId();
            var (success, errorMessage, data) = await _bookingService.CreateBookingAsync(customerId, dto);

            if (!success)
                return BadRequest(new { message = errorMessage });

            return Ok(new { message = "Đặt lịch thành công"});
            //return Ok(new { message = "Đặt lịch thành công", data });
        }

        // GET api/bookings?status=&date=&pageNumber=&pageSize=
        // Customer: chỉ thấy booking của mình. Admin: thấy tất cả
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetBookings(
            [FromQuery] string? status,
            [FromQuery] DateOnly? date,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            var currentUserId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");

            var result = await _bookingService.GetBookingsAsync(currentUserId, isAdmin, status, date, pageNumber, pageSize);
            return Ok(result);
        }

        // GET api/bookings/5
        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBookingById(int id)
        {
            var currentUserId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");

            var (success, errorMessage, data) = await _bookingService.GetBookingByIdAsync(id, currentUserId, isAdmin);
            if (!success)
                return NotFound(new { message = errorMessage });

            return Ok(data);
        }

        // GET api/bookings/available-slots?serviceId=&staffId=&date=
        // Không cần đăng nhập - khách vãng lai cũng xem được để cân nhắc trước khi đặt
        [HttpGet("available-slots")]
        public async Task<IActionResult> GetAvailableSlots([FromQuery] int serviceId, [FromQuery] int staffId, [FromQuery] DateOnly date)
        {
            var (success, errorMessage, slots) = await _bookingService.GetAvailableSlotsAsync(serviceId, staffId, date);
            if (!success)
                return BadRequest(new { message = errorMessage });

            return Ok(new { date, serviceId, staffId, availableSlots = slots });
        }

        // PATCH api/bookings/5/cancel
        // Customer hủy booking của mình, Admin hủy bất kỳ - chỉ khi đang Pending
        [Authorize]
        [HttpPatch("{id}/cancel")]
        public async Task<IActionResult> CancelBooking(int id, [FromBody] CancelBookingDto dto)
        {
            var currentUserId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");

            var (success, errorMessage) = await _bookingService.CancelBookingAsync(id, currentUserId, isAdmin, dto);
            if (!success)
                return BadRequest(new { message = errorMessage });

            return Ok(new { message = "Đã hủy booking" });
        }

        // PATCH api/bookings/5/confirm
        // Chỉ Admin mới được xác nhận
        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/confirm")]
        public async Task<IActionResult> ConfirmBooking(int id)
        {
            var (success, errorMessage) = await _bookingService.ConfirmBookingAsync(id);
            if (!success)
                return BadRequest(new { message = errorMessage });

            return Ok(new { message = "Đã xác nhận booking" });
        }

        // PATCH api/bookings/5/complete
        // Chỉ Admin mới được đánh dấu hoàn thành
        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/complete")]
        public async Task<IActionResult> CompleteBooking(int id)
        {
            var (success, errorMessage) = await _bookingService.CompleteBookingAsync(id);
            if (!success)
                return BadRequest(new { message = errorMessage });

            return Ok(new { message = "Đã hoàn thành booking" });
        }
    }
}
