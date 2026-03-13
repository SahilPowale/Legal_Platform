import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext"; 
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; 

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const styles = {
    container: { minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" },
    card: { background: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(12px)", padding: "40px", borderRadius: "20px", boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)", border: "1px solid rgba(255, 255, 255, 0.18)", width: "100%", maxWidth: "400px", animation: "slideUp 0.5s ease-out forwards" },
    title: { color: "#1e293b", fontSize: "2rem", fontWeight: "700", marginBottom: "10px", textAlign: "center" },
    subtitle: { color: "#64748b", textAlign: "center", marginBottom: "30px", fontSize: "0.95rem" },
    formGroup: { marginBottom: "20px" },
    label: { display: "block", marginBottom: "8px", color: "#334155", fontWeight: "500", fontSize: "0.9rem" },
    input: { width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "1rem", backgroundColor: "rgba(255, 255, 255, 0.9)", transition: "all 0.2s ease", boxSizing: "border-box", outline: "none" },
    button: { width: "100%", padding: "14px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "12px", fontSize: "1rem", fontWeight: "600", cursor: "pointer", marginTop: "10px", transition: "transform 0.1s ease", boxShadow: "0 4px 6px rgba(37, 99, 235, 0.2)" },
    footerLink: { textAlign: "center", marginTop: "20px", color: "#64748b", fontSize: "0.9rem" },
    link: { color: "#2563eb", textDecoration: "none", fontWeight: "600" },
    forgotLink: { color: "#2563eb", fontSize: "0.85rem", textDecoration: "none", fontWeight: "600", float: "right", marginTop: "-10px", marginBottom: "15px" }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss();
    setIsSubmitting(true);
    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        navigate("/dashboard");
      }
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>Sign in to access your dashboard</p>
        
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input style={styles.input} type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>

          <Link to="/forgot-password" style={styles.forgotLink}>Forgot Password?</Link>
          <div style={{clear: "both"}}></div>

          <button style={styles.button} type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing In..." : "Log In"}
          </button>
        </form>

        <p style={styles.footerLink}>
          Don't have an account? <Link to="/register" style={styles.link}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;