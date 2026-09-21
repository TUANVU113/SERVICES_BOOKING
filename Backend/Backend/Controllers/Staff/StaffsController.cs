using Backend.DTOs.Staff;
using Backend.Services.Staff;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace Backend.Controllers.Staff
{
    [ApiController]
    [Route("api/[controller]")]
    public class StaffsController : Controller
    {
        private readonly IStaffService _staffService;

        public StaffsController(IStaffService staffService)
        {
            _staffService = staffService;
        }

        // GET api/staffs?pageNumber=1&pageSize=10
        // Không bắt buộc đăng nhập - Admin có token sẽ thấy cả nhân viên đã khóa
        [HttpGet]
        public async Task<IActionResult> GetStaffs([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var isAdmin = User.IsInRole("Admin");
            var result = await _staffService.GetStaffsAsync(pageNumber, pageSize, isAdmin);
            return Ok(result);
        }

        // GET api/staffs/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetStaffById(int id)
        {
            var staff = await _staffService.GetStaffByIdAsync(id);
            if (staff == null)
                return NotFound(new { message = "Không tìm thấy nhân viên" });

            return Ok(staff);
        }

        // POST api/staffs
        // Chỉ Admin mới được tạo nhân viên mới
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateStaff([FromBody] CreateStaffDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var (success, errorMessage, data) = await _staffService.CreateStaffAsync(dto);
            if (!success)
                return Conflict(new { message = errorMessage });

            return Ok(new { message = "Tạo nhân viên thành công" });
        }

        // PUT api/staffs/5
        // Chỉ Admin mới được cập nhật
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStaff(int id, [FromBody] UpdateStaffDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var (success, errorMessage) = await _staffService.UpdateStaffAsync(id, dto);
            if (!success)
            {
                // Phân biệt lỗi "không tìm thấy" (404) và "trùng email" (409)
                if (errorMessage == "Không tìm thấy nhân viên")
                    return NotFound(new { message = errorMessage });

                return Conflict(new { message = errorMessage });
            }

            return Ok(new { message = "Cập nhật nhân viên thành công" });
        }

        // PATCH api/staffs/5/lock
        // Chỉ Admin mới được khóa nhân viên
        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/lock")]
        public async Task<IActionResult> LockStaff(int id)
        {
            var success = await _staffService.LockStaffAsync(id);
            if (!success)
                return NotFound(new { message = "Không tìm thấy nhân viên" });

            return Ok(new { message = "Đã khóa nhân viên" });
        }

        // PATCH api/staffs/5/unlock
        // Chỉ Admin mới được mở lại nhân viên đã khóa
        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/unlock")]
        public async Task<IActionResult> UnlockStaff(int id)
        {
            var success = await _staffService.UnlockStaffAsync(id);
            if (!success)
                return NotFound(new { message = "Không tìm thấy nhân viên" });

            return Ok(new { message = "Đã mở lại nhân viên" });
        }
        // GET api/staffs/working?date=2026-09-25
        // Trả về danh sách nhân viên đang hoạt động VÀ có ca làm việc đúng ngày này
        // Dùng để FE lọc dropdown chọn nhân viên khi đặt lịch, trước khi gọi available-slots
        [HttpGet("working")]
        public async Task<IActionResult> GetStaffsWorkingOnDate([FromQuery] DateOnly date)
        {
            var staffs = await _staffService.GetStaffsWorkingOnDateAsync(date);
            return Ok(staffs);
        }
    }
}
