using AutoMapper;
using CalendarApp.Bussiness.Abstract;
using CalendarApp.Bussiness.Concrete;
using CalendarApp.Entities;
using CalendarApp.Entities.CustomerDtos;
using CalendarApp.Entities.ManagerDtos;
using CalendarAppDemo2.Entities.User_Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace CalendarApp.API.Controllers
{
    /// <summary>
    /// Müşteri işlemlerini yöneten API Controller sınıfı
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class CustomerController : Controller
    {
        private readonly ICustomerService _customerService;
        private readonly IMapper _mapper;
        /// <summary>
        /// Bağımlılıkları enjekte ederek controller örneği oluşturur
        /// </summary>
        public CustomerController(ICustomerService customerService, IMapper mapper)
        {
            _customerService = customerService;
            _mapper = mapper;
        }

        /*manager → elindeki veri(kaynak nesne)
            GetUserDto → dönüştürmek istediğin hedef tip*/
        //Map<Hedef>(kaynak);
        /// <summary>
        /// Yeni bir müşteri ekler
        /// </summary>
        /// <param name="customerAddDto">Müşteri ekleme veri transfer nesnesi</param>
        /// <returns>Eklenen müşteri bilgisi</returns>
        [HttpPost("addCustomer")]
        public async Task<IActionResult> AddAsync([FromBody] CustomerAddDto customerAddDto)
        {
            if (customerAddDto == null)
            {
                return BadRequest("Eksik ya da hatalı veri");
            }
            //Dto to Customer.
            var customerDto = _mapper.Map<Customer>(customerAddDto);
            await _customerService.AddAsync(customerDto);
            return Ok(customerDto);

        }
        /// <summary>
        /// Belirtilen ID'ye sahip müşteriyi getirir
        /// </summary>
        /// <param name="id">Müşteri ID'si</param>
        /// <returns>Müşteri bilgisi (randevuları dahil)</returns>
        [HttpGet("getById/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var customer = await _customerService.GetByIdAsync(id);
            if (customer == null)
            {
                return NotFound("Girilen Id değerine sahip bir müşteri bulunamadı.");
            }
            /*manager → elindeki veri(kaynak nesne)
            GetUserDto → dönüştürmek istediğin hedef tip*/
            //Map<Hedef>(kaynak);
            var customerDto = _mapper.Map<CustomerGetByAppointmensDto>(customer);
            return Ok(customerDto);
        }
        /// <summary>
        /// Tüm müşterileri listeler
        /// </summary>
        /// <returns>Müşteri listesi (randevuları dahil)</returns>
        [HttpGet("GetAllCustomer")]
        public async Task<IActionResult> GetAll()
        {
            var customers = await _customerService.GetAllAsync();
            if (customers == null)
            {
                return NotFound("Kayıtlı Kullanıcı Yok.");
            }
            var customersDto = _mapper.Map<List<CustomerGetByAppointmensDto>>(customers);
            return Ok(customersDto);
        }
        /// <summary>
        /// Belirtilen ID'ye sahip müşteriyi siler
        /// </summary>
        /// <param name="id">Silinecek müşteri ID'si</param>
        /// <returns>İşlem sonucu</returns>
        [HttpDelete("Delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var user = await _customerService.GetByIdAsync(id);
            if (user == null)
            {
                return NotFound("Kullanıcı Bulunamadı.");
            }
            await _customerService.DeleteAsync(id);
            return Ok("Silme işlemi başarılı.");
        }
        /// <summary>
        /// Müşteri bilgilerini günceller
        /// </summary>
        /// <param name="id">Güncellenecek müşteri ID'si</param>
        /// <param name="customerUpdateDto">Güncellenecek müşteri bilgileri</param>
        /// <returns>Güncellenen müşteri bilgisi</returns>
        [HttpPut("Update/{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CustomerUpdateDto customerUpdateDto)
        {
            var customer = await _customerService.GetByIdAsync(id);
            if (customer == null)
            {
                return NotFound("Girilen Id'ye ait kullanıcı bulunamadı."); // BadRequest yerine NotFound
            }

            _mapper.Map(customerUpdateDto, customer);

            var updateCustomer = await _customerService.UpdateAsync(id, customer);
            var updatedDto = _mapper.Map<CustomerGetDto>(updateCustomer);
            return Ok(updatedDto); // Sadece mesaj yerine güncellenmiş kullanıcıyı dön
        }
    }
}
