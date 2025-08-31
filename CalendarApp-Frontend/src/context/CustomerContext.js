// CustomerContext.js
import { createContext, useState, useContext, useEffect } from "react";
import axiosInstance from "../axiosConfig";

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomers = async () => {
    try {
      const res = await axiosInstance.get("/customer/GetAllCustomer");
      setCustomers(res.data);
      setLoading(false);
    } catch (err) {
      setError("Müşteriler yüklenirken hata oluştu");
      setLoading(false);
    }
  };

  const addCustomer = async (newCustomer) => {
    try {
      const res = await axiosInstance.post(
        "/customer/AddCustomer",
        newCustomer
      );
      setCustomers((prev) => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error("Müşteri eklenirken hata:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // CustomerContext.js
  const updateCustomer = async (customer) => {
    try {
      console.log("Updating customer:", customer); // Log ekledik
      const res = await axiosInstance.put(
        `/customer/update/${customer.id}`,
        customer
      );
      console.log("Update response:", res.data); // Log ekledik
      setCustomers((prev) =>
        prev.map((c) => (c.id === customer.id ? res.data : c))
      );
      return res.data;
    } catch (err) {
      console.error("Update error details:", {
        // Detaylı hata logu
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      throw err;
    }
  };

  const deleteCustomer = async (customerId) => {
    try {
      console.log("Deleting customer ID:", customerId); // Log ekledik
      await axiosInstance.delete(`/customer/delete/${customerId}`);
      console.log("Delete successful for ID:", customerId); // Log ekledik
      setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    } catch (err) {
      console.error("Delete error details:", {
        // Detaylı hata logu
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      throw err;
    }
  };
  return (
    <CustomerContext.Provider
      value={{
        customers,
        setCustomers,
        loading,
        error,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        fetchCustomers, // Yeniden yükleme için
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomers = () => useContext(CustomerContext);
