using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CalendarApp.Entities.ManagerDtos
{
    /// <summary>
    /// Yönetici bilgilerini getir- bütün alanlarla beraber
    /// </summary>
    public class ManagerGetDto
    {
        public int Id { get; set; }
        public string TcNo { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Address { get; set; }
    }
}
