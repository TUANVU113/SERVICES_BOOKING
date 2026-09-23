using Backend.Data;
using Backend.DTOs.Common;
using Backend.DTOs.Staff;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.Staff
{
    public class StaffService : IStaffService
    {
        private readonly ApplicationDbContext _context;

        public StaffService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PagedResultDto<StaffDto>> GetStaffsAsync(int pageNumber, int pageSize, bool isAdmin)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 10;

            var query = _context.Staffs.AsQueryable();

            if (!isAdmin)
            {
                query = query.Where(s => s.IsActive);
            }

            query = query.OrderBy(s => s.Id); 

            var totalCount = await query.CountAsync();

            var staffs = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(s => new StaffDto
                {
                    Id = s.Id,
                    FullName = s.FullName,
                    Email = s.Email,
                    IsActive = s.IsActive
                })
                .ToListAsync();

            return new PagedResultDto<StaffDto>
            {
                Data = staffs,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };
        }

        public async Task<StaffDto?> GetStaffByIdAsync(int id)
        {
            var staff = await _context.Staffs.FindAsync(id);
            if (staff == null) return null;

            return new StaffDto
            {
                Id = staff.Id,
                FullName = staff.FullName,
                Email = staff.Email,
                IsActive = staff.IsActive
            };
        }

        public async Task<(bool Success, string? ErrorMessage, StaffDto? Data)> CreateStaffAsync(CreateStaffDto dto)
        {
            var emailExists = await _context.Staffs.AnyAsync(s => s.Email == dto.Email);
            if (emailExists)
                return (false, "Email đã tồn tại", null);

            var staff = new Models.Staff
            {
                FullName = dto.FullName,
                Email = dto.Email,
                IsActive = true 
            };

            _context.Staffs.Add(staff);
            await _context.SaveChangesAsync();

            var result = new StaffDto
            {
                Id = staff.Id,
                FullName = staff.FullName,
                Email = staff.Email,
                IsActive = staff.IsActive
            };

            return (true, null, result);
        }

        public async Task<(bool Success, string? ErrorMessage)> UpdateStaffAsync(int id, UpdateStaffDto dto)
        {
            var staff = await _context.Staffs.FindAsync(id);
            if (staff == null)
                return (false, "Không tìm thấy nhân viên");

            var emailExists = await _context.Staffs.AnyAsync(s => s.Email == dto.Email && s.Id != id);
            if (emailExists)
                return (false, "Email đã tồn tại");

            staff.FullName = dto.FullName;
            staff.Email = dto.Email;

            await _context.SaveChangesAsync();
            return (true, null);
        }

        public async Task<bool> LockStaffAsync(int id)
        {
            var staff = await _context.Staffs.FindAsync(id);
            if (staff == null) return false;

            staff.IsActive = false; 
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UnlockStaffAsync(int id)
        {
            var staff = await _context.Staffs.FindAsync(id);
            if (staff == null) return false;

            staff.IsActive = true; 
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<List<StaffDto>> GetStaffsWorkingOnDateAsync(DateOnly date)
        {
            return await _context.Staffs
                .Where(s => s.IsActive && _context.WorkSchedules.Any(w => w.StaffId == s.Id && w.WorkDate == date))
                .Select(s => new StaffDto
                {
                    Id = s.Id,
                    FullName = s.FullName,
                    Email = s.Email,
                    IsActive = s.IsActive
                })
                .ToListAsync();
        }
      
    }
}
