const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper: Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register User (Now handled in auth.js, kept here as a fallback)
// @route   POST /api/users/register
const registerUser = async (req, res) => {
    res.status(400).json({ message: "Registration is now handled via /api/auth/register" });
};

// @desc    Login User (Now handled in auth.js, kept here as a fallback)
// @route   POST /api/users/login
const loginUser = async (req, res) => {
    res.status(400).json({ message: "Login is now handled via /api/auth/login" });
};

// @desc    Get Current Profile
// @route   GET /api/users/me
const getMe = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'User not found (Check Auth Token)' });
        }

        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found in database' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("getMe Error:", error);
        res.status(500).json({ message: 'Server Error fetching profile' });
    }
};

// @desc    Update Profile (Saves KYC, QR Code Image & Details)
// @route   PUT /api/users/profile
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            // 1. Standard Fields
            user.name = req.body.name || user.name;
            if (req.body.phone !== undefined) user.phone = req.body.phone;
            if (req.body.address !== undefined) user.address = req.body.address;

            // 2. GLOBAL KYC VERIFICATION (Citizens & Lawyers)
            // If they upload a new ID, automatically set their status to pending for the Admin
            if (req.body.identityDocument !== undefined && req.body.identityDocument !== user.identityDocument) {
                user.identityDocument = req.body.identityDocument;
                user.identityStatus = 'pending'; 
            }

            // 3. LAWYER SPECIFIC FIELDS
            if (user.role === 'lawyer') {
                if (req.body.specialization !== undefined) user.specialization = req.body.specialization;
                if (req.body.experience !== undefined) user.experience = req.body.experience;
                
                // Bar Council Verification
                if (req.body.barNumber !== undefined) user.barNumber = req.body.barNumber;
                
                // 🚨 THE FIX: If they upload a new Bar Council Image, set status to pending for Admin review
                if (req.body.barCouncilImage !== undefined && req.body.barCouncilImage !== user.barCouncilImage) {
                    user.barCouncilImage = req.body.barCouncilImage;
                    user.lawyerStatus = 'pending'; 
                }
                
                // Payment Info
                if (req.body.paymentQrCode !== undefined) user.paymentQrCode = req.body.paymentQrCode;
                if (req.body.consultationFee !== undefined) {
                    user.consultationFee = req.body.consultationFee === "" ? 0 : Number(req.body.consultationFee);
                }
            }
            // Save all changes
            const updatedUser = await user.save();

            // Return the fresh flat object back to the frontend state
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                phone: updatedUser.phone,
                address: updatedUser.address,
                identityStatus: updatedUser.identityStatus,
                identityDocument: updatedUser.identityDocument,
                specialization: updatedUser.specialization,
                experience: updatedUser.experience,
                barNumber: updatedUser.barNumber,
                barCouncilImage: updatedUser.barCouncilImage,
                rating: updatedUser.rating,
                paymentQrCode: updatedUser.paymentQrCode,
                consultationFee: updatedUser.consultationFee,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("Profile Update Error:", error);
        res.status(500).json({ message: 'Server Error updating profile' });
    }
};

// @desc    Get Lawyers List (Public Search)
// @route   GET /api/users/lawyers
const getLawyers = async (req, res) => {
    try {
        // Only show lawyers who have had their Bar Council ID approved by the Admin
        const lawyers = await User.find({ 
            role: 'lawyer', 
            lawyerStatus: 'approved' 
        }).select('-password');
        
        res.json(lawyers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching lawyers' });
    }
};

module.exports = { registerUser, loginUser, getMe, getLawyers, updateUserProfile };