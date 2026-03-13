import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const styles = {
    nav: {
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%',
      height: '70px',
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0 20px',
      boxSizing: 'border-box'
    },
    container: {
      maxWidth: '1200px',
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    logoSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px' // Space between back button and logo
    },
    logoLink: {
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    logoText: {
      fontSize: '1.4rem',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      color: 'transparent'
    },
    menu: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px' 
    },
    divider: {
      height: '24px',
      width: '1px',
      backgroundColor: '#e2e8f0',
      margin: '0 5px'
    },
    userName: {
      color: '#334155', 
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '5px'
    }
  };

  return (
    <nav style={styles.nav}>
      <style>{`
        /* GLOBAL BACK BUTTON (Small & Dark) */
        .nav-btn-back {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-weight: 600;
          padding: 6px 12px;
          background-color: #1e293b;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.85rem;
          transition: background 0.2s ease, transform 0.1s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .nav-btn-back:hover {
          background-color: #334155;
          transform: translateY(-1px);
        }

        /* Standard Navigation Links (Visible Rectangles) */
        .nav-link {
          text-decoration: none;
          color: #475569;
          font-weight: 600;
          font-size: 0.95rem;
          padding: 8px 16px;
          border-radius: 8px;
          background-color: #f8fafc; 
          border: 1px solid #e2e8f0; 
          box-shadow: 0 1px 2px rgba(0,0,0,0.05); 
          transition: all 0.2s ease;
          display: inline-block;
        }
        .nav-link:hover {
          background-color: #e2e8f0;
          color: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .nav-link.active {
          color: #2563eb;
          background-color: #eff6ff;
          border-color: #bfdbfe;
          box-shadow: 0 1px 2px rgba(37, 99, 235, 0.1);
        }

        /* Admin Badge */
        .nav-admin-badge {
          background-color: #fee2e2;
          color: #dc2626;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: bold;
          text-decoration: none;
          border: 1px solid #fecaca;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .nav-admin-badge:hover {
          background-color: #fca5a5;
          transform: translateY(-1px);
        }

        /* Primary Button */
        .nav-btn-primary {
          padding: 8px 20px;
          background-color: #2563eb;
          color: white;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s ease;
          box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
          border: none;
          cursor: pointer;
          font-size: 0.95rem;
        }
        .nav-btn-primary:hover {
          background-color: #1d4ed8;
          transform: translateY(-1px);
        }

        /* Danger Button (Logout) */
        .nav-btn-danger {
          padding: 8px 16px;
          background-color: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }
        .nav-btn-danger:hover {
          background-color: #fee2e2;
          border-color: #fca5a5;
          transform: translateY(-1px);
        }
      `}</style>

      <div style={styles.container}>
        
        <div style={styles.logoSection}>
          {/* THE GLOBAL BACK BUTTON: Only renders if NOT on the Home page ('/') */}
          {location.pathname !== '/' && (
            <button onClick={() => navigate(-1)} className="nav-btn-back" title="Go Back">
               ← Back
            </button>
          )}

          {/* LOGO */}
          <Link to="/" style={styles.logoLink}>
            <span style={{ fontSize: '1.5rem' }}>⚖️</span>
            <span style={styles.logoText}>Legal Bridge</span>
          </Link>
        </div>

        {/* RIGHT SECTION: LINKS & BUTTONS */}
        <div style={styles.menu}>
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Home
          </Link>
          
          {user ? (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                Dashboard
              </Link>
              
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-admin-badge" title="Go to Admin Panel">
                  🛡️ Admin Panel
                </Link>
              )}
              
              <div style={styles.divider}></div>
              
              <span style={styles.userName}>
                 👤 {user.name}
              </span>
              
              <button onClick={handleLogout} className="nav-btn-danger">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`}>
                Login
              </Link>
              
              <Link to="/register" className="nav-btn-primary">
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