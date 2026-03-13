const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// --- REGISTER ---
router.post("/register", async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields." });
    }

    // Check for existing Email
    let existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: "User with this email already exists." });

    // Check for existing Username
    let existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(400).json({ message: "This username is already taken." });

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate Verification Token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Create User
    const user = new User({
      name,
      username,
      email,
      password: hashedPassword,
      role: role || "citizen",
      verificationToken,
      isVerified: false,
      lawyerStatus: role === 'lawyer' ? 'pending' : undefined
    });

    await user.save();

    // Send Verification Email
    const link = `${process.env.CLIENT_URL || "http://localhost:5173"}/verify/${verificationToken}`;
    
    await sendEmail({
      email: user.email,
      subject: "Verify Your Legal Platform Account",
      message: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #2563eb;">Welcome to Digital Legal Platform!</h2>
        <p>Please verify your email address to activate your account.</p>
        <a href="${link}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
      </div>
      `
    });

    res.status(201).json({ message: "Registration successful! Please check your email to verify your account." });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// --- VERIFY EMAIL ---
router.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({ verificationToken: token });

    if (!user) return res.status(400).json({ message: "Invalid or expired verification link." });

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully. You can now login." });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// --- LOGIN ---
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: "Please verify your email to log in." });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "30d" });

    // Returns a flat object so Dashboard states work perfectly
    res.status(200).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      lawyerStatus: user.lawyerStatus,
      phone: user.phone || "",
      address: user.address || "",
      specialization: user.specialization || "",
      experience: user.experience || 0,
      barNumber: user.barNumber || "",
      barCouncilImage: user.barCouncilImage || "",
      paymentQrCode: user.paymentQrCode || "",
      consultationFee: user.consultationFee || 500,
      rating: user.rating || 0,
      token
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// --- FORGOT PASSWORD ---
router.post("/forgot-password", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "No account found with this email." });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    // Hash token and save to database
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 Minutes
    await user.save();

    // Send Email
    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${resetToken}`;
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Please click the button below to choose a new password. This link expires in 15 minutes.</p>
        <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
      `
    });

    res.status(200).json({ message: "Password reset link sent to your email." });
  } catch (error) {
    res.status(500).json({ message: "Error sending email." });
  }
});

// --- RESET PASSWORD ---
router.put("/reset-password/:token", async (req, res) => {
  try {
    // Hash token from URL to compare with database
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() } // Ensure token is not expired
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired reset token." });

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful! You can now log in." });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;