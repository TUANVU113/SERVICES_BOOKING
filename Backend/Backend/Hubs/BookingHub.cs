using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.RegularExpressions;

namespace Backend.Hubs
{
    [Authorize]
    public class BookingHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = Context.User?.FindFirst(ClaimTypes.Role)?.Value;

            if (role == "Admin")
            {
                // Mọi Admin đang online đều nằm trong nhóm "Admins" -> nhận mọi thông báo booking
                await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
            }
            else if (!string.IsNullOrEmpty(userId))
            {
                // Mỗi Customer có 1 nhóm riêng theo UserId -> chỉ nhận thông báo về booking của chính họ
                await Groups.AddToGroupAsync(Context.ConnectionId, $"Customer-{userId}");
            }

            await base.OnConnectedAsync();
        }
    }
}
