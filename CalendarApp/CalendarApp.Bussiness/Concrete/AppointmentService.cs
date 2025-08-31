using CalendarApp.Bussiness.Abstract;
using CalendarApp.DataAccess;
using CalendarApp.DataAccess.Abstract;
using CalendarApp.DataAccess.Concrete;
using CalendarApp.Entities;
using CalendarApp.Entities.CustomerDtos;
using CalendarAppDemo2.Entities.Appointment_Dtos;

namespace CalendarApp.Bussiness.Concrete
{
    /// <summary>
    /// Randevu işlemlerini yöneten servis sınıfı
    /// </summary>
    public class AppointmentService : IAppointmentService
    {
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly ICustomerRepository _customerRepository;
        private readonly IManagerRepository _managerRepository;
        /// <summary>
        /// Bağımlılıkları enjekte ederek servis örneği oluşturur
        /// </summary>
        public AppointmentService(IAppointmentRepository appointmentRepository,
                                IManagerRepository managerRepository,
                                ICustomerRepository customerRepository)
        {
            _appointmentRepository = appointmentRepository;
            _managerRepository = managerRepository;
            _customerRepository = customerRepository;
        }
        /// Yeni bir randevu oluşturur
        /// </summary>
        /// <param name="dto">Randevu oluşturma veri transfer nesnesi</param>
        /// <returns>Oluşturulan randevu nesnesi</returns>
        /// <exception cref="ArgumentException">Geçersiz süre değeri için</exception>
        /// <exception cref="KeyNotFoundException">Yönetici veya müşteri bulunamadığında</exception>
        public async Task<Appointment> CreateAppointmentAsync(AppointmentCreateDto dto)
        {
            // Validasyonlar
            if (dto.DurationValue <= 0)
                throw new ArgumentException("Geçerli bir süre değeri giriniz.");

            var manager = await _managerRepository.GetByIdAsync(dto.ManagerId);
            if (manager == null)
                throw new KeyNotFoundException("Yönetici bulunamadı");

            foreach (var customerId in dto.CustomerIds)
            {
                var customer = await _customerRepository.GetByIdAsync(customerId);
                if (customer == null)
                    throw new KeyNotFoundException($"Müşteri ID {customerId} bulunamadı");
            }

            // Appointment oluştur
            var appointment = new Appointment
            {
                Note = dto.Note,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                DurationType = dto.DurationType,
                DurationValue = dto.DurationValue,
                ManagerId = dto.ManagerId,
                Status = Status.Planned
            };

            // Transaction kullanarak veri tutarlılığını sağla  
            using (var dbContext = new CalenderAppDbContext())
            {
                // Randevuyu kaydet
                await dbContext.Appointments.AddAsync(appointment);
                await dbContext.SaveChangesAsync();

                // Müşteri ilişkilerini kaydet
                foreach (var customerId in dto.CustomerIds)
                {
                    await dbContext.AppointmentCustomers.AddAsync(new AppointmentCustomer
                    {
                        AppointmentId = appointment.Id,
                        CustomerId = customerId,
                        CreatedByManagerId = dto.ManagerId,
                        CreatedAt = DateTime.UtcNow
                    });
                }
                await dbContext.SaveChangesAsync();

                // Tam veriyi döndür
                return await _appointmentRepository.GetByIdAsync(appointment.Id);
            }
        }
        /// <summary>
        /// Varolan bir randevuyu günceller
        /// </summary>
        /// <param name="id">Güncellenecek randevu ID'si</param>
        /// <param name="dto">Randevu güncelleme veri transfer nesnesi</param>
        /// <returns>Güncellenen randevu nesnesi</returns>
        /// <exception cref="KeyNotFoundException">Randevu bulunamadığında</exception>
        public async Task<Appointment> UpdateAsync(int id, AppointmentUpdateDto dto)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(id);
            if (appointment == null)
                throw new KeyNotFoundException("Randevu bulunamadı");

            appointment.Note = dto.Note;
            appointment.StartTime = dto.StartTime;
            appointment.EndTime = dto.EndTime;
            appointment.DurationType = dto.DurationType;
            appointment.DurationValue = dto.DurationValue;

            return await _appointmentRepository.UpdateAsync(appointment);
        }
        /// <summary>
        /// Randevunun durumunu günceller
        /// </summary>
        /// <param name="id">Randevu ID'si</param>
        /// <param name="newStatus">Yeni durum</param>
        /// <returns>Güncellenen randevu nesnesi</returns>
        /// <exception cref="KeyNotFoundException">Randevu bulunamadığında</exception>
        public async Task<Appointment> UpdateStatusAsync(int id, Status newStatus)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(id);
            if (appointment == null)
                throw new KeyNotFoundException("Randevu bulunamadı");

            appointment.Status = newStatus;
            return await _appointmentRepository.UpdateAsync(appointment);
        }
        /// <summary>
        /// Belirtilen ID'ye sahip randevuyu siler
        /// </summary>
        /// <param name="id">Silinecek randevu ID'si</param>
        /// <exception cref="KeyNotFoundException">Randevu bulunamadığında</exception>
        public async Task DeleteAsync(int id)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(id);
            if (appointment == null)
                throw new KeyNotFoundException("Randevu bulunamadı");

            await _appointmentRepository.DeleteAsync(id);
        }
        /// <summary>
        /// Tüm randevuları listeler
        /// </summary>
        /// <returns>Randevu listesi</returns>
        public async Task<List<Appointment>> GetAllAsync()
        {
            return await _appointmentRepository.GetAllAsync();
        }
        /// <summary>
        /// Belirtilen ID'ye sahip randevuyu getirir
        /// </summary>
        /// <param name="id">Randevu ID'si</param>
        /// <returns>Randevu nesnesi</returns>
        /// <exception cref="KeyNotFoundException">Randevu bulunamadığında</exception>
        public async Task<Appointment> GetByIdAsync(int id)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(id);
            if (appointment == null)
                throw new KeyNotFoundException("Randevu bulunamadı");
            return appointment;
        }
        /// <summary>
        /// Belirtilen müşteriye ait randevuları listeler
        /// </summary>
        /// <param name="customerId">Müşteri ID'si</param>
        /// <returns>Randevu listesi</returns>
        /// <exception cref="KeyNotFoundException">Müşteri bulunamadığında</exception>
        public async Task<List<Appointment>> GetByCustomerIdAsync(int customerId)
        {
            var customer = await _customerRepository.GetByIdAsync(customerId);
            if (customer == null)
                throw new KeyNotFoundException("Müşteri bulunamadı");

            return await _appointmentRepository.GetByCustomerIdAsync(customerId);
        }
        /// <summary>
        /// Belirtilen yöneticiye ait randevuları listeler
        /// </summary>
        /// <param name="managerId">Yönetici ID'si</param>
        /// <returns>Randevu listesi</returns>
        public async Task<List<Appointment>> GetByManagerIdAsync(int managerId)
        {
            return await _appointmentRepository.GetByManagerIdAsync(managerId);
        }
        /// <summary>
        /// Müşteriyi belirtilen randevuya ekler
        /// </summary>
        /// <param name="dto">Müşteri-randevu ilişki veri transfer nesnesi</param>
        /// <returns>Güncellenen randevu nesnesi</returns>
        /// <exception cref="KeyNotFoundException">Randevu, müşteri veya yönetici bulunamadığında</exception>
        public async Task<Appointment> AddCustomerToAppointmentAsync(CustomerAppointmentDto dto)
        {
            // Validasyonlar
            var appointment = await _appointmentRepository.GetByIdAsync(dto.AppointmentId);
            if (appointment == null)
                throw new KeyNotFoundException("Randevu bulunamadı");

            var customer = await _customerRepository.GetByIdAsync(dto.CustomerId);
            if (customer == null)
                throw new KeyNotFoundException("Müşteri bulunamadı");

            var manager = await _managerRepository.GetByIdAsync(dto.ManagerId);
            if (manager == null)
                throw new KeyNotFoundException("Yönetici bulunamadı");

            // Müşteriyi ekle
            await _appointmentRepository.AddCustomerToAppointmentAsync(
                dto.AppointmentId,
                dto.CustomerId,
                dto.ManagerId);

            // Güncellenmiş randevuyu döndür
            return await _appointmentRepository.GetByIdAsync(dto.AppointmentId);
        }
        /// <summary>
        /// Müşteriyi belirtilen randevudan çıkarır
        /// </summary>
        /// <param name="dto">Müşteri-randevu ilişki veri transfer nesnesi</param>
        /// <returns>Güncellenen randevu nesnesi</returns>
        /// <exception cref="KeyNotFoundException">Randevu veya müşteri bulunamadığında</exception>
        /// <exception cref="InvalidOperationException">Müşteri randevuya kayıtlı değilse</exception>
        public async Task<Appointment> RemoveCustomerFromAppointmentAsync(CustomerAppointmentDto dto)
        {
            // Validasyonlar
            var appointment = await _appointmentRepository.GetByIdAsync(dto.AppointmentId);
            if (appointment == null)
                throw new KeyNotFoundException("Randevu bulunamadı");

            var customer = await _customerRepository.GetByIdAsync(dto.CustomerId);
            if (customer == null)
                throw new KeyNotFoundException("Müşteri bulunamadı");

            // Müşteriyi çıkar
            var result = await _appointmentRepository.RemoveCustomerFromAppointmentAsync(
                dto.AppointmentId,
                dto.CustomerId);

            if (!result)
                throw new InvalidOperationException("Müşteri bu randevuya kayıtlı değil");

            // Güncellenmiş randevuyu döndür
            return await _appointmentRepository.GetByIdAsync(dto.AppointmentId);
        }
    }
}
