using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Booking
    {
        public int Id { get; set; }

        [Required, MaxLength(50)]
        public string BookingCode { get; set; } = string.Empty;

        [Required]
        public int CustomerId { get; set; }

        [Required]
        public int ServiceId { get; set; }

        [Required]
        public int StaffId { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }

        [Required, MaxLength(20)]
        public string Status { get; set; } = "Pending"; // Pending, Confirmed, Completed, Cancelled

        [MaxLength(500)]
        public string? CustomerNote { get; set; }

        [MaxLength(500)]
        public string? CancellationReason { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navigation properties
        public User Customer { get; set; } = null!;
        public Service Service { get; set; } = null!;
        public Staff Staff { get; set; } = null!;
    }
}
