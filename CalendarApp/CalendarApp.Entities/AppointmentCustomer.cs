using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CalendarApp.Entities
{
    public class AppointmentCustomer
    {
        public int AppointmentId { get; set; }
        public Appointment Appointment { get; set; }
        public int CustomerId { get; set; }
        public Customer Customer { get; set; }
        public int CreatedByManagerId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Manager CreatedByManager { get; set; }
    }
}
