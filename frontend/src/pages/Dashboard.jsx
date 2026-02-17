import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { apiCall, BASE_URL } from '../services/api'; 

// --- HELPER: Start Video Call ---
const startVideoCall = (id) => {
    const meetingUrl = `https://meet.jit.si/LegalConnect_${id}`;
    window.open(meetingUrl, '_blank');
};

// ==========================================
// 1. CITIZEN DASHBOARD COMPONENT
// ==========================================
const CitizenDashboard = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Rating Modal State
    const [reviewModal, setReviewModal] = useState(null); 
    const [reviewData, setReviewData] = useState({ rating: 5, review: '' });

    // --- FETCH DATA ---
    const loadData = async () => {
        const token = localStorage.getItem('token');
        if(token) {
            const data = await apiCall('/api/appointments', 'GET', null, token);
            if (data) setAppointments(data);
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    // --- FILE UPLOAD (Secure) ---
    const handleFileUpload = async (e, appointmentId) => {
        const file = e.target.files[0];
        if (!file) return;

        // validation: Max 10MB
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File is too large (Max 10MB).");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('token');
        toast.info("Uploading document... please wait.");
        
        const res = await apiCall(`/api/appointments/${appointmentId}/upload`, 'POST', formData, token, true);
        
        if (res) {
            toast.success("Document Uploaded Successfully!");
            loadData(); // Refresh to show new file
        } else {
            toast.error("Upload Failed. Please try again.");
        }
    };

    // --- REFUND LOGIC ---
    const requestRefund = async (id, dateStr) => {
        // Calculate difference in days
        const diffDays = Math.ceil(Math.abs(new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24)); 
        
        if (diffDays > 7) { 
            toast.error("Refund period (7 days) has expired."); 
            return; 
        }
        
        if(!window.confirm("Are you sure you want to request a refund? The lawyer will be notified.")) return;

        const token = localStorage.getItem('token');
        const res = await apiCall(`/api/appointments/${id}`, 'PUT', { status: 'refund_requested' }, token);
        
        if (res) {
            toast.info("Refund Request Sent.");
            loadData();
        }
    };

    // --- SUBMIT REVIEW ---
    const submitReview = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        
        const res = await apiCall(`/api/appointments/${reviewModal}/review`, 'POST', {
            rating: Number(reviewData.rating), 
            review: reviewData.review
        }, token);
        
        if (res) {
            toast.success("Review Submitted! Thank you.");
            setReviewModal(null);
            loadData();
        }
    };

    // Filter Cases
    const activeCases = appointments.filter(a => ['pending', 'accepted', 'refund_requested'].includes(a.status));
    const pastCases = appointments.filter(a => ['completed', 'cancelled', 'rejected'].includes(a.status));

    if (loading) return <div style={{padding:'20px'}}>Loading your cases...</div>;

    return (
        <div className="slide-up">
            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div className="glass-card" style={{ padding:'30px', background:'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color:'white', cursor:'pointer', borderRadius:'15px' }} onClick={() => navigate('/ask-ai')}>
                    <h2 style={{margin:0}}>🤖 Ask AI Lawyer</h2>
                    <p style={{margin:'5px 0 0 0', opacity:0.9}}>Instant legal guidance & draft analysis.</p>
                </div>
                <div className="glass-card" style={{ padding:'30px', background:'linear-gradient(135deg, #10b981 0%, #059669 100%)', color:'white', cursor:'pointer', borderRadius:'15px' }} onClick={() => navigate('/book-lawyer')}>
                    <h2 style={{margin:0}}>⚖️ Find a Lawyer</h2>
                    <p style={{margin:'5px 0 0 0', opacity:0.9}}>Browse experts and book consultations.</p>
                </div>
            </div>

            {/* --- SECTION: ACTIVE CASES --- */}
            <div className="glass-card" style={{ padding: '25px', marginBottom: '30px', borderRadius:'15px' }}>
                <h3 style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px' }}>📅 Active Cases</h3>
                
                {activeCases.length === 0 && <p style={{color:'#94a3b8', fontStyle:'italic'}}>No active cases currently.</p>}
                
                {activeCases.map(app => (
                    <div key={app._id} style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '20px', background: app.status === 'refund_requested' ? '#fff7ed' : '#fff' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'15px' }}>
                            <div>
                                <h4 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color:'#1e293b' }}>Adv. {app.lawyerId?.name}</h4>
                                <p style={{ margin: '0', fontSize: '0.9rem', color: '#64748b' }}>
                                    <strong>Date:</strong> {new Date(app.date).toLocaleDateString()} | <strong>Time:</strong> {app.slot}
                                </p>
                                <div style={{marginTop:'8px'}}>
                                    <span style={{ 
                                        padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase',
                                        background: app.status === 'accepted' ? '#dcfce7' : '#fef3c7',
                                        color: app.status === 'accepted' ? '#166534' : '#b45309'
                                    }}>
                                        {app.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {app.status === 'accepted' && (
                                    <>
                                        <button onClick={() => startVideoCall(app._id)} className="btn btn-primary" style={{ fontSize: '0.85rem', padding:'8px 15px' }}>📹 Join Video Call</button>
                                        <button onClick={() => requestRefund(app._id, app.createdAt)} className="btn btn-secondary" style={{ fontSize: '0.85rem', color: '#ef4444', borderColor: '#ef4444' }}>Request Refund</button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* DOCUMENT SECTION */}
                        <div style={{ marginTop: '20px', background: '#f8fafc', padding: '15px', borderRadius: '8px', border:'1px solid #f1f5f9' }}>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
                                <p style={{fontSize:'0.85rem', fontWeight:'bold', margin:0, color:'#475569'}}>📂 Case Documents</p>
                                {app.status === 'accepted' && (
                                    <label className="btn btn-secondary" style={{fontSize:'0.75rem', cursor:'pointer', padding:'5px 10px'}}>
                                        📎 Upload New File
                                        <input type="file" style={{display:'none'}} onChange={(e) => handleFileUpload(e, app._id)} />
                                    </label>
                                )}
                            </div>
                            
                            {/* Document List */}
                            {app.documents && app.documents.length > 0 ? (
                                <div style={{display:'flex', flexWrap:'wrap', gap:'10px'}}>
                                    {app.documents.map((doc, idx) => (
                                        <a key={idx} href={`${BASE_URL}/${doc.filePath}`} target="_blank" rel="noreferrer" 
                                           style={{fontSize:'0.8rem', padding:'8px 12px', background:'white', border:'1px solid #cbd5e1', borderRadius:'6px', textDecoration:'none', color:'#2563eb', display:'flex', alignItems:'center', gap:'8px', transition:'0.2s'}}>
                                            📄 {doc.fileName}
                                        </a>
                                    ))}
                                </div>
                            ) : <p style={{fontSize:'0.8rem', color:'#94a3b8', margin:0}}>No documents uploaded yet.</p>}
                        </div>
                    </div>
                ))}
            </div>

            {/* --- SECTION: PAST CASES (HISTORY) --- */}
            <div className="glass-card" style={{ padding: '25px', borderRadius:'15px' }}>
                <h3 style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px' }}>📂 Case History</h3>
                
                {pastCases.length === 0 && <p style={{color:'#94a3b8'}}>No history available.</p>}
                
                {pastCases.map(app => (
                    <div key={app._id} style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div>
                            <strong>Adv. {app.lawyerId?.name}</strong> 
                            <span style={{ marginLeft: '10px', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: '#f1f5f9', color: '#475569', fontWeight: 'bold' }}>
                                {app.status.toUpperCase()}
                            </span>
                            <div style={{fontSize:'0.8rem', color:'#64748b', marginTop:'4px'}}>
                                {new Date(app.date).toLocaleDateString()}
                            </div>
                            {/* Show Remarks if Closed */}
                            {app.remarks && (
                                <div style={{fontSize:'0.8rem', color:'#dc2626', marginTop:'5px', fontStyle:'italic'}}>
                                    Reason: "{app.remarks}"
                                </div>
                            )}
                        </div>
                        
                        {app.status === 'completed' && !app.rating && (
                            <button onClick={() => setReviewModal(app._id)} className="btn btn-secondary" style={{ fontSize:'0.75rem', color: '#eab308', borderColor:'#eab308' }}>★ Rate Service</button>
                        )}
                        {app.rating > 0 && <span style={{color:'#eab308', fontSize:'0.9rem', fontWeight:'bold'}}>{app.rating} ★</span>}
                    </div>
                ))}
            </div>
            
            {/* REVIEW MODAL */}
            {reviewModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="glass-card" style={{ padding: '30px', width: '350px', background: 'white', borderRadius:'15px' }}>
                        <h3 style={{marginTop:0}}>Rate Your Experience</h3>
                        <p style={{fontSize:'0.9rem', color:'#64748b'}}>How was your consultation?</p>
                        
                        <form onSubmit={submitReview}>
                            <label style={{fontWeight:'bold', fontSize:'0.85rem'}}>Rating</label>
                            <select className="input-field" value={reviewData.rating} onChange={e => setReviewData({...reviewData, rating: e.target.value})} style={{marginBottom:'15px'}}>
                                <option value="5">5 - Excellent</option>
                                <option value="4">4 - Good</option>
                                <option value="3">3 - Average</option>
                                <option value="2">2 - Poor</option>
                                <option value="1">1 - Bad</option>
                            </select>
                            
                            <label style={{fontWeight:'bold', fontSize:'0.85rem'}}>Review (Optional)</label>
                            <textarea className="input-field" rows="3" placeholder="Write a review..." value={reviewData.review} onChange={e => setReviewData({...reviewData, review: e.target.value})}></textarea>
                            
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button type="button" onClick={() => setReviewModal(null)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Submit Review</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// ==========================================
// 2. LAWYER DASHBOARD COMPONENT
// ==========================================
const LawyerDashboard = ({ rating }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Close Case Modal
    const [closeModal, setCloseModal] = useState(null); 
    const [closeData, setCloseData] = useState({ status: 'completed', remarks: '' });

    const loadData = async () => {
        const token = localStorage.getItem('token');
        if(token) {
            const data = await apiCall('/api/appointments', 'GET', null, token);
            if (data) setAppointments(data);
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    // --- STATUS UPDATES ---
    const handleStatus = async (id, status) => {
        const token = localStorage.getItem('token');
        const res = await apiCall(`/api/appointments/${id}`, 'PUT', { status }, token);
        if(res) {
            toast.success(`Case Updated: ${status}`);
            loadData();
        } else {
            toast.error("Failed to update status.");
        }
    };

    // --- CLOSE CASE ---
    const submitCloseCase = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        
        const res = await apiCall(`/api/appointments/${closeModal}`, 'PUT', closeData, token);
        if(res) {
            setCloseModal(null);
            toast.success("Case Closed Successfully");
            loadData();
        } else {
            toast.error("Failed to close case");
        }
    };

    const pending = appointments.filter(a => a.status === 'pending');
    const refunds = appointments.filter(a => a.status === 'refund_requested');
    const active = appointments.filter(a => a.status === 'accepted');
    const history = appointments.filter(a => ['completed', 'cancelled', 'rejected'].includes(a.status));

    if (loading) return <div style={{padding:'20px'}}>Loading dashboard...</div>;

    return (
        <div className="slide-up">
            {/* STATS ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
                <div className="glass-card" style={{ padding: '25px', borderLeft: '5px solid #3b82f6', borderRadius:'12px' }}>
                    <p style={{margin:0, fontSize:'0.85rem', fontWeight:'bold', color:'#64748b', textTransform:'uppercase'}}>Pending Requests</p>
                    <h2 style={{margin:'5px 0 0 0', fontSize:'2.5rem', color:'#1e293b'}}>{pending.length}</h2>
                </div>
                <div className="glass-card" style={{ padding: '25px', borderLeft: '5px solid #10b981', borderRadius:'12px' }}>
                    <p style={{margin:0, fontSize:'0.85rem', fontWeight:'bold', color:'#64748b', textTransform:'uppercase'}}>Active Cases</p>
                    <h2 style={{margin:'5px 0 0 0', fontSize:'2.5rem', color:'#1e293b'}}>{active.length}</h2>
                </div>
                <div className="glass-card" style={{ padding: '25px', borderLeft: '5px solid #f59e0b', borderRadius:'12px' }}>
                    <p style={{margin:0, fontSize:'0.85rem', fontWeight:'bold', color:'#64748b', textTransform:'uppercase'}}>Client Rating</p>
                    <h2 style={{margin:'5px 0 0 0', fontSize:'2.5rem', color:'#1e293b'}}>{rating || 0}★</h2>
                </div>
            </div>

            {/* REFUND REQUESTS */}
            {refunds.length > 0 && (
                <div className="glass-card" style={{ padding: '20px', marginBottom: '30px', background: '#fff7ed', border: '1px solid #fdba74', borderRadius:'15px' }}>
                    <h3 style={{ color: '#c2410c', margin: '0 0 15px 0' }}>⚠️ Action Required: Refund Requests</h3>
                    {refunds.map(r => (
                        <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background:'white', padding:'15px', borderRadius:'10px', marginBottom:'10px', border:'1px solid #fed7aa' }}>
                            <div>
                                <strong style={{color:'#9a3412'}}>{r.citizenId?.name}</strong> <span style={{color:'#666'}}>requested a refund.</span>
                                <br/><small style={{color:'#666'}}>Booking Date: {new Date(r.date).toLocaleDateString()}</small>
                            </div>
                            <div style={{display:'flex', gap:'10px'}}>
                                <button onClick={() => handleStatus(r._id, 'cancelled')} className="btn btn-secondary" style={{color:'#c2410c'}}>Approve Refund</button>
                                <button onClick={() => handleStatus(r._id, 'accepted')} className="btn btn-primary">Reject (Continue Case)</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ACTIVE CASES */}
            <div className="glass-card" style={{ padding: '25px', background: '#f0fdf4', marginBottom: '30px', borderRadius:'15px' }}>
                <h3 style={{color:'#166534', borderBottom:'2px solid #bbf7d0', paddingBottom:'15px', marginBottom:'20px'}}>⚖️ Active Cases</h3>
                
                {active.length === 0 && <p style={{color:'#666', fontStyle:'italic'}}>No active cases.</p>}
                
                {active.map(c => (
                    <div key={c._id} style={{ padding: '20px', borderBottom: '1px solid #bbf7d0', background:'white', margin:'10px 0', borderRadius:'12px' }}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                            <div>
                                <h4 style={{margin:0, fontSize:'1.1rem'}}>{c.citizenId?.name}</h4>
                                <p style={{margin:'5px 0', color:'#64748b', fontSize:'0.9rem'}}>{c.description}</p>
                            </div>
                            <div style={{display:'flex', gap:'10px'}}>
                                <button onClick={() => startVideoCall(c._id)} className="btn btn-primary" style={{fontSize:'0.85rem'}}>📹 Video Call</button>
                                <button onClick={() => setCloseModal(c._id)} className="btn btn-secondary" style={{fontSize:'0.85rem', background:'#334155', color:'white', border:'none'}}>🏁 End Case</button>
                            </div>
                        </div>
                        
                        {/* Documents Display */}
                        <div style={{marginTop:'15px', background:'#f8fafc', padding:'15px', borderRadius:'8px', border:'1px solid #e2e8f0'}}>
                            <p style={{fontSize:'0.8rem', fontWeight:'bold', margin:'0 0 10px 0', color:'#475569'}}>📂 Client Documents:</p>
                            {c.documents && c.documents.length > 0 ? (
                                <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
                                    {c.documents.map((doc, idx) => (
                                        <a key={idx} href={`${BASE_URL}/${doc.filePath}`} target="_blank" rel="noreferrer" 
                                           style={{fontSize:'0.8rem', padding:'6px 10px', background:'#e2e8f0', borderRadius:'5px', textDecoration:'none', color:'#334155'}}>
                                            📄 {doc.fileName}
                                        </a>
                                    ))}
                                </div>
                            ) : <p style={{fontSize:'0.8rem', color:'#94a3b8', margin:0}}>No documents uploaded.</p>}
                        </div>
                    </div>
                ))}
            </div>

            {/* NEW BOOKINGS */}
            <div className="glass-card" style={{ padding: '25px', borderRadius:'15px' }}>
                <h3>📥 New Bookings</h3>
                {pending.length === 0 && <p style={{color:'#94a3b8'}}>No pending bookings.</p>}
                
                {pending.map(req => (
                    <div key={req._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid #f1f5f9', alignItems:'center' }}>
                        <div>
                            <strong>{req.citizenId?.name}</strong>
                            <div style={{fontSize:'0.9rem', color:'#334155', marginTop:'5px'}}>{req.description}</div>
                            <small style={{color:'#64748b', marginTop:'5px', display:'block'}}>
                                Requested Slot: {new Date(req.date).toLocaleDateString()} @ {req.slot}
                            </small>
                        </div>
                        <div style={{display:'flex', gap:'10px'}}>
                            <button onClick={() => handleStatus(req._id, 'rejected')} className="btn btn-secondary" style={{ color: 'red', borderColor:'red' }}>Reject</button>
                            <button onClick={() => handleStatus(req._id, 'accepted')} className="btn btn-primary">Accept</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* CLOSE CASE MODAL */}
            {closeModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="glass-card" style={{ padding: '30px', width: '400px', background: 'white', borderRadius:'15px' }}>
                        <h3 style={{marginTop:0}}>Close Case</h3>
                        <p style={{fontSize:'0.9rem', color:'#666'}}>Finalize the status of this appointment.</p>
                        
                        <form onSubmit={submitCloseCase}>
                            <label style={{fontWeight:'bold', fontSize:'0.85rem'}}>Final Status</label>
                            <select className="input-field" value={closeData.status} onChange={e => setCloseData({...closeData, status: e.target.value})} style={{marginBottom:'15px'}}>
                                <option value="completed">Completed (Successful)</option>
                                <option value="cancelled">Cancelled (Incomplete)</option>
                            </select>
                            
                            <label style={{fontWeight:'bold', fontSize:'0.85rem'}}>Reason / Remarks (Visible to Client)</label>
                            <textarea className="input-field" rows="3" placeholder="e.g. Consultation successful, advice given." value={closeData.remarks} onChange={e => setCloseData({...closeData, remarks: e.target.value})} required></textarea>
                            
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button type="button" onClick={() => setCloseModal(null)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Confirm Close</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// ==========================================
// 3. MAIN DASHBOARD SHELL (PROFILE & LAYOUT)
// ==========================================
const Dashboard = () => {
    const { user, logout, login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    
    // Profile State
    const [formData, setFormData] = useState({
        phone: '', address: '', specialization: '', 
        barNumber: '', experience: 0, paymentQrCode: '', consultationFee: 500
    });

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if(token) {
                const data = await apiCall('/api/users/me', 'GET', null, token);
                if (data) {
                    login(data, token); // Update context with fresh data
                    setFormData({
                        phone: data.phone || '', 
                        address: data.address || '',
                        specialization: data.specialization || '', 
                        barNumber: data.barNumber || '',
                        experience: data.experience || 0,
                        paymentQrCode: data.paymentQrCode || '', 
                        consultationFee: data.consultationFee !== undefined ? data.consultationFee : 500
                    });
                }
            }
        };
        fetchProfile();
    }, [navigate]); 

    // --- IMAGE COMPRESSION (Critical for QR Uploads) ---
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    // Create Canvas for Resizing
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 500; // Resize to 500px width max
                    const scaleSize = MAX_WIDTH / img.width;
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scaleSize;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    
                    // Compress to JPEG with 0.7 quality to keep size low
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    setFormData(prev => ({ ...prev, paymentQrCode: compressedDataUrl }));
                };
            };
            reader.readAsDataURL(file);
        }
    };

    // --- SAVE PROFILE ---
    const handleUpdate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const data = await apiCall('/api/users/profile', 'PUT', formData, token);
        
        if (data) { 
            login(data, token); 
            setIsEditing(false); 
            toast.success("Profile Updated Successfully!"); 
        } else {
            toast.error("Failed to save profile.");
        }
    };

    if (!user) return <div style={{textAlign:'center', marginTop:'50px', fontSize:'1.2rem', color:'#666'}}>Loading...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }} className="fade-in">
            {/* --- HEADER --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{fontSize:'2rem', fontWeight:'bold', margin:0, color:'#1e293b'}}>Dashboard</h1>
                    <p style={{color:'#64748b', margin:0}}>Welcome back, {user.name}</p>
                </div>
                {/* <button onClick={logout} className="btn btn-secondary" style={{ color: '#ef4444', borderColor: '#ef4444' }}>Logout</button> */}
            </div>
            
            {/* --- LAYOUT GRID --- */}
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 3fr', gap: '30px' }}>
                
                {/* --- LEFT: PROFILE SIDEBAR --- */}
                <div className="glass-card" style={{ height: 'fit-content', padding: '30px', borderRadius:'15px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom: '20px', alignItems:'center' }}>
                        <h3 style={{margin:0, fontSize:'1.2rem'}}>My Profile</h3>
                        <button onClick={() => setIsEditing(!isEditing)} style={{ background:'none', border:'none', color:'#2563eb', fontWeight:'bold', cursor:'pointer', fontSize:'0.9rem' }}>
                            {isEditing ? 'Cancel' : 'Edit'}
                        </button>
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleUpdate} style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                            <label style={{fontSize:'0.75rem', fontWeight:'bold', color:'#64748b'}}>Phone Number</label>
                            <input className="input-field" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Phone" />
                            
                            <label style={{fontSize:'0.75rem', fontWeight:'bold', color:'#64748b'}}>City / Location</label>
                            <input className="input-field" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="City" />
                            
                            {user.role === 'lawyer' && (
                                <div style={{background:'#f8fafc', padding:'10px', borderRadius:'8px', marginTop:'10px'}}>
                                    <p style={{fontSize:'0.8rem', fontWeight:'bold', margin:'0 0 10px 0', color:'#2563eb'}}>Lawyer Settings</p>
                                    
                                    <label style={{fontSize:'0.75rem', fontWeight:'bold'}}>Specialization</label>
                                    <input className="input-field" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} style={{marginBottom:'10px'}} />
                                    
                                    <label style={{fontSize:'0.75rem', fontWeight:'bold'}}>Consultation Fee (₹)</label>
                                    <input className="input-field" type="number" value={formData.consultationFee} onChange={e => setFormData({...formData, consultationFee: e.target.value})} style={{marginBottom:'10px'}} />
                                    
                                    <label style={{fontSize:'0.75rem', fontWeight:'bold'}}>Upload Payment QR</label>
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="input-field" style={{padding:'5px'}} />
                                    
                                    {formData.paymentQrCode && (
                                        <div style={{textAlign:'center', marginTop:'10px'}}>
                                            <p style={{fontSize:'0.7rem', color:'green', margin:0}}>QR Preview Ready</p>
                                            <img src={formData.paymentQrCode} alt="Preview" style={{width:'100%', borderRadius:'8px', border:'1px solid #ccc', marginTop:'5px'}} />
                                        </div>
                                    )}
                                </div>
                            )}
                            <button className="btn btn-primary" style={{ marginTop:'10px' }}>Save Changes</button>
                        </form>
                    ) : (
                        <div>
                            {/* Read-Only Profile View */}
                            <div style={{marginBottom:'15px'}}>
                                <p style={{margin:0, fontSize:'0.75rem', color:'#64748b', textTransform:'uppercase'}}>Full Name</p>
                                <p style={{margin:0, fontWeight:'bold', fontSize:'1rem'}}>{user.name}</p>
                            </div>
                            <div style={{marginBottom:'15px'}}>
                                <p style={{margin:0, fontSize:'0.75rem', color:'#64748b', textTransform:'uppercase'}}>Email Address</p>
                                <p style={{margin:0, fontWeight:'bold', fontSize:'0.9rem'}}>{user.email}</p>
                            </div>
                            <div style={{marginBottom:'15px'}}>
                                <p style={{margin:0, fontSize:'0.75rem', color:'#64748b', textTransform:'uppercase'}}>Phone</p>
                                <p style={{margin:0, fontWeight:'bold'}}>{user.phone || 'N/A'}</p>
                            </div>
                            <div style={{marginBottom:'15px'}}>
                                <p style={{margin:0, fontSize:'0.75rem', color:'#64748b', textTransform:'uppercase'}}>Location</p>
                                <p style={{margin:0, fontWeight:'bold'}}>{user.address || 'N/A'}</p>
                            </div>

                            {user.role === 'lawyer' && (
                                <div style={{background:'#f8fafc', padding:'15px', borderRadius:'12px', marginTop:'20px', border:'1px solid #e2e8f0'}}>
                                    <h4 style={{margin:'0 0 10px 0', fontSize:'0.9rem', color:'#2563eb'}}>Professional Details</h4>
                                    
                                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px'}}>
                                        <span style={{fontSize:'0.85rem'}}>Fee:</span> 
                                        <strong>₹{user.consultationFee}</strong>
                                    </div>
                                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px'}}>
                                        <span style={{fontSize:'0.85rem'}}>Rating:</span> 
                                        <strong style={{color:'#d97706'}}>{user.rating} ★</strong>
                                    </div>
                                    
                                    <div style={{marginTop:'15px'}}>
                                        <p style={{margin:0, fontSize:'0.75rem', fontWeight:'bold', color:'#64748b'}}>Payment QR Status:</p>
                                        {user.paymentQrCode ? (
                                            <div style={{marginTop:'5px'}}>
                                                <span style={{fontSize:'0.75rem', background:'#dcfce7', color:'#166534', padding:'2px 8px', borderRadius:'10px'}}>✅ Active</span>
                                                <img src={user.paymentQrCode} alt="QR" style={{width:'100%', borderRadius:'8px', marginTop:'10px', border:'1px solid #cbd5e1'}} />
                                            </div>
                                        ) : (
                                            <span style={{fontSize:'0.8rem', color:'#ef4444'}}>❌ Not Uploaded</span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* --- RIGHT: MAIN CONTENT AREA --- */}
                <div>
                    {user.role === 'lawyer' ? <LawyerDashboard rating={user.rating} /> : <CitizenDashboard />}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;