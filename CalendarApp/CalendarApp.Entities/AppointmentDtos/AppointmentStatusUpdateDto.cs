using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CalendarApp.Entities.AppointmentDtos
{
    /// <summary>
    /// Randevu durumu güncelleme DTO
    /// </summary>
    public class AppointmentStatusUpdateDto
    {
        public Status NewStatus { get; set; }
    }
}
