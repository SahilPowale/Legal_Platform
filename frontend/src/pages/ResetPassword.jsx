import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { apiCall } from "../services/api";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss();

    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error("Password must be at least 8 characters long, and include at least one number and one special character.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiCall(`/api/auth/reset-password/${token}`, "PUT", { password });
      if (res) {
        toast.success("Password successfully reset! Please log in.");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      toast.error("Failed to reset password. Token may be invalid or expired.");
    }
    setIsSubmitting(false);
  };

  const styles = {
    container: { minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" },
    card: { background: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(12px)", padding: "40px", borderRadius: "20px", boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)", width: "100%", maxWidth: "400px", textAlign: "center" },
    input: { width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "1rem", boxSizing: "border-box", outline: "none", marginBottom: "10px" },
    button: { width: "100%", padding: "14px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "12px", fontSize: "1rem", fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 6px rgba(16, 185, 129, 0.2)", marginTop: "10px" }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ color: "#1e293b", marginBottom: "10px" }}>Create New Password</h2>
        <p style={{ color: "#64748b", marginBottom: "30px", fontSize: "0.95rem" }}>Enter your new secure password below.</p>
        
        <form onSubmit={handleSubmit}>
          <input 
            style={styles.input} type="password" placeholder="New Password" 
            value={password} onChange={(e) => setPassword(e.target.value)} required 
          />
          <small style={{color:'#94a3b8', fontSize:'0.75rem', display:'block', marginBottom:'20px', textAlign:'left'}}>
            Must be 8+ chars with a number & special character.
          </small>
          <button style={styles.button} type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;