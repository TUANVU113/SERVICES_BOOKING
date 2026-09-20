using Backend.DTOs.Auth;
using Backend.Services.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers.Auth
{

    [ApiController]
    [Route("api/[controller]")]
    
    public class AuthController : Controller
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            // Validate dữ liệu đầu vào (dựa trên [Required], [EmailAddress] trong DTO)
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.LoginAsync(request);

            if (result == null)
                return Unauthorized(new { message = "Email hoặc mật khẩu không đúng" });

            return Ok(result);
        }
    }
}
