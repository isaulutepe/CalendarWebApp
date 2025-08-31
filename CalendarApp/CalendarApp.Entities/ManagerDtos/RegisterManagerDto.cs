using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CalendarAppDemo2.Entities.User_Dtos
{
    /// <summary>
    /// Yeni yönetici ekleme için dto
    /// </summary>
    public class RegisterManagerDto
    {
        [Required]
        public string TcNo { get; set; }
        [Required]
        public string Name { get; set; }
        [Required]
        public string Surname { get; set; }
        [EmailAddress]
        [Required]
        public string Email { get; set; }
        [Required]
        public string Password { get; set; }
        [Required]
        public string Address { get; set; }

    }
}
