using CalendarApp.Bussiness.Abstract;
using CalendarApp.DataAccess.Abstract;
using CalendarApp.Entities;


namespace CalendarApp.Bussiness.Concrete
{
    /// <summary>
    /// Müşteri işlemlerini yöneten servis sınıfı
    /// </summary>
    public class CustomerService : ICustomerService
    {
        private readonly ICustomerRepository _customerRepository;
        /// <summary>
        /// Bağımlılıkları enjekte ederek servis örneği oluşturur
        /// </summary>
        /// <param name="customerRepository">Müşteri veri erişim katmanı</param>
        public CustomerService(ICustomerRepository customerRepository)
        {
            _customerRepository = customerRepository;
        }
        /// <summary>
        /// Yeni bir müşteri ekler
        /// </summary>
        /// <param name="customer">Eklenecek müşteri nesnesi</param>
        /// <returns>Eklenen müşteri nesnesi</returns>
        public async Task<Customer> AddAsync(Customer customer)
        {
            return await _customerRepository.AddAsync(customer);
        }
        /// <summary>
        /// Belirtilen ID'ye sahip müşteriyi siler
        /// </summary>
        /// <param name="id">Silinecek müşteri ID'si</param>
        /// <exception cref="System.KeyNotFoundException">Müşteri bulunamazsa</exception>
        public async Task DeleteAsync(int id)
        {
            await _customerRepository.DeleteAsync(id);
        }
        /// <summary>
        /// Tüm müşterileri listeler
        /// </summary>
        /// <returns>Müşteri listesi</returns>
        public async Task<List<Customer>> GetAllAsync()
        {
            return await _customerRepository.GetAllAsync();
        }
        /// <summary>
        /// Belirtilen ID'ye sahip müşteriyi getirir
        /// </summary>
        /// <param name="id">Müşteri ID'si</param>
        /// <returns>Müşteri nesnesi</returns>
        /// <exception cref="System.KeyNotFoundException">Müşteri bulunamazsa</exception>
        public async Task<Customer> GetByIdAsync(int id)
        {
            return await _customerRepository.GetByIdAsync(id);
        }
        /// <summary>
        /// Müşteri bilgilerini günceller
        /// </summary>
        /// <param name="id">Güncellenecek müşteri ID'si</param>
        /// <param name="customer">Yeni müşteri bilgileri</param>
        /// <returns>Güncellenen müşteri nesnesi</returns>
        /// <exception cref="System.KeyNotFoundException">Müşteri bulunamazsa</exception>
        /// <exception cref="System.ArgumentException">Geçersiz veri girilirse</exception>
        public async Task<Customer> UpdateAsync(int id, Customer customer)
        {
            return await (_customerRepository.UpdateAsync(id, customer));
        }
    }
}
