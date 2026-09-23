using Backend.Data;
using Backend.DTOs.Common;
using Backend.DTOs.Service;
using Microsoft.EntityFrameworkCore;
namespace Backend.Services.Service
{
    public class ServiceService : IServiceService
    {
        private readonly ApplicationDbContext _context;

        public ServiceService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceDto> CreateServiceAsync(CreateServiceDto dto)
        {
            var service = new Models.Service
            {
                Name = dto.Name,
                Description = dto.Description,
                DurationMinutes = dto.DurationMinutes,
                Price = dto.Price,
                IsActive = true 
            };

            _context.Services.Add(service);
            await _context.SaveChangesAsync();

            return new ServiceDto
            {
                Id = service.Id,
                Name = service.Name,
                Description = service.Description,
                DurationMinutes = service.DurationMinutes,
                Price = service.Price,
                IsActive = service.IsActive
            };
        }

        public async Task<PagedResultDto<ServiceDto>> GetServicesAsync(int pageNumber, int pageSize)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 10;

            var query = _context.Services
                .OrderBy(s => s.Id); 

            var totalCount = await query.CountAsync();

            var services = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(s => new ServiceDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Description = s.Description,
                    DurationMinutes = s.DurationMinutes,
                    Price = s.Price,
                    IsActive = s.IsActive
                })
                .ToListAsync();

            return new PagedResultDto<ServiceDto>
            {
                Data = services,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };
        }

        public async Task<ServiceDto?> GetServiceByIdAsync(int id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null) return null;

            return new ServiceDto
            {
                Id = service.Id,
                Name = service.Name,
                Description = service.Description,
                DurationMinutes = service.DurationMinutes,
                Price = service.Price,
                IsActive = service.IsActive
            };
        }

        public async Task<bool> UpdateServiceAsync(int id, UpdateServiceDto dto)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null) return false;

            service.Name = dto.Name;
            service.Description = dto.Description;
            service.DurationMinutes = dto.DurationMinutes;
            service.Price = dto.Price;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> LockServiceAsync(int id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null) return false;

            service.IsActive = false; 
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UnlockServiceAsync(int id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null) return false;

            service.IsActive = true; 
            await _context.SaveChangesAsync();
            return true;
        }

        
    }
}
