# 📅 Randevu Takip Sistemi

Son stajımda **yöneticiler için geliştirilmiş bir randevu takip sistemi** uygulaması geliştirdim.  
Bu sistem, yöneticilerin müşteri ve randevu işlemlerini yönetmelerine ve istatistiklere erişmelerine olanak sağlar.

---

## 🚀 Teknoloji Yığını
- **Frontend:** React.js  
- **Backend:** ASP.NET Core Web API  
- **Mimari:** Katmanlı Mimari (Layered Architecture)  
- **Takvim Bileşeni:** FullCalendar  
- **ORM:** Entity Framework Core  
- **Kimlik Doğrulama:** JWT (JSON Web Tokens)  
- **Veri Transfer Nesneleri:** AutoMapper  

---

## 📂 Proje Yapısı

```bash
AppointmentTrackingSystem/
├── ClientApp/              # React frontend uygulaması
├── CalendarApp.API/        # ASP.NET Core Web API
├── CalendarApp.Core/       # Core katmanı (Entities, Interfaces)
├── CalendarApp.Service/    # Business logic katmanı
├── CalendarApp.Repository/ # Data access katmanı
└── CalendarApp.DTO/        # Data Transfer Objects

✨ Özellikler

👤 Müşteri Yönetimi: Ekleme, silme, güncelleme, listeleme

📅 Randevu Yönetimi: Oluşturma, silme, güncelleme, durum değiştirme

👥 Katılımcı Yönetimi: Randevulara müşteri ekleme/çıkarma

🛠 Yönetici İşlemleri: Yönetici kaydı, girişi ve profil yönetimi

📊 İstatistikler: Raporlar ve istatistiksel veriler

📌 API Endpoint’leri
🔹 Randevu İşlemleri (AppointmentController)

| Method | Endpoint                                 | Açıklama                            | İstek Gövdesi                | Yanıt         |
| ------ | ---------------------------------------- | ----------------------------------- | ---------------------------- | ------------- |
| POST   | `/api/Appointment/create`                | Yeni randevu oluşturur              | `AppointmentCreateDto`       | `201 Created` |
| GET    | `/api/Appointment`                       | Tüm randevuları listeler            | -                            | `200 OK`      |
| GET    | `/api/Appointment/{id}`                  | ID'ye göre randevu getirir          | -                            | `200 OK`      |
| PUT    | `/api/Appointment/{id}`                  | Randevu bilgilerini günceller       | `AppointmentUpdateDto`       | `200 OK`      |
| PUT    | `/api/Appointment/{id}/status`           | Randevu durumunu günceller          | `AppointmentStatusUpdateDto` | `200 OK`      |
| DELETE | `/api/Appointment/{id}`                  | Randevuyu siler                     | -                            | `200 OK`      |
| GET    | `/api/Appointment/customer/{customerId}` | Müşteriye ait randevuları listeler  | -                            | `200 OK`      |
| GET    | `/api/Appointment/manager/{managerId}`   | Yöneticiye ait randevuları listeler | -                            | `200 OK`      |
| POST   | `/api/Appointment/add-customer`          | Müşteri ekler                       | `CustomerAppointmentDto`     | `200 OK`      |
| POST   | `/api/Appointment/remove-customer`       | Müşteri çıkarır                     | `CustomerAppointmentDto`     | `200 OK`      |

🔹 Müşteri İşlemleri (CustomerController)

| Method | Endpoint                       | Açıklama                      | İstek Gövdesi       | Yanıt    |
| ------ | ------------------------------ | ----------------------------- | ------------------- | -------- |
| POST   | `/api/Customer/addCustomer`    | Yeni müşteri ekler            | `CustomerAddDto`    | `200 OK` |
| GET    | `/api/Customer/getById/{id}`   | ID'ye göre müşteri getirir    | -                   | `200 OK` |
| GET    | `/api/Customer/GetAllCustomer` | Tüm müşterileri listeler      | -                   | `200 OK` |
| DELETE | `/api/Customer/Delete/{id}`    | Müşteriyi siler               | -                   | `200 OK` |
| PUT    | `/api/Customer/Update/{id}`    | Müşteri bilgilerini günceller | `CustomerUpdateDto` | `200 OK` |

🔹 Yönetici İşlemleri (ManagerController)

| Method | Endpoint                           | Açıklama                       | İstek Gövdesi              | Yanıt                |
| ------ | ---------------------------------- | ------------------------------ | -------------------------- | -------------------- |
| GET    | `/api/Manager/getById/{id}`        | ID'ye göre yönetici getirir    | -                          | `200 OK`             |
| GET    | `/api/Manager/GetByEmail/{email}`  | Email’e göre yönetici getirir  | -                          | `200 OK`             |
| GET    | `/api/Manager/GetByTcNo/{tcNo}`    | TC No’ya göre yönetici getirir | -                          | `200 OK`             |
| GET    | `/api/Manager/GetAllManagers`      | Tüm yöneticileri listeler      | -                          | `200 OK`             |
| DELETE | `/api/Manager/deleteManager/{id}`  | Yöneticiyi siler               | -                          | `200 OK`             |
| POST   | `/api/Manager/Register`            | Yeni yönetici kaydı            | `RegisterManagerDto`       | `200 OK`             |
| POST   | `/api/Manager/Login`               | Yönetici girişi yapar          | `LoginDto`                 | `200 OK` + JWT Token |
| PUT    | `/api/Manager/UpdatePassword/{id}` | Şifre güncelleme               | `ManagerPasswordUpdateDto` | `200 OK`             |
| PUT    | `/api/Manager/Update/{id}`         | Yönetici bilgilerini günceller | `ManagerUpdateDto`         | `200 OK`             |

📦 Data Transfer Object (DTO) Yapıları

Proje içerisinde kullanılan tüm DTO yapıları CalendarApp.ENTITY/Dtos klasörü altında tanımlanmıştır.
Her DTO, veri transferi sırasında entity bağımlılığını azaltmak ve güvenliği artırmak için kullanılmıştır.

✍️ Bu proje, staj süresinde geliştirilmiş olup gerçek bir kurumsal senaryoya uygun şekilde tasarlanmıştır.

## 🖼️ Ekran Görüntüleri

![Ekran Görüntüsü 1](https://github.com/user-attachments/assets/9d53e5fa-610f-4aa7-a9a6-d1166eb8413f)
![Ekran Görüntüsü 2](https://github.com/user-attachments/assets/90e1a766-b48f-4153-9623-15328b434625)
![Ekran Görüntüsü 3](https://github.com/user-attachments/assets/3c298bd8-7d08-43ea-b5cd-cdf2e0efad5c)
![Ekran Görüntüsü 4](https://github.com/user-attachments/assets/bb35bd71-ed93-4f44-bce2-f767ebc5eb53)
![Ekran Görüntüsü 5](https://github.com/user-attachments/assets/d48e9b3a-025f-4599-aefc-3fabccfc6f58)




