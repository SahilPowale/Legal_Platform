const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// @desc    Register
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ message: 'Fill all fields' });

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email, password: hashedPassword, role });

    if (user) res.status(201).json({ 
        _id: user.id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) 
    });
    else res.status(400).json({ message: 'Invalid data' });
};

// @desc    Login
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user.id, name: user.name, email: user.email, role: user.role,
            phone: user.phone || "", address: user.address || "",
            specialization: user.specialization || "", experience: user.experience || 0,
            barNumber: user.barNumber || "",
            // Send Payment Data
            paymentQrCode: user.paymentQrCode || "", 
            consultationFee: user.consultationFee || 500,
            rating: user.rating || 0,
            token: generateToken(user._id)
        });
    } else {
        res.status(400).json({ message: 'Invalid credentials' });
    }
};

// @desc    Get Current Profile
const getMe = async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json(user);
};

// @desc    Update Profile (Saves QR Code Image)
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            user.name = req.body.name || user.name;
            if (req.body.phone !== undefined) user.phone = req.body.phone;
            if (req.body.address !== undefined) user.address = req.body.address;
            
            if (user.role === 'lawyer') {
                if (req.body.specialization !== undefined) user.specialization = req.body.specialization;
                if (req.body.experience !== undefined) user.experience = req.body.experience;
                if (req.body.barNumber !== undefined) user.barNumber = req.body.barNumber;
                
                // SAVE IMAGE STRING
                if (req.body.paymentQrCode !== undefined) user.paymentQrCode = req.body.paymentQrCode;
                
                if (req.body.consultationFee !== undefined) {
                    user.consultationFee = req.body.consultationFee === "" ? 0 : Number(req.body.consultationFee);
                }
            }
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role,
                phone: updatedUser.phone, address: updatedUser.address,
                specialization: updatedUser.specialization, experience: updatedUser.experience,
                barNumber: updatedUser.barNumber, rating: updatedUser.rating,
                paymentQrCode: updatedUser.paymentQrCode, 
                consultationFee: updatedUser.consultationFee,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Lawyers List
const getLawyers = async (req, res) => {
    const lawyers = await User.find({ role: 'lawyer' }).select('-password');
    res.json(lawyers);
};

module.exports = { registerUser, loginUser, getMe, getLawyers, updateUserProfile };