using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CalendarApp.Entities.CustomerDtos
{
    /// <summary>
    /// Müşteri bilgilerini güncelleme
    /// </summary>
    public class CustomerUpdateDto
    {
        public string Name { get; set; }
        public string Surname { get; set; }
        public string Phone { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
    }
}
