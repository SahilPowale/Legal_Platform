import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // <--- NEW: Starts as true

  useEffect(() => {
    // Check LocalStorage ONCE when the app starts
    const checkUser = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        
        if (storedUser && token) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Auth Error:", error);
        localStorage.clear();
      } finally {
        setLoading(false); // <--- Done checking, now we can render the app
      }
    };

    checkUser();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {/* Don't render ANYTHING until we know if user is logged in */}
      {!loading && children} 
    </AuthContext.Provider>
  );
};