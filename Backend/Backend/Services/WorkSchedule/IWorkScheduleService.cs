using Backend.DTOs.Common;
using Backend.DTOs.WorkSchedule;

namespace Backend.Services.WorkSchedule
{
    public interface IWorkScheduleService
    {
        Task<(bool Success, string? ErrorMessage, PagedResultDto<WorkScheduleDto>? Data)> GetWorkSchedulesByStaffAsync(
            int staffId, int pageNumber, int pageSize);

        Task<(bool Success, string? ErrorMessage, WorkScheduleDto? Data)> GetWorkScheduleByIdAsync(int staffId, int id);

        Task<(bool Success, string? ErrorMessage, WorkScheduleDto? Data)> CreateWorkScheduleAsync(
            int staffId, CreateWorkScheduleDto dto);

        Task<(bool Success, string? ErrorMessage)> UpdateWorkScheduleAsync(
            int staffId, int id, UpdateWorkScheduleDto dto);
        Task<(bool Success, string? ErrorMessage)> DeleteWorkScheduleAsync(int staffId, int id);
    }
}
