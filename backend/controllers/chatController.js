const Message = require('../models/Message');

// @desc    Send a message
// @route   POST /api/chat
const sendMessage = async (req, res) => {
    try {
        const { appointmentId, receiverId, text } = req.body;
        // Safely extract sender ID whether it is stored as _id or id
        const senderId = req.user._id || req.user.id; 

        if (!appointmentId || !receiverId || !text) {
            console.error("Chat Error: Missing fields", { appointmentId, receiverId, text });
            return res.status(400).json({ message: "Missing required chat data" });
        }

        const newMessage = await Message.create({
            appointmentId,
            sender: senderId,
            receiver: receiverId,
            text: text
        });

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Save Message Error:", error);
        res.status(500).json({ message: "Server Error sending message", error: error.message });
    }
};

// @desc    Get chat history for a specific case
// @route   GET /api/chat/:appointmentId
const getMessages = async (req, res) => {
    try {
        const messages = await Message.find({ appointmentId: req.params.appointmentId }).sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (error) {
        console.error("Fetch Messages Error:", error);
        res.status(500).json({ message: "Server Error fetching chat history" });
    }
};

// @desc    Delete all messages when case ends (PRIVACY FEATURE)
// @route   DELETE /api/chat/:appointmentId
const deleteChatHistory = async (req, res) => {
    try {
        await Message.deleteMany({ appointmentId: req.params.appointmentId });
        res.status(200).json({ message: "Chat history wiped for privacy." });
    } catch (error) {
        console.error("Delete Chat Error:", error);
        res.status(500).json({ message: "Error deleting chat history" });
    }
};

module.exports = { sendMessage, getMessages, deleteChatHistory };