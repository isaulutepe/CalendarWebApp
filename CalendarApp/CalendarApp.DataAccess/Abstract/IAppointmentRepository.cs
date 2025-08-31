using CalendarApp.Entities;
using CalendarAppDemo2.Entities.Appointment_Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace CalendarApp.DataAccess.Abstract
{
    public interface IAppointmentRepository
    {
        Task<Appointment> GetByIdAsync(int id);
        Task<List<Appointment>> GetAllAsync();
        Task<Appointment> CreateAsync(Appointment appointment);
        Task<Appointment> UpdateAsync(Appointment appointment);
        Task DeleteAsync(int id);
        Task<List<Appointment>> GetByCustomerIdAsync(int customerId);
        Task<List<Appointment>> GetByManagerIdAsync(int managerId);
        Task<AppointmentCustomer> AddCustomerToAppointmentAsync(int appointmentId, int customerId, int managerId);
        Task<bool> RemoveCustomerFromAppointmentAsync(int appointmentId, int customerId);
        Task<bool> IsCustomerInAppointmentAsync(int appointmentId, int customerId);
    }
}
