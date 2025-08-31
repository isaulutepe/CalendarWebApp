using CalendarApp.DataAccess.Abstract;
using CalendarApp.Entities;
using Microsoft.EntityFrameworkCore;

namespace CalendarApp.DataAccess.Concrete
{
    /// <summary>
    /// Customer entity'si için veritabanı işlemlerini yürüten repository sınıfı
    /// </summary>
    public class CustomerRepository : ICustomerRepository
    {
        /// <summary>
        /// Yeni bir müşteri ekler
        /// </summary>
        /// <param name="customer">Eklenecek müşteri nesnesi</param>
        /// <returns>Eklenen müşteri nesnesini döndürür</returns>
        public async Task<Customer> AddAsync(Customer customer)
        {
            using (var dbContext = new CalenderAppDbContext())
            {
                var added = await dbContext.Customers.AddAsync(customer);
                dbContext.SaveChanges();
                return added.Entity;
            }
        }
        /// <summary>
        /// Belirtilen ID'ye sahip müşteriyi siler
        /// </summary>
        /// <param name="id">Silinecek müşterinin ID'si</param>
        public async Task DeleteAsync(int id)
        {
            using (var dbContext = new CalenderAppDbContext())
            {
                var deleted = await dbContext.Customers.FirstOrDefaultAsync(x => x.Id == id);
                dbContext.Customers.Remove(deleted);
                dbContext.SaveChanges();
            }
        }
        /// <summary>
        /// Tüm müşterileri listeler
        /// </summary>
        /// <returns>Müşteri listesini döndürür</returns>
        public async Task<List<Customer>> GetAllAsync()
        {
            using (var dbContext = new CalenderAppDbContext())
            {
                return await dbContext.Customers.ToListAsync();
            }
        }
        /// <summary>
        /// Belirtilen ID'ye sahip müşteriyi getirir
        /// </summary>
        /// <param name="id">Getirilecek müşterinin ID'si</param>
        /// <returns>Müşteri nesnesini döndürür</returns>
        public async Task<Customer> GetByIdAsync(int id)
        {
            using (var dbContext = new CalenderAppDbContext())
            {
                return await dbContext.Customers.FirstOrDefaultAsync(x => x.Id == id);
            }
        }
        /// <summary>
        /// Müşteri bilgilerini günceller
        /// </summary>
        /// <param name="id">Güncellenecek müşterinin ID'si</param>
        /// <param name="customer">Yeni müşteri bilgileri</param>
        /// <returns>Güncellenen müşteri nesnesini döndürür</returns>
        public async Task<Customer> UpdateAsync(int id, Customer customer)
        {
            using (var dbContext = new CalenderAppDbContext())
            {
                var currentCustomer = await dbContext.Customers.FirstOrDefaultAsync(x => x.Id == id);
                currentCustomer.Name = customer.Name;
                currentCustomer.Surname = customer.Surname;
                currentCustomer.Address = customer.Address;
                currentCustomer.Phone = customer.Phone;
                currentCustomer.City = customer.City;
                dbContext.SaveChanges();
                return customer;
            }
        }
    }
}
