using Backend.DTOs.Common;
using Backend.DTOs.Service;

namespace Backend.Services.Service
{
    public interface IServiceService
    {
        Task<ServiceDto> CreateServiceAsync(CreateServiceDto dto);
        Task<PagedResultDto<ServiceDto>> GetServicesAsync(int pageNumber, int pageSize);
        Task<ServiceDto?> GetServiceByIdAsync(int id);
        Task<bool> UpdateServiceAsync(int id, UpdateServiceDto dto);
        Task<bool> LockServiceAsync(int id);
        Task<bool> UnlockServiceAsync(int id);
    }
}
