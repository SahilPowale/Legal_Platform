const { GoogleGenerativeAI } = require("@google/generative-ai");
const Chat = require('../models/Chat');

// @desc    Ask Legal AI (Conversational & Accurate) with Document Support
// @route   POST /api/ai/ask
const askAI = async (req, res) => {
  try {
    let { question, history, chatId } = req.body;
    
    if (typeof history === 'string') {
        try { history = JSON.parse(history); } 
        catch (e) { history = []; }
    }

    if (!question) return res.status(400).json({ message: "Question required" });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ message: "API key not set" });

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 🚨 UPGRADED: Added Interview Mode to System Instructions 🚨
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: `
            You are Nyay Sahayak, an Expert Indian Legal Assistant AI.
            Your role is to provide clear legal guidance under Indian law.
            
            INTERVIEW MODE: If the user requests a legal document draft, act as their personal lawyer taking notes. Ask them for the required details one single question at a time in a polite, conversational manner. Never ask for all details at once.
            
            Follow the mandatory structure for general advice: Short Answer, Relevant Law (Sections/Acts), Simple Explanation, and Practical Guidance.
            Disclaimer at the end of general advice: "I am an AI legal assistant. This information is for educational purposes only and not a substitute for professional legal advice."
        `
    });

    const chat = model.startChat({ history: history || [] });
    let msgParts = [question];

    if (req.file) {
        const filePart = {
            inlineData: {
                data: req.file.buffer.toString("base64"),
                mimeType: req.file.mimetype
            }
        };
        msgParts = [filePart, question];
    }

    const result = await chat.sendMessage(msgParts);
    const response = await result.response;
    const text = response.text();

    // ==========================================
    // DATABASE SAVING LOGIC
    // ==========================================
    let savedChatId = null;
    
    if (req.user && req.user.id) {
        const timestampUser = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const timestampAI = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (chatId && chatId !== 'null') {
            // Append to existing chat
            const chatRecord = await Chat.findById(chatId);
            if (chatRecord && chatRecord.userId.toString() === req.user.id) {
                chatRecord.messages.push({ id: Date.now().toString(), text: question, sender: 'user', timestamp: timestampUser });
                chatRecord.messages.push({ id: (Date.now() + 1).toString(), text: text, sender: 'ai', timestamp: timestampAI });
                await chatRecord.save();
                savedChatId = chatRecord._id;
            }
        } else {
            // Create new chat & generate title
            const title = question.length > 30 ? question.substring(0, 30) + '...' : question;
            const newChat = await Chat.create({
                userId: req.user.id,
                title: title,
                messages: [
                    { id: Date.now().toString(), text: question, sender: 'user', timestamp: timestampUser },
                    { id: (Date.now() + 1).toString(), text: text, sender: 'ai', timestamp: timestampAI }
                ]
            });
            savedChatId = newChat._id;
        }
    }

    res.json({ answer: text, chatId: savedChatId });

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ message: "AI Service Unavailable. Try again later." });
  }
};

// @desc    Get all chat history titles for the user
// @route   GET /api/ai/chats
const getUserChats = async (req, res) => {
    try {
        const chats = await Chat.find({ userId: req.user.id }).select('title updatedAt').sort({ updatedAt: -1 });
        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ message: "Failed to load chat history" });
    }
};

// @desc    Get a specific chat's messages
// @route   GET /api/ai/chats/:id
const getSingleChat = async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id);
        if (!chat || chat.userId.toString() !== req.user.id) {
            return res.status(404).json({ message: "Chat not found" });
        }
        res.status(200).json(chat);
    } catch (error) {
        res.status(500).json({ message: "Failed to load chat" });
    }
};

module.exports = { askAI, getUserChats, getSingleChat };