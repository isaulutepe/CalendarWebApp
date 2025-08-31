using CalendarApp.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CalendarApp.DataAccess.Abstract
{
    public interface IManagerRepository
    {
        Task<Manager> AddAsync(Manager manager);
        Task<Manager> UpdateAsync(int id, Manager manager);
        Task DeleteAsync(int id);
        Task<Manager> GetByIdAsync(int id);
        Task<Manager> GetByTcNoAsync(string tcNo);
        Task<Manager> GetByEmailAsync(string email);
        Task<List<Manager>> GetAllAsync();
        Task<Manager> UpdatePasswordAsync(int id, string password);

    }
}
