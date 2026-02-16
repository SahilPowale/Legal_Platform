const express = require('express');
const router = express.Router();
const { 
    bookAppointment, 
    getAppointments, 
    updateStatus, 
    addReview,
    uploadDocument,
    uploadMiddleware
} = require('../controllers/appointmentController');

const { protect } = require('../middleware/authMiddleware');

// Booking & Listing
router.post('/', protect, bookAppointment); 
router.get('/', protect, getAppointments);

// Management
router.put('/:id', protect, updateStatus);
router.post('/:id/review', protect, addReview); 

// File Upload Route
router.post('/:id/upload', protect, uploadMiddleware, uploadDocument);

module.exports = router;