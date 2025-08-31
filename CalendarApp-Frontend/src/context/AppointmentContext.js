import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../axiosConfig";
import Swal from "sweetalert2";
import { useCustomers } from "./CustomerContext";
import { useContext as useReactContext } from "react";
import { AuthContext } from "./AuthContext";

const AppointmentContext = createContext();

export const AppointmentProvider = ({ children }) => {
  const { customers, setCustomers } = useCustomers();
  const { user } = useReactContext(AuthContext);
  const managerId = user?.id;

  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [error, setError] = useState(null);

  // Status enum mapping
  const statusEnumMap = {
    0: "planned",
    1: "complete",
    2: "canceled",
    3: "win",
    4: "lose",
  };

  const statusReverseMap = {
    planned: 0,
    complete: 1,
    canceled: 2,
    win: 3,
    lose: 4,
  };

  // 📌 Randevuları formatlama (takvim için de ortak)
  const formatAppointmentsToEvents = (appointmentsData) => {
    return appointmentsData.map((appointment) => {
      const customerNames = appointment.customers
        .map((c) => `${c.name} ${c.surname}`)
        .join(", ");

      // Status enum değerini string'e çevir
      const status = statusEnumMap[appointment.status] || "planned";

      const durationText =
        appointment.durationType === 0
          ? `${appointment.durationValue} saat`
          : `${appointment.durationValue} gün`;

      return {
        id: appointment.id,
        title: `${appointment.note} (${durationText})`,
        start: appointment.startTime,
        end: appointment.endTime,
        allDay: appointment.durationType === 1,
        backgroundColor: getRandomEventColor(),
        extendedProps: {
          customerIds: appointment.customers.map((c) => c.id),
          customerNames: customerNames,
          status: status,
          durationType: appointment.durationType,
          durationValue: appointment.durationValue,
        },
      };
    });
  };

  const eventColors = [
    "#FF6B6B",
    "#FF9F43",
    "#1DD1A1",
    "#54A0FF",
    "#5F27CD",
    "#F368E0",
    "#10AC84",
    "#576574",
    "#00d2ff",
    "#feca57",
  ];

  const getRandomEventColor = () => {
    return eventColors[Math.floor(Math.random() * eventColors.length)];
  };

  // 📌 Randevuları API'dan çek
  const fetchAppointments = async () => {
    if (!managerId) return;
    try {
      setLoadingAppointments(true);

      const customersRes = await axiosInstance.get("/customer/GetAllCustomer");
      setCustomers(customersRes.data);

      const appointmentsRes = await axiosInstance.get(
        `/appointment/manager/${managerId}`
      );
      setAppointments(formatAppointmentsToEvents(appointmentsRes.data));
    } catch (err) {
      setError("Randevular yüklenirken hata oluştu");
    } finally {
      setLoadingAppointments(false);
    }
  };

  // 📌 Randevu oluşturma
  const createAppointment = async (appointmentData) => {
    try {
      const response = await axiosInstance.post(
        "/appointment/create",
        appointmentData
      );

      const newAppointment = {
        ...response.data,
        customers: customers.filter((c) =>
          appointmentData.CustomerIds.includes(c.id)
        ),
      };

      setAppointments((prev) => [
        ...prev,
        ...formatAppointmentsToEvents([newAppointment]),
      ]);
      Swal.fire("Başarılı!", "Randevu oluşturuldu", "success");
    } catch (err) {
      Swal.fire(
        "Hata!",
        err.response?.data?.message || "Randevu oluşturulamadı",
        "error"
      );
    }
  };
  // Müşteri ekleme
  const addCustomerToAppointment = async (appointmentId, customerId) => {
    try {
      const response = await axiosInstance.post("/appointment/add-customer", {
        appointmentId,
        customerId,
        managerId: user.id, // Giriş yapan yönetici
      });
      // Randevu listesini güncelle
      fetchAppointments();
    } catch (error) {
      console.error("Müşteri eklenirken hata:", error);
    }
  };

  // Müşteri çıkarma
  const removeCustomerFromAppointment = async (appointmentId, customerId) => {
    try {
      const response = await axiosInstance.post(
        "/appointment/remove-customer",
        {
          appointmentId,
          customerId,
          managerId: user.id, // Giriş yapan yönetici
        }
      );
      // Randevu listesini güncelle
      fetchAppointments();
    } catch (error) {
      console.error("Müşteri çıkarılırken hata:", error);
    }
  };

  // 📌 Randevu silme
  const deleteAppointment = async (appointmentId) => {
    try {
      const result = await Swal.fire({
        title: "Emin misiniz?",
        text: "Bu randevuyu silmek istediğinize emin misiniz?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Evet, sil!",
        cancelButtonText: "İptal",
      });

      if (!result.isConfirmed) return;

      await axiosInstance.delete(`/appointment/${appointmentId}`);
      setAppointments((prev) =>
        prev.filter((event) => event.id !== appointmentId)
      );
      fetchAppointments();
      Swal.fire("Silindi!", "Randevu başarıyla silindi.", "success");
    } catch {
      Swal.fire("Hata!", "Randevu silinirken bir hata oluştu.", "error");
    }
  };
  // 📌 Randevu durumunu güncelleme
  const updateAppointmentStatus = async (appointmentId, currentStatus) => {
    try {
      const { value: newStatus } = await Swal.fire({
        title: "Durum Güncelle",
        input: "select",
        inputOptions: {
          0: "Planlandı",
          1: "Tamamlandı",
          2: "İptal Edildi",
          3: "Kazanıldı",
          4: "Kaybedildi",
        },
        inputValue: statusReverseMap[currentStatus] || 0,
        inputPlaceholder: "Durum seçin",
        showCancelButton: true,
        confirmButtonText: "Güncelle",
        cancelButtonText: "İptal",
        inputValidator: (value) => {
          if (value === "") {
            return "Bir durum seçmelisiniz";
          }
        },
      });

      if (!newStatus) return; // İptal edildiyse

      await axiosInstance.put(`/appointment/${appointmentId}/status`, {
        newStatus: parseInt(newStatus),
      });

      // State'i güncelle
      setAppointments((prev) =>
        prev.map((event) => {
          if (event.id === appointmentId) {
            return {
              ...event,
              extendedProps: {
                ...event.extendedProps,
                status: statusEnumMap[newStatus],
              },
            };
          }
          return event;
        })
      );

      fetchAppointments();
      Swal.fire("Başarılı!", "Randevu durumu güncellendi.", "success");
    } catch (err) {
      Swal.fire(
        "Hata!",
        err.response?.data?.message || "Durum güncellenirken bir hata oluştu",
        "error"
      );
    }
  };

  // 📌 Randevu güncelleme
  const updateAppointment = async (appointmentId, updatedData) => {
    try {
      // Status string'ini enum değerine çevir
      const dataToSend = {
        ...updatedData,
        Status: statusReverseMap[updatedData.Status] ?? 0,
      };

      await axiosInstance.put(`/appointment/${appointmentId}`, dataToSend);
      await fetchAppointments(); // Güncel listeyi çek
      Swal.fire("Güncellendi!", "Randevu başarıyla güncellendi.", "success");
    } catch {
      Swal.fire("Hata!", "Randevu güncellenirken bir hata oluştu.", "error");
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [managerId]);

  return (
    <AppointmentContext.Provider
      value={{
        appointments,
        loadingAppointments,
        error,
        fetchAppointments,
        createAppointment,
        deleteAppointment,
        updateAppointment,
        removeCustomerFromAppointment, // Bu fonksiyonu ekledik
        addCustomerToAppointment, // Bu fonksiyonu da ekledik
        updateAppointmentStatus,
        statusEnumMap,
        statusReverseMap,
      }}
    >
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = () => useContext(AppointmentContext);
