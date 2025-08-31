using CalendarApp.Entities;
using Microsoft.EntityFrameworkCore;
using System.Runtime.ConstrainedExecution;


namespace CalendarApp.DataAccess
{
    public class CalenderAppDbContext : DbContext
    {
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            //Veritabanı bağlantısı gerçekleştirir.
            base.OnConfiguring(optionsBuilder);
            optionsBuilder.UseSqlServer("Server=localhost\\SQLEXPRESS; DataBase=CalendarApp; uid=jesus1; pwd=30032001B.; TrustServerCertificate=True;");
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<AppointmentCustomer>()
         .HasKey(ac => new { ac.AppointmentId, ac.CustomerId });

            // Appointment - AppointmentCustomer ilişkisi
            modelBuilder.Entity<AppointmentCustomer>()
                .HasOne(ac => ac.Appointment)
                .WithMany(a => a.AppointmentCustomers)
                .HasForeignKey(ac => ac.AppointmentId)
                .OnDelete(DeleteBehavior.Cascade);

            // Customer - AppointmentCustomer ilişkisi
            modelBuilder.Entity<AppointmentCustomer>()
                .HasOne(ac => ac.Customer)
                .WithMany(c => c.AppointmentCustomers)
                .HasForeignKey(ac => ac.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            // Manager - AppointmentCustomer ilişkisi 
            modelBuilder.Entity<AppointmentCustomer>()
                .HasOne(ac => ac.CreatedByManager)
                .WithMany()
                .HasForeignKey(ac => ac.CreatedByManagerId)
                .OnDelete(DeleteBehavior.Restrict);

            // Appointment ↔ Manager ilişkisi
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Manager)
                .WithMany(m => m.Appointments) // Manager'daki Appointments koleksiyonunu referans göster
                .HasForeignKey(a => a.ManagerId)
                .OnDelete(DeleteBehavior.Restrict);
        }
        //Bu DbSet’ler Entity Framework üzerinden veritabanı tablolarını temsil eder.
        //CRUD işlemleri bu DbSet’ler üzerinden yapılır.
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Manager> Managers { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<AppointmentCustomer> AppointmentCustomers { get; set; }
    }
}
