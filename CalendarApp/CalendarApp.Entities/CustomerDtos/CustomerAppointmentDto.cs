using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CalendarApp.Entities.CustomerDtos
{
    /// <summary>
    /// Müşteri Randevu ilişkisi
    /// </summary>
    public class CustomerAppointmentDto
    {
        [Required]
        public int AppointmentId { get; set; }

        [Required]
        public int CustomerId { get; set; }

        [Required]
        public int ManagerId { get; set; } // İşlemi yapan yönetici
    }
}
