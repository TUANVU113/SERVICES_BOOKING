using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Booking
{
    public class CancelBookingDto
    {
        [MaxLength(500)]
        public string? CancellationReason { get; set; }
    }
}
