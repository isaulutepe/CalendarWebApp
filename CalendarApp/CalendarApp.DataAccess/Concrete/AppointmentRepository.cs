using CalendarApp.DataAccess.Abstract;
using CalendarApp.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace CalendarApp.DataAccess.Concrete
{
    /// <summary>
    /// Randevu (Appointment) işlemleri için veritabanı repository sınıfı
    /// </summary>
    public class AppointmentRepository : IAppointmentRepository
    {
        /// <summary>
        /// Yeni bir randevu oluşturur
        /// </summary>
        /// <param name="appointment">Oluşturulacak randevu nesnesi</param>
        /// <returns>Oluşturulan randevu nesnesini döndürür</returns>
        public async Task<Appointment> CreateAsync(Appointment appointment)
            {
                using (var dbContext = new CalenderAppDbContext())
                {
                    await dbContext.Appointments.AddAsync(appointment);
                    await dbContext.SaveChangesAsync();
                    return appointment;
                }
            }
        /// <summary>
        /// Belirtilen ID'ye sahip randevuyu siler
        /// </summary>
        /// <param name="id">Silinecek randevunun ID'si</param>
        /// <remarks>Randevuyla ilişkili müşteri bağlantılarını da siler</remarks>
        public async Task DeleteAsync(int id)
            {
                using (var dbContext = new CalenderAppDbContext())
                {
                    var appointment = await dbContext.Appointments
                        .Include(a => a.AppointmentCustomers)
                        .FirstOrDefaultAsync(a => a.Id == id);

                    if (appointment != null)
                    {
                        dbContext.Appointments.Remove(appointment);
                        await dbContext.SaveChangesAsync();
                    }
                }
            }
        /// <summary>
        /// Tüm randevuları getirir
        /// </summary>
        /// <returns>Randevu listesini döndürür (Yönetici ve müşteri bilgileri dahil)</returns>
        public async Task<List<Appointment>> GetAllAsync()
            {
                using (var dbContext = new CalenderAppDbContext())
                {
                    return await dbContext.Appointments
                        .Include(a => a.Manager)
                        .Include(a => a.AppointmentCustomers)
                            .ThenInclude(ac => ac.Customer)
                        .ToListAsync();
                }
            }
        /// <summary>
        /// Belirtilen ID'ye sahip randevuyu getirir
        /// </summary>
        /// <param name="id">Getirilecek randevunun ID'si</param>
        /// <returns>Randevu nesnesini döndürür (Yönetici ve müşteri bilgileri dahil)</returns>
        public async Task<Appointment> GetByIdAsync(int id)
            {
                using (var dbContext = new CalenderAppDbContext())
                {
                    return await dbContext.Appointments
                        .Include(a => a.Manager)
                        .Include(a => a.AppointmentCustomers)
                            .ThenInclude(ac => ac.Customer)
                        .FirstOrDefaultAsync(a => a.Id == id);
                }
            }
        /// <summary>
        /// Belirtilen müşteri ID'sine ait randevuları getirir
        /// </summary>
        /// <param name="customerId">Müşteri ID'si</param>
        /// <returns>Müşteriye ait randevu listesini döndürür</returns>
        public async Task<List<Appointment>> GetByCustomerIdAsync(int customerId)
            {
                using (var dbContext = new CalenderAppDbContext())
                {
                    return await dbContext.Appointments
                        .Where(a => a.AppointmentCustomers.Any(ac => ac.CustomerId == customerId))
                        .Include(a => a.Manager)
                        .Include(a => a.AppointmentCustomers)
                            .ThenInclude(ac => ac.Customer)
                        .ToListAsync();
                }
            }
        /// <summary>
        /// Randevu bilgilerini günceller
        /// </summary>
        /// <param name="appointment">Güncellenecek randevu bilgileri</param>
        /// <returns>Güncellenen randevu nesnesini döndürür</returns>
        public async Task<Appointment> UpdateAsync(Appointment appointment)
            {
                using (var dbContext = new CalenderAppDbContext())
                {
                    dbContext.Appointments.Update(appointment);
                    await dbContext.SaveChangesAsync();
                    return appointment;
                }
            }
        /// <summary>
        /// Belirtilen yönetici ID'sine ait randevuları getirir
        /// </summary>
        /// <param name="managerId">Yönetici ID'si</param>
        /// <returns>Yöneticiye ait randevu listesini döndürür</returns>
        public async Task<List<Appointment>> GetByManagerIdAsync(int managerId)
            {
                using (var dbContext = new CalenderAppDbContext())
                {
                    return await dbContext.Appointments
                        .Where(a => a.ManagerId == managerId)
                        .Include(a => a.Manager)
                        .Include(a => a.AppointmentCustomers)
                            .ThenInclude(ac => ac.Customer)
                        .ToListAsync();
                }
            }
        /// <summary>
        /// Müşteriyi belirtilen randevuya ekler
        /// </summary>
        /// <param name="appointmentId">Randevu ID'si</param>
        /// <param name="customerId">Müşteri ID'si</param>
        /// <param name="managerId">İşlemi yapan yönetici ID'si</param>
        /// <returns>Oluşturulan randevu-müşteri ilişkisini döndürür</returns>
        /// <exception cref="InvalidOperationException">Müşteri zaten randevuya ekliyse fırlatılır</exception>
        public async Task<AppointmentCustomer> AddCustomerToAppointmentAsync(int appointmentId, int customerId, int managerId)
            {
                using (var dbContext = new CalenderAppDbContext())
                {
                    // Müşteri zaten ekli mi kontrolü
                    var existing = await dbContext.AppointmentCustomers
                        .FirstOrDefaultAsync(ac => ac.AppointmentId == appointmentId && ac.CustomerId == customerId);

                    if (existing != null)
                        throw new InvalidOperationException("Müşteri zaten bu randevuya ekli");

                    var appointmentCustomer = new AppointmentCustomer
                    {
                        AppointmentId = appointmentId,
                        CustomerId = customerId,
                        CreatedByManagerId = managerId,
                        CreatedAt = DateTime.UtcNow
                    };

                    await dbContext.AppointmentCustomers.AddAsync(appointmentCustomer);
                    await dbContext.SaveChangesAsync();
                    return appointmentCustomer;
                }
            }
        /// <summary>
        /// Müşteriyi belirtilen randevudan çıkarır
        /// </summary>
        /// <param name="appointmentId">Randevu ID'si</param>
        /// <param name="customerId">Müşteri ID'si</param>
        /// <returns>İşlem başarılıysa true, aksi halde false döndürür</returns>
        public async Task<bool> RemoveCustomerFromAppointmentAsync(int appointmentId, int customerId)
            {
                using (var dbContext = new CalenderAppDbContext())
                {
                    var appointmentCustomer = await dbContext.AppointmentCustomers
                        .FirstOrDefaultAsync(ac => ac.AppointmentId == appointmentId && ac.CustomerId == customerId);

                    if (appointmentCustomer == null)
                        return false;

                    dbContext.AppointmentCustomers.Remove(appointmentCustomer);
                    await dbContext.SaveChangesAsync();
                    return true;
                }
            }
        /// <summary>
        /// Müşterinin belirtilen randevuya ekli olup olmadığını kontrol eder
        /// </summary>
        /// <param name="appointmentId">Randevu ID'si</param>
        /// <param name="customerId">Müşteri ID'si</param>
        /// <returns>Müşteri randevuya ekliyse true, aksi halde false döndürür</returns>
        public async Task<bool> IsCustomerInAppointmentAsync(int appointmentId, int customerId)
            {
                using (var dbContext = new CalenderAppDbContext())
                {
                    return await dbContext.AppointmentCustomers
                        .AnyAsync(ac => ac.AppointmentId == appointmentId && ac.CustomerId == customerId);
                }
            }
        }
}
