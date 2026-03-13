import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { apiCall } from "../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss();
    setIsSubmitting(true);

    try {
      const res = await apiCall("/api/auth/forgot-password", "POST", { email });
      if (res) toast.success("Password reset link sent to your email!");
    } catch (err) {
      toast.error("Failed to send reset link.");
    }
    setIsSubmitting(false);
  };

  const styles = {
    container: { minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" },
    card: { background: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(12px)", padding: "40px", borderRadius: "20px", boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)", width: "100%", maxWidth: "400px", textAlign: "center" },
    title: { color: "#1e293b", fontSize: "1.8rem", fontWeight: "700", marginBottom: "10px" },
    input: { width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "1rem", boxSizing: "border-box", outline: "none", marginBottom: "20px" },
    button: { width: "100%", padding: "14px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "12px", fontSize: "1rem", fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 6px rgba(37, 99, 235, 0.2)" },
    link: { color: "#64748b", textDecoration: "none", fontSize: "0.9rem", display: "block", marginTop: "20px" }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Reset Password</h2>
        <p style={{ color: "#64748b", marginBottom: "30px", fontSize: "0.95rem" }}>
          Enter your email address and we will send you a link to reset your password.
        </p>
        
        <form onSubmit={handleSubmit}>
          <input 
            style={styles.input} type="email" placeholder="Enter your email" 
            value={email} onChange={(e) => setEmail(e.target.value)} required 
          />
          <button style={styles.button} type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending Link..." : "Send Reset Link"}
          </button>
        </form>
        <Link to="/login" style={styles.link}>← Back to Login</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;