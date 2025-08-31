import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import axiosInstance from "../axiosConfig";
import Swal from "sweetalert2";
import { useCustomers } from "../context/CustomerContext";
import { useAppointments } from "../context/AppointmentContext";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

import {
  Form,
  Button,
  Row,
  Col,
  Badge,
  Alert,
  Modal,
  Card,
} from "react-bootstrap";
import { FaEdit, FaTrash, FaCog } from "react-icons/fa";

const Navbar = () => {
  const { user, login, logout } = useContext(AuthContext);
  const { customers, addCustomer, updateCustomer, deleteCustomer } =
    useCustomers();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeModal, setActiveModal] = useState("");
  const [userDropdown, setUserDropdown] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement
  );
  //----------------------

  const [registerForm, setRegisterForm] = useState({
    tcNo: "",
    name: "",
    surname: "",
    email: "",
    password: "",
    address: "",
  });

  // Kayıt işlemi fonksiyonu
const handleRegisterSubmit = async (e) => {
  e.preventDefault();
  
  // Form verilerini al
  const { name, surname, email, tcNo, password } = registerForm;

  try {
    // Client-side validations
    if (!name || !surname || !email || !tcNo || !password) {
      throw new Error("Lütfen tüm alanları doldurunuz.");
    }

    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      throw new Error("Lütfen geçerli bir email adresi giriniz.");
    }

    if (!/^[0-9]{11}$/.test(tcNo)) {
      throw new Error("TC Kimlik No 11 haneli olmalı ve sadece rakamlardan oluşmalıdır.");
    }

    if (password.length < 6) {
      throw new Error("Şifre en az 6 karakter olmalıdır.");
    }

    // API isteği
    const response = await axiosInstance.post("/manager/register", registerForm);

    // Başarılı kayıt mesajı
    Swal.fire({
      title: "Başarılı!",
      text: response.data || "Hesabınız başarıyla oluşturuldu. Giriş yapabilirsiniz.",
      icon: "success",
      confirmButtonText: "Tamam"
    });

    // Modalı kapat ve giriş sayfasına yönlendir
    closeModal();
    setActiveModal("giris");
  } catch (error) {
    // Hata mesajını belirle
    let errorMessage = "Kayıt işlemi sırasında bir hata oluştu.";
    
    if (error.response) {
      // Backend'den gelen hata mesajı
      errorMessage = error.response.data;
    } else if (error.message) {
      // Client-side validation hatası
      errorMessage = error.message;
    }

    // Hata mesajını göster
    Swal.fire({
      title: "Hata!",
      text: errorMessage,
      icon: "error",
      confirmButtonText: "Tamam"
    });
  }
};

  // ---------------------------
  const {
    appointments,
    deleteAppointment,
    updateAppointment,
    statusReverseMap,
    updateAppointmentStatus,
    removeCustomerFromAppointment,
    addCustomerToAppointment,
    fetchAppointments,
  } = useAppointments();
  // Güncelleme modalı için state'ler
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [updateSearchTerm, setUpdateSearchTerm] = useState("");
  const [updateFormData, setUpdateFormData] = useState({
    id: "",
    note: "",
    startDate: "",
    startTime: "09:00",
    durationType: "hours",
    duration: 1,
    status: "planned",
    customerIds: [],
  });
  const [pendingChanges, setPendingChanges] = useState({
    addedCustomers: [],
    removedCustomers: [],
  });

  const events = appointments;

  // Status seçenekleri
  const statusOptions = [
    { value: "planned", label: "Planlandı", color: "primary" },
    { value: "complete", label: "Tamamlandı", color: "success" },
    { value: "canceled", label: "İptal Edildi", color: "danger" },
    { value: "win", label: "Kazanıldı", color: "success" },
    { value: "lose", label: "Kaybedildi", color: "warning" },
  ];
  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleAddCustomerToUpdate = (customerId) => {
    if (!updateFormData.customerIds.includes(customerId)) {
      setPendingChanges((prev) => ({
        ...prev,
        addedCustomers: [...prev.addedCustomers, customerId],
        removedCustomers: prev.removedCustomers.filter(
          (id) => id !== customerId
        ),
      }));
    }
    setUpdateSearchTerm("");
  };

  const handleRemoveCustomerFromUpdate = (customerId) => {
    setPendingChanges((prev) => ({
      ...prev,
      removedCustomers: [...prev.removedCustomers, customerId],
      addedCustomers: prev.addedCustomers.filter((id) => id !== customerId),
    }));
  };
  const filteredUpdateCustomers = customers.filter(
    (customer) =>
      !updateFormData.customerIds.includes(customer.id) &&
      !pendingChanges.addedCustomers.includes(customer.id) &&
      (customer.name.toLowerCase().includes(updateSearchTerm.toLowerCase()) ||
        customer.phone?.includes(updateSearchTerm))
  );
  const calculateUpdateEndDate = () => {
    if (!updateFormData.startDate) return null;

    const startDate = new Date(updateFormData.startDate);

    if (updateFormData.durationType === "hours") {
      const [hours, minutes] = updateFormData.startTime.split(":").map(Number);
      startDate.setHours(hours, minutes);
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + parseInt(updateFormData.duration));
      return endDate;
    } else {
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + parseInt(updateFormData.duration));
      return endDate;
    }
  };
  const handleDeleteAppointment = async (eventId) => {
    try {
      await deleteAppointment(eventId);
    } catch (error) {
      console.error("Silme işlemi sırasında hata:", error);
    }
  };
  const handleUpdateAppointment = (eventId) => {
    const selectedEvent = events.find(
      (event) => String(event.id) === String(eventId)
    );
    if (!selectedEvent) return;

    const startDate = new Date(selectedEvent.start);
    const durationType = selectedEvent.allDay ? "days" : "hours";
    const duration = selectedEvent.allDay
      ? Math.round(
          (new Date(selectedEvent.end) - startDate) / (1000 * 60 * 60 * 24)
        )
      : Math.round(
          (new Date(selectedEvent.end) - startDate) / (1000 * 60 * 60)
        );

    setUpdateFormData({
      id: selectedEvent.id,
      note: selectedEvent.title.split(" (")[0],
      startDate: startDate.toISOString().split("T")[0],
      startTime: startDate.toTimeString().substring(0, 5),
      durationType,
      duration,
      status: selectedEvent.extendedProps.status || "planned",
      customerIds: selectedEvent.extendedProps.customerIds || [],
    });
    setPendingChanges({ addedCustomers: [], removedCustomers: [] });
    setSelectedAppointment(selectedEvent);
    setShowUpdateModal(true);
  };
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    const finalCustomerIds = [
      ...updateFormData.customerIds.filter(
        (id) => !pendingChanges.removedCustomers.includes(id)
      ),
      ...pendingChanges.addedCustomers,
    ];

    if (finalCustomerIds.length === 0) {
      alert("Lütfen en az bir müşteri seçin");
      return;
    }

    const endDate = calculateUpdateEndDate();
    if (!endDate) {
      alert("Lütfen geçerli bir tarih seçin");
      return;
    }

    try {
      // Müşteri ekleme/çıkarma işlemlerini yap
      await Promise.all([
        ...pendingChanges.addedCustomers.map((customerId) =>
          addCustomerToAppointment(updateFormData.id, customerId)
        ),
        ...pendingChanges.removedCustomers.map((customerId) =>
          removeCustomerFromAppointment(updateFormData.id, customerId)
        ),
      ]);

      // Randevu bilgilerini güncelle
      const appointmentData = {
        Id: parseInt(updateFormData.id),
        Note: updateFormData.note,
        StartTime: new Date(
          `${updateFormData.startDate}T${updateFormData.startTime}`
        ),
        EndTime: endDate,
        DurationType: updateFormData.durationType === "hours" ? 0 : 1,
        DurationValue: parseInt(updateFormData.duration),
        Status: updateFormData.status,
        CustomerIds: finalCustomerIds,
      };

      await updateAppointment(updateFormData.id, appointmentData);
      setShowUpdateModal(false);
      setSelectedAppointment(null);
      setPendingChanges({ addedCustomers: [], removedCustomers: [] });
    } catch (err) {
      console.error("Randevu güncelleme hatası:", err);
    }
  };
  const getDisplayCustomers = () => {
    return [
      ...updateFormData.customerIds.filter(
        (id) => !pendingChanges.removedCustomers.includes(id)
      ),
      ...pendingChanges.addedCustomers,
    ];
  };
  const handleModalClose = () => {
    setShowUpdateModal(false);
    setPendingChanges({ addedCustomers: [], removedCustomers: [] });
  };
  const getStatusBadgeColor = (status) => {
    const statusOption = statusOptions.find((s) => s.value === status);
    return statusOption ? statusOption.color : "secondary";
  };
  const getStatusLabel = (status) => {
    const statusOption = statusOptions.find((s) => s.value === status);
    return statusOption ? statusOption.label : "Bilinmeyen";
  };

  // --------------------------

  const managerId = user?.id; // user varsa id'sini al
  // Form state'leri
  const [loginData, setLogin] = useState({
    email: "",
    password: "",
  });

  const [customerForm, setCustomerForm] = useState({
    name: "",
    surname: "",
    phone: "",
    address: "",
    city: "",
  });

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    surname: user?.surname || "",
    email: user?.email || "",
    address: user?.address || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const toggleUserDropdown = () => setUserDropdown(!userDropdown);

  const openModal = (modalName) => {
    setActiveModal(modalName);
    setIsCollapsed(true);
    if (modalName === "randevular")   fetchAppointments(); 
  };

  const closeModal = () => {
    setActiveModal("");
    setCustomerForm({
      name: "",
      surname: "",
      phone: "",
      address: "",
      city: "",
    });
  };

  useEffect(() => {
    const rememberedUser = localStorage.getItem("rememberedUser");
    const token = localStorage.getItem("token");

    if (rememberedUser && token) {
      try {
        const userData = JSON.parse(rememberedUser);
        login(userData, token);
      } catch (error) {
        console.error("Kullanıcı bilgisi okunamadı:", error);
      }
    }
  }, []);

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    try {
      console.log("Submitting update for:", customerForm); // Log ekledik
      await updateCustomer(customerForm);
      console.log("Update successful"); // Log ekledik
      await Swal.fire("Başarılı", "Müşteri güncellendi", "success");
      setActiveModal("musteriler");
    } catch (err) {
      console.error("Update submission error:", err); // Log ekledik
      Swal.fire({
        title: "Hata",
        text: err.response?.data?.message || "Güncelleme başarısız",
        icon: "error",
        footer: `Status: ${err.response?.status} - URL: ${err.config?.url}`,
      });
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    const result = await Swal.fire({
      title: "Emin misiniz?",
      text: "Bu müşteriyi silmek istediğinize emin misiniz?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Evet, sil!",
      cancelButtonText: "İptal",
    });

    if (result.isConfirmed) {
      try {
        console.log("Deleting customer ID:", customerId); // Log ekledik
        await deleteCustomer(customerId);
        console.log("Delete successful"); // Log ekledik
        await Swal.fire("Silindi!", "Müşteri başarıyla silindi", "success");
        fetchAppointments(); //Silinen kişiye ait randevuların da takvimden kaldırılması için
      } catch (err) {
        console.error("Delete submission error:", err); // Log ekledik
        Swal.fire({
          title: "Hata!",
          text: err.response?.data?.message || "Silme işlemi başarısız",
          icon: "error",
          footer: `Status: ${err.response?.status} - URL: ${err.config?.url}`,
        });
      }
    }
  };
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post("/manager/login", loginData);
      login(res.data.manager, res.data.token);

      if (rememberMe) {
        localStorage.setItem(
          "rememberedUser",
          JSON.stringify(res.data.manager)
        );
        localStorage.setItem("token", res.data.token);
      } else {
        sessionStorage.setItem("user", JSON.stringify(res.data.manager));
        sessionStorage.setItem("token", res.data.token);
      }

      closeModal();
      await Swal.fire("Başarılı", "Giriş yapıldı", "success");
    } catch (err) {
      Swal.fire(
        "Hata",
        err.response?.data?.message || "Giriş başarısız",
        "error"
      );
    }
  };

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    try {
      await addCustomer(customerForm);
      setCustomerForm({
        name: "",
        surname: "",
        phone: "",
        address: "",
        city: "",
      });
      setActiveModal("musteriler");
      await Swal.fire("Başarılı", "Müşteri eklendi", "success");
    } catch (err) {
      Swal.fire(
        "Hata",
        err.response?.data?.message || "Müşteri eklenemedi",
        "error"
      );
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const { data } = await axiosInstance.put(
        `/manager/update/${user.id}`,
        profileForm
      );
      login(data, localStorage.getItem("token"));
      closeModal();
      await Swal.fire("Başarılı", "Profil güncellendi", "success");
    } catch (err) {
      Swal.fire(
        "Hata",
        err.response?.data?.message || "Güncelleme başarısız",
        "error"
      );
    }
  };

  const handlePasswordChange = async () => {
    try {
      await axiosInstance.put(`/manager/UpdatePassword/${user.id}`, {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      closeModal();
      await Swal.fire("Başarılı", "Şifre değiştirildi", "success");
    } catch (err) {
      Swal.fire(
        "Hata",
        err.response?.data?.message || "Şifre değiştirme başarısız",
        "error"
      );
    }
  };

  const handleDeleteProfile = async () => {
    const result = await Swal.fire({
      title: "Emin misiniz?",
      text: "Profiliniz kalıcı olarak silinecek!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet, sil!",
      cancelButtonText: "İptal",
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`/manager/delete/${user.id}`);
        logout();
        await Swal.fire("Silindi!", "Profiliniz silindi", "success");
      } catch (err) {
        Swal.fire(
          "Hata",
          err.response?.data?.message || "Silme işlemi başarısız",
          "error"
        );
      }
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container">
          <a className="navbar-brand fw-bold" href="#home">
            <i className="bi bi-building me-2"></i> Randevu App
          </a>
          <button
            className="navbar-toggler"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div
            className={`collapse navbar-collapse ${!isCollapsed ? "show" : ""}`}
          >
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {user && (
                <>
                  <li className="nav-item">
                    <a
                      className="nav-link"
                      href="#musteriler"
                      onClick={(e) => {
                        e.preventDefault();
                        openModal("musteriler");
                      }}
                    >
                      <i className="bi bi-people me-1"></i> Müşteriler
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      className="nav-link"
                      href="#istatistikler"
                      onClick={(e) => {
                        e.preventDefault();
                        openModal("istatistikler");
                      }}
                    >
                      <i className="bi bi-bar-chart me-1"></i> İstatistikler
                    </a>
                  </li>
                </>
              )}
            </ul>

            <div className="d-flex align-items-center">
              {!user ? (
                <>
                  <button
                    className="btn btn-outline-light btn-sm me-2"
                    onClick={() => openModal("giris")}
                  >
                    <i className="bi bi-box-arrow-in-right me-1"></i> Giriş Yap
                  </button>
                  <button
                    className="btn btn-outline-light btn-sm me-2"
                    onClick={() => openModal("uyeol")}
                  >
                    <i className="bi bi-box-arrow-in-right me-1"></i> Hesap
                    Oluştur
                  </button>
                </>
              ) : (
                <div className="dropdown">
                  <button
                    className="btn btn-outline-light dropdown-toggle"
                    onClick={toggleUserDropdown}
                    aria-expanded={userDropdown}
                  >
                    <i className="bi bi-person-circle me-1"></i>
                    {user.name} {user.surname}
                  </button>

                  <ul
                    className={`dropdown-menu dropdown-menu-end ${
                      userDropdown ? "show" : ""
                    }`}
                  >
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          setProfileForm({ ...user });
                          openModal("profil");
                          setUserDropdown(false);
                        }}
                      >
                        <i className="bi bi-person me-2"></i> Profil Bilgileri
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          openModal("randevular");
                          setUserDropdown(false);
                        }}
                      >
                        <i className="bi bi-calendar me-2"></i> Oluşturduğum
                        Randevular
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          setPasswordForm({
                            oldPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                          });
                          openModal("sifre-degistir");
                          setUserDropdown(false);
                        }}
                      >
                        <i className="bi bi-shield-lock me-2"></i> Şifre
                        Değiştir
                      </button>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button
                        className="dropdown-item text-danger"
                        onClick={() => {
                          setUserDropdown(false);
                          handleDeleteProfile();
                        }}
                      >
                        <i className="bi bi-trash me-2"></i> Profili Sil
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          setUserDropdown(false);
                          logout();

                        }}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i> Çıkış Yap
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      {/* Üye Ol Modal */}
      {activeModal === "uyeol" && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">
                  <i className="bi bi-person-plus me-2"></i>Yeni Hesap Oluştur
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeModal}
                ></button>
              </div>
              <form onSubmit={handleRegisterSubmit}>
                <div className="modal-body">
                  {/* TC Kimlik No */}
                  <div className="mb-3">
                    <label className="form-label">TC Kimlik No</label>
                    <input
                      type="text"
                      className="form-control"
                      value={registerForm.tcNo}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          tcNo: e.target.value,
                        })
                      }
                      required
                      maxLength="11"
                      pattern="[0-9]{11}"
                      title="Lütfen 11 haneli TC kimlik numaranızı giriniz"
                    />
                    <small className="text-muted">
                      11 haneli numaranızı giriniz
                    </small>
                  </div>

                  {/* Ad */}
                  <div className="mb-3">
                    <label className="form-label">Ad</label>
                    <input
                      type="text"
                      className="form-control"
                      value={registerForm.name}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          name: e.target.value,
                        })
                      }
                      required
                      pattern="[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+"
                      title="Lütfen sadece harf giriniz"
                    />
                  </div>

                  {/* Soyad */}
                  <div className="mb-3">
                    <label className="form-label">Soyad</label>
                    <input
                      type="text"
                      className="form-control"
                      value={registerForm.surname}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          surname: e.target.value,
                        })
                      }
                      required
                      pattern="[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+"
                      title="Lütfen sadece harf giriniz"
                    />
                  </div>

                  {/* E-posta */}
                  <div className="mb-3">
                    <label className="form-label">E-posta</label>
                    <input
                      type="email"
                      className="form-control"
                      value={registerForm.email}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  {/* Şifre */}
                  <div className="mb-3">
                    <label className="form-label">Şifre</label>
                    <input
                      type="password"
                      className="form-control"
                      value={registerForm.password}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          password: e.target.value,
                        })
                      }
                      required
                      minLength="6"
                    />
                    <small className="text-muted">
                      En az 6 karakter olmalıdır
                    </small>
                  </div>

                  {/* Adres */}
                  <div className="mb-3">
                    <label className="form-label">Adres</label>
                    <textarea
                      className="form-control"
                      value={registerForm.address}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          address: e.target.value,
                        })
                      }
                      required
                      rows="3"
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                  >
                    İptal
                  </button>
                  <button type="submit" className="btn btn-success">
                    <i className="bi bi-person-check me-1"></i>Hesap Oluştur
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Profil Modal */}
      {activeModal === "profil" && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Profil Bilgileri</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Tc No</label>
                  <input
                    type="text"
                    disabled
                    className="form-control"
                    value={profileForm.tcNo}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, tcNo: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Ad</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, name: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Soyad</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profileForm.surname}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        surname: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">E-posta</label>
                  <input
                    type="email"
                    className="form-control"
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, email: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Adres</label>
                  <textarea
                    className="form-control"
                    value={profileForm.address}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        address: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-danger me-auto"
                  onClick={handleDeleteProfile}
                >
                  Profili Sil
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  İptal
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleProfileUpdate}
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Randevular Modal */}
      {activeModal === "randevular" && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title">Oluşturduğum Randevular</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                {events.length === 0 ? (
                  <div className="alert alert-info">
                    Henüz randevu oluşturmadınız
                  </div>
                ) : (
                  <div className="list-group">
                    {events.map((event) => (
                      <div key={event.id} className="list-group-item">
                        <div className="d-flex justify-content-between">
                          <div>
                            <h5>{event.title}</h5>
                            <p className="mb-1">
                              <strong>Tarih:</strong>{" "}
                              {new Date(event.start).toLocaleDateString(
                                "tr-TR"
                              )}
                            </p>
                            <p className="mb-1">
                              <strong>Müşteriler:</strong>{" "}
                              {event.extendedProps.customerNames}
                            </p>
                            <Badge
                              bg={getStatusBadgeColor(
                                event.extendedProps.status
                              )}
                            >
                              {getStatusLabel(event.extendedProps.status)}
                            </Badge>
                          </div>
                          <div className="event-actions">
                            <FaCog
                              className="event-action-icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                const currentStatus = getStatusLabel(
                                  event.extendedProps.status
                                );
                                const currentStatusId =
                                  statusReverseMap[currentStatus];
                                const nextStatusId = (currentStatusId + 1) % 5;
                                updateAppointmentStatus(event.id, nextStatusId);
                              }}
                            />
                            <FaEdit
                              className="event-action-icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateAppointment(event.id);
                              }}
                            />
                            <FaTrash
                              className="event-action-icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAppointment(event.id);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Güncelleme Modalı */}
      <Modal
        show={showUpdateModal}
        onHide={handleModalClose}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Randevu Düzenle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdateSubmit}>
            <Row>
              {/* Sol taraf - Randevu detayları */}
              <Col md={6}>
                <h6 className="mb-3 text-primary">Randevu Detayları</h6>

                <Form.Group className="mb-3">
                  <Form.Label>Not</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    type="text"
                    name="note"
                    value={updateFormData.note}
                    onChange={handleUpdateInputChange}
                    placeholder="Randevu notlarını buraya yazınız..."
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Başlangıç Tarihi</Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={updateFormData.startDate}
                    onChange={handleUpdateInputChange}
                    required
                  />
                </Form.Group>

                {updateFormData.durationType === "hours" && (
                  <Form.Group className="mb-3">
                    <Form.Label>Başlangıç Saati</Form.Label>
                    <Form.Control
                      type="time"
                      name="startTime"
                      value={updateFormData.startTime}
                      onChange={handleUpdateInputChange}
                      required
                    />
                  </Form.Group>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>Süre Türü</Form.Label>
                  <Form.Select
                    name="durationType"
                    value={updateFormData.durationType}
                    onChange={handleUpdateInputChange}
                    required
                  >
                    <option value="hours">Saatlik</option>
                    <option value="days">Günlük</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    {updateFormData.durationType === "hours"
                      ? "Süre (Saat)"
                      : "Süre (Gün)"}
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max={updateFormData.durationType === "hours" ? "12" : "30"}
                    name="duration"
                    value={updateFormData.duration}
                    onChange={handleUpdateInputChange}
                    required
                  />
                </Form.Group>

                {calculateUpdateEndDate() && (
                  <div className="alert alert-info">
                    <strong>Bitiş Zamanı:</strong>{" "}
                    {calculateUpdateEndDate().toLocaleString("tr-TR")}
                  </div>
                )}
              </Col>
              {/* Sağ taraf - Müşteri yönetimi */}
              <Col md={6}>
                <h6 className="mb-3 text-primary">Müşteri Yönetimi</h6>

                {/* Mevcut müşteriler */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Form.Label className="mb-0">
                      Randevudaki Müşteriler
                    </Form.Label>
                    <Badge bg="secondary">{getDisplayCustomers().length}</Badge>
                  </div>
                  <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                    {getDisplayCustomers().length === 0 ? (
                      <Alert variant="info" className="py-2">
                        <small>Henüz müşteri eklenmemiş</small>
                      </Alert>
                    ) : (
                      getDisplayCustomers().map((id) => {
                        const customer = customers.find((c) => c.id === id);
                        return customer ? (
                          <Card key={customer.id} className="mb-2">
                            <Card.Body className="py-2">
                              <div className="d-flex justify-content-between align-items-start">
                                <div className="flex-grow-1">
                                  <h6 className="mb-1">
                                    {customer.name} {customer.surname}
                                  </h6>
                                  <small className="text-muted d-block">
                                    {customer.phone}
                                  </small>
                                  {customer.email && (
                                    <small className="text-muted d-block">
                                      {customer.email}
                                    </small>
                                  )}
                                </div>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() =>
                                    handleRemoveCustomerFromUpdate(customer.id)
                                  }
                                >
                                  ×
                                </Button>
                              </div>
                            </Card.Body>
                          </Card>
                        ) : null;
                      })
                    )}
                  </div>
                </div>

                {/* Müşteri ekleme butonu */}
                <div className="mb-3">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="w-100"
                    onClick={() => setShowCustomerSearch(!showCustomerSearch)}
                  >
                    {showCustomerSearch
                      ? "Müşteri Aramayı Kapat"
                      : "Müşteri Ekle"}
                  </Button>
                </div>

                {/* Müşteri arama alanı */}
                {showCustomerSearch && (
                  <div className="mb-4 border rounded p-2">
                    <Form.Control
                      type="text"
                      placeholder="Müşteri adı veya telefon ile ara..."
                      className="mb-2"
                      value={updateSearchTerm}
                      onChange={(e) => setUpdateSearchTerm(e.target.value)}
                    />

                    <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                      {filteredUpdateCustomers.length === 0 ? (
                        <div className="p-2 text-center text-muted">
                          {updateSearchTerm
                            ? "Arama kriterine uygun müşteri bulunamadı"
                            : "Müşteri bulunamadı"}
                        </div>
                      ) : (
                        filteredUpdateCustomers.map((customer) => (
                          <div
                            key={customer.id}
                            className="d-flex justify-content-between align-items-center p-2 border-bottom"
                          >
                            <div>
                              <small className="fw-bold">{customer.name}</small>
                              <br />
                              <small className="text-muted">
                                {customer.phone}
                              </small>
                            </div>
                            <Button
                              variant={
                                getDisplayCustomers().includes(customer.id)
                                  ? "secondary"
                                  : "success"
                              }
                              size="sm"
                              onClick={() =>
                                handleAddCustomerToUpdate(customer.id)
                              }
                              disabled={getDisplayCustomers().includes(
                                customer.id
                              )}
                            >
                              {getDisplayCustomers().includes(customer.id)
                                ? "Eklendi"
                                : "Ekle"}
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            İptal
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateSubmit}
            disabled={getDisplayCustomers().length === 0}
          >
            Güncelle
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Şifre Değiştirme Modal */}
      {activeModal === "sifre-degistir" && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title">Şifre Değiştir</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handlePasswordChange();
                }}
              >
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Eski Şifre</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwordForm.oldPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          oldPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Yeni Şifre</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Yeni Şifre Tekrar</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                  >
                    İptal
                  </button>
                  <button type="submit" className="btn btn-warning">
                    Değiştir
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Müşteriler Modal */}
      {activeModal === "musteriler" && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Müşteri Listesi</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Ad</th>
                      <th>Soyad</th>
                      <th>Telefon</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c.id}>
                        <td>{c.name}</td>
                        <td>{c.surname}</td>
                        <td>{c.phone}</td>
                        <td>
                          <div className="d-flex gap-2">
                            {/* Güncelle Butonu */}
                            <button
                              className="btn btn-sm btn-warning"
                              onClick={() => {
                                setCustomerForm({
                                  id: c.id, // Güncelleme için ID ekliyoruz
                                  name: c.name,
                                  surname: c.surname,
                                  phone: c.phone,
                                  address: c.address,
                                  city: c.city,
                                });
                                setActiveModal("musteri-guncelle");
                              }}
                              title="Güncelle"
                            >
                              <i className="bi bi-pencil-fill"></i>
                            </button>

                            {/* Sil Butonu */}
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteCustomer(c.id)}
                              title="Sil"
                            >
                              <i className="bi bi-trash-fill"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>
                  Kapat
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => {
                    setCustomerForm({
                      name: "",
                      surname: "",
                      phone: "",
                      address: "",
                      city: "",
                    });
                    setActiveModal("musteri-ekle");
                  }}
                >
                  <i className="bi bi-plus-lg me-1"></i> Yeni Müşteri
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Müşteri Güncelleme Modalı */}
      {activeModal === "musteri-guncelle" && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-warning text-white">
                <h5 className="modal-title">Müşteri Güncelle</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setActiveModal("musteriler")}
                ></button>
              </div>
              <form onSubmit={handleUpdateCustomer}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Ad</label>
                    <input
                      type="text"
                      className="form-control"
                      value={customerForm.name}
                      onChange={(e) =>
                        setCustomerForm({
                          ...customerForm,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Soyad</label>
                    <input
                      type="text"
                      className="form-control"
                      value={customerForm.surname}
                      onChange={(e) =>
                        setCustomerForm({
                          ...customerForm,
                          surname: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Telefon</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={customerForm.phone}
                      onChange={(e) =>
                        setCustomerForm({
                          ...customerForm,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Adres</label>
                    <input
                      type="text"
                      className="form-control"
                      value={customerForm.address}
                      onChange={(e) =>
                        setCustomerForm({
                          ...customerForm,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Şehir</label>
                    <input
                      type="text"
                      className="form-control"
                      value={customerForm.city}
                      onChange={(e) =>
                        setCustomerForm({
                          ...customerForm,
                          city: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setActiveModal("musteriler")}
                  >
                    İptal
                  </button>
                  <button type="submit" className="btn btn-warning">
                    Güncelle
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Giriş Modal */}
      {activeModal === "giris" && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title">Giriş Yap</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeModal}
                ></button>
              </div>
              <form onSubmit={handleLoginSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">E-posta</label>
                    <input
                      type="email"
                      className="form-control"
                      value={loginData.email}
                      onChange={(e) =>
                        setLogin({ ...loginData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Şifre</label>
                    <input
                      type="password"
                      className="form-control"
                      value={loginData.password}
                      onChange={(e) =>
                        setLogin({ ...loginData, password: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="rememberMe">
                      Beni hatırla
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                  >
                    İptal
                  </button>
                  <button type="submit" className="btn btn-info text-white">
                    Giriş Yap
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Müşteri Ekle Modal */}
      {activeModal === "musteri-ekle" && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">Yeni Müşteri Ekle</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setActiveModal("musteriler")}
                ></button>
              </div>
              <form onSubmit={handleCustomerSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Ad</label>
                    <input
                      type="text"
                      className="form-control"
                      value={customerForm.name}
                      onChange={(e) =>
                        setCustomerForm({
                          ...customerForm,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Soyad</label>
                    <input
                      type="text"
                      className="form-control"
                      value={customerForm.surname}
                      onChange={(e) =>
                        setCustomerForm({
                          ...customerForm,
                          surname: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Telefon</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={customerForm.phone}
                      onChange={(e) =>
                        setCustomerForm({
                          ...customerForm,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Adres</label>
                    <input
                      type="text"
                      className="form-control"
                      value={customerForm.address}
                      onChange={(e) =>
                        setCustomerForm({
                          ...customerForm,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Şehir</label>
                    <input
                      type="text"
                      className="form-control"
                      value={customerForm.city}
                      onChange={(e) =>
                        setCustomerForm({
                          ...customerForm,
                          city: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setActiveModal("musteriler")}
                  >
                    İptal
                  </button>
                  <button type="submit" className="btn btn-success">
                    Kaydet
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* İstatistikler Modal */}
      {activeModal === "istatistikler" && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-xl">
            {" "}
            {/* modal-lg'dan modal-xl'a büyüttük */}
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="bi bi-bar-chart-fill me-2"></i>İstatistik Paneli
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                {/* Genel Bakış Kartları */}
                <h5 className="mb-3 border-bottom pb-2">
                  <i className="bi bi-speedometer2 me-2"></i>Genel Bakış
                </h5>
                <Row className="g-4 mb-4">
                  {/* Toplam Müşteri */}
                  <Col xl={2} md={4} sm={6}>
                    <Card className="text-center h-100 shadow-sm">
                      <Card.Body>
                        <div className="stats-icon bg-primary bg-opacity-10 text-primary">
                          <i className="bi bi-people-fill"></i>
                        </div>
                        <Card.Title className="mt-2">Toplam Müşteri</Card.Title>
                        <Card.Text className="display-6 fw-bold text-primary">
                          {customers.length}
                        </Card.Text>
                        <small className="text-muted">Sistemde kayıtlı</small>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Toplam Randevu */}
                  <Col xl={2} md={4} sm={6}>
                    <Card className="text-center h-100 shadow-sm">
                      <Card.Body>
                        <div className="stats-icon bg-info bg-opacity-10 text-info">
                          <i className="bi bi-calendar-check"></i>
                        </div>
                        <Card.Title className="mt-2">Toplam Randevu</Card.Title>
                        <Card.Text className="display-6 fw-bold text-info">
                          {appointments.length}
                        </Card.Text>
                        <small className="text-muted">Tüm zamanlar</small>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Bu Ay Randevular */}
                  <Col xl={2} md={4} sm={6}>
                    <Card className="text-center h-100 shadow-sm">
                      <Card.Body>
                        <div className="stats-icon bg-warning bg-opacity-10 text-warning">
                          <i className="bi bi-calendar-month"></i>
                        </div>
                        <Card.Title className="mt-2">Bu Ay</Card.Title>
                        <Card.Text className="display-6 fw-bold text-warning">
                          {
                            appointments.filter((a) => {
                              const appDate = new Date(a.start);
                              const now = new Date();
                              return (
                                appDate.getMonth() === now.getMonth() &&
                                appDate.getFullYear() === now.getFullYear()
                              );
                            }).length
                          }
                        </Card.Text>
                        <small className="text-muted">
                          {new Date().toLocaleString("tr-TR", {
                            month: "long",
                          })}
                        </small>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Bugünkü Randevular */}
                  <Col xl={2} md={4} sm={6}>
                    <Card className="text-center h-100 shadow-sm">
                      <Card.Body>
                        <div className="stats-icon bg-success bg-opacity-10 text-success">
                          <i className="bi bi-calendar-day"></i>
                        </div>
                        <Card.Title className="mt-2">Bugün</Card.Title>
                        <Card.Text className="display-6 fw-bold text-success">
                          {
                            appointments.filter((a) => {
                              const appDate = new Date(a.start).toDateString();
                              return appDate === new Date().toDateString();
                            }).length
                          }
                        </Card.Text>
                        <small className="text-muted">
                          {new Date().toLocaleDateString("tr-TR")}
                        </small>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Ortalama Süre */}
                  <Col xl={2} md={4} sm={6}>
                    <Card className="text-center h-100 shadow-sm">
                      <Card.Body>
                        <div className="stats-icon bg-purple bg-opacity-10 text-purple">
                          <i className="bi bi-clock-history"></i>
                        </div>
                        <Card.Title className="mt-2">Ort. Süre</Card.Title>
                        <Card.Text className="display-6 fw-bold text-purple">
                          {appointments.length > 0
                            ? Math.round(
                                (appointments.reduce((acc, curr) => {
                                  const start = new Date(curr.start);
                                  const end = new Date(curr.end);
                                  return acc + (end - start) / (1000 * 60 * 60); // Saate çevir
                                }, 0) /
                                  appointments.length) *
                                  10
                              ) / 10
                            : 0}{" "}
                          sa
                        </Card.Text>
                        <small className="text-muted">Randevu başına</small>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* En Çok Randevu Alan */}
                  <Col xl={2} md={4} sm={6}>
                    <Card className="text-center h-100 shadow-sm">
                      <Card.Body>
                        <div className="stats-icon bg-danger bg-opacity-10 text-danger">
                          <i className="bi bi-star-fill"></i>
                        </div>
                        <Card.Title className="mt-2">En Aktif</Card.Title>
                        <Card.Text
                          className="fw-bold text-danger"
                          style={{ fontSize: "1.2rem" }}
                        >
                          {customers.length > 0
                            ? (() => {
                                const customerAppointments = customers.map(
                                  (c) => ({
                                    ...c,
                                    count: appointments.filter((a) =>
                                      a.extendedProps?.customerIds?.includes(
                                        c.id
                                      )
                                    ).length,
                                  })
                                );
                                const mostActive = customerAppointments.reduce(
                                  (prev, current) =>
                                    prev.count > current.count ? prev : current
                                );
                                return mostActive.count > 0
                                  ? `${mostActive.name.substring(0, 10)}...`
                                  : "Yok";
                              })()
                            : "Yok"}
                        </Card.Text>
                        <small className="text-muted">
                          {customers.length > 0 &&
                            (() => {
                              const customerAppointments = customers.map(
                                (c) => ({
                                  ...c,
                                  count: appointments.filter((a) =>
                                    a.extendedProps?.customerIds?.includes(c.id)
                                  ).length,
                                })
                              );
                              const mostActive = customerAppointments.reduce(
                                (prev, current) =>
                                  prev.count > current.count ? prev : current
                              );
                              return mostActive.count > 0
                                ? `${mostActive.count} randevu`
                                : "Veri yok";
                            })()}
                        </small>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Randevu Durum Dağılımı */}
                <Row className="mb-4">
                  <Col lg={6}>
                    <Card className="h-100 shadow-sm">
                      <Card.Body>
                        <h5 className="mb-3 border-bottom pb-2">
                          <i className="bi bi-pie-chart-fill me-2 text-primary"></i>
                          Randevu Durum Dağılımı
                        </h5>
                        <div style={{ height: "300px" }}>
                          <Pie
                            data={{
                              labels: statusOptions.map((s) => s.label),
                              datasets: [
                                {
                                  data: statusOptions.map(
                                    (option) =>
                                      appointments.filter(
                                        (a) =>
                                          a.extendedProps?.status ===
                                          option.value
                                      ).length
                                  ),
                                  backgroundColor: statusOptions.map(
                                    (option) =>
                                      `rgba(var(--bs-${option.color}-rgb), 0.7)`
                                  ),
                                  borderColor: statusOptions.map(
                                    (option) =>
                                      `rgba(var(--bs-${option.color}-rgb), 1)`
                                  ),
                                  borderWidth: 1,
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  position: "right",
                                },
                                tooltip: {
                                  callbacks: {
                                    label: function (context) {
                                      const total = context.dataset.data.reduce(
                                        (a, b) => a + b,
                                        0
                                      );
                                      const value = context.raw;
                                      const percentage = Math.round(
                                        (value / total) * 100
                                      );
                                      return `${context.label}: ${value} (${percentage}%)`;
                                    },
                                  },
                                },
                              },
                            }}
                          />
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Aylık Randevu Trendi */}
                  <Col lg={6}>
                    <Card className="h-100 shadow-sm">
                      <Card.Body>
                        <h5 className="mb-3 border-bottom pb-2">
                          <i className="bi bi-graph-up me-2 text-success"></i>
                          Aylık Randevu Trendi
                        </h5>
                        <div style={{ height: "300px" }}>
                          <Bar
                            data={{
                              labels: Array.from({ length: 6 }, (_, i) => {
                                const date = new Date();
                                date.setMonth(date.getMonth() - (5 - i));
                                return date.toLocaleString("tr-TR", {
                                  month: "short",
                                });
                              }),
                              datasets: [
                                {
                                  label: "Randevu Sayısı",
                                  data: Array.from({ length: 6 }, (_, i) => {
                                    const date = new Date();
                                    date.setMonth(date.getMonth() - (5 - i));
                                    return appointments.filter((a) => {
                                      const appDate = new Date(a.start);
                                      return (
                                        appDate.getMonth() ===
                                          date.getMonth() &&
                                        appDate.getFullYear() ===
                                          date.getFullYear()
                                      );
                                    }).length;
                                  }),
                                  backgroundColor:
                                    "rgba(var(--bs-primary-rgb), 0.7)",
                                  borderColor: "rgba(var(--bs-primary-rgb), 1)",
                                  borderWidth: 1,
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  ticks: {
                                    stepSize: 1,
                                  },
                                },
                              },
                              plugins: {
                                tooltip: {
                                  callbacks: {
                                    label: function (context) {
                                      return `${context.dataset.label}: ${context.raw}`;
                                    },
                                  },
                                },
                              },
                            }}
                          />
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Son Randevular */}
                <Card className="shadow-sm">
                  <Card.Body>
                    <h5 className="mb-3 border-bottom pb-2">
                      <i className="bi bi-list-ul me-2 text-info"></i>
                      Son 5 Randevu
                    </h5>
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Tarih</th>
                            <th>Müşteri</th>
                            <th>Not</th>
                            <th>Durum</th>
                            <th>Süre</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appointments
                            .sort(
                              (a, b) => new Date(b.start) - new Date(a.start)
                            )
                            .slice(0, 5)
                            .map((appointment) => (
                              <tr key={appointment.id}>
                                <td>
                                  {new Date(appointment.start).toLocaleString(
                                    "tr-TR",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </td>
                                <td>
                                  {appointment.extendedProps?.customerNames
                                    ?.split(",")
                                    .slice(0, 2)
                                    .join(", ")}
                                  {appointment.extendedProps?.customerNames?.split(
                                    ","
                                  ).length > 2 && "..."}
                                </td>
                                <td
                                  className="text-truncate"
                                  style={{ maxWidth: "150px" }}
                                >
                                  {appointment.title}
                                </td>
                                <td>
                                  <Badge
                                    bg={getStatusBadgeColor(
                                      appointment.extendedProps?.status
                                    )}
                                  >
                                    {getStatusLabel(
                                      appointment.extendedProps?.status
                                    )}
                                  </Badge>
                                </td>
                                <td>
                                  {(new Date(appointment.end) -
                                    new Date(appointment.start)) /
                                    (1000 * 60 * 60 * 24) >=
                                  1
                                    ? `${Math.round(
                                        (new Date(appointment.end) -
                                          new Date(appointment.start)) /
                                          (1000 * 60 * 60 * 24)
                                      )} gün`
                                    : `${Math.round(
                                        (new Date(appointment.end) -
                                          new Date(appointment.start)) /
                                          (1000 * 60 * 60)
                                      )} saat`}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </Card.Body>
                </Card>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  <i className="bi bi-x-lg me-1"></i>Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
