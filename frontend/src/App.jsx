import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { useContext } from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AskAI from "./pages/AskAI";
import BookLawyer from "./pages/BookLawyer";
import Navbar from "./components/Navbar";

// --- GLOBAL STYLES (The Design System) ---
const globalStyles = `
  /* Reset & Body */
  body {
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background-color: #f8fafc;
    /* Professional Gradient Background */
    background-image: 
      radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.15) 0px, transparent 50%), 
      radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.15) 0px, transparent 50%);
    background-attachment: fixed;
    color: #334155;
    -webkit-font-smoothing: antialiased;
  }

  /* Glass Card Effect */
  .glass-card {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transition: transform 0.2s ease;
  }

  /* Buttons */
  .btn {
    border: none;
    padding: 12px 24px;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 1rem;
  }
  
  .btn-primary {
    background: linear-gradient(135deg, #2563eb, #4f46e5);
    color: white;
    box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 8px rgba(37, 99, 235, 0.3); }

  .btn-secondary {
    background: white;
    color: #475569;
    border: 1px solid #e2e8f0;
  }
  .btn-secondary:hover { background: #f8fafc; border-color: #cbd5e1; }

  /* Inputs */
  .input-field {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.8);
    font-size: 1rem;
    outline: none;
    transition: border-color 0.2s;
    box-sizing: border-box; /* Important for padding */
  }
  .input-field:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }

  /* Animations */
  .fade-in { animation: fadeIn 0.5s ease-out forwards; }
  .slide-up { animation: slideUp 0.5s ease-out forwards; opacity: 0; animation-delay: 0.1s; }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
`;

// 🔒 Protected Route
const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// 🔓 Public Route
const PublicRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* INJECT GLOBAL CSS HERE */}
        <style>{globalStyles}</style>
        
        <Navbar />
        <ToastContainer position="top-right" autoClose={3000} />
        
        <Routes>
          <Route path="/" element={<Home />} />
          
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/ask-ai" element={<ProtectedRoute><AskAI /></ProtectedRoute>} />
          <Route path="/book-lawyer" element={<ProtectedRoute><BookLawyer /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;