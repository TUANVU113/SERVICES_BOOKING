using Backend.Data;
using Backend.DTOs.Common;
using Backend.DTOs.WorkSchedule;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.WorkSchedule
{
    public class WorkScheduleService : IWorkScheduleService
    {
        private readonly ApplicationDbContext _context;

        public WorkScheduleService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<(bool Success, string? ErrorMessage, PagedResultDto<WorkScheduleDto>? Data)> GetWorkSchedulesByStaffAsync(
            int staffId, int pageNumber, int pageSize)
        {
            var staffExists = await _context.Staffs.AnyAsync(s => s.Id == staffId);
            if (!staffExists)
                return (false, "Không tìm thấy nhân viên", null);

            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 10;

            var query = _context.WorkSchedules
                .Where(w => w.StaffId == staffId)
                .OrderBy(w => w.WorkDate).ThenBy(w => w.StartTime); // bắt buộc có ORDER BY khi Skip/Take

            var totalCount = await query.CountAsync();

            var schedules = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(w => new WorkScheduleDto
                {
                    Id = w.Id,
                    StaffId = w.StaffId,
                    WorkDate = w.WorkDate,
                    StartTime = w.StartTime,
                    EndTime = w.EndTime
                })
                .ToListAsync();

            var result = new PagedResultDto<WorkScheduleDto>
            {
                Data = schedules,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };

            return (true, null, result);
        }

        public async Task<(bool Success, string? ErrorMessage, WorkScheduleDto? Data)> GetWorkScheduleByIdAsync(int staffId, int id)
        {
            var schedule = await _context.WorkSchedules
                .FirstOrDefaultAsync(w => w.Id == id && w.StaffId == staffId);

            if (schedule == null)
                return (false, "Không tìm thấy lịch làm việc", null);

            var dto = new WorkScheduleDto
            {
                Id = schedule.Id,
                StaffId = schedule.StaffId,
                WorkDate = schedule.WorkDate,
                StartTime = schedule.StartTime,
                EndTime = schedule.EndTime
            };

            return (true, null, dto);
        }

        public async Task<(bool Success, string? ErrorMessage, WorkScheduleDto? Data)> CreateWorkScheduleAsync(
            int staffId, CreateWorkScheduleDto dto)
        {
            // Điều kiện 1: StartTime phải nhỏ hơn EndTime
            if (dto.StartTime >= dto.EndTime)
                return (false, "Giờ bắt đầu phải nhỏ hơn giờ kết thúc", null);

            var staff = await _context.Staffs.FindAsync(staffId);
            if (staff == null)
                return (false, "Không tìm thấy nhân viên", null);

            // Điều kiện 3: không tạo lịch làm việc cho nhân viên bị khóa
            if (!staff.IsActive)
                return (false, "Nhân viên đã bị khóa, không thể tạo lịch làm việc", null);

            // Điều kiện 2: không trùng ca làm việc trong cùng ngày cho cùng nhân viên
            // Trùng khi: cùng ngày VÀ 2 khoảng giờ giao nhau (StartA < EndB && EndA > StartB)
            var isOverlapped = await _context.WorkSchedules.AnyAsync(w =>
                w.StaffId == staffId &&
                w.WorkDate == dto.WorkDate &&
                dto.StartTime < w.EndTime &&
                dto.EndTime > w.StartTime);

            if (isOverlapped)
                return (false, "Ca làm việc bị trùng với lịch đã có của nhân viên này", null);

            var schedule = new Models.WorkSchedule
            {
                StaffId = staffId,
                WorkDate = dto.WorkDate,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime
            };

            _context.WorkSchedules.Add(schedule);
            await _context.SaveChangesAsync();

            var result = new WorkScheduleDto
            {
                Id = schedule.Id,
                StaffId = schedule.StaffId,
                WorkDate = schedule.WorkDate,
                StartTime = schedule.StartTime,
                EndTime = schedule.EndTime
            };

            return (true, null, result);
        }

        public async Task<(bool Success, string? ErrorMessage)> UpdateWorkScheduleAsync(
            int staffId, int id, UpdateWorkScheduleDto dto)
        {
            // Điều kiện 1: StartTime phải nhỏ hơn EndTime
            if (dto.StartTime >= dto.EndTime)
                return (false, "Giờ bắt đầu phải nhỏ hơn giờ kết thúc");

            var schedule = await _context.WorkSchedules
                .FirstOrDefaultAsync(w => w.Id == id && w.StaffId == staffId);
            if (schedule == null)
                return (false, "Không tìm thấy lịch làm việc");

            var staff = await _context.Staffs.FindAsync(staffId);
            if (staff == null)
                return (false, "Không tìm thấy nhân viên");

            // Điều kiện 3: không cập nhật lịch cho nhân viên đang bị khóa
            if (!staff.IsActive)
                return (false, "Nhân viên đã bị khóa, không thể cập nhật lịch làm việc");

            // Điều kiện 2: không trùng với ca khác (loại trừ chính bản ghi đang sửa)
            var isOverlapped = await _context.WorkSchedules.AnyAsync(w =>
                w.StaffId == staffId &&
                w.Id != id &&
                w.WorkDate == dto.WorkDate &&
                dto.StartTime < w.EndTime &&
                dto.EndTime > w.StartTime);

            if (isOverlapped)
                return (false, "Ca làm việc bị trùng với lịch đã có của nhân viên này");

            schedule.WorkDate = dto.WorkDate;
            schedule.StartTime = dto.StartTime;
            schedule.EndTime = dto.EndTime;

            await _context.SaveChangesAsync();
            return (true, null);
        }
        public async Task<(bool Success, string? ErrorMessage)> DeleteWorkScheduleAsync(int staffId, int id)
        {
            var schedule = await _context.WorkSchedules
                .FirstOrDefaultAsync(w => w.Id == id && w.StaffId == staffId);

            if (schedule == null)
                return (false, "Không tìm thấy lịch làm việc");

            _context.WorkSchedules.Remove(schedule);
            await _context.SaveChangesAsync();
            return (true, null);
        }

    }
}
