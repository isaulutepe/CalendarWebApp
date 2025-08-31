using AutoMapper;
using CalendarApp.Bussiness.Abstract;
using CalendarApp.Bussiness.Concrete;
using CalendarApp.Entities;
using CalendarApp.Entities.AppointmentDtos;
using CalendarApp.Entities.CustomerDtos;
using CalendarAppDemo2.Entities.Appointment_Dtos;
using Microsoft.AspNetCore.Mvc;

namespace CalendarApp.API.Controllers
{
    /// <summary>
    /// Randevu işlemlerini yöneten API Controller sınıfı
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class AppointmentController : Controller
    {
        private readonly IAppointmentService _appointmentService;
        private readonly IMapper _mapper;
        /// <summary>
        /// Bağımlılıkları enjekte ederek controller örneği oluşturur
        /// </summary>
        public AppointmentController(IAppointmentService appointmentService, IMapper mapper)
        {
            _appointmentService = appointmentService;
            _mapper = mapper;
        }
        /// <summary>
        /// Yeni bir randevu oluşturur
        /// </summary>
        /// <param name="dto">Randevu oluşturma veri transfer nesnesi</param>
        /// <returns>Oluşturulan randevu bilgisi</returns>
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] AppointmentCreateDto dto)
        {
            try
            {
                var appointment = await _appointmentService.CreateAppointmentAsync(dto);
                return CreatedAtAction(nameof(GetById),
                    new { id = appointment.Id },
                    _mapper.Map<AppointmentGetDto>(appointment));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"İç hata: {ex.Message}");
            }
        }
        /// <summary>
        /// Tüm randevuları listeler
        /// </summary>
        /// <returns>Randevu listesi</returns>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var appointments = await _appointmentService.GetAllAsync();
            var appointmentsDto = _mapper.Map<List<AppointmentGetDto>>(appointments);
            return Ok(appointmentsDto);
        }
        /// <summary>
        /// Belirtilen ID'ye sahip randevuyu getirir
        /// </summary>
        /// <param name="id">Randevu ID'si</param>
        /// <returns>Randevu bilgisi</returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var appointment = await _appointmentService.GetByIdAsync(id);
                return Ok(_mapper.Map<AppointmentGetDto>(appointment));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }
        /// <summary>
        /// Randevu bilgilerini günceller
        /// </summary>
        /// <param name="id">Güncellenecek randevu ID'si</param>
        /// <param name="dto">Güncelleme veri transfer nesnesi</param>
        /// <returns>Güncellenen randevu bilgisi</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] AppointmentUpdateDto dto)
        {
            try
            {
                dto.Id = id;
                var appointment = await _appointmentService.UpdateAsync(id, dto);
                return Ok(_mapper.Map<AppointmentGetDto>(appointment));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }
        /// <summary>
        /// Randevu durumunu günceller
        /// </summary>
        /// <param name="id">Randevu ID'si</param>
        /// <param name="dto">Durum güncelleme veri transfer nesnesi</param>
        /// <returns>İşlem sonucu</returns>
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] AppointmentStatusUpdateDto dto)
        {
            try
            {
                await _appointmentService.UpdateStatusAsync(id, dto.NewStatus);
                return Ok("Güncelleme işlemi başarılı.");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }
        /// <summary>
        /// Belirtilen ID'ye sahip randevuyu siler
        /// </summary>
        /// <param name="id">Silinecek randevu ID'si</param>
        /// <returns>İşlem sonucu</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _appointmentService.DeleteAsync(id);
                return Ok("Silme işlemi başarılı.");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }
        /// <summary>
        /// Belirtilen müşteriye ait randevuları listeler
        /// </summary>
        /// <param name="customerId">Müşteri ID'si</param>
        /// <returns>Randevu listesi</returns>
        [HttpGet("customer/{customerId}")]
        public async Task<IActionResult> GetByCustomerId(int customerId)
        {
            try
            {
                var appointments = await _appointmentService.GetByCustomerIdAsync(customerId);
                return Ok(_mapper.Map<List<AppointmentGetDto>>(appointments));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }
        /// <summary>
        /// Belirtilen yöneticiye ait randevuları listeler
        /// </summary>
        /// <param name="managerId">Yönetici ID'si</param>
        /// <returns>Randevu listesi</returns>
        [HttpGet("manager/{managerId}")]
        public async Task<IActionResult> GetByManagerId(int managerId)
        {
            try
            {
                var appointments = await _appointmentService.GetByManagerIdAsync(managerId);
                var appointmentsDto = _mapper.Map<List<AppointmentGetDto>>(appointments);
                return Ok(appointmentsDto);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }
        /// <summary>
        /// Müşteriyi belirtilen randevuya ekler
        /// </summary>
        /// <param name="dto">Müşteri-randevu ilişki veri transfer nesnesi</param>
        /// <returns>Güncellenen randevu bilgisi</returns>
        [HttpPost("add-customer")]
        public async Task<IActionResult> AddCustomerToAppointment([FromBody] CustomerAppointmentDto dto)
        {
            try
            {
                var appointment = await _appointmentService.AddCustomerToAppointmentAsync(dto);
                return Ok(_mapper.Map<AppointmentGetDto>(appointment));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"İç hata: {ex.Message}");
            }
        }
        /// <summary>
        /// Müşteriyi belirtilen randevudan çıkarır
        /// </summary>
        /// <param name="dto">Müşteri-randevu ilişki veri transfer nesnesi</param>
        /// <returns>Güncellenen randevu bilgisi</returns>
        [HttpPost("remove-customer")]
        public async Task<IActionResult> RemoveCustomerFromAppointment([FromBody] CustomerAppointmentDto dto)
        {
            try
            {
                var appointment = await _appointmentService.RemoveCustomerFromAppointmentAsync(dto);
                return Ok(_mapper.Map<AppointmentGetDto>(appointment));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"İç hata: {ex.Message}");
            }
        }
    }
}
