import React from "react";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import { AppointmentProvider } from "./context/AppointmentContext";
import { CustomerProvider } from "./context/CustomerContext";
function App() {
  return (
    <AuthProvider>
      <CustomerProvider>
        <AppointmentProvider>
          <Home />
        </AppointmentProvider>
      </CustomerProvider>
    </AuthProvider>
  );
}

export default App;
