using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class WorkSchedule
    {
        public int Id { get; set; }

        [Required]
        public int StaffId { get; set; }

        [Required]
        public DateOnly WorkDate { get; set; }

        [Required]
        public TimeOnly StartTime { get; set; }

        [Required]
        public TimeOnly EndTime { get; set; }

        // Navigation property
        public Staff Staff { get; set; } = null!;
    }
}
