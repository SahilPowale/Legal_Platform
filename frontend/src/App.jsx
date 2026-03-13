import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { useContext } from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import AskAI from "./pages/AskAI";
import BookLawyer from "./pages/BookLawyer";
import AdminDashboard from "./pages/AdminDashboard"; 
import Navbar from "./components/Navbar";

// 🚨 NEW: Video Call Page Import
import VideoCall from "./pages/VideoCall";

// NEW RECOVERY PAGES
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

const globalStyles = `
  /* 🪄 REFINED RESPONSIVE OVERRIDE 🪄 */
  html, body {
    overflow-x: hidden; /* Kills the ugly horizontal scrollbar forever */
    width: 100%;
  }

  * {
    box-sizing: border-box !important; /* Stops padding from pushing things off-screen */
  }

  img, video, iframe, canvas {
    max-width: 100% !important; /* Forces media to shrink to fit */
    height: auto !important; /* Prevents images/videos from looking stretched or warped */
  }

  /* Automatically stack side-by-side flex items on small screens */
  @media (max-width: 768px) {
    .glass-card > div {
       flex-direction: column !important;
       align-items: flex-start !important;
    }
  }

  /* --- EXISTING PLATFORM STYLES --- */
  body {
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background-color: #f8fafc;
    background-image: 
      radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.15) 0px, transparent 50%), 
      radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.15) 0px, transparent 50%);
    background-attachment: fixed;
    color: #334155;
    -webkit-font-smoothing: antialiased;
  }
  .glass-card {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transition: transform 0.2s ease;
  }
  .btn {
    border: none;
    padding: 12px 24px;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 1rem;
    text-decoration: none;
    display: inline-block;
  }
  .btn-primary { background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2); }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 8px rgba(37, 99, 235, 0.3); }
  .btn-secondary { background: white; color: #475569; border: 1px solid #e2e8f0; }
  .btn-secondary:hover { background: #f8fafc; border-color: #cbd5e1; }
  .input-field {
    width: 100%; padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 10px;
    background: rgba(255, 255, 255, 0.8); font-size: 1rem; outline: none; transition: border-color 0.2s; box-sizing: border-box; 
  }
  .input-field:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
  .loader-container { display: flex; justify-content: center; align-items: center; height: 100vh; width: 100%; }
  .loader {
    border: 4px solid #f3f3f3; border-top: 4px solid #3b82f6; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite;
  }
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
`;

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="loader-container"><div className="loader"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="loader-container"><div className="loader"></div></div>;
  if (!user || user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="loader-container"><div className="loader"></div></div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <style>{globalStyles}</style>
        <Navbar />
        <ToastContainer position="top-center" autoClose={3000} limit={2} hideProgressBar={false} newestOnTop={true} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          
          {/* NEW RECOVERY ROUTES */}
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />
          
          <Route path="/verify/:token" element={<PublicRoute><VerifyEmail /></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/ask-ai" element={<ProtectedRoute><AskAI /></ProtectedRoute>} />
          <Route path="/book-lawyer" element={<ProtectedRoute><BookLawyer /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          
          {/* 🚨 ADDED: SECURE P2P VIDEO ROOM ROUTE 🚨 */}
          <Route path="/room/:roomId" element={<ProtectedRoute><VideoCall /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;