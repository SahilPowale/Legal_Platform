const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['citizen', 'lawyer'], required: true },
  
  // Basic Profile
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  
  // Lawyer Details
  specialization: { type: String, default: "General" },
  experience: { type: Number, default: 0 },
  barNumber: { type: String, default: "" },
  
  // PAYMENT: Stores the base64 string of the QR Code image
  paymentQrCode: { type: String, default: "" }, 
  consultationFee: { type: Number, default: 500 }, 
  
  // Ratings
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);