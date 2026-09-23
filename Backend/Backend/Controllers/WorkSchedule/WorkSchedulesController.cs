using Backend.DTOs.WorkSchedule;
using Backend.Services.WorkSchedule;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers.WorkSchedule
{
    [ApiController]
    [Route("api/staffs/{staffId}/workschedules")]
    public class WorkSchedulesController : Controller
    {
        private readonly IWorkScheduleService _workScheduleService;

        public WorkSchedulesController(IWorkScheduleService workScheduleService)
        {
            _workScheduleService = workScheduleService;
        }

        [HttpGet]
        public async Task<IActionResult> GetWorkSchedules(int staffId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var (success, errorMessage, data) = await _workScheduleService.GetWorkSchedulesByStaffAsync(staffId, pageNumber, pageSize);
            if (!success)
                return NotFound(new { message = errorMessage });

            return Ok(data);
        }

        
        [HttpGet("{id}")]
        public async Task<IActionResult> GetWorkScheduleById(int staffId, int id)
        {
            var (success, errorMessage, data) = await _workScheduleService.GetWorkScheduleByIdAsync(staffId, id);
            if (!success)
                return NotFound(new { message = errorMessage });

            return Ok(data);
        }

      
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateWorkSchedule(int staffId, [FromBody] CreateWorkScheduleDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var (success, errorMessage, data) = await _workScheduleService.CreateWorkScheduleAsync(staffId, dto);
            if (!success)
            {
                if (errorMessage == "Không tìm thấy nhân viên")
                    return NotFound(new { message = errorMessage });

                return BadRequest(new { message = errorMessage }); 
            }

            return Ok(new { message = "Tạo lịch làm việc thành công" });
        }

        
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateWorkSchedule(int staffId, int id, [FromBody] UpdateWorkScheduleDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var (success, errorMessage) = await _workScheduleService.UpdateWorkScheduleAsync(staffId, id, dto);
            if (!success)
            {
                if (errorMessage is "Không tìm thấy nhân viên" or "Không tìm thấy lịch làm việc")
                    return NotFound(new { message = errorMessage });

                return BadRequest(new { message = errorMessage }); // sai giờ, trùng ca, nhân viên bị khóa
            }

            return Ok(new { message = "Cập nhật lịch làm việc thành công" });
        }
        
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWorkSchedule(int staffId, int id)
        {
            var (success, errorMessage) = await _workScheduleService.DeleteWorkScheduleAsync(staffId, id);
            if (!success)
                return NotFound(new { message = errorMessage });

            return Ok(new { message = "Đã xóa lịch làm việc" });
        }
    }
}
