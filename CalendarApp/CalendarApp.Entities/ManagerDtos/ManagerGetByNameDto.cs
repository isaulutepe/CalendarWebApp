using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CalendarApp.Entities.ManagerDtos
{
    /// <summary>
    /// Yönetici bilgilerini getir- yalnızca belirli alanları
    /// </summary>
    public class ManagerGetByNameDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
    }
}
