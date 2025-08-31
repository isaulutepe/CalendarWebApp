using CalendarApp.Bussiness.Abstract;
using CalendarApp.Bussiness.Concrete;
using CalendarApp.DataAccess.Abstract;
using CalendarApp.DataAccess.Concrete;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// CORS politikasýný yapýlandýrma
// Uygulamanýn tüm kaynaklardan gelen isteklere izin verir
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder => builder
            .AllowAnyOrigin() // Tüm originlere izin ver
            .AllowAnyMethod()  // Tüm HTTP metodlarýna izin ver (GET, POST, vb.)
            .AllowAnyHeader());// Tüm headerlara izin ver
});
// Swagger/OpenAPI dokümantasyon servislerini ekle
// API dokümantasyonu oluþturmak için kullanýlýr
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// AutoMapper konfigürasyonu
// MappingProfile sýnýfýndaki eþlemeleri kaydeder
builder.Services.AddAutoMapper(typeof(CalendarApp.Bussiness.Mapping.MappingProfile));
// Controller servislerini ekle
builder.Services.AddControllers();

/******************************************
 *          DEPENDENCY INJECTION          *
 ******************************************/
// Manager servis ve repository kayýtlarý
builder.Services.AddScoped<IManagerService, ManagerService>();
builder.Services.AddScoped<IManagerRepository, ManagerRepository>();
// Customer servis ve repository kayýtlarý
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();
builder.Services.AddScoped<ICustomerService, CustomerService>();
// Appointment servis ve repository kayýtlarý
builder.Services.AddScoped<IAppointmentRepository, AppointmentRepository>();
builder.Services.AddScoped<IAppointmentService, AppointmentService>();

/******************************************
 *          JWT AUTHENTICATION            *
 ******************************************/

// JWT Bearer Authentication yapýlandýrmasý
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true, // Token yayýncýsýný doðrula
            ValidateAudience = true, // Token alýcýsýný doðrula
            ValidateLifetime = true,  // Token süresini doðrula
            ValidateIssuerSigningKey = true, // Ýmza anahtarýný doðrula
            ValidIssuer = builder.Configuration["Jwt:Issuer"], // Geçerli yayýncý
            ValidAudience = builder.Configuration["Jwt:Audience"], // Geçerli alýcý
            IssuerSigningKey = new SymmetricSecurityKey( 
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])) // Ýmza anahtarý
        };
    });
var app = builder.Build();

// Geliþtirme ortamýnda Swagger middleware'ini etkinleþtir
if (app.Environment.IsDevelopment())
{
    app.UseSwagger(); // Swagger JSON endpoint'ini oluþturur
    app.UseSwaggerUI(); // Swagger UI arayüzünü saðlar
}

// CORS politikasýný uygula
app.UseCors("AllowAll");
// Routing middleware'ini ekle
app.UseRouting();
// Authentication middleware'ini ekle (JWT doðrulama)
app.UseAuthentication();
// Authorization middleware'ini ekle
app.UseAuthorization();
// Controller endpoint'lerini map'le
app.MapControllers();
// Uygulamayý çalýþtýr
app.Run();
