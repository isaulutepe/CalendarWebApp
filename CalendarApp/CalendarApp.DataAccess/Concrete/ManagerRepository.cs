using CalendarApp.DataAccess.Abstract;
using CalendarApp.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Scaffolding.Metadata;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace CalendarApp.DataAccess.Concrete
{
    /// <summary>
    /// Manager entity'si için veritabanı işlemlerini yürüten repository sınıfı
    /// </summary>
    public class ManagerRepository : IManagerRepository
    {
        /// <summary>
        /// Yeni bir yönetici ekler
        /// </summary>
        /// <param name="manager">Eklenecek yönetici nesnesi</param>
        /// <returns>Eklenen yönetici nesnesini döndürür</returns>
        public async Task<Manager> AddAsync(Manager manager)
        {
            using (var dbContext = new CalenderAppDbContext())
            {
                var added = await dbContext.Managers.AddAsync(manager);
                await dbContext.SaveChangesAsync();
                return added.Entity;
            }
        }
        /// <summary>
        /// Belirtilen ID'ye sahip yöneticiyi siler
        /// </summary>
        /// <param name="id">Silinecek yöneticinin ID'si</param>
        public async Task DeleteAsync(int id)
        {
            using (var dbContext = new CalenderAppDbContext())
            {
                var deleted = await dbContext.Managers.FirstOrDefaultAsync(x => x.Id == id);
                dbContext.Managers.Remove(deleted);
                await dbContext.SaveChangesAsync();
            }
        }
        /// <summary>
        /// Tüm yöneticileri listeler
        /// </summary>
        /// <returns>Yönetici listesini döndürür</returns>
        public async Task<List<Manager>> GetAllAsync()
        {
            using (var dbContext = new CalenderAppDbContext())
            {
                return await dbContext.Managers.ToListAsync();
            }
        }
        /// Belirtilen email adresine sahip yöneticiyi getirir
        /// </summary>
        /// <param name="email">Aranacak email adresi</param>
        /// <returns>Yönetici nesnesini döndürür</returns>
        public async Task<Manager> GetByEmailAsync(string email)
        {
            using (var dbContext = new CalenderAppDbContext())
            {
                return await dbContext.Managers.Where(x => x.Email == email).FirstOrDefaultAsync();

            }
        }
        /// <summary>
        /// Belirtilen ID'ye sahip yöneticiyi getirir
        /// </summary>
        /// <param name="id">Getirilecek yöneticinin ID'si</param>
        /// <returns>Yönetici nesnesini döndürür</returns>
        public async Task<Manager> GetByIdAsync(int id)
        {
            using (var dbContext = new CalenderAppDbContext())
            {
                return await dbContext.Managers.FirstOrDefaultAsync(x => x.Id == id);
            }

        }
        /// <summary>
        /// Belirtilen TC kimlik numarasına sahip yöneticiyi getirir
        /// </summary>
        /// <param name="tcNo">Aranacak TC kimlik numarası</param>
        /// <returns>Yönetici nesnesini döndürür</returns>
        public async Task<Manager> GetByTcNoAsync(string tcNo)
        {
            using (var dbContext = new CalenderAppDbContext())
            {
                return await dbContext.Managers.Where(x => x.TcNo == tcNo).FirstOrDefaultAsync();
            }
        }
        /// <summary>
        /// Yönetici bilgilerini günceller
        /// </summary>
        /// <param name="id">Güncellenecek yöneticinin ID'si</param>
        /// <param name="manager">Yeni yönetici bilgileri</param>
        /// <returns>Güncellenen yönetici nesnesini döndürür</returns>
        public async Task<Manager> UpdateAsync(int id, Manager manager)
        {
            using (var dbContext = new CalenderAppDbContext())
            {
                var currentManager = await dbContext.Managers.FirstOrDefaultAsync(x => x.Id == id);
                currentManager.TcNo = manager.TcNo;
                currentManager.Name = manager.Name;
                currentManager.Email = manager.Email;
                currentManager.Surname = manager.Surname;
                currentManager.Address = manager.Address;
                await dbContext.SaveChangesAsync();
                return manager;
            }
        }
        /// <summary>
        /// Belirtilen ID'ye sahip yöneticinin şifresini günceller
        /// </summary>
        /// <param name="id">Yönetici ID'si</param>
        /// <param name="password">Yeni şifre</param>
        /// <returns>Güncellenen yönetici nesnesini döndürür</returns>
        public async Task<Manager> UpdatePasswordAsync(int id, string password)
        {
            using (var dbContext = new CalenderAppDbContext())
            {
                var manager = await dbContext.Managers.FirstOrDefaultAsync(x => x.Id == id);
                manager.Password = password;
                await dbContext.SaveChangesAsync();
                return manager;

            }
        }
    }
}
