using CalendarApp.Bussiness.Abstract;
using CalendarApp.Bussiness.Concrete;
using CalendarApp.DataAccess.Abstract;
using CalendarApp.DataAccess.Concrete;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// CORS politikas�n� yap�land�rma
// Uygulaman�n t�m kaynaklardan gelen isteklere izin verir
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder => builder
            .AllowAnyOrigin() // T�m originlere izin ver
            .AllowAnyMethod()  // T�m HTTP metodlar�na izin ver (GET, POST, vb.)
            .AllowAnyHeader());// T�m headerlara izin ver
});
// Swagger/OpenAPI dok�mantasyon servislerini ekle
// API dok�mantasyonu olu�turmak i�in kullan�l�r
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// AutoMapper konfig�rasyonu
// MappingProfile s�n�f�ndaki e�lemeleri kaydeder
builder.Services.AddAutoMapper(typeof(CalendarApp.Bussiness.Mapping.MappingProfile));
// Controller servislerini ekle
builder.Services.AddControllers();

/******************************************
 *          DEPENDENCY INJECTION          *
 ******************************************/
// Manager servis ve repository kay�tlar�
builder.Services.AddScoped<IManagerService, ManagerService>();
builder.Services.AddScoped<IManagerRepository, ManagerRepository>();
// Customer servis ve repository kay�tlar�
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();
builder.Services.AddScoped<ICustomerService, CustomerService>();
// Appointment servis ve repository kay�tlar�
builder.Services.AddScoped<IAppointmentRepository, AppointmentRepository>();
builder.Services.AddScoped<IAppointmentService, AppointmentService>();

/******************************************
 *          JWT AUTHENTICATION            *
 ******************************************/

// JWT Bearer Authentication yap�land�rmas�
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true, // Token yay�nc�s�n� do�rula
            ValidateAudience = true, // Token al�c�s�n� do�rula
            ValidateLifetime = true,  // Token s�resini do�rula
            ValidateIssuerSigningKey = true, // �mza anahtar�n� do�rula
            ValidIssuer = builder.Configuration["Jwt:Issuer"], // Ge�erli yay�nc�
            ValidAudience = builder.Configuration["Jwt:Audience"], // Ge�erli al�c�
            IssuerSigningKey = new SymmetricSecurityKey( 
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])) // �mza anahtar�
        };
    });
var app = builder.Build();

// Geli�tirme ortam�nda Swagger middleware'ini etkinle�tir
if (app.Environment.IsDevelopment())
{
    app.UseSwagger(); // Swagger JSON endpoint'ini olu�turur
    app.UseSwaggerUI(); // Swagger UI aray�z�n� sa�lar
}

// CORS politikas�n� uygula
app.UseCors("AllowAll");
// Routing middleware'ini ekle
app.UseRouting();
// Authentication middleware'ini ekle (JWT do�rulama)
app.UseAuthentication();
// Authorization middleware'ini ekle
app.UseAuthorization();
// Controller endpoint'lerini map'le
app.MapControllers();
// Uygulamay� �al��t�r
app.Run();
