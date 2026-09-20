namespace Backend.DTOs.Auth
{
    public class LoginResponseDto
    {
        public string Message { get; set; } = string.Empty;   // "Đăng nhập thành công"
        public string Token { get; set; } = string.Empty;      // JWT token (đã chứa UserId, Email, Role)
        public string FullName { get; set; } = string.Empty;
    }
}
