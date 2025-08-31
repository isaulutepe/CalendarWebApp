using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CalendarApp.Entities.CustomerDtos
{
    /// <summary>
    /// Müşterileri getir - Randevularla beraber
    /// </summary>
    public class CustomerGetByAppointmensDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public string Phone { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        //// Navigation Property (One-to-Many)
        public ICollection<Appointment> Appointments { get; set; }
    }
}
