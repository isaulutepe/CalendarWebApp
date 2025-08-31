import React, { useState, useContext } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Form,
  Button,
  Row,
  Col,
  Badge,
  Spinner,
  Alert,
  Modal,
  Card,
} from "react-bootstrap";
import "../style/calendar.css";
import { useCustomers } from "../context/CustomerContext";
import { AuthContext } from "../context/AuthContext";
import { useAppointments } from "../context/AppointmentContext";
import { FaEdit, FaTrash, FaCog } from "react-icons/fa";

const CustomerTag = ({ customer, onRemove, showRemove = true }) => {
  return (
    <Badge pill className="customer-tag">
      {customer.name}
      {showRemove && (
        <span
          className="close-button"
          onClick={() => onRemove(customer.id)}
          aria-label={`Remove ${customer.name}`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onRemove(customer.id);
          }}
        >
          &times;
        </span>
      )}
    </Badge>
  );
};

const Calendar = () => {
  const {
    appointments,
    loadingAppointments,
    createAppointment,
    deleteAppointment,
    updateAppointment,
    statusReverseMap,
    updateAppointmentStatus,
    removeCustomerFromAppointment,
    addCustomerToAppointment,
  } = useAppointments();

  const { customers } = useCustomers();
  const { user } = useContext(AuthContext);
  const [selectedDate, setSelectedDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const managerId = user?.id;

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

  const [formData, setFormData] = useState({
    note: "",
    customerIds: [],
    startDate: "",
    durationType: "hours",
    duration: 1,
    startTime: "09:00",
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

  const handleDateSelect = (selectInfo) => {
    const startDate = selectInfo.startStr.split("T")[0];
    setSelectedDate(startDate);
    setFormData((prev) => ({
      ...prev,
      startDate: startDate,
      startTime: selectInfo.start.toTimeString().substring(0, 5),
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddCustomer = (customerId) => {
    if (!formData.customerIds.includes(customerId)) {
      setFormData((prev) => ({
        ...prev,
        customerIds: [...prev.customerIds, customerId],
      }));
    }
    setSearchTerm("");
  };

  const handleRemoveCustomer = (customerId) => {
    setFormData((prev) => ({
      ...prev,
      customerIds: prev.customerIds.filter((id) => id !== customerId),
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

  const filteredCustomers = customers.filter(
    (customer) =>
      !formData.customerIds.includes(customer.id) &&
      (customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm))
  );

  const filteredUpdateCustomers = customers.filter(
    (customer) =>
      !updateFormData.customerIds.includes(customer.id) &&
      !pendingChanges.addedCustomers.includes(customer.id) &&
      (customer.name.toLowerCase().includes(updateSearchTerm.toLowerCase()) ||
        customer.phone?.includes(updateSearchTerm))
  );

  const calculateEndDate = () => {
    if (!formData.startDate) return null;

    const startDate = new Date(formData.startDate);

    if (formData.durationType === "hours") {
      const [hours, minutes] = formData.startTime.split(":").map(Number);
      startDate.setHours(hours, minutes);
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + parseInt(formData.duration));
      return endDate;
    } else {
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + parseInt(formData.duration));
      return endDate;
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.customerIds.length === 0) {
      alert("Lütfen en az bir müşteri seçin");
      return;
    }

    const endDate = calculateEndDate();
    if (!endDate) {
      alert("Lütfen geçerli bir tarih seçin");
      return;
    }

    try {
      const appointmentData = {
        Note: formData.note,
        StartTime: new Date(`${formData.startDate}T${formData.startTime}`),
        EndTime: endDate,
        DurationType: formData.durationType === "hours" ? 0 : 1,
        DurationValue: parseInt(formData.duration),
        ManagerId: managerId,
        CustomerIds: formData.customerIds,
        Status: 0,
      };

      await createAppointment(appointmentData);

      setFormData({
        note: "",
        customerIds: [],
        startDate: "",
        durationType: "hours",
        duration: 1,
        startTime: "09:00",
      });
    } catch (err) {
      console.error("Randevu oluşturma hatası:", err);
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

  const renderEventContent = (eventInfo) => {
    const status = eventInfo.event.extendedProps.status;
    const statusColor = getStatusBadgeColor(status);
    const statusLabel = getStatusLabel(status);

    return (
      <div className="event-content-container">
        <div className="event-main-content">
          <b>{eventInfo.event.title}</b>
          <div className="event-customers">
            {eventInfo.event.extendedProps.customerNames}
          </div>
          <Badge bg={statusColor} className="mt-1">
            {statusLabel}
          </Badge>
        </div>
        <div className="event-actions">
          <FaCog
            className="event-action-icon"
            onClick={(e) => {
              e.stopPropagation();
              const currentStatus = eventInfo.event.extendedProps.status;
              const currentStatusId = statusReverseMap[currentStatus];
              const nextStatusId = (currentStatusId + 1) % 5;
              updateAppointmentStatus(eventInfo.event.id, nextStatusId);
            }}
          />
          <FaEdit
            className="event-action-icon"
            onClick={(e) => {
              e.stopPropagation();
              handleUpdateAppointment(eventInfo.event.id);
            }}
          />
          <FaTrash
            className="event-action-icon"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteAppointment(eventInfo.event.id);
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid mt-4">
      <Row className="g-1">
        <Col lg={8}>
          <div className="calendar-container shadow-sm">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              events={events}
              selectable={true}
              select={handleDateSelect}
              height="80vh"
              locale="tr"
              buttonText={{
                today: "Bugün",
                month: "Ay",
                week: "Hafta",
                day: "Gün",
              }}
              eventDisplay="block"
              timeZone="Europe/Istanbul"
              slotMinTime="08:00:00"
              slotMaxTime="20:00:00"
              nowIndicator={true}
              eventContent={renderEventContent}
            />
          </div>
        </Col>

        <Col lg={4}>
          <div className="appointment-form p-4 shadow-sm">
            <h4 className="mb-4">
              <i className="far fa-calendar-plus me-2"></i>
              Yeni Randevu
            </h4>

            {selectedDate && (
              <div className="alert alert-info mb-4">
                <strong>Seçilen Tarih:</strong>{" "}
                {new Date(selectedDate).toLocaleDateString("tr-TR")}
              </div>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Müşteri ara..."
                  className="customer-search-input mb-3"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {loadingAppointments ? (
                  <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ height: "8vh" }}
                  >
                    <p>
                      Giriş yaptıktan sonra müşteri bilgilerini görebilirsiniz
                    </p>
                  </div>
                ) : (
                  <div className="customer-list">
                    {filteredCustomers.length === 0 ? (
                      <div className="p-3 text-center text-muted">
                        {searchTerm
                          ? "Sonuç bulunamadı"
                          : customers.length === 0
                          ? "Müşteri bulunamadı"
                          : "Tüm müşteriler seçili"}
                      </div>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <div
                          key={customer.id}
                          className="customer-list-item"
                          onClick={() => handleAddCustomer(customer.id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ")
                              handleAddCustomer(customer.id);
                          }}
                        >
                          <div>
                            {customer.name} {customer.surname}
                            {customer.phone && (
                              <div className="phone">{customer.phone}</div>
                            )}
                          </div>
                          <i className="fas fa-plus text-primary"></i>
                        </div>
                      ))
                    )}
                  </div>
                )}

                <div
                  className="mt-3 mb-3 p-2 border rounded"
                  style={{ minHeight: "50px" }}
                >
                  {formData.customerIds.length === 0 ? (
                    <small className="text-muted">
                      Müşteri seçmek için aşağıdan ekleyin
                    </small>
                  ) : (
                    formData.customerIds.map((id) => {
                      const customer = customers.find((c) => c.id === id);
                      return customer ? (
                        <CustomerTag
                          key={id}
                          customer={customer}
                          onRemove={handleRemoveCustomer}
                        />
                      ) : null;
                    })
                  )}
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Not</Form.Label>
                <Form.Control
                  type="text"
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  required
                  placeholder="Yapılacak aktivite hakkında"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Başlangıç Tarihi</Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Row className="mb-3">
                {formData.durationType === "hours" && (
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Başlangıç Saati</Form.Label>
                      <Form.Control
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                )}
                <Col md={formData.durationType === "hours" ? 6 : 12}>
                  <Form.Group>
                    <Form.Label>Süre Türü</Form.Label>
                    <Form.Select
                      name="durationType"
                      value={formData.durationType}
                      onChange={handleInputChange}
                    >
                      <option value="hours">Saatlik</option>
                      <option value="days">Günlük</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>
                  {formData.durationType === "hours"
                    ? "Süre (Saat)"
                    : "Süre (Gün)"}
                </Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max={formData.durationType === "hours" ? "12" : "30"}
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              {calculateEndDate() && (
                <div className="end-time-display">
                  <strong>Bitiş Zamanı:</strong>{" "}
                  {calculateEndDate().toLocaleString("tr-TR")}
                </div>
              )}

              <Button
                variant="primary"
                type="submit"
                className="w-100 py-2"
                disabled={
                  !formData.startDate ||
                  formData.customerIds.length === 0 ||
                  loadingAppointments
                }
              >
                {loadingAppointments ? "Lütfen Giriş Yapınız" : "Randevu Oluştur"}
              </Button>
            </Form>
          </div>
        </Col>
      </Row>

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
    </div>
  );
};

export default Calendar;
