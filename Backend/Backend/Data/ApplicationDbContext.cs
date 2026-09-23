using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Service> Services { get; set; } = null!;
        public DbSet<Staff> Staffs { get; set; } = null!;
        public DbSet<WorkSchedule> WorkSchedules { get; set; } = null!;
        public DbSet<Booking> Bookings { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

           
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(e => e.Email).IsUnique(); 
                entity.Property(e => e.Role).HasDefaultValue("Customer");
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("SYSDATETIME()");
            });

            
            modelBuilder.Entity<Service>(entity =>
            {
                entity.Property(e => e.IsActive).HasDefaultValue(true);

                entity.ToTable(t =>
                {
                    t.HasCheckConstraint("CK_Services_Duration", "DurationMinutes > 0");
                    t.HasCheckConstraint("CK_Services_Price", "Price >= 0");
                });
            });

            
            modelBuilder.Entity<Staff>(entity =>
            {
                entity.HasIndex(e => e.Email).IsUnique(); 
                entity.Property(e => e.IsActive).HasDefaultValue(true);
            });

           
            modelBuilder.Entity<WorkSchedule>(entity =>
            {
                entity.HasOne(e => e.Staff)
                      .WithMany(s => s.WorkSchedules)
                      .HasForeignKey(e => e.StaffId)
                      .OnDelete(DeleteBehavior.Cascade); 

                entity.HasIndex(e => e.StaffId); 

                entity.ToTable(t =>
                {
                    t.HasCheckConstraint("CK_WorkSchedule_Time", "EndTime > StartTime");
                });
            });

            
            modelBuilder.Entity<Booking>(entity =>
            {
                entity.HasIndex(e => e.BookingCode).IsUnique(); 
                entity.HasIndex(e => e.CustomerId); 
                entity.HasIndex(e => e.StaffId);
                entity.HasIndex(e => e.ServiceId);

                entity.Property(e => e.Status).HasDefaultValue("Pending");
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("SYSDATETIME()");

                entity.HasOne(e => e.Customer)
                      .WithMany(u => u.Bookings)
                      .HasForeignKey(e => e.CustomerId)
                      .OnDelete(DeleteBehavior.Restrict); 

                entity.HasOne(e => e.Service)
                      .WithMany(s => s.Bookings)
                      .HasForeignKey(e => e.ServiceId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Staff)
                      .WithMany(s => s.Bookings)
                      .HasForeignKey(e => e.StaffId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.ToTable(t =>
                {
                    t.HasCheckConstraint("CK_Bookings_Status",
                        "Status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled')");
                    t.HasCheckConstraint("CK_Bookings_Time", "EndTime > StartTime");
                });
            });
        }
    }
}