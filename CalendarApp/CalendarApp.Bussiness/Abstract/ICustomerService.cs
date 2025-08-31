using CalendarApp.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CalendarApp.Bussiness.Abstract
{
    public interface ICustomerService
    {
        Task<Customer> AddAsync(Customer customer);
        Task<Customer> UpdateAsync(int id, Customer customer);
        Task DeleteAsync(int id);
        Task<Customer> GetByIdAsync(int id);
        Task<List<Customer>> GetAllAsync();
    }
}
