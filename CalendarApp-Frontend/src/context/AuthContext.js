import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Önce localStorage'dan kontrol et (rememberMe aktifse)
    const rememberedUser = localStorage.getItem("rememberedUser");
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    
    if (!rememberedUser) {
      // Session storage'dan kontrol et
      const sessionUser = sessionStorage.getItem("user");
      if (sessionUser && token) {
        try {
          setUser(JSON.parse(sessionUser));
        } catch (error) {
          console.error("Session user parse error:", error);
        }
      }
    } else if (token) {
      try {
        setUser(JSON.parse(rememberedUser));
      } catch (error) {
        console.error("Remembered user parse error:", error);
        localStorage.removeItem("rememberedUser");
      }
    }
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("token", token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("rememberedUser");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
     window.location.reload(); // Sayfayı yenile
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};