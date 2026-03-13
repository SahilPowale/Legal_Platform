import { useState, useEffect, useRef } from 'react';
import { apiCall } from '../services/api';
import { toast } from 'react-toastify'; // 🚨 Added to alert user if send fails

const ChatBox = ({ currentUserId, otherUserId, otherUserName, appointmentId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);

    const fetchMessages = async () => {
        const token = localStorage.getItem('token');
        if (!token || !appointmentId) return;

        const data = await apiCall(`/api/chat/${appointmentId}`, 'GET', null, token);
        if (data) setMessages(data);
    };

    useEffect(() => {
        fetchMessages(); 
        const interval = setInterval(fetchMessages, 2000); 
        return () => clearInterval(interval); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appointmentId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const token = localStorage.getItem('token');
        const payload = { appointmentId, receiverId: otherUserId, text: newMessage };
        
        // Optimistic Update Setup
        const tempId = Date.now();
        setMessages(prev => [...prev, { sender: currentUserId, text: newMessage, _id: tempId }]);
        setNewMessage("");

        const res = await apiCall('/api/chat', 'POST', payload, token);
        
        // 🚨 Error Catch: If backend fails, show error and rollback optimistic message
        if (!res) {
            toast.error("Failed to send message. Please try again.");
            setMessages(prev => prev.filter(msg => msg._id !== tempId));
        } else {
            fetchMessages(); 
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '450px', width: '100%', maxWidth: '400px', border: '1px solid #d1d5db', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            
            <div style={{ background: '#075e54', color: 'white', padding: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '35px', height: '35px', background: '#ccc', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem' }}>👤</div>
                <div>
                    <div style={{ fontSize: '1.1rem' }}>{otherUserName || "Client"}</div>
                    <div style={{ fontSize: '0.75rem', color: '#dcf8c6' }}>Legal Consultation Chat</div>
                </div>
            </div>

            <div style={{ flex: 1, padding: '15px', overflowY: 'auto', background: '#efeae2', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                <div style={{ textAlign: 'center', margin: '10px 0' }}>
                    <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.75rem', padding: '5px 10px', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                        🔒 Messages are end-to-end encrypted and will be deleted when the case closes.
                    </span>
                </div>

                {messages.map((msg) => {
                    const isMe = msg.sender === currentUserId;
                    return (
                        <div key={msg._id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%', position: 'relative' }}>
                            <div style={{ 
                                background: isMe ? '#dcf8c6' : 'white', 
                                color: '#111b21', 
                                padding: '8px 12px', 
                                borderRadius: isMe ? '10px 0px 10px 10px' : '0px 10px 10px 10px',
                                fontSize: '0.95rem',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                            }}>
                                {msg.text}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} style={{ display: 'flex', padding: '10px', background: '#f0f2f5', gap: '10px' }}>
                <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message" 
                    style={{ flex: 1, padding: '12px 15px', borderRadius: '24px', border: 'none', outline: 'none', fontSize: '0.95rem' }}
                />
                <button type="submit" style={{ background: '#00a884', color: 'white', border: 'none', borderRadius: '50%', width: '45px', height: '45px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem' }}>
                    ➤
                </button>
            </form>
        </div>
    );
};

export default ChatBox;