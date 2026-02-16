import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  // --- INTERNAL STYLES ---
  const styles = {
    nav: {
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%',
      height: '70px',
      backgroundColor: 'rgba(255, 255, 255, 0.8)', // Glass effect base
      backdropFilter: 'blur(12px)',                // The Blur
      borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0 20px'
    },
    container: {
      maxWidth: '1200px',
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    logoLink: {
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    logoText: {
      fontSize: '1.5rem',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #2563eb, #4f46e5)', // Gradient Text
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    menu: {
      display: 'flex',
      alignItems: 'center',
      gap: '25px'
    },
    link: (active) => ({
      textDecoration: 'none',
      color: active ? '#2563eb' : '#64748b',
      fontWeight: active ? '700' : '500',
      fontSize: '0.95rem',
      transition: 'color 0.2s ease'
    }),
    btnRegister: {
      padding: '10px 20px',
      backgroundColor: '#2563eb',
      color: 'white',
      borderRadius: '8px',
      textDecoration: 'none',
      fontWeight: '600',
      boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)',
      transition: 'transform 0.1s'
    },
    btnLogout: {
      padding: '8px 16px',
      backgroundColor: '#fee2e2',
      color: '#dc2626',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer'
    },
    divider: {
      height: '24px',
      width: '1px',
      backgroundColor: '#e2e8f0'
    }
  };

  // Helper to check active route
  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        
        {/* LOGO */}
        <Link to="/" style={styles.logoLink}>
          <span style={{ fontSize: '1.5rem' }}>⚖️</span>
          <span style={styles.logoText}>Digital Legal Platform</span>
        </Link>

        {/* LINKS & BUTTONS */}
        <div style={styles.menu}>
          <Link to="/" style={styles.link(isActive('/'))}>
            Home
          </Link>
          
          {user ? (
            <>
              <Link to="/dashboard" style={styles.link(isActive('/dashboard'))}>
                Dashboard
              </Link>
              
              <div style={styles.divider}></div>
              
              <span style={{ color: '#334155', fontWeight: 'bold' }}>{user.name}</span>
              
              <button onClick={logout} style={styles.btnLogout} className="btn-hover">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.link(isActive('/login'))}>
                Login
              </Link>
              <Link to="/register" style={styles.btnRegister} className="btn-hover">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;