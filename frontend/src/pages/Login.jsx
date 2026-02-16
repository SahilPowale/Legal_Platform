import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [selectedRole, setSelectedRole] = useState("citizen"); 

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        if (data.role !== selectedRole) {
          toast.error(`Please login as a ${data.role}`);
          return;
        }
        login(data, data.token);
        toast.success(`Welcome back!`);
        navigate("/dashboard");
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  // Internal Styles
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '80vh',
      padding: '20px'
    },
    card: {
      maxWidth: '400px',
      width: '100%',
      padding: '40px'
    },
    tabContainer: {
      display: 'flex',
      marginBottom: '30px',
      borderBottom: '2px solid #e2e8f0'
    },
    tab: (active, color) => ({
      flex: 1,
      textAlign: 'center',
      padding: '12px',
      cursor: 'pointer',
      fontWeight: 'bold',
      color: active ? color : '#94a3b8',
      borderBottom: active ? `3px solid ${color}` : 'none',
      marginBottom: '-2px',
      transition: 'all 0.3s'
    }),
    title: {
      textAlign: 'center',
      marginBottom: '30px',
      fontSize: '2rem',
      fontWeight: '800',
      color: '#1e293b'
    },
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' },
    link: { color: '#2563eb', textDecoration: 'none', fontWeight: 'bold', display: 'block', textAlign: 'center', marginTop: '20px' }
  };

  return (
    <div style={styles.container} className="fade-in">
      <div className="glass-card" style={styles.card}>
        
        {/* Role Tabs */}
        <div style={styles.tabContainer}>
          <div 
            onClick={() => setSelectedRole("citizen")}
            style={styles.tab(selectedRole === 'citizen', '#2563eb')}
          >
            Citizen
          </div>
          <div 
            onClick={() => setSelectedRole("lawyer")}
            style={styles.tab(selectedRole === 'lawyer', '#7c3aed')}
          >
            Lawyer
          </div>
        </div>

        <h2 style={styles.title}>Welcome Back</h2>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input type="email" name="email" onChange={handleChange} required className="input-field" placeholder="you@example.com" />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input type="password" name="password" onChange={handleChange} required className="input-field" placeholder="••••••••" />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            Login as {selectedRole === 'citizen' ? 'Citizen' : 'Lawyer'}
          </button>
        </form>
        
        <a href="/register" style={styles.link}>Create a new account</a>
      </div>
    </div>
  );
}

export default Login;