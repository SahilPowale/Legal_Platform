const mongoose = require('mongoose');

const appointmentSchema = mongoose.Schema({
    citizenId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    lawyerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    date: { type: String, required: true },
    slot: { type: String, required: true },
    description: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled', 'refund_requested'], 
        default: 'pending' 
    },
    // --- NEW: Document Storage ---
    documents: [{
        fileName: String,
        filePath: String, // e.g., "uploads/file-123.pdf"
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        uploadedAt: { type: Date, default: Date.now }
    }],
    // -----------------------------
    rating: { type: Number, default: 0 },
    review: { type: String, default: "" },
    remarks: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);