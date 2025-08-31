using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CalendarApp.Entities.CustomerDtos
{
    /// <summary>
    /// Müşterileri getir- belirli parametreleri
    /// </summary>
    public class CustomerGetByNameDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
    }
}
