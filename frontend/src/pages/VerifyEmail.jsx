import { useEffect, useContext, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const VerifyEmail = () => {
  const { token } = useParams();
  const { verifyEmail } = useContext(AuthContext);
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("We are verifying your email...");

  const styles = {
    container: {
      minHeight: "70vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    },
    card: {
      background: "white",
      padding: "40px",
      borderRadius: "20px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      textAlign: "center",
      maxWidth: "500px",
      width: "100%",
    },
    icon: {
      fontSize: "4rem",
      marginBottom: "20px",
    },
    title: {
      fontSize: "1.8rem",
      marginBottom: "10px",
      color: "#1e293b",
    },
    text: {
      color: "#64748b",
      marginBottom: "30px",
      fontSize: "1.1rem",
      lineHeight: "1.6",
    },
    button: {
      display: "inline-block",
      padding: "12px 24px",
      backgroundColor: "#2563eb",
      color: "white",
      textDecoration: "none",
      borderRadius: "10px",
      fontWeight: "600",
      transition: "background 0.2s",
    }
  };

  useEffect(() => {
    const verify = async () => {
      try {
        await verifyEmail(token);
        setStatus("success");
        setMessage("Your email has been successfully verified! You can now log in to your account.");
      } catch (err) {
        setStatus("error");
        setMessage("The verification link is invalid or has expired.");
      }
    };
    
    // Slight delay for better UX
    const timer = setTimeout(() => {
        verify();
    }, 1500);

    return () => clearTimeout(timer);
  }, [token, verifyEmail]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>
          {status === "verifying" && "🔄"}
          {status === "success" && "✅"}
          {status === "error" && "❌"}
        </div>
        
        <h2 style={styles.title}>
          {status === "verifying" && "Verifying..."}
          {status === "success" && "Email Verified!"}
          {status === "error" && "Verification Failed"}
        </h2>
        
        <p style={styles.text}>{message}</p>
        
        {status !== "verifying" && (
          <Link to="/login" style={styles.button}>
            Go to Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;