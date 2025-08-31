using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CalendarApp.Entities.AppointmentDtos
{
    /// <summary>
    /// Kullanıcı Ekleme Dto
    /// </summary>
    public class AddCustomerDto
    {
        [Required] public int CustomerId { get; set; }
        [Required] public int ManagerId { get; set; }
    }
}
