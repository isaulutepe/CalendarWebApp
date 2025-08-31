using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CalendarApp.Entities;
using CalendarApp.Entities.CustomerDtos;
using CalendarApp.Entities.ManagerDtos;

namespace CalendarAppDemo2.Entities.Appointment_Dtos
{
    /// <summary>
    /// Randevuları görüntüleme dto(Müşterilerle birlikte)
    /// </summary>
    public class AppointmentGetDto
    {
        public int Id { get; set; }
        public string Note { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public DurationType DurationType { get; set; }
        public int DurationValue { get; set; }
        public Status Status { get; set; }
        public ManagerGetByNameDto Manager { get; set; }
        public List<CustomerGetByNameDto> Customers { get; set; } = new();
    }
}
