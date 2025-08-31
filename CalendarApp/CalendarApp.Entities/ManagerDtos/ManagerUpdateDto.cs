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
    /// Yönetici güncelleme dto
    /// </summary>
    public class ManagerUpdateDto
    {
        public int Id { get; set; } //Güncellenecek olan ile karşılatırmak için.
        public string TcNo { get; set; }
        [Required]
        public string Name { get; set; }
        [Required]
        public string Surname { get; set; }
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        [Required]
        public string Address { get; set; }
    }
}
