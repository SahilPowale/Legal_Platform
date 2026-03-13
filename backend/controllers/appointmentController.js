const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Message = require('../models/Message'); // 🚨 NEW: Imported Message Model
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import the email utility
const sendEmail = require('../utils/sendEmail');

// --- MULTER CONFIGURATION (File Uploads) ---
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|pdf|doc|docx/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Only Images, PDFs, and Docs allowed!'));
    }
});

// --- CONTROLLER FUNCTIONS ---

const bookAppointment = async (req, res) => {
    try {
        const { lawyerId, date, slot, description, kycDocument } = req.body;
        
        const appointment = await Appointment.create({
            citizenId: req.user.id,
            lawyerId,
            date,
            slot,
            description,
            kycDocument: kycDocument || "", 
            status: 'pending' 
        });

        const lawyer = await User.findById(lawyerId);
        const citizen = await User.findById(req.user.id);

        if (lawyer && citizen) {
            const emailMessage = `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2 style="color: #2563eb;">New Consultation Request ⚖️</h2>
                    <p>Hello Adv. ${lawyer.name},</p>
                    <p>You have a new consultation request from <strong>${citizen.name}</strong>.</p>
                    <ul>
                        <li><strong>Date:</strong> ${date}</li>
                        <li><strong>Time:</strong> ${slot}</li>
                    </ul>
                    <p>Please log in to your dashboard to review the case details, verify their transaction ID, and check any attached KYC documents.</p>
                    <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/login" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Request</a>
                </div>
            `;
            await sendEmail({ 
                email: lawyer.email, 
                subject: "New Consultation Request - Digital Legal Platform", 
                message: emailMessage 
            });
        }

        res.status(201).json(appointment);
    } catch (error) {
        console.error("Booking Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const uploadDocument = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: 'Case not found' });

        if (appointment.citizenId.toString() !== req.user.id && appointment.lawyerId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const newDoc = {
            fileName: req.file.originalname,
            filePath: req.file.path, 
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

const updateStatus = async (req, res) => {
    try {
        const { status, remarks } = req.body;
        const appointment = await Appointment.findById(req.params.id);
        if(!appointment) return res.status(404).json({message: 'Not found'});

        const userId = req.user._id.toString();
        
        if (req.user.role === 'lawyer' && appointment.lawyerId.toString() === userId) {
            appointment.status = status;
            if(remarks) appointment.remarks = remarks;
        } 
        else if (req.user.role === 'citizen' && appointment.citizenId.toString() === userId) {
            if (['cancelled', 'refund_requested'].includes(status)) appointment.status = status;
            else return res.status(403).json({message: 'Citizens can only cancel'});
        } else {
            return res.status(401).json({message: 'Not authorized'});
        }

        await appointment.save();

        // 🚨 NEW: PRIVACY SELF-DESTRUCT TRIGGER 🚨
        if (['completed', 'cancelled'].includes(status)) {
            try {
                await Message.deleteMany({ appointmentId: appointment._id });
                console.log(`Chat history wiped for closed appointment ${appointment._id}`);
            } catch (chatError) {
                console.error("Failed to wipe chat history:", chatError);
            }
        }

        // --- SEND ALERT EMAIL TO CITIZEN ---
        const populatedAppt = await Appointment.findById(req.params.id)
            .populate('citizenId', 'name email')
            .populate('lawyerId', 'name');

        if (populatedAppt && populatedAppt.citizenId) {
            const citizenEmail = populatedAppt.citizenId.email;
            let emailSubject = "Update on your Consultation Request";
            let emailMessage = `<p>Hello ${populatedAppt.citizenId.name},</p>`;

            if (status === 'accepted') {
                emailSubject = "Consultation Request Accepted! 🎉";
                emailMessage += `
                    <p>Great news! Adv. <strong>${populatedAppt.lawyerId.name}</strong> has <strong>accepted</strong> your case request.</p>
                    <ul>
                        <li><strong>Date:</strong> ${populatedAppt.date}</li>
                        <li><strong>Time:</strong> ${populatedAppt.slot}</li>
                    </ul>
                    <p>Please log in to your dashboard at the scheduled time to join your video consultation.</p>
                `;
            } else if (status === 'rejected') {
                emailSubject = "Consultation Request Update";
                emailMessage += `
                    <p>Update on your case: Adv. <strong>${populatedAppt.lawyerId.name}</strong> was unable to accept your booking request.</p>
                    ${remarks ? `<p><strong>Reason provided:</strong> ${remarks}</p>` : ''}
                    <p>Any payments made will be refunded shortly. You can browse the platform to find another lawyer.</p>
                `;
            } else if (status === 'completed') {
                emailSubject = "Consultation Completed - Please Leave a Review";
                emailMessage += `
                    <p>Your consultation with Adv. <strong>${populatedAppt.lawyerId.name}</strong> has been marked as completed.</p>
                    <p>We hope the session was helpful! Please log in to your dashboard to rate your experience.</p>
                `;
            }

            if (['accepted', 'rejected', 'completed'].includes(status)) {
                await sendEmail({ 
                    email: citizenEmail, 
                    subject: emailSubject, 
                    message: `<div style="font-family: Arial, sans-serif; color: #333;">${emailMessage}</div>` 
                });
            }
        }

        res.status(200).json(appointment);
    } catch (error) {
        console.error("Status Update Error:", error);
        res.status(500).json({ message: 'Update failed' });
    }
};

const addReview = async (req, res) => {
    try {
        const { rating, review } = req.body;
        const appointment = await Appointment.findById(req.params.id);
        if(!appointment) return res.status(404).json({message: 'Not found'});
        if(appointment.status !== 'completed') return res.status(400).json({message: 'Case not completed'});

        appointment.rating = rating;
        appointment.review = review;
        await appointment.save();

        const lawyerId = appointment.lawyerId;
        const allReviews = await Appointment.find({ lawyerId: lawyerId, rating: { $gt: 0 } });
        const avgRating = allReviews.reduce((acc, item) => acc + item.rating, 0) / allReviews.length;
        await User.findByIdAndUpdate(lawyerId, { rating: avgRating.toFixed(1), ratingCount: allReviews.length });

        res.status(200).json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Review failed' });
    }
};

module.exports = { 
    bookAppointment, 
    getAppointments, 
    updateStatus, 
    addReview, 
    uploadDocument, 
    uploadMiddleware: upload.single('file') 
};