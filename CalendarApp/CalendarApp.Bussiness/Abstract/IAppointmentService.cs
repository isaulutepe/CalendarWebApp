using CalendarApp.Entities;
using CalendarApp.Entities.CustomerDtos;
using CalendarAppDemo2.Entities.Appointment_Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CalendarApp.Bussiness.Abstract
{
    public interface IAppointmentService
    {
        Task<Appointment> GetByIdAsync(int id);
        Task<List<Appointment>> GetAllAsync();
        Task<Appointment> CreateAppointmentAsync(AppointmentCreateDto dto);
        Task<Appointment> UpdateAsync(int id, AppointmentUpdateDto dto);
        Task<Appointment> UpdateStatusAsync(int id, Status newStatus);
        Task DeleteAsync(int id);
        Task<List<Appointment>> GetByCustomerIdAsync(int customerId);
        Task<List<Appointment>> GetByManagerIdAsync(int managerId);
        Task<Appointment> AddCustomerToAppointmentAsync(CustomerAppointmentDto dto);
        Task<Appointment> RemoveCustomerFromAppointmentAsync(CustomerAppointmentDto dto);

    }
}
