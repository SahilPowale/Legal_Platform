const express = require('express');
const router = express.Router();

// 1. IMPORT CONTROLLERS (Only do this once!)
const { 
    registerUser, 
    loginUser, 
    getMe, 
    getLawyers, 
    updateUserProfile 
} = require('../controllers/userController');

// 2. IMPORT MIDDLEWARE
const { protect } = require('../middleware/authMiddleware');

// 3. DEFINE ROUTES
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);           // Get current user info
router.get('/lawyers', protect, getLawyers); // Get list of lawyers
router.put('/profile', protect, updateUserProfile); // Update profile

module.exports = router;