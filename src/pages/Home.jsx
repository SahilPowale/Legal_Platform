import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
    const { user } = useContext(AuthContext);

    // Internal Styles
    const styles = {
        container: { minHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' },
        heroTitle: { fontSize: '3.5rem', fontWeight: '900', marginBottom: '20px', lineHeight: '1.2' },
        subText: { fontSize: '1.25rem', color: '#64748b', maxWidth: '600px', marginBottom: '40px' },
        buttonGroup: { display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' },
        featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', maxWidth: '1000px', width: '100%', marginTop: '60px' },
        featureCard: { padding: '30px', textAlign: 'left' },
        icon: { fontSize: '2.5rem', marginBottom: '15px', display: 'block' }
    };

    // 1. LAWYER VIEW
    if (user && user.role === 'lawyer') {
        return (
            <div style={styles.container} className="fade-in">
                <div className="slide-up">
                    <span style={{ backgroundColor: '#f3e8ff', color: '#7c3aed', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>Professional Workspace</span>
                    <h1 style={{ ...styles.heroTitle, marginTop: '20px' }}>Welcome, Adv. {user.name}</h1>
                    <p style={styles.subText}>Your digital office is ready. Manage clients and access AI research tools.</p>
                    <div style={styles.buttonGroup}>
                        <Link to="/dashboard" className="btn btn-primary" style={{ textDecoration: 'none' }}>Go to Dashboard</Link>
                    </div>
                </div>
            </div>
        );
    }

    // 2. CITIZEN VIEW
    if (user && user.role === 'citizen') {
        return (
            <div style={styles.container} className="fade-in">
                <div className="slide-up">
                    <h1 style={{ ...styles.heroTitle, color: '#1e293b' }}>Legal Help, <span style={{ color: '#2563eb' }}>Simplified.</span></h1>
                    <p style={styles.subText}>Don't navigate the legal system alone. Get instant AI answers or book a consultation.</p>
                    <div style={styles.buttonGroup}>
                        <Link to="/ask-ai" className="btn btn-primary" style={{ textDecoration: 'none', background: '#2563eb' }}>Ask AI Lawyer</Link>
                        <Link to="/book-lawyer" className="btn btn-secondary" style={{ textDecoration: 'none' }}>Find an Expert</Link>
                    </div>
                </div>
            </div>
        );
    }

    // 3. GUEST VIEW
    return (
        <div style={styles.container} className="fade-in">
            <div className="slide-up">
                <h1 style={styles.heroTitle}>Justice Made <br /><span style={{ color: '#2563eb' }}>Digital & Accessible</span></h1>
                <p style={styles.subText}>Bridging the gap between citizens and legal professionals with secure, AI-powered technology.</p>
                
                <div style={styles.buttonGroup}>
                    <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none' }}>Login</Link>
                    <Link to="/register" className="btn btn-secondary" style={{ textDecoration: 'none' }}>Join as Lawyer</Link>
                </div>

                <div style={styles.featureGrid}>
                    <div className="glass-card" style={styles.featureCard}>
                        <span style={styles.icon}>🤖</span>
                        <h3>AI Guidance</h3>
                        <p style={{ color: '#64748b', marginTop: '10px' }}>Instant answers to common legal questions 24/7.</p>
                    </div>
                    <div className="glass-card" style={styles.featureCard}>
                        <span style={styles.icon}>⚖️</span>
                        <h3>Find Lawyers</h3>
                        <p style={{ color: '#64748b', marginTop: '10px' }}>Book verified experts for consultations.</p>
                    </div>
                    <div className="glass-card" style={styles.featureCard}>
                        <span style={styles.icon}>🔒</span>
                        <h3>Secure Data</h3>
                        <p style={{ color: '#64748b', marginTop: '10px' }}>Your case details are private and encrypted.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;