import { useState, useEffect, useRef } from 'react';
import { apiCall } from '../services/api';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown'; // <--- NEW IMPORT

const AskAI = () => {
    // --- STATE MANAGEMENT ---
    const [messages, setMessages] = useState([
        { 
            id: 1, 
            text: "Namaste! I am Nyay Sahayak. Select your language and ask me about Indian Law.", 
            sender: 'ai', 
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState('English'); // Default Language

    // Auto-scroll ref
    const messagesEndRef = useRef(null);

    // Scroll to bottom whenever messages change
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages]);

    // --- SEND MESSAGE FUNCTION ---
    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        // 1. Add User Message to UI
        const userMsg = { 
            id: Date.now(), 
            text: input, 
            sender: 'user', 
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        };
        
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        // 2. Prepare History for Context
        // We filter out the initial welcome message to avoid confusing the AI
        const historyPayload = newMessages
            .filter(m => m.id !== 1) 
            .map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));

        // 3. Modify Prompt based on Language
        // We append a system instruction to the USER's message to force the language
        let finalQuestion = input;
        if (language === 'Hindi') {
            finalQuestion += " (Please reply in Hindi / कृपया हिंदी में उत्तर दें)";
        } else if (language === 'Marathi') {
            finalQuestion += " (Please reply in Marathi / कृपया मराठीत उत्तर द्या)";
        }

        // 4. API Call
        const token = localStorage.getItem('token');
        const data = await apiCall('/api/ai/ask', 'POST', { 
            question: finalQuestion,
            history: historyPayload 
        }, token);

        // 5. Handle Response
        if (data) {
            const aiMsg = { 
                id: Date.now() + 1, 
                text: data.answer, 
                sender: 'ai', 
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            };
            setMessages(prev => [...prev, aiMsg]);
        } else {
            toast.error("Network Error. Please try again.");
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "⚠️ Connection failed. Please check your internet.",
                sender: 'ai',
                isError: true,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }
        setLoading(false);
    };

    // --- STYLES (Telegram / WhatsApp Inspired) ---
    const styles = {
        container: {
            maxWidth: '1000px',
            margin: '20px auto',
            height: '85vh',
            display: 'flex',
            flexDirection: 'column',
            background: '#e8e3df', // WhatsApp-like beige background
            borderRadius: '15px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            overflow: 'hidden',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            position: 'relative'
        },
        header: {
            background: '#3b72f1', // WhatsApp/Telegram blue
            color: 'white',
            padding: '15px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 10,
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        },
        headerLeft: {
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
        },
        avatar: {
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            background: 'white',
            color: '#3b72f1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '1.2rem'
        },
        status: {
            fontSize: '0.8rem',
            opacity: 0.9
        },
        langSelect: {
            padding: '5px 10px',
            borderRadius: '5px',
            border: 'none',
            fontSize: '0.9rem',
            cursor: 'pointer',
            background: 'rgba(255,255,255,0.2)',
            color: 'black',
            outline: 'none'
        },
        chatArea: {
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', // Subtle pattern
            backgroundSize: '20px 20px'
        },
        messageRow: {
            display: 'flex',
            width: '100%',
        },
        bubble: {
            maxWidth: '75%',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '1rem',
            lineHeight: '1.5',
            position: 'relative',
            boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
            wordWrap: 'break-word',
            display: 'flex',       // Added flex for layout
            flexDirection: 'column' // Stack content vertically
        },
        userBubble: {
            background: '#c6ddf8', // Light Green (User)
            color: '#000',
            borderTopRightRadius: '0',
            marginLeft: 'auto' // Pushes to right
        },
        aiBubble: {
            background: '#ffffff', // White (AI)
            color: '#000',
            borderTopLeftRadius: '0',
            marginRight: 'auto' // Pushes to left
        },
        timestamp: {
            fontSize: '0.7rem',
            color: '#999',
            textAlign: 'right',
            marginTop: '5px',
            display: 'block',
            alignSelf: 'flex-end'
        },
        footer: {
            background: '#f0f0f0',
            padding: '10px 15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            borderTop: '1px solid #ddd'
        },
        input: {
            flex: 1,
            padding: '14px',
            borderRadius: '25px',
            border: '1px solid #ccc',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border 0.3s'
        },
        sendBtn: {
            background: '#3b72f1',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }
    };

    return (
        <div style={styles.container} className="fade-in">
            {/* HEADER */}
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <div style={styles.avatar}>⚖️</div>
                    <div>
                        <h3 style={{margin:0, fontSize:'1.1rem'}}>Nyay Sahayak</h3>
                        <p style={styles.status}>
                            {loading ? 'Typing...' : 'Online | Legal Assistant'}
                        </p>
                    </div>
                </div>
                
                {/* Language Selector */}
                <select 
                    style={styles.langSelect} 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)}
                >
                    <option value="English">🇬🇧 English</option>
                    <option value="Hindi">🇮🇳 हिंदी (Hindi)</option>
                    <option value="Marathi">🚩 मराठी (Marathi)</option>
                </select>
            </div>

            {/* CHAT MESSAGES */}
            <div style={styles.chatArea}>
                {messages.map((msg) => (
                    <div key={msg.id} style={styles.messageRow}>
                        <div 
                            style={{
                                ...styles.bubble, 
                                ...(msg.sender === 'user' ? styles.userBubble : styles.aiBubble),
                                border: msg.isError ? '1px solid red' : 'none'
                            }}
                        >
                            {/* MARKDOWN RENDERING: This fixes the "Stars" issue */}
                            <div className="markdown-content">
                                {msg.sender === 'ai' && <strong style={{color:'#075e54', display:'block', marginBottom:'5px'}}>🤖 Nyay Sahayak:</strong>}
                                
                                <ReactMarkdown 
                                    components={{
                                        // Custom styles for markdown elements to look good in chat
                                        p: ({node, ...props}) => <p style={{margin:'0 0 8px 0'}} {...props} />,
                                        ul: ({node, ...props}) => <ul style={{paddingLeft:'20px', margin:'0 0 8px 0'}} {...props} />,
                                        ol: ({node, ...props}) => <ol style={{paddingLeft:'20px', margin:'0 0 8px 0'}} {...props} />,
                                        strong: ({node, ...props}) => <strong style={{fontWeight:'bold', color: msg.sender === 'ai' ? '#333' : 'inherit'}} {...props} />
                                    }}
                                >
                                    {msg.text}
                                </ReactMarkdown>
                            </div>
                            
                            <span style={styles.timestamp}>{msg.timestamp}</span>
                        </div>
                    </div>
                ))}
                
                {/* Typing Animation Bubble */}
                {loading && (
                    <div style={styles.messageRow}>
                        <div style={{...styles.bubble, ...styles.aiBubble, fontStyle:'italic', color:'#666'}}>
                            Typing...
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            {/* INPUT FOOTER */}
            <form style={styles.footer} onSubmit={handleSend}>
                <input 
                    style={styles.input} 
                    placeholder={
                        language === 'Hindi' ? "अपना कानूनी प्रश्न यहाँ लिखें..." :
                        language === 'Marathi' ? "तुमचा कायदेशीर प्रश्न येथे लिहा..." :
                        "Type your legal question here..."
                    }
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading}
                />
                <button 
                    type="submit" 
                    style={{...styles.sendBtn, opacity: loading || !input.trim() ? 0.7 : 1}}
                    disabled={loading || !input.trim()}
                >
                    ➤
                </button>
            </form>
        </div>
    );
};

export default AskAI;