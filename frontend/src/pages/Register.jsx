import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Register = () => {
  const [formData, setFormData] = useState({ 
    name: "", 
    username: "", 
    email: "", 
    password: "",
    role: "citizen"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const styles = {
    container: { minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" },
    card: { background: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(12px)", padding: "40px", borderRadius: "20px", boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)", border: "1px solid rgba(255, 255, 255, 0.18)", width: "100%", maxWidth: "450px", animation: "slideUp 0.5s ease-out forwards" },
    title: { color: "#1e293b", fontSize: "2rem", fontWeight: "700", marginBottom: "10px", textAlign: "center" },
    subtitle: { color: "#64748b", textAlign: "center", marginBottom: "30px", fontSize: "0.95rem" },
    formGroup: { marginBottom: "15px" },
    label: { display: "block", marginBottom: "5px", color: "#334155", fontWeight: "500", fontSize: "0.9rem" },
    input: { width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "1rem", backgroundColor: "white", boxSizing: "border-box", outline: "none" },
    select: { width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "1rem", backgroundColor: "white", cursor: "pointer", boxSizing: "border-box" },
    button: { width: "100%", padding: "14px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "12px", fontSize: "1rem", fontWeight: "600", cursor: "pointer", marginTop: "10px", boxShadow: "0 4px 6px rgba(37, 99, 235, 0.2)" },
    footerLink: { textAlign: "center", marginTop: "20px", color: "#64748b", fontSize: "0.9rem" },
    link: { color: "#2563eb", textDecoration: "none", fontWeight: "600" }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss();

    // STRICT PASSWORD VALIDATION: Min 8 chars, 1 number, 1 special char
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      toast.error("Password must be at least 8 characters long, and include at least one number and one special character (!@#$%^&*).");
      return;
    }

    setIsSubmitting(true);
    try {
      await register(formData);
      setTimeout(() => navigate("/login"), 2000); 
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join our legal platform today</p>
        
        <form onSubmit={handleSubmit}>
          <div style={{display:'flex', gap:'10px'}}>
            <div style={{...styles.formGroup, flex: 1}}>
              <label style={styles.label}>Full Name</label>
              <input style={styles.input} type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
            </div>
            <div style={{...styles.formGroup, flex: 1}}>
              <label style={styles.label}>Username</label>
              <input style={styles.input} type="text" name="username" placeholder="johndoe88" value={formData.username} onChange={handleChange} required />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input style={styles.input} type="email" name="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} required />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
            <small style={{color:'#94a3b8', fontSize:'0.75rem', marginTop:'4px', display:'block'}}>Must be 8+ chars with a number & special character.</small>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>I am a:</label>
            <select style={styles.select} name="role" value={formData.role} onChange={handleChange}>
              <option value="citizen">Citizen (Seeking Help)</option>
              <option value="lawyer">Lawyer (Offering Help)</option>
            </select>
          </div>

          <button style={styles.button} type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p style={styles.footerLink}>
          Already have an account? <Link to="/login" style={styles.link}>Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;