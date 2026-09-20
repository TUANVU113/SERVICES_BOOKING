using Backend.DTOs.Common;
using Backend.DTOs.Staff;

namespace Backend.Services.Staff
{
    public interface IStaffService
    {
        Task<PagedResultDto<StaffDto>> GetStaffsAsync(int pageNumber, int pageSize, bool isAdmin);
        Task<StaffDto?> GetStaffByIdAsync(int id);
        Task<(bool Success, string? ErrorMessage, StaffDto? Data)> CreateStaffAsync(CreateStaffDto dto);
        Task<(bool Success, string? ErrorMessage)> UpdateStaffAsync(int id, UpdateStaffDto dto);
        Task<bool> LockStaffAsync(int id);
        Task<bool> UnlockStaffAsync(int id);
    }
}
