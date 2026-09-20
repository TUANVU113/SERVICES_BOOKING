using Backend.Models;

namespace Backend.Services.Auth
{
    public interface IJwtService
    {
        string GenerateToken(User user);
    }
}
