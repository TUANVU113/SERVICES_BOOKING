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

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateService([FromBody] CreateServiceDto dto)
        {
            
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created = await _serviceService.CreateServiceAsync(dto);
            return Ok(new { message = "Tạo dịch vụ thành công" });
        }

        
        [HttpGet]
        public async Task<IActionResult> GetServices([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _serviceService.GetServicesAsync(pageNumber, pageSize);
            return Ok(result);
        }

        
        [HttpGet("{id}")]
        public async Task<IActionResult> GetServiceById(int id)
        {
            var service = await _serviceService.GetServiceByIdAsync(id);
            if (service == null)
                return NotFound(new { message = "Không tìm thấy dịch vụ" });

            return Ok(service);
        }

        
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

        
        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/lock")]
        public async Task<IActionResult> LockService(int id)
        {
            var success = await _serviceService.LockServiceAsync(id);
            if (!success)
                return NotFound(new { message = "Không tìm thấy dịch vụ" });

            return Ok(new { message = "Đã khóa dịch vụ" });
        }

        
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
