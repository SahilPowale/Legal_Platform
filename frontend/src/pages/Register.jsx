import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";

const Register = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'citizen',
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!formData.name || !formData.email || !formData.password) {
            toast.warning("Please fill in all fields");
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (res.ok) {
                login(data, data.token);
                toast.success("Registration Successful!");
                navigate('/dashboard');
            } else {
                toast.error(data.message || 'Registration failed');
            }
        } catch (err) {
            toast.error('Server connection failed');
        }
    };

    // Internal Styles
    const styles = {
        container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '20px' },
        card: { maxWidth: '400px', width: '100%', padding: '40px' },
        title: { textAlign: 'center', marginBottom: '25px', fontSize: '2rem', fontWeight: '800' },
        formGroup: { marginBottom: '15px' },
        label: { display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }
    };

    return (
        <div style={styles.container} className="fade-in">
            <div className="glass-card" style={styles.card}>
                <h2 style={styles.title}>Create Account</h2>
                
                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Full Name</label>
                        <input type="text" name="name" onChange={handleChange} className="input-field" required />
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Email</label>
                        <input type="email" name="email" onChange={handleChange} className="input-field" required />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Password</label>
                        <input type="password" name="password" onChange={handleChange} className="input-field" required />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>I am a:</label>
                        <select name="role" onChange={handleChange} className="input-field" style={{ height: '45px' }}>
                            <option value="citizen">Citizen</option>
                            <option value="lawyer">Lawyer</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                        Get Started
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;