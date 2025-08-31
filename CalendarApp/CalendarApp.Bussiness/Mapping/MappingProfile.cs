using AutoMapper;
using CalendarApp.Entities;
using CalendarApp.Entities.CustomerDtos;
using CalendarApp.Entities.ManagerDtos;
using CalendarAppDemo2.Entities.Appointment_Dtos;
using CalendarAppDemo2.Entities.User_Dtos;


namespace CalendarApp.Bussiness.Mapping
{
        /// <summary>
        /// AutoMapper konfigürasyonlarını içeren profil sınıfı
        /// </summary>
        public class MappingProfile : Profile
        {
            //Çalışma Manıtğı
            //CreateMap<**Kaynak**, **Hedef**>();
            /// <summary>
            /// Entity ve DTO'lar arasındaki eşleme kurallarını tanımlar
            /// </summary>
            /// <remarks>
            /// Mapping mantığı: CreateMap&lt;Kaynak, Hedef&gt;();
            /// </remarks>
            public MappingProfile()
            {
            
                #region Account Mapping
                // Kayıt işlemleri için RegisterManagerDto'dan Manager'a dönüşüm
                CreateMap<RegisterManagerDto, Manager>();
                // Giriş işlemleri için LoginDto'dan Manager'a dönüşüm
                CreateMap<LoginDto, Manager>();
                #endregion
                #region Manager Mapping
                // Manager entity'den ManagerGetDto'ya dönüşüm
                CreateMap<Manager, ManagerGetDto>();
                // Güncelleme işlemleri için ManagerUpdateDto'dan Manager'a dönüşüm
                CreateMap<ManagerUpdateDto, Manager>();
                // Manager entity'den ManagerGetByNameDto'ya dönüşüm
                CreateMap<Manager, ManagerGetByNameDto>();
                #endregion
                #region Customer Mapping
                // Ekleme işlemleri için CustomerAddDto'dan Customer'a dönüşüm
                CreateMap<CustomerAddDto, Customer>();
                // Customer entity'den CustomerUpdateDto'ya dönüşüm
                CreateMap<Customer, CustomerUpdateDto>();
                CreateMap<Customer, CustomerAddDto>();
                //Randevularla birlikte getir.
                CreateMap<Customer, CustomerGetByAppointmensDto>();
                // CustomerUpdateDto'dan Customer'a dönüşüm
                CreateMap<CustomerUpdateDto, Customer>();
                // Customer entity'den CustomerGetDto'ya dönüşüm
                CreateMap<Customer, CustomerGetDto>();
                // Customer entity'den CustomerGetByNameDto'ya dönüşüm
                CreateMap<Customer, CustomerGetByNameDto>();
                #endregion
                #region Appointment Mapping
                // Randevu oluşturma işlemleri için AppointmentCreateDto'dan Appointment'a dönüşüm
                CreateMap<AppointmentCreateDto, Appointment>();
                // Randevu güncelleme işlemleri için AppointmentUpdateDto'dan Appointment'a dönüşüm
                CreateMap<AppointmentUpdateDto, Appointment>();
                // Randevu entity'sinden AppointmentGetDto'ya dönüşüm
                CreateMap<Appointment, AppointmentGetDto>()
                    .ForMember(dest => dest.Customers, opt => opt.MapFrom(src => src.AppointmentCustomers.Select(ac => ac.Customer)));
                #endregion
            }
        }
}
