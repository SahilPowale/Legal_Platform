const router = require('express').Router();
const { sendMessage, getMessages, deleteChatHistory } = require('../controllers/chatController');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Robust Middleware to verify token and attach user ID safely
const verifyUser = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            return next();
        } catch (err) {
            console.error("Token verification failed:", err);
            return res.status(401).json({ message: "Not authorized, token failed" });
        }
    }
    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }
};

// 🚨 FIXED: URL parameters now strictly use :appointmentId
router.post('/', verifyUser, sendMessage);
router.get('/:appointmentId', verifyUser, getMessages);
router.delete('/:appointmentId', verifyUser, deleteChatHistory); // Added missing self-destruct route

module.exports = router;