import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { apiCall } from '../services/api'; 

const BookLawyer = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [lawyers, setLawyers] = useState([]);
    const [filteredLawyers, setFilteredLawyers] = useState([]);
    const [search, setSearch] = useState('');
    
    // Modal & Booking State
    const [selectedLawyer, setSelectedLawyer] = useState(null);
    const [bookingData, setBookingData] = useState({ date: '', slot: '', description: '', txnId: '', kycDocument: '' });
    const [step, setStep] = useState(1);

    useEffect(() => {
        const fetchLawyers = async () => {
            const token = localStorage.getItem('token');
            const data = await apiCall('/api/users/lawyers', 'GET', null, token);
            if (data) {
                setLawyers(data);
                setFilteredLawyers(data);
            }
        };
        fetchLawyers();
    }, []);

    useEffect(() => {
        setFilteredLawyers(lawyers.filter(l => 
            l.name.toLowerCase().includes(search.toLowerCase()) || 
            l.specialization?.toLowerCase().includes(search.toLowerCase())
        ));
    }, [search, lawyers]);

    // --- COMPRESS KYC ID IMAGE ---
    const handleKycUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800; // Keep quality decent for readable IDs
                    const scaleSize = MAX_WIDTH / img.width;
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scaleSize;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    setBookingData(prev => ({ ...prev, kycDocument: compressedDataUrl }));
                };
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNext = (e) => {
        e.preventDefault();
        if(!bookingData.date || !bookingData.slot) { toast.warn("Select Date & Time"); return; }
        if(!selectedLawyer.paymentQrCode) { toast.error("Lawyer has not uploaded a QR code yet."); return; }
        setStep(2);
    };

    const handleConfirmBooking = async (e) => {
        e.preventDefault();
        if(!bookingData.txnId) { toast.warn("Please enter Transaction ID"); return; }
        
        // --- STRICT KYC CHECK ---
        // If the user isn't globally verified and they haven't uploaded an ID, block the booking!
        if (user?.identityStatus !== 'verified' && !bookingData.kycDocument) {
            toast.error("You must upload an Identity Proof (Aadhaar/DL) to proceed.");
            return;
        }

        const token = localStorage.getItem('token');
        
        // Pass the kycDocument to the backend
        const res = await apiCall('/api/appointments', 'POST', {
            lawyerId: selectedLawyer._id,
            date: bookingData.date,
            slot: bookingData.slot,
            description: `${bookingData.description} [Ref: ${bookingData.txnId}]`,
            kycDocument: bookingData.kycDocument
        }, token);

        if (res) {
            toast.success("Booking Confirmed! The lawyer will review your request.");
            setSelectedLawyer(null);
            setStep(1);
            setBookingData({ date: '', slot: '', description: '', txnId: '', kycDocument: '' }); // Reset
            navigate('/dashboard');
        } else {
            toast.error("Booking Failed");
        }
    };

    const styles = {
        grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginTop: '30px' },
        card: { padding: '30px', display: 'flex', flexDirection: 'column', gap: '15px' },
        overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
        modal: { background: 'white', padding: '40px', borderRadius: '20px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }} className="fade-in">
            <h1 style={{textAlign:'center'}}>Find a Lawyer</h1>
            <input className="input-field" placeholder="Search..." style={{maxWidth:'500px', margin:'0 auto', display:'block'}} value={search} onChange={e => setSearch(e.target.value)} />

            <div style={styles.grid}>
                {filteredLawyers.map(lawyer => (
                    <div key={lawyer._id} className="glass-card card-hover" style={styles.card}>
                        <div>
                            <h3>Adv. {lawyer.name}</h3>
                            <p style={{color:'#10b981', fontWeight:'bold'}}>Fee: ₹{lawyer.consultationFee}</p>
                            <p>{lawyer.specialization} | {lawyer.experience} Yrs</p>
                        </div>
                        <button className="btn btn-primary" onClick={() => setSelectedLawyer(lawyer)}>Book Now</button>
                    </div>
                ))}
            </div>

            {selectedLawyer && (
                <div style={styles.overlay}>
                    <div style={styles.modal} className="slide-up">
                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
                            <h2 style={{margin:0}}>Booking: Adv. {selectedLawyer.name}</h2>
                            <button onClick={() => {setSelectedLawyer(null); setStep(1)}} style={{background:'none', border:'none', fontSize:'1.5rem', cursor:'pointer'}}>&times;</button>
                        </div>

                        {step === 1 ? (
                            <form onSubmit={handleNext} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                                <div style={{display:'flex', gap:'10px'}}>
                                    <input type="date" className="input-field" required value={bookingData.date} onChange={e => setBookingData({...bookingData, date: e.target.value})} />
                                    <select className="input-field" required value={bookingData.slot} onChange={e => setBookingData({...bookingData, slot: e.target.value})}>
                                        <option value="">Time...</option><option>10:00 AM</option><option>12:00 PM</option><option>04:00 PM</option>
                                    </select>
                                </div>
                                <textarea className="input-field" rows="3" required placeholder="Description..." value={bookingData.description} onChange={e => setBookingData({...bookingData, description: e.target.value})}></textarea>
                                <button type="submit" className="btn btn-primary">Proceed to Payment (₹{selectedLawyer.consultationFee})</button>
                            </form>
                        ) : (
                            <form onSubmit={handleConfirmBooking} style={{textAlign:'center', display:'flex', flexDirection:'column', gap:'15px'}}>
                                <p style={{margin:0}}>Scan to pay <strong>₹{selectedLawyer.consultationFee}</strong></p>
                                <img src={selectedLawyer.paymentQrCode} alt="Payment QR" style={{margin:'0 auto', border:'1px solid #ccc', borderRadius:'10px', width:'200px', height:'200px', objectFit:'contain'}} />
                                
                                <input className="input-field" placeholder="Enter Transaction ID (UTR)" required value={bookingData.txnId} onChange={e => setBookingData({...bookingData, txnId: e.target.value})} />
                                
                                {/* --- UNVERIFIED CITIZEN WARNING & UPLOAD --- */}
                                {user?.identityStatus !== 'verified' && (
                                    <div style={{background: '#fef2f2', padding: '15px', borderRadius: '10px', border: '1px solid #f87171', textAlign:'left'}}>
                                        <p style={{margin: '0 0 10px 0', fontSize: '0.85rem', color: '#b91c1c'}}>
                                            <strong>⚠️ Identity Verification Required</strong><br/>
                                            Since you do not have a Verified Badge, you must upload a valid ID (Aadhaar/DL/PAN) for the lawyer to review your case request.
                                        </p>
                                        <input type="file" accept="image/*" onChange={handleKycUpload} className="input-field" style={{padding: '5px'}} required />
                                        {bookingData.kycDocument && <p style={{fontSize:'0.75rem', color:'green', margin:'5px 0 0 0', fontWeight:'bold'}}>✅ ID Attached Successfully</p>}
                                    </div>
                                )}

                                <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
                                    <button type="button" onClick={() => setStep(1)} className="btn btn-secondary" style={{flex: 1}}>Back</button>
                                    <button type="submit" className="btn btn-primary" style={{flex: 2}}>Confirm Booking</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookLawyer;