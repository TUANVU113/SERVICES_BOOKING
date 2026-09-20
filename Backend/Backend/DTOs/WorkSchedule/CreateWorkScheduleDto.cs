using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.WorkSchedule
{
    public class CreateWorkScheduleDto
    {
        [Required(ErrorMessage = "Ngày làm việc là bắt buộc")]
        public DateOnly WorkDate { get; set; }

        [Required(ErrorMessage = "Giờ bắt đầu là bắt buộc")]
        public TimeOnly StartTime { get; set; }

        [Required(ErrorMessage = "Giờ kết thúc là bắt buộc")]
        public TimeOnly EndTime { get; set; }
    }
}
