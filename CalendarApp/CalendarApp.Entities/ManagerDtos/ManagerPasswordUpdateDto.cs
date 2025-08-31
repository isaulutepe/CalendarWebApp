using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CalendarAppDemo2.Entities.User_Dtos
{
    /// <summary>
    /// Yönetici şifre güncelleme
    /// </summary>
    public class ManagerPasswordUpdateDto
    {
        public string OldPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
