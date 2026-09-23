namespace Backend.DTOs.Auth
{
    public class LoginResponseDto
    {
        public string Message { get; set; } = string.Empty;   
        public string Token { get; set; } = string.Empty;      
        public string FullName { get; set; } = string.Empty;
    }
}
