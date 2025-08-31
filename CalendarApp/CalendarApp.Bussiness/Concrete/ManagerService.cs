using CalendarApp.Bussiness.Abstract;
using CalendarApp.DataAccess.Abstract;
using CalendarApp.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CalendarApp.Bussiness.Concrete
{
    /// <summary>
    /// Yönetici (Manager) işlemlerini yöneten servis sınıfı
    /// </summary>
    public class ManagerService : IManagerService
    {
        private readonly IManagerRepository _managerRepository;
        /// <summary>
        /// Bağımlılıkları enjekte ederek servis örneği oluşturur
        /// </summary>
        /// <param name="managerRepository">Yönetici veri erişim katmanı</param>
        public ManagerService(IManagerRepository managerRepository)
        {
            _managerRepository = managerRepository;
        }
        /// <summary>
        /// Yeni bir yönetici ekler
        /// </summary>
        /// <param name="manager">Eklenecek yönetici nesnesi</param>
        /// <returns>Eklenen yönetici nesnesi</returns>
        /// <exception cref="ArgumentNullException">Yönetici bilgileri boşsa</exception>
        /// <exception cref="ArgumentException">Geçersiz TC No veya email formatı</exception>
        public async Task<Manager> AddAsync(Manager manager)
        {
            return await _managerRepository.AddAsync(manager);
        }
        /// <summary>
        /// Belirtilen ID'ye sahip yöneticiyi siler
        /// </summary>
        /// <param name="id">Silinecek yönetici ID'si</param>
        /// <exception cref="KeyNotFoundException">Yönetici bulunamazsa</exception>
        public async Task DeleteAsync(int id)
        {
            await (_managerRepository.DeleteAsync(id));
        }
        /// <summary>
        /// Tüm yöneticileri listeler
        /// </summary>
        /// <returns>Yönetici listesi</returns>
        public async Task<List<Manager>> GetAllAsync()
        {
            return await _managerRepository.GetAllAsync();
        }
        /// <summary>
        /// Belirtilen email adresine sahip yöneticiyi getirir
        /// </summary>
        /// <param name="email">Aranacak email adresi</param>
        /// <returns>Yönetici nesnesi</returns>
        public async Task<Manager> GetByEmailAsync(string email)
        {
            return await _managerRepository.GetByEmailAsync(email);
        }
        /// <summary>
        /// Belirtilen ID'ye sahip yöneticiyi getirir
        /// </summary>
        /// <param name="id">Yönetici ID'si</param>
        /// <returns>Yönetici nesnesi</returns>
        /// <exception cref="KeyNotFoundException">Yönetici bulunamazsa</exception>
        public async Task<Manager> GetByIdAsync(int id)
        {
            return await _managerRepository.GetByIdAsync(id);
        }
        /// <summary>
        /// Belirtilen TC Kimlik Numarasına sahip yöneticiyi getirir
        /// </summary>
        /// <param name="tcNo">Aranacak TC Kimlik Numarası</param>
        /// <returns>Yönetici nesnesi</returns>
        /// <exception cref="ArgumentException">Geçersiz TC No formatı</exception>
        public async Task<Manager> GetByTcNoAsync(string tcNo)
        {
            return await _managerRepository.GetByTcNoAsync(tcNo);
        }
        /// <summary>
        /// Yönetici bilgilerini günceller
        /// </summary>
        /// <param name="id">Güncellenecek yönetici ID'si</param>
        /// <param name="manager">Yeni yönetici bilgileri</param>
        /// <returns>Güncellenen yönetici nesnesi</returns>
        /// <exception cref="KeyNotFoundException">Yönetici bulunamazsa</exception>
        /// <exception cref="ArgumentException">Geçersiz TC No veya email formatı</exception>
        public async Task<Manager> UpdateAsync(int id, Manager manager)
        {
          return await (_managerRepository.UpdateAsync(id, manager));
        }
        /// <summary>
        /// Yöneticinin şifresini günceller
        /// </summary>
        /// <param name="id">Yönetici ID'si</param>
        /// <param name="password">Yeni şifre</param>
        /// <returns>Güncellenen yönetici nesnesi</returns>
        /// <exception cref="KeyNotFoundException">Yönetici bulunamazsa</exception>
        /// <exception cref="ArgumentException">Şifre gereksinimleri karşılamıyorsa</exception>
        public async Task<Manager> UpdatePasswordAsync(int id, string password)
        {
            return await (_managerRepository.UpdatePasswordAsync(id, password));
        }
    }
}
