using Backend.Data;
using Microsoft.EntityFrameworkCore;
using Backend.DTOs.Auth;

namespace Backend.Services.Auth
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IJwtService _jwtService;

        public AuthService(ApplicationDbContext context, IJwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto request)
        {
            // Tìm user theo Email (async, không block thread)
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            // Email không tồn tại
            if (user == null)
                return null;

            // Tài khoản bị khóa
            if (!user.IsActive)
                return null;

            // So sánh password nhập vào với hash đã lưu trong DB
            bool isPasswordCorrect = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            if (!isPasswordCorrect)
                return null;

          
            // Đăng nhập thành công -> sinh JWT token chứa thông tin user
            var token = _jwtService.GenerateToken(user);

            return new LoginResponseDto
            {
                Message = "Đăng nhập thành công",
                Token = token,
                FullName = user.FullName
            };
        }
    }
}
