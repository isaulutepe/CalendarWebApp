using CalendarApp.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CalendarApp.Bussiness.Abstract
{
    public interface IManagerService
    {
        Task<Manager> AddAsync(Manager manager);
        Task<Manager> UpdateAsync(int id,Manager manager);
        Task DeleteAsync(int id);
        Task<Manager> GetByIdAsync(int id);
        Task<Manager> GetByEmailAsync(string email);
        Task<Manager> GetByTcNoAsync(string tcNo);
        Task<List<Manager>> GetAllAsync();
        Task<Manager> UpdatePasswordAsync(int id, string password);
        
    }
}
