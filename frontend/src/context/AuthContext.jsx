import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
// NEW: Import your dynamic URL so it stops using localhost in production!
// (Adjust the path '../services/api' if your api.js is in a different folder)
import { BASE_URL } from "../services/api"; 

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // FIXED: Now dynamically uses Render link in production and localhost during testing
  const api = axios.create({
    baseURL: `${BASE_URL}/api`,
  });

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await api.get("/users/me"); 
          setUser(res.data);
        } catch (error) {
          console.error("Session expired");
          localStorage.removeItem("token");
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkUserLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      toast.dismiss(); 
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      setUser(res.data); 
      toast.success("Login Successful!");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      toast.dismiss(); 
      const res = await api.post("/auth/register", userData);
      toast.success(res.data.message || "Registration successful!");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
      throw err;
    }
  };

  const verifyEmail = async (token) => {
    try {
      const res = await api.post("/auth/verify-email", { token });
      toast.success(res.data.message);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
      throw err;
    }
  };

  const logout = () => {
    toast.dismiss(); 
    localStorage.removeItem("token");
    setUser(null);
    toast.info("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, verifyEmail, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};