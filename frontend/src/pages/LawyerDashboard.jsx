import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from "react-toastify";

const LawyerDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch Appointments on Load
    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:5000/api/appointments', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if(res.ok) setAppointments(data);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load requests");
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    // Handle Accept/Reject
    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/appointments/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ status: newStatus })
            });

            if(res.ok) {
                toast.success(`Appointment ${newStatus}`);
                // Refresh list locally
                setAppointments(appointments.map(app => 
                    app._id === id ? { ...app, status: newStatus } : app
                ));
            } else {
                toast.error("Update failed");
            }
        } catch (err) {
            toast.error("Server Error");
        }
    };

    // Filter appointments
    const pendingRequests = appointments.filter(a => a.status === 'pending');
    const activeCases = appointments.filter(a => a.status === 'accepted');

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm border-l-4 border-indigo-600">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Legal Practice Dashboard</h1>
                    <p className="text-gray-500">Welcome, Adv. {user.name}</p>
                </div>
                <div className="flex gap-4">
                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200">
                         Drafts
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-blue-500">
                    <h3 className="text-gray-500 text-sm font-bold uppercase">Pending Requests</h3>
                    <p className="text-3xl font-bold text-gray-800">{pendingRequests.length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-green-500">
                    <h3 className="text-gray-500 text-sm font-bold uppercase">Active Cases</h3>
                    <p className="text-3xl font-bold text-gray-800">{activeCases.length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-purple-500">
                    <h3 className="text-gray-500 text-sm font-bold uppercase">Reputation Score</h3>
                    <p className="text-3xl font-bold text-gray-800">4.8 <span className="text-sm text-yellow-500">★</span></p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN: Requests & Tools */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* 1. Appointment Requests */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                            <h2 className="font-bold text-lg">📥 New Case Requests</h2>
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                {pendingRequests.length} New
                            </span>
                        </div>
                        
                        {loading ? <p className="p-6">Loading...</p> : (
                            <div className="divide-y divide-gray-100">
                                {pendingRequests.length === 0 && <p className="p-6 text-gray-500">No pending requests.</p>}
                                {pendingRequests.map(req => (
                                    <div key={req._id} className="p-6 hover:bg-gray-50 transition">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-gray-800">{req.citizenId?.name || "Client"}</h3>
                                                <p className="text-sm text-gray-500 mb-2">Requested: {req.slot} | {new Date(req.date).toLocaleDateString()}</p>
                                                <div className="bg-yellow-50 text-yellow-800 p-2 rounded text-sm border border-yellow-100">
                                                    " {req.description} "
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleStatusUpdate(req._id, 'rejected')}
                                                    className="px-3 py-1 text-sm border border-red-200 text-red-600 rounded hover:bg-red-50"
                                                >
                                                    Reject
                                                </button>
                                                <button 
                                                    onClick={() => handleStatusUpdate(req._id, 'accepted')}
                                                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 shadow-sm"
                                                >
                                                    Accept Case
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 2. Active Cases (Communication Hub) */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                         <div className="bg-gray-50 px-6 py-4 border-b">
                            <h2 className="font-bold text-lg">⚖️ Active Cases</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {activeCases.length === 0 && <p className="p-6 text-gray-500">No active cases yet. Accept a request to start.</p>}
                            {activeCases.map(caseItem => (
                                <div key={caseItem._id} className="p-6 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold">{caseItem.citizenId?.name}</h3>
                                        <p className="text-xs text-gray-400">Case ID: #{caseItem._id.slice(-6)}</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => toast.info("Chat feature coming next!")}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full" title="Message"
                                        >
                                            💬
                                        </button>
                                        <button 
                                            onClick={() => toast.info("Voice call coming next!")}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-full" title="Call"
                                        >
                                            📞
                                        </button>
                                        <button 
                                            onClick={() => toast.info("Video call opening...")}
                                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-full" title="Video Meeting"
                                        >
                                            📹
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Tools */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                         <h3 className="font-bold mb-4">🤖 AI Legal Assistant</h3>
                         <p className="text-sm text-gray-600 mb-4">Draft contracts or research case law instantly.</p>
                         <button className="w-full bg-indigo-100 text-indigo-700 py-2 rounded hover:bg-indigo-200 font-semibold">
                             Open AI Tool
                         </button>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                         <h3 className="font-bold mb-4">🤝 Peer Consultation</h3>
                         <p className="text-sm text-gray-600 mb-4">Connect with senior counsel for guidance.</p>
                         <button className="w-full border border-gray-300 text-gray-600 py-2 rounded hover:bg-gray-50">
                             Find Lawyers
                         </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LawyerDashboard;