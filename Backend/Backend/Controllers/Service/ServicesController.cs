using Backend.DTOs.Service;
using Backend.Services.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers.Service
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServicesController : Controller
    {
        private readonly IServiceService _serviceService;

        public ServicesController(IServiceService serviceService)
        {
            _serviceService = serviceService;
        }

        // POST api/services
        // Chỉ Admin mới được tạo dịch vụ mới
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateService([FromBody] CreateServiceDto dto)
        {
            // [Range] trong DTO tự kiểm tra DurationMinutes > 0 và Price >= 0.
            // Nếu body gửi giá âm hoặc thời lượng <= 0, ModelState.IsValid sẽ là false
            // và trả về danh sách lỗi kèm thông báo tương ứng.
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created = await _serviceService.CreateServiceAsync(dto);
            return Ok(new { message = "Tạo dịch vụ thành công" });
        }

        // GET api/services?pageNumber=1&pageSize=10
        // Không yêu cầu đăng nhập - ai cũng xem được danh sách dịch vụ
        [HttpGet]
        public async Task<IActionResult> GetServices([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _serviceService.GetServicesAsync(pageNumber, pageSize);
            return Ok(result);
        }

        // GET api/services/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetServiceById(int id)
        {
            var service = await _serviceService.GetServiceByIdAsync(id);
            if (service == null)
                return NotFound(new { message = "Không tìm thấy dịch vụ" });

            return Ok(service);
        }

        // PUT api/services/5
        // Chỉ Admin mới được cập nhật
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateService(int id, [FromBody] UpdateServiceDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var success = await _serviceService.UpdateServiceAsync(id, dto);
            if (!success)
                return NotFound(new { message = "Không tìm thấy dịch vụ" });

            return Ok(new { message = "Cập nhật dịch vụ thành công" });
        }

        // PATCH api/services/5/lock
        // Chỉ Admin mới được khóa dịch vụ
        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/lock")]
        public async Task<IActionResult> LockService(int id)
        {
            var success = await _serviceService.LockServiceAsync(id);
            if (!success)
                return NotFound(new { message = "Không tìm thấy dịch vụ" });

            return Ok(new { message = "Đã khóa dịch vụ" });
        }

        // PATCH api/services/5/unlock
        // Chỉ Admin mới được mở lại dịch vụ đã khóa
        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/unlock")]
        public async Task<IActionResult> UnlockService(int id)
        {
            var success = await _serviceService.UnlockServiceAsync(id);
            if (!success)
                return NotFound(new { message = "Không tìm thấy dịch vụ" });

            return Ok(new { message = "Đã mở lại dịch vụ" });
        }
    }
}
