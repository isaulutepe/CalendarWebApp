using AutoMapper;
using CalendarApp.Bussiness.Abstract;
using CalendarApp.Entities;
using CalendarApp.Entities.ManagerDtos;
using CalendarAppDemo2.Entities.User_Dtos;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace CalendarApp.API.Controllers
{
    /// <summary>
    /// Yönetici (Manager) işlemlerini yöneten API Controller sınıfı
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class ManagerController : Controller
    {
        private readonly IManagerService _managerService;
        private readonly IMapper _mapper;
        private readonly IConfiguration _config;
        /// <summary>
        /// Bağımlılıkları enjekte ederek controller örneği oluşturur
        /// </summary>
        public ManagerController(IManagerService manager, IMapper mapper, IConfiguration configuration)
        {
            _managerService = manager;
            _mapper = mapper;
            _config = configuration;
        }
        /// <summary>
        /// Belirtilen ID'ye sahip yöneticiyi getirir
        /// </summary>
        /// <param name="id">Yönetici ID'si</param>
        /// <returns>Yönetici bilgisi</returns>
        [HttpGet("getById/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var manager = await _managerService.GetByIdAsync(id);
            if (manager == null)
            {
                return NotFound("Girilen Id değerine sahip bir yönetici bulunamadı.");
            }
            /*manager → elindeki veri(kaynak nesne)
            GetUserDto → dönüştürmek istediğin hedef tip*/
            //Map<Hedef>(kaynak);
            var managerDto = _mapper.Map<ManagerGetDto>(manager);
            return Ok(managerDto);
        }
        /// <summary>
        /// Belirtilen email adresine sahip yöneticiyi getirir
        /// </summary>
        /// <param name="email">Aranacak email adresi</param>
        /// <returns>Yönetici bilgisi</returns>
        [HttpGet("GetByEmail/{email}")]
        public async Task<IActionResult> GetByEmail(string email)
        {
            var manager = await _managerService.GetByEmailAsync(email);
            if (manager == null)
            {
                return NotFound();
            }
            var managerDto = _mapper.Map<ManagerGetDto>(manager);
            return Ok(managerDto);
        }
        /// <summary>
        /// Belirtilen TC Kimlik Numarasına sahip yöneticiyi getirir
        /// </summary>
        /// <param name="tcNo">Aranacak TC Kimlik Numarası</param>
        /// <returns>Yönetici bilgisi</returns>
        [HttpGet("GetByTcNo/{tcNo}")]
        public async Task<IActionResult> GetByTcNo(string tcNo)
        {
            var manager = await _managerService.GetByTcNoAsync(tcNo);
            if (manager == null)
            {
                return NotFound();
            }
            var managerDto = _mapper.Map<ManagerGetDto>(manager);
            return Ok(managerDto);
        }
        /// <summary>
        /// Tüm yöneticileri listeler
        /// </summary>
        /// <returns>Yönetici listesi</returns>
        [HttpGet("GetAllManagers")]
        public async Task<IActionResult> GetAll()
        {
            var managers = await _managerService.GetAllAsync();
            if (managers == null)
            {
                return NotFound("Kayıtlı Yönetici Yok.");
            }
            var managersDto = _mapper.Map<List<ManagerGetDto>>(managers);
            return Ok(managersDto);
        }
        /// <summary>
        /// Belirtilen ID'ye sahip yöneticiyi siler
        /// </summary>
        /// <param name="id">Silinecek yönetici ID'si</param>
        /// <returns>İşlem sonucu</returns>
        [HttpDelete("deleteManager/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var manager = await _managerService.GetByIdAsync(id);
            if (manager == null)
            {
                return NotFound("Kullanıcı Bulunamadı.");
            }
            await _managerService.DeleteAsync(id);
            return Ok("Silme işlemi başarılı.");
        }
        /// <summary>
        /// Yeni yönetici kaydı oluşturur
        /// </summary>
        /// <param name="registerManagerDto">Kayıt bilgileri</param>
        /// <returns>İşlem sonucu</returns>
        [HttpPost("Register")]
        public async Task<IActionResult> Register([FromBody] RegisterManagerDto registerManagerDto)
        {
            if (registerManagerDto == null)
                return BadRequest("Lütfen tüm alanları doldurunuz.");

            // Email validation
            if (string.IsNullOrWhiteSpace(registerManagerDto.Email))
                return BadRequest("Email adresi boş olamaz.");

            if (!new EmailAddressAttribute().IsValid(registerManagerDto.Email))
                return BadRequest("Lütfen geçerli bir email adresi giriniz.");

            // TCKN validation
            if (string.IsNullOrWhiteSpace(registerManagerDto.TcNo))
                return BadRequest("TC Kimlik No boş olamaz.");

            if (registerManagerDto.TcNo.Length != 11 || !registerManagerDto.TcNo.All(char.IsDigit))
                return BadRequest("TC Kimlik No 11 haneli olmalı ve sadece rakamlardan oluşmalıdır.");

            // Check if email exists
            if (await _managerService.GetByEmailAsync(registerManagerDto.Email) != null)
                return BadRequest("Bu email adresi zaten kayıtlı. Lütfen farklı bir email deneyin.");

            // Check if TCKN exists
            if (await _managerService.GetByTcNoAsync(registerManagerDto.TcNo) != null)
                return BadRequest("Bu TC Kimlik No zaten kayıtlı. Lütfen bilgilerinizi kontrol edin.");

            // Password validation
            if (string.IsNullOrWhiteSpace(registerManagerDto.Password))
                return BadRequest("Şifre boş olamaz.");

            if (registerManagerDto.Password.Length < 6)
                return BadRequest("Şifre en az 6 karakter olmalıdır.");

            var user = _mapper.Map<Manager>(registerManagerDto);
            user.Password = BCrypt.Net.BCrypt.HashPassword(registerManagerDto.Password);

            await _managerService.AddAsync(user);
            return Ok("Kayıt başarılı. Artık giriş yapabilirsiniz.");
        }
        /// <summary>
        /// Yönetici girişi yapar ve JWT token döner
        /// </summary>
        /// <param name="loginUserDto">Giriş bilgileri</param>
        /// <returns>JWT token ve yönetici bilgisi</returns>
        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginUserDto)
        {
            if (loginUserDto == null)
                return BadRequest("Geçersiz giriş bilgileri.");

            var currentManager = await _managerService.GetByEmailAsync(loginUserDto.Email);
            if (currentManager == null)
                return BadRequest("Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı.");

            // Password verification
            if (!BCrypt.Net.BCrypt.Verify(loginUserDto.Password, currentManager.Password))
                return BadRequest("Şifre yanlış.");

            // Token generation
            var token = GenerateJwtToken(currentManager);

            return Ok(new
            {
                token = token,
                manager = _mapper.Map<ManagerGetDto>(currentManager)
            });
        }
        /// <summary>
        /// Yönetici şifresini günceller
        /// </summary>
        /// <param name="id">Yönetici ID'si</param>
        /// <param name="passwordUpdateDto">Şifre güncelleme bilgileri</param>
        /// <returns>İşlem sonucu</returns>
        [HttpPut("UpdatePassword/{id}")]
        public async Task<IActionResult> UpdatePassword(int id, [FromBody] ManagerPasswordUpdateDto passwordUpdateDto)
        {
            // Kullanıcıyı bul
            var manager = await _managerService.GetByIdAsync(id);
            if (manager == null)
            {
                return NotFound("Kullanıcı bulunamadı.");
            }

            // Eski şifreyi kontrol et
            if (!BCrypt.Net.BCrypt.Verify(passwordUpdateDto.OldPassword, manager.Password))
            {
                return BadRequest("Eski şifre yanlış.");
            }

            // Yeni şifreyi hash'le ve güncelle
            manager.Password = BCrypt.Net.BCrypt.HashPassword(passwordUpdateDto.NewPassword);

            // Güncelleme işlemi - Artık doğrudan entity'i gönderiyoruz
            var updatedManager = await _managerService.UpdatePasswordAsync(id, manager.Password);

            return Ok(new
            {
                Message = "Şifre başarıyla güncellendi.",
                Manager = _mapper.Map<ManagerGetDto>(updatedManager)
            });
        }
        /// <summary>
        /// Yönetici bilgilerini günceller
        /// </summary>
        /// <param name="id">Yönetici ID'si</param>
        /// <param name="managerUpdateDto">Güncellenecek yönetici bilgileri</param>
        /// <returns>Güncellenen yönetici bilgisi</returns>
        [HttpPut("Update/{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ManagerUpdateDto managerUpdateDto)
        {
            var manager = await _managerService.GetByIdAsync(managerUpdateDto.Id);
            if (manager == null)
            {
                return NotFound("Girilen Id'ye ait kullanıcı bulunamadı."); // BadRequest yerine NotFound
            }

            _mapper.Map(managerUpdateDto, manager);

            var updatedManager = await _managerService.UpdateAsync(id, manager);
            return Ok(updatedManager); // Sadece mesaj yerine güncellenmiş kullanıcıyı dön
        }
        /// <summary>
        /// JWT token oluşturur
        /// </summary>
        private string GenerateJwtToken(Manager manager)
        {
            var key = _config["Jwt:Key"];
            if (Encoding.UTF8.GetByteCount(key) < 32)
            {
                throw new ArgumentException("JWT key must be at least 256 bits (32 characters)");
            }

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
        new Claim(JwtRegisteredClaimNames.Sub, manager.Email),
        new Claim("id", manager.Id.ToString()),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        new Claim(ClaimTypes.Role, "Manager")
    };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(3),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }


    }
}
