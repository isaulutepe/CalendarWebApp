using CalendarApp.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CalendarAppDemo2.Entities.Appointment_Dtos
{
    /// <summary>
    /// Randevu güncelleme Dto
    /// </summary>
    public class AppointmentUpdateDto
    {
        [Required] public int Id { get; set; }
        public string Note { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public DurationType DurationType { get; set; }
        public int DurationValue { get; set; }

    }
}
