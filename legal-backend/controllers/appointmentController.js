const Appointment = require('../models/Appointment');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- MULTER CONFIGURATION (File Uploads) ---
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        // Unique filename: Timestamp-Random.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB Limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|pdf|doc|docx/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Only Images, PDFs, and Docs allowed!'));
    }
});

// --- CONTROLLER FUNCTIONS ---

// @desc    Book Appointment
const bookAppointment = async (req, res) => {
    try {
        const { lawyerId, date, slot, description } = req.body;
        // Status is 'pending' until lawyer verifies payment Txn ID
        const appointment = await Appointment.create({
            citizenId: req.user.id,
            lawyerId,
            date,
            slot,
            description,
            status: 'pending' 
        });
        res.status(201).json(appointment);
    } catch (error) {
        console.error("Booking Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Upload Document to Case
const uploadDocument = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: 'Case not found' });

        // Security: Only involved parties can upload
        if (appointment.citizenId.toString() !== req.user.id && appointment.lawyerId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        // Save file info to DB array
        const newDoc = {
            fileName: req.file.originalname,
            filePath: req.file.path, // e.g., "uploads/file.pdf"
            uploadedBy: req.user.id
        };

        appointment.documents.push(newDoc);
        await appointment.save();

        res.status(200).json(appointment);
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ message: 'Upload failed' });
    }
};

// @desc    Get Appointments
const getAppointments = async (req, res) => {
    try {
        const query = req.user.role === 'lawyer' ? { lawyerId: req.user.id } : { citizenId: req.user.id };
        const appointments = await Appointment.find(query)
            .populate('citizenId', 'name email phone')
            .populate('lawyerId', 'name specialization')
            .sort({ date: -1 });
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Fetch failed' });
    }
};

// @desc    Update Status (Accept/Reject/Complete/Cancel)
const updateStatus = async (req, res) => {
    try {
        const { status, remarks } = req.body;
        const appointment = await Appointment.findById(req.params.id);
        if(!appointment) return res.status(404).json({message: 'Not found'});

        const userId = req.user._id.toString();
        
        // Lawyer Permissions
        if (req.user.role === 'lawyer' && appointment.lawyerId.toString() === userId) {
            appointment.status = status;
            if(remarks) appointment.remarks = remarks;
        } 
        // Citizen Permissions
        else if (req.user.role === 'citizen' && appointment.citizenId.toString() === userId) {
            if (['cancelled', 'refund_requested'].includes(status)) appointment.status = status;
            else return res.status(403).json({message: 'Citizens can only cancel'});
        } else {
            return res.status(401).json({message: 'Not authorized'});
        }

        await appointment.save();
        res.status(200).json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Update failed' });
    }
};

// @desc    Add Review
const addReview = async (req, res) => {
    try {
        const { rating, review } = req.body;
        const appointment = await Appointment.findById(req.params.id);
        if(!appointment) return res.status(404).json({message: 'Not found'});
        if(appointment.status !== 'completed') return res.status(400).json({message: 'Case not completed'});

        appointment.rating = rating;
        appointment.review = review;
        await appointment.save();

        // Update Lawyer Average
        const lawyerId = appointment.lawyerId;
        const allReviews = await Appointment.find({ lawyerId: lawyerId, rating: { $gt: 0 } });
        const avgRating = allReviews.reduce((acc, item) => acc + item.rating, 0) / allReviews.length;
        await User.findByIdAndUpdate(lawyerId, { rating: avgRating.toFixed(1), ratingCount: allReviews.length });

        res.status(200).json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Review failed' });
    }
};

// Export Middleware & Functions
module.exports = { 
    bookAppointment, 
    getAppointments, 
    updateStatus, 
    addReview, 
    uploadDocument, 
    uploadMiddleware: upload.single('file') 
};