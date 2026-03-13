const router = require('express').Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken'); // 🚨 Added JWT import

// Middleware to check if user is Admin and verify token
const verifyAdmin = async (req, res, next) => {
  let token;

  // 1. Check if the token was sent in the headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Extract the token
      token = req.headers.authorization.split(' ')[1];

      // 3. Decode the token to get the user ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Find the user in the database and attach it to req.user
      req.user = await User.findById(decoded.id).select('-password');

      // 5. Finally, check if they are an admin
      if (req.user && req.user.role === 'admin') {
        next();
      } else {
        return res.status(403).json({ message: "Access Denied: Admins Only" });
      }
    } catch (err) {
      console.error("Admin Auth Error:", err);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  // If no token is found at all
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// ==========================================
// 1. LAWYER BAR COUNCIL VERIFICATIONS
// ==========================================

// GET ALL PENDING LAWYERS
router.get('/lawyers/pending', verifyAdmin, async (req, res) => {
  try {
    const lawyers = await User.find({ role: 'lawyer', lawyerStatus: 'pending' }).select('-password');
    res.json(lawyers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// APPROVE LAWYER
router.put('/lawyer/approve/:id', verifyAdmin, async (req, res) => {
  try {
    const lawyer = await User.findByIdAndUpdate(req.params.id, { lawyerStatus: 'approved' }, { new: true });
    res.json({ message: "Lawyer Approved Successfully", lawyer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// REJECT LAWYER
router.put('/lawyer/reject/:id', verifyAdmin, async (req, res) => {
  try {
    const lawyer = await User.findByIdAndUpdate(req.params.id, { lawyerStatus: 'rejected' }, { new: true });
    res.json({ message: "Lawyer Rejected", lawyer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 2. GLOBAL IDENTITY (KYC) VERIFICATIONS
// ==========================================

// GET ALL PENDING KYC USERS (Citizens & Lawyers)
router.get('/kyc/pending', verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({ identityStatus: 'pending' }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// APPROVE KYC
router.put('/kyc/approve/:id', verifyAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { identityStatus: 'verified' }, { new: true });
    res.json({ message: "Identity Verified Successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// REJECT KYC
router.put('/kyc/reject/:id', verifyAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { identityStatus: 'rejected' }, { new: true });
    res.json({ message: "Identity Verification Rejected", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;