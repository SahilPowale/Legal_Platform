const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path"); // Needed for file serving
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

app.use(cors());

// IMPORTANT: Increase limit for Profile QR Code (Base64)
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// NEW: Serve Uploaded Documents Publicly
// Allows accessing files at http://localhost:5000/uploads/filename.pdf
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/users", userRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => res.send("Legal Platform API Running"));

// Connect to MongoDB (Atlas)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));