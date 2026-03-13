const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  // --- Auth Fields ---
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Email Verification Logic
  isVerified: { type: Boolean, default: false }, 
  verificationToken: { type: String },

  // Password Reset Logic
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },

  // --- Role & Profile ---
  role: { 
    type: String, 
    enum: ['citizen', 'lawyer', 'admin'], 
    default: 'citizen' 
  },
  
  // Lawyer Bar Council Verification Status
  lawyerStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },

  // NEW: Global Identity Verification (KYC) for ALL users
  identityStatus: {
    type: String,
    enum: ['unverified', 'pending', 'verified', 'rejected'],
    default: 'unverified'
  },
  identityDocument: { type: String, default: "" }, // Stores Aadhaar/PAN/DL image

  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  
  // --- Lawyer Specific Details ---
  specialization: { type: String, default: "General" },
  experience: { type: Number, default: 0 },
  barNumber: { type: String, default: "" }, 
  barCouncilImage: { type: String, default: "" }, 
  
  // PAYMENT
  paymentQrCode: { type: String, default: "" }, 
  consultationFee: { type: Number, default: 500 }, 
  
  // Ratings
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);