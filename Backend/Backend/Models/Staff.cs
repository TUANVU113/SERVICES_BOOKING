using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Staff
    {
        public int Id { get; set; }

        [Required, MaxLength(150)]
        public string FullName { get; set; } = string.Empty;

        [Required, MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        // Navigation properties
        public ICollection<WorkSchedule> WorkSchedules { get; set; } = new List<WorkSchedule>();
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
