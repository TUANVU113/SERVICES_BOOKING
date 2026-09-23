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

       
        [HttpGet]
        public async Task<IActionResult> GetStaffs([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var isAdmin = User.IsInRole("Admin");
            var result = await _staffService.GetStaffsAsync(pageNumber, pageSize, isAdmin);
            return Ok(result);
        }

        
        [HttpGet("{id}")]
        public async Task<IActionResult> GetStaffById(int id)
        {
            var staff = await _staffService.GetStaffByIdAsync(id);
            if (staff == null)
                return NotFound(new { message = "Không tìm thấy nhân viên" });

            return Ok(staff);
        }

      
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

   
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStaff(int id, [FromBody] UpdateStaffDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var (success, errorMessage) = await _staffService.UpdateStaffAsync(id, dto);
            if (!success)
            {
                
                if (errorMessage == "Không tìm thấy nhân viên")
                    return NotFound(new { message = errorMessage });

                return Conflict(new { message = errorMessage });
            }

            return Ok(new { message = "Cập nhật nhân viên thành công" });
        }

       
        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/lock")]
        public async Task<IActionResult> LockStaff(int id)
        {
            var success = await _staffService.LockStaffAsync(id);
            if (!success)
                return NotFound(new { message = "Không tìm thấy nhân viên" });

            return Ok(new { message = "Đã khóa nhân viên" });
        }

        
        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/unlock")]
        public async Task<IActionResult> UnlockStaff(int id)
        {
            var success = await _staffService.UnlockStaffAsync(id);
            if (!success)
                return NotFound(new { message = "Không tìm thấy nhân viên" });

            return Ok(new { message = "Đã mở lại nhân viên" });
        }
        
        [HttpGet("working")]
        public async Task<IActionResult> GetStaffsWorkingOnDate([FromQuery] DateOnly date)
        {
            var staffs = await _staffService.GetStaffsWorkingOnDateAsync(date);
            return Ok(staffs);
        }
    }
}
