import { useState, useEffect, useRef } from 'react';
import { apiCall } from '../services/api';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';
import html2pdf from 'html2pdf.js';
import { legalTemplates } from '../utils/legalTemplates'; 

const translations = {
    English: { welcome: "Namaste! I am Nyay Sahayak. Ask me about Indian Law, or use the Document Drafter below.", title: "Nyay Sahayak", statusOnline: "Online | Legal Assistant", statusTyping: "Typing...", placeholder: "Type your legal question or fill in the template details...", networkError: "⚠️ Connection failed.", aiName: "🤖 Nyay Sahayak:", newChat: "➕ New Chat", history: "Chat History" },
    Hindi: { welcome: "नमस्ते! मैं न्याय सहायक हूँ। अपनी भाषा चुनें और मुझसे भारतीय कानून के बारे में पूछें।", title: "न्याय सहायक", statusOnline: "ऑनलाइन | कानूनी सहायक", statusTyping: "टाइप कर रहा है...", placeholder: "अपना कानूनी प्रश्न यहाँ लिखें...", networkError: "⚠️ कनेक्शन विफल।", aiName: "🤖 न्याय सहायक:", newChat: "➕ नई चैट", history: "चैट इतिहास" },
    Marathi: { welcome: "नमस्कार! मी न्याय सहायक आहे. तुमची भाषा निवडा आणि मला भारतीय कायद्याबद्दल विचारा.", title: "न्याय सहायक", statusOnline: "ऑनलाइन | कायदेशीर सहाय्यक", statusTyping: "टाइप करत आहे...", placeholder: "तुमचा कायदेशीर प्रश्न येथे लिहा...", networkError: "⚠️ कनेक्शन अयशस्वी.", aiName: "🤖 न्याय सहायक:", newChat: "➕ नवीन गप्पा", history: "गप्पा इतिहास" }
};

const AskAI = () => {
    const [language, setLanguage] = useState('English');
    const t = translations[language];

    const [messages, setMessages] = useState([{ id: 1, text: t.welcome, sender: 'ai', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    const [chatHistoryList, setChatHistoryList] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Dynamic Smart Form States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTemplate, setActiveTemplate] = useState(null);
    const [formValues, setFormValues] = useState({});

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // Extract categories dynamically from the templates array
    const templateCategories = [...new Set(legalTemplates.map(tpl => tpl.category))];

    // ==========================================
    // INITIALIZATION & HISTORY FETCHING
    // ==========================================
    const loadChatHistory = async () => {
        const token = localStorage.getItem('token');
        const data = await apiCall('/api/ai/chats', 'GET', null, token);
        if (data) setChatHistoryList(data);
    };

    useEffect(() => { loadChatHistory(); }, []);

    useEffect(() => {
        if (!document.getElementById('google-translate-script')) {
            const addScript = document.createElement('script');
            addScript.id = 'google-translate-script';
            addScript.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            addScript.async = true;
            document.body.appendChild(addScript);

            window.googleTranslateElementInit = () => {
                new window.google.translate.TranslateElement({ pageLanguage: 'en', includedLanguages: 'en,hi,mr', autoDisplay: false }, 'google_translate_element');
            };
        }
    }, []);

    // ==========================================
    // EVENT HANDLERS
    // ==========================================
    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        if (messages.length === 1 && messages[0].id === 1) {
            setMessages([{ ...messages[0], text: translations[newLang].welcome }]);
        }
        const langCode = newLang === 'Hindi' ? 'hi' : newLang === 'Marathi' ? 'mr' : 'en';
        const gtSelect = document.querySelector('.goog-te-combo');
        if (gtSelect) { gtSelect.value = langCode; gtSelect.dispatchEvent(new Event('change')); }
    };

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(scrollToBottom, [messages]);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) setSelectedFile(file);
    };

    const removeFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const startNewChat = () => {
        setActiveChatId(null);
        setMessages([{ id: 1, text: t.welcome, sender: 'ai', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        setIsSidebarOpen(false);
    };

    const fetchSingleChat = async (id) => {
        const token = localStorage.getItem('token');
        const data = await apiCall(`/api/ai/chats/${id}`, 'GET', null, token);
        if (data) {
            setMessages([{ id: 1, text: t.welcome, sender: 'ai', timestamp: '' }, ...data.messages]);
            setActiveChatId(id);
            setIsSidebarOpen(false);
        }
    };

    // ==========================================
    // DYNAMIC SMART FORM HANDLERS
    // ==========================================
    const handleTemplateSelect = (e) => {
        const selectedId = e.target.value;
        if (!selectedId) return;

        const template = legalTemplates.find(t => t.id === selectedId);
        if (template) {
            setActiveTemplate(template);
            setFormValues({}); // Reset previous form data
            setIsModalOpen(true); // Open the magic form popup
        }
        e.target.value = ""; // Reset dropdown to placeholder
    };

    const handleFormChange = (id, value) => {
        setFormValues(prev => ({ ...prev, [id]: value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsModalOpen(false); // Close Modal
        setLoading(true);

        // 1. Compile User Data into a clean string for the Prompt
        const mappedDetails = activeTemplate.fields
            .map(f => `- ${f.label}: ${formValues[f.id] || 'N/A'}`)
            .join('\n');

        // 2. The Master "Silent" Prompt - UPGRADED TO BAN HTML & ENFORCE MARKDOWN
        let massivePrompt = `I need you to draft a formal ${activeTemplate.label} under Indian Law. Here are the exact details provided by the user:\n\n${mappedDetails}\n\n[SYSTEM DIRECTIVE: All details provided. Generate the FINAL document immediately wrapped strictly between [DOC_START] and [DOC_END] tags. CRITICAL FORMATTING RULES: 1. Use pure Markdown ONLY (** for bold, # for headings). 2. NEVER use HTML tags like <br>, <b>, or <center>. 3. Structure it formally. DO NOT ask any follow-up questions. Do not add conversational text inside the tags.]`;

        // 3. What the user actually sees in their chatbox
        let displayMessage = `📄 **Drafting Document:** ${activeTemplate.label}\n*(Details provided securely via form)*`;

        // Add visual message to UI
        const userMsg = { id: Date.now(), text: displayMessage, sender: 'user', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);

        // Prepare History Payload (Excluding the welcome message)
        const historyPayload = newMessages
            .filter(m => m.id !== 1)
            .map(msg => ({ role: msg.sender === 'user' ? 'user' : 'model', parts: [{ text: msg.text }] }));

        const formData = new FormData();
        formData.append('question', massivePrompt); // Send the MASSIVE prompt, not the display string
        formData.append('history', JSON.stringify(historyPayload));
        if (activeChatId) formData.append('chatId', activeChatId);

        const token = localStorage.getItem('token');
        const data = await apiCall('/api/ai/ask', 'POST', formData, token, true);

        if (data) {
            const aiMsg = { id: Date.now() + 1, text: data.answer, sender: 'ai', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
            setMessages(prev => [...prev, aiMsg]);
            
            if (!activeChatId && data.chatId) {
                setActiveChatId(data.chatId);
                loadChatHistory();
            }
        } else {
            toast.error(t.networkError);
            setMessages(prev => [...prev, { id: Date.now() + 1, text: t.networkError, sender: 'ai', isError: true, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        }
        setLoading(false);
    };

    // ==========================================
    // STANDARD CHAT SENDER
    // ==========================================
    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() && !selectedFile) return;

        let displayMessage = input;
        if (selectedFile) displayMessage = `📄 [Document Attached: ${selectedFile.name}]\n\n${input}`;

        const userMsg = { id: Date.now(), text: displayMessage, sender: 'user', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        
        const fileToSend = selectedFile; 
        removeFile();
        setLoading(true);

        const historyPayload = newMessages
            .filter(m => m.id !== 1)
            .map(msg => ({ role: msg.sender === 'user' ? 'user' : 'model', parts: [{ text: msg.text }] }));

        let finalQuestion = input;
        if (language === 'Hindi') finalQuestion += " (Please reply in Hindi / कृपया हिंदी में उत्तर दें)";
        else if (language === 'Marathi') finalQuestion += " (Please reply in Marathi / कृपया मराठीत उत्तर द्या)";

        const formData = new FormData();
        formData.append('question', finalQuestion);
        formData.append('history', JSON.stringify(historyPayload));
        if (activeChatId) formData.append('chatId', activeChatId); 
        if (fileToSend) formData.append('document', fileToSend);

        const token = localStorage.getItem('token');
        const data = await apiCall('/api/ai/ask', 'POST', formData, token, true);

        if (data) {
            const aiMsg = { id: Date.now() + 1, text: data.answer, sender: 'ai', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
            setMessages(prev => [...prev, aiMsg]);
            
            if (!activeChatId && data.chatId) {
                setActiveChatId(data.chatId);
                loadChatHistory();
            }
        } else {
            toast.error(t.networkError);
            setMessages(prev => [...prev, { id: Date.now() + 1, text: t.networkError, sender: 'ai', isError: true, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        }
        setLoading(false);
    };

    // ==========================================
    // PDF GENERATION LOGIC
    // ==========================================
    const downloadPDF = (msgId) => {
        const element = document.getElementById(`doc-${msgId}`);
        const opt = {
            margin:       15,
            filename:     `Legal_Bridge_Document_${msgId}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };

    // ==========================================
    // STYLES
    // ==========================================
    const styles = {
        wrapper: { maxWidth: '1200px', margin: '20px auto', display: 'flex', height: '85vh', position: 'relative', overflow: 'hidden', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', backgroundColor: '#e8e3df' },
        sidebar: { position: 'absolute', top: 0, left: isSidebarOpen ? '0' : '-300px', width: '280px', height: '100%', background: '#1e293b', color: 'white', transition: 'left 0.3s ease', zIndex: 50, display: 'flex', flexDirection: 'column', boxShadow: isSidebarOpen ? '4px 0 15px rgba(0,0,0,0.3)' : 'none' },
        sidebarHeader: { padding: '20px', borderBottom: '1px solid #334155' },
        newChatBtn: { width: '100%', padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', transition: 'background 0.2s' },
        historyList: { flex: 1, overflowY: 'auto', padding: '10px' },
        historyItem: (isActive) => ({ padding: '12px 15px', borderBottom: '1px solid #334155', cursor: 'pointer', background: isActive ? '#334155' : 'transparent', borderRadius: '8px', marginBottom: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.9rem', color: isActive ? 'white' : '#cbd5e1' }),
        
        mainChat: { flex: 1, display: 'flex', flexDirection: 'column', width: '100%', background: '#e8e3df', position: 'relative' },
        overlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40, display: isSidebarOpen ? 'block' : 'none' },
        header: { background: '#3b72f1', color: 'white', padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10, boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
        headerLeft: { display: 'flex', alignItems: 'center', gap: '15px' },
        hamburger: { background: 'none', border: 'none', color: 'white', fontSize: '1.8rem', cursor: 'pointer', marginRight: '5px', display: 'flex', alignItems:'center' },
        avatar: { width: '45px', height: '45px', borderRadius: '50%', background: 'white', color: '#3b72f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' },
        status: { fontSize: '0.8rem', opacity: 0.9 },
        langSelect: { padding: '5px 10px', borderRadius: '5px', border: 'none', fontSize: '0.9rem', cursor: 'pointer', background: 'rgba(255,255,255,0.2)', color: 'black', outline: 'none' },
        
        chatArea: { flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' },
        messageRow: { display: 'flex', width: '100%' },
        bubble: { padding: '12px 16px', borderRadius: '12px', fontSize: '1rem', lineHeight: '1.5', position: 'relative', boxShadow: '0 1px 2px rgba(0,0,0,0.15)', wordWrap: 'break-word', display: 'flex', flexDirection: 'column' },
        userBubble: { background: '#c6ddf8', color: '#000', borderTopRightRadius: '0', marginLeft: 'auto', maxWidth: '75%' },
        aiBubble: { background: '#ffffff', color: '#000', borderTopLeftRadius: '0', marginRight: 'auto' }, 
        timestamp: { fontSize: '0.7rem', color: '#999', textAlign: 'right', marginTop: '5px', display: 'block', alignSelf: 'flex-end' },
        
        pdfBtn: { background: '#ef4444', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', alignSelf: 'flex-end', marginBottom: '10px' },
        
        // UPGRADED: Supreme Court Formatted A4 Paper Constraints
        a4Paper: { 
            position: 'relative', 
            background: 'white', 
            color: 'black', 
            padding: '60px 50px', 
            borderRadius: '4px', 
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)', 
            fontFamily: '"Times New Roman", Times, serif', 
            fontSize: '14pt', 
            lineHeight: '1.5', 
            textAlign: 'justify', 
            width: '100%', 
            border: '1px solid #cbd5e1', 
            overflowX: 'auto', 
            minHeight: '800px', 
            display: 'flex', 
            flexDirection: 'column' 
        },

        watermark: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg)', fontSize: 'clamp(3rem, 8vw, 6rem)', color: 'rgba(0, 0, 0, 0.04)', fontWeight: '900', whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 0, userSelect: 'none', letterSpacing: '10px' },
        docContent: { position: 'relative', zIndex: 1, flexGrow: 1 },
        copyrightFooter: { borderTop: '2px solid #e2e8f0', marginTop: '40px', paddingTop: '15px', textAlign: 'center', fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold', position: 'relative', zIndex: 1 },

        dropdownContainer: { padding: '10px 15px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' },
        templateSelect: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#334155', outline: 'none', cursor: 'pointer', background: 'white', fontWeight: 'bold' },

        footerContainer: { background: '#f0f0f0', display: 'flex', flexDirection: 'column' },
        filePreview: { padding: '8px 15px', background: '#e0e0e0', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #ccc' },
        removeFileBtn: { background: 'transparent', border: 'none', color: 'red', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' },
        footer: { padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px' },
        attachBtn: { background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#555', padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
        input: { flex: 1, padding: '14px', borderRadius: '25px', border: '1px solid #ccc', fontSize: '1rem', outline: 'none' },
        sendBtn: { background: '#3b72f1', color: 'white', border: 'none', borderRadius: '50%', width: '50px', height: '50px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' },

        // MODAL STYLES
        modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 999, display: isModalOpen ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center' },
        modalContent: { background: 'white', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '500px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.25)' },
        modalTitle: { margin: '0 0 20px 0', color: '#1e293b', fontSize: '1.3rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' },
        formGroup: { marginBottom: '15px' },
        formLabel: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#475569', fontSize: '0.9rem' },
        formInput: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' },
        modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '25px' },
        cancelBtn: { padding: '10px 20px', border: 'none', background: '#e2e8f0', color: '#475569', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' },
        generateBtn: { padding: '10px 20px', border: 'none', background: '#3b82f6', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s', boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)' }
    };

    // UPGRADED: Indian Legal Formal Styling Hooks for Markdown Rendering
    const MarkdownConfig = {
        p: ({node, ...props}) => <p style={{margin:'0 0 15px 0', textIndent: '30px'}} {...props} />, 
        ul: ({node, ...props}) => <ul style={{paddingLeft:'40px', margin:'0 0 15px 0'}} {...props} />, 
        ol: ({node, ...props}) => <ol style={{paddingLeft:'40px', margin:'0 0 15px 0'}} {...props} />, 
        strong: ({node, ...props}) => <strong style={{fontWeight:'bold'}} {...props} />,
        h1: ({node, ...props}) => <h1 style={{textAlign: 'center', fontSize: '16pt', textTransform: 'uppercase', borderBottom: '1px solid black', paddingBottom: '5px', marginBottom: '25px'}} {...props} />,
        h2: ({node, ...props}) => <h2 style={{fontSize: '14pt', marginTop: '20px', marginBottom: '15px', textTransform: 'uppercase'}} {...props} />,
        h3: ({node, ...props}) => <h3 style={{fontSize: '14pt', marginTop: '15px', marginBottom: '10px', fontWeight: 'bold'}} {...props} />
    };

    return (
        <div style={styles.wrapper} className="fade-in">
            {/* GOOGLE TRANSLATE ELEMENT */}
            <div id="google_translate_element" style={{ display: 'none' }}></div>
            <style>{`.goog-te-banner-frame.skiptranslate { display: none !important; } body { top: 0px !important; } .goog-tooltip { display: none !important; } .goog-text-highlight { background-color: transparent !important; border: none !important; box-shadow: none !important; }`}</style>

            {/* MAGIC SMART FORM MODAL */}
            <div style={styles.modalOverlay}>
                <div style={styles.modalContent}>
                    {activeTemplate && (
                        <form onSubmit={handleFormSubmit}>
                            <h3 style={styles.modalTitle}>📝 Configure: {activeTemplate.label}</h3>
                            
                            {activeTemplate.fields.map(field => (
                                <div key={field.id} style={styles.formGroup}>
                                    <label style={styles.formLabel}>{field.label}</label>
                                    <input 
                                        type={field.type || 'text'} 
                                        placeholder={field.placeholder || ''} 
                                        style={styles.formInput} 
                                        value={formValues[field.id] || ''}
                                        onChange={(e) => handleFormChange(field.id, e.target.value)}
                                        required 
                                    />
                                </div>
                            ))}

                            <div style={styles.modalActions}>
                                <button type="button" style={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" style={styles.generateBtn}>✨ Generate Document</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* SIDEBAR (HISTORY) */}
            <div style={styles.sidebar} className="notranslate">
                <div style={styles.sidebarHeader}>
                    <button style={styles.newChatBtn} onClick={startNewChat}>{t.newChat}</button>
                </div>
                <div style={styles.historyList}>
                    <p style={{fontSize:'0.8rem', color:'#94a3b8', margin:'0 0 10px 5px', fontWeight:'bold', textTransform:'uppercase'}}>{t.history}</p>
                    {chatHistoryList.map(chat => (
                        <div key={chat._id} style={styles.historyItem(activeChatId === chat._id)} onClick={() => fetchSingleChat(chat._id)}>💬 {chat.title}</div>
                    ))}
                    {chatHistoryList.length === 0 && <p style={{color:'#64748b', fontSize:'0.9rem', paddingLeft:'5px'}}>No previous chats.</p>}
                </div>
            </div>

            {/* MAIN CHAT AREA */}
            <div style={styles.mainChat}>
                <div style={styles.overlay} onClick={() => setIsSidebarOpen(false)}></div>

                <div style={styles.header} className="notranslate">
                    <div style={styles.headerLeft}>
                        <button style={styles.hamburger} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>☰</button>
                        <div style={styles.avatar}>⚖️</div>
                        <div>
                            <h3 style={{margin:0, fontSize:'1.1rem'}}>{t.title}</h3>
                            <p style={styles.status}>{loading ? t.statusTyping : t.statusOnline}</p>
                        </div>
                    </div>
                    <select style={styles.langSelect} value={language} onChange={handleLanguageChange}>
                        <option value="English">🇬🇧 English</option>
                        <option value="Hindi">🇮🇳 हिंदी</option>
                        <option value="Marathi">🚩 मराठी</option>
                    </select>
                </div>

                <div style={styles.chatArea}>
                    {messages.map((msg) => {
                        const hasDocument = msg.sender === 'ai' && msg.text.includes('[DOC_START]') && msg.text.includes('[DOC_END]');
                        let beforeDoc = '', docContent = '', afterDoc = '';
                        
                        if (hasDocument) {
                            const parts = msg.text.split('[DOC_START]');
                            beforeDoc = parts[0];
                            const docAndAfter = parts[1].split('[DOC_END]');
                            docContent = docAndAfter[0];
                            afterDoc = docAndAfter[1] || '';
                        }

                        return (
                            <div key={msg.id} style={styles.messageRow}>
                                <div style={{...styles.bubble, ...(msg.sender === 'user' ? styles.userBubble : styles.aiBubble), border: msg.isError ? '1px solid red' : 'none', maxWidth: hasDocument ? '95%' : '75%'}}>
                                    <div className="markdown-content">
                                        {msg.sender === 'ai' && <strong className="notranslate" style={{color:'#075e54', display:'block', marginBottom:'5px'}}>{t.aiName}</strong>}
                                        
                                        {!hasDocument ? (
                                            <ReactMarkdown components={MarkdownConfig}>{msg.text}</ReactMarkdown>
                                        ) : (
                                            <>
                                                {/* Text generated before the actual document tags */}
                                                {beforeDoc.trim() && <ReactMarkdown components={MarkdownConfig}>{beforeDoc}</ReactMarkdown>}
                                                
                                                {/* The Actual Rendered A4 Document UI */}
                                                <div style={{ margin: '20px 0', width: '100%', display: 'flex', flexDirection: 'column', background: '#f8fafc', padding: '20px', borderRadius: '10px' }}>
                                                    <button onClick={() => downloadPDF(msg.id)} style={styles.pdfBtn}>
                                                        📥 Download as PDF
                                                    </button>
                                                    
                                                    <div id={`doc-${msg.id}`} style={styles.a4Paper}>
                                                        <div style={styles.watermark}>LEGAL BRIDGE</div>
                                                        <div style={styles.docContent}>
                                                            <ReactMarkdown components={MarkdownConfig}>{docContent}</ReactMarkdown>
                                                        </div>
                                                        <div style={styles.copyrightFooter}>
                                                            © {new Date().getFullYear()} Legal Bridge - Nyay Sahayak AI. For informational use only. Not a substitute for legal counsel.
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Text generated after the document tags */}
                                                {afterDoc.trim() && <ReactMarkdown components={MarkdownConfig}>{afterDoc}</ReactMarkdown>}
                                            </>
                                        )}
                                    </div>
                                    <span style={styles.timestamp} className="notranslate">{msg.timestamp}</span>
                                </div>
                            </div>
                        );
                    })}
                    {loading && <div style={styles.messageRow} className="notranslate"><div style={{...styles.bubble, ...styles.aiBubble, fontStyle:'italic', color:'#666', maxWidth: '75%'}}>{t.statusTyping}</div></div>}
                    <div ref={messagesEndRef} />
                </div>

                <div style={styles.footerContainer} className="notranslate">
                    {/* DYNAMIC FORM DROPDOWN */}
                    <div style={styles.dropdownContainer}>
                        <select style={styles.templateSelect} onChange={handleTemplateSelect} defaultValue="">
                            <option value="" disabled>📑 Auto-Draft a Document (Select Template)</option>
                            {templateCategories.map(category => (
                                <optgroup key={category} label={`--- ${category} ---`}>
                                    {legalTemplates.filter(t => t.category === category).map((tpl) => (
                                        <option key={tpl.id} value={tpl.id}>{tpl.label}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>

                    {selectedFile && (
                        <div style={styles.filePreview}>
                            <span>📄 {selectedFile.name}</span>
                            <button type="button" onClick={removeFile} style={styles.removeFileBtn}>✖</button>
                        </div>
                    )}

                    <form style={styles.footer} onSubmit={handleSend}>
                        <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileSelect} accept=".pdf,.doc,.docx,.txt" />
                        <button type="button" style={styles.attachBtn} onClick={() => fileInputRef.current.click()} disabled={loading}>📎</button>
                        <input style={styles.input} placeholder={t.placeholder} value={input} onChange={(e) => setInput(e.target.value)} disabled={loading} />
                        <button type="submit" style={{...styles.sendBtn, opacity: loading || (!input.trim() && !selectedFile) ? 0.7 : 1}} disabled={loading || (!input.trim() && !selectedFile)}>➤</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AskAI;