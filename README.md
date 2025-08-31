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

![Ekran Görüntüsü 1](https://github.com/user-attachments/assets/382b7f9e-1e77-4819-a44e-b0eb134f4b18)
![Ekran Görüntüsü 2](https://github.com/user-attachments/assets/73b3c480-86b7-4cbc-b2a9-8e64ab6373fb)
![Ekran Görüntüsü 3](https://github.com/user-attachments/assets/9d8ed295-537b-48db-bb7a-cb57701c121e)
![Ekran Görüntüsü 4](https://github.com/user-attachments/assets/1f824872-d2fe-4112-b701-5baa7126b14d)
![Ekran Görüntüsü 5](https://github.com/user-attachments/assets/ad324456-20c1-4f95-89d4-ea6662e80e10)

