import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiCall } from '../services/api';
import { toast } from 'react-toastify';

// Helper component to display data or a "Missing" badge
const InfoField = ({ label, value, format = (v) => v }) => {
    const isMissing = value === undefined || value === null || value === '';
    
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>
            <span style={{ color: '#64748b', fontWeight: 'bold' }}>{label}:</span>
            {isMissing ? (
                <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.75rem', background: '#fee2e2', padding: '2px 8px', borderRadius: '12px' }}>
                    Missing Data
                </span>
            ) : (
                <span style={{ color: '#1e293b', textAlign: 'right', maxWidth: '60%', wordWrap: 'break-word' }}>
                    {format(value)}
                </span>
            )}
        </div>
    );
};

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    
    // 🚨 REMOVED KYC States & Tab Logic
    const [pendingLawyers, setPendingLawyers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null); 

    const loadData = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (token) {
            // 🚨 REMOVED KYC API Call. Only fetching Lawyers now.
            const lawyerData = await apiCall('/api/admin/lawyers/pending', 'GET', null, token);
            if (lawyerData) setPendingLawyers(lawyerData);
        }
        setLoading(false);
    };

    useEffect(() => { 
        loadData(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAction = async (id, action, type) => {
        const token = localStorage.getItem('token');
        const endpoint = `/api/admin/${type}/${action}/${id}`;
        
        toast.info(`Processing ${action}...`);
        const res = await apiCall(endpoint, 'PUT', null, token);
        
        if (res) {
            toast.success(`User successfully ${action}d!`);
            loadData(); 
        } else {
            toast.error(`Failed to process request.`);
        }
    };

    if (loading) return <div style={{padding:'40px', textAlign:'center', fontSize:'1.2rem'}}>Loading Admin Panel...</div>;

    const styles = {
        cardGrid: { 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', 
            gap: '25px' 
        },
        userCard: { 
            border: '1px solid #e2e8f0', 
            borderRadius: '12px', 
            padding: '20px', 
            background: 'white',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column'
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }} className="fade-in">
            
            {/* HEADER */}
            <div style={{ marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
                <h1 style={{fontSize:'2.5rem', fontWeight:'bold', margin:0, color:'#dc2626'}}>🛡️ Admin Command Center</h1>
                <p style={{color:'#64748b', margin:'5px 0 0 0', fontSize:'1.1rem'}}>Manage Platform Verifications & Safety</p>
            </div>

            {/* MAIN DASHBOARD AREA (Tabs removed) */}
            <div className="glass-card" style={{ padding: '30px', borderRadius:'15px' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{margin:0, color:'#1e293b'}}>Pending Professional Approvals</h2>
                    <span style={{ background: '#e2e8f0', color: '#475569', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        {pendingLawyers.length} Lawyers
                    </span>
                </div>
                
                {pendingLawyers.length === 0 ? (
                    <div style={{textAlign:'center', padding:'40px', background:'#f8fafc', borderRadius:'10px', border:'1px dashed #cbd5e1'}}>
                        <p style={{fontSize:'1.2rem', color:'#64748b', margin:0}}>🎉 All caught up! No pending lawyer verifications.</p>
                    </div>
                ) : (
                    <div style={styles.cardGrid}>
                        {pendingLawyers.map(lawyer => (
                            <div key={lawyer._id} style={styles.userCard}>
                                <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', marginBottom: '15px' }}>
                                    <h3 style={{ margin: '0 0 5px 0', fontSize:'1.3rem', color: '#0f172a' }}>{lawyer.name}</h3>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>✉️ {lawyer.email}</p>
                                </div>
                                
                                {/* FULL LAWYER PROFILE INFO */}
                                <div style={{ flexGrow: 1, marginBottom: '20px' }}>
                                    <InfoField label="Phone" value={lawyer.phone} />
                                    <InfoField label="Address" value={lawyer.address} />
                                    <InfoField label="Specialization" value={lawyer.specialization} />
                                    <InfoField label="Experience" value={lawyer.experience} format={(v) => `${v} Years`} />
                                    <InfoField label="Consultation Fee" value={lawyer.consultationFee} format={(v) => `₹${v}`} />
                                </div>
                                
                                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '20px', border:'1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <span style={{ fontSize:'0.85rem', color:'#64748b', textTransform:'uppercase', fontWeight:'bold' }}>Bar Council No:</span>
                                        <span style={{ fontSize:'1rem', fontWeight:'bold', color: lawyer.barNumber ? '#2563eb' : '#ef4444' }}>
                                            {lawyer.barNumber || "Missing"}
                                        </span>
                                    </div>
                                    
                                    <button 
                                        onClick={() => setSelectedImage(lawyer.barCouncilImage)} 
                                        className="btn btn-secondary" 
                                        style={{ width: '100%', fontSize:'0.85rem' }}
                                        disabled={!lawyer.barCouncilImage}
                                    >
                                        👁️ View Bar Council ID
                                    </button>
                                </div>
                                
                                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                                    <button onClick={() => handleAction(lawyer._id, 'reject', 'lawyer')} className="btn" style={{ flex: 1, background: '#fee2e2', color: '#dc2626' }}>Reject</button>
                                    <button onClick={() => handleAction(lawyer._id, 'approve', 'lawyer')} className="btn btn-primary" style={{ flex: 1, background: '#16a34a', boxShadow: '0 4px 6px rgba(22, 163, 74, 0.2)' }}>Approve</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* FULL SIZE IMAGE MODAL */}
            {selectedImage && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding:'20px' }}>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '16px', maxWidth: '800px', width: '100%', position: 'relative', animation: 'slideUp 0.3s ease' }}>
                        
                        <button 
                            onClick={() => setSelectedImage(null)} 
                            style={{ position: 'absolute', top: '-45px', right: '0', background: 'none', border: 'none', color: 'white', fontSize: '2.5rem', cursor: 'pointer', transition: 'transform 0.2s' }}
                            onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                        >
                            &times;
                        </button>
                        
                        <h3 style={{marginTop:0, borderBottom:'2px solid #f1f5f9', paddingBottom:'15px', color:'#1e293b'}}>Document Review</h3>
                        
                        <div style={{ maxHeight: '75vh', overflowY: 'auto', textAlign:'center', background:'#f8fafc', padding:'10px', borderRadius:'8px' }}>
                            <img 
                                src={selectedImage} 
                                alt="Verification Proof" 
                                style={{ width: '100%', height: 'auto', borderRadius: '8px', objectFit: 'contain' }} 
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;