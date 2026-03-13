const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
// 🚨 NEW: Import HTTP and Socket.io for WebRTC Signaling
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

// Initialize the Express application
const app = express();

// 🚨 NEW: Create an HTTP server so Socket.io can attach to it
const server = http.createServer(app);

// ==========================================
// 1. ENVIRONMENT VALIDATION
// ==========================================
if (!process.env.MONGO_URI) {
  console.error("❌ CRITICAL ERROR: MONGO_URI is missing in the environment variables or .env file");
  process.exit(1);
}

// ==========================================
// 2. GLOBAL MIDDLEWARE CONFIGURATION
// ==========================================
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, 
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==========================================
// 3. API ROUTING
// ==========================================
app.use("/api/auth", require("./routes/auth"));                 
app.use("/api/admin", require("./routes/adminRoutes"));         
app.use("/api/users", require("./routes/userRoutes"));          
app.use("/api/appointments", require("./routes/appointmentRoutes")); 
app.use("/api/ai", require("./routes/aiRoutes"));               
app.use("/api/chat", require("./routes/chatRoutes"));           

app.get("/", (req, res) => {
  res.status(200).send("Digital Legal Platform API is Running Successfully!");
});

// ==========================================
// 4. WEBRTC SIGNALING SERVER (SOCKET.IO)
// ==========================================
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log(`🔌 New WebRTC Connection: ${socket.id}`);

  // When a user joins the consultation room
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    console.log(`User ${userId} joined room ${roomId}`);
    
    // Tell the other person in the room that someone just connected
    socket.to(roomId).emit("user-connected", userId);

    // Relaying the WebRTC Offer
    socket.on("offer", (offer) => {
      socket.to(roomId).emit("offer", offer);
    });

    // Relaying the WebRTC Answer
    socket.on("answer", (answer) => {
      socket.to(roomId).emit("answer", answer);
    });

    // Relaying Network Routing Info (ICE Candidates)
    socket.on("ice-candidate", (candidate) => {
      socket.to(roomId).emit("ice-candidate", candidate);
    });

    // Handle Disconnects
    socket.on("disconnect", () => {
      console.log(`WebRTC Disconnected: ${socket.id}`);
      socket.to(roomId).emit("user-disconnected", userId);
    });
  });
});

// ==========================================
// 5. MONGODB CLOUD DATABASE CONNECTION
// ==========================================
mongoose.connection.on("error", (err) => console.error("❌ MongoDB Runtime Error:", err.message));
mongoose.connection.on("disconnected", () => console.warn("⚠️ MongoDB Disconnected"));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Initial Connection Error:", err.message));

// ==========================================
// 6. SERVER EXECUTION 
// ==========================================
// 🚨 CRITICAL FIX: We must use server.listen() instead of app.listen() to power WebSockets
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Server + WebRTC Signaling running locally on port ${PORT}`);
  });
}

// Export the HTTP server directly for deployment compatibility
module.exports = server;