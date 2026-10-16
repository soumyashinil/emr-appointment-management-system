import { createContext } from "react";
import api from "../services/api";
import { useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const response = await api.get("/auth/me");
        setUser(response.data.data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkLogin();
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    setUser(response.data.data.user);
  };

  const logout = async () => {
    try {
      const response = await api.post("/auth/logout");
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
    };

    window.addEventListener("auth:session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
