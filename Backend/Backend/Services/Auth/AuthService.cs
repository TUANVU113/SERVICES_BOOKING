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
            
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
                return null;

            if (!user.IsActive)
                return null;

            bool isPasswordCorrect = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            if (!isPasswordCorrect)
                return null;

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
