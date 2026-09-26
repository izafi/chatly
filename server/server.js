const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");

require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();

// =========================
// Database Connection
// =========================

connectDB();

// =========================
// Middleware
// =========================

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());

// =========================
// API Routes
// =========================

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use(
  "/api/conversations",
  conversationRoutes
);

app.use(
  "/api/messages",
  messageRoutes
);

// =========================
// Test Route
// =========================

app.get("/", (req, res) => {
  res.json({
    message: "Chatly API is running 🚀",
  });
});

// =========================
// Create HTTP Server
// =========================

const server = http.createServer(app);

// =========================
// Socket.IO Server
// =========================

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// =========================
// Online Users
// =========================

// User ID -> Socket ID

const onlineUsers = new Map();

// =========================
// Socket Connection
// =========================

io.on("connection", (socket) => {
  console.log(
    "New socket connected:",
    socket.id
  );

  // =========================
  // User Goes Online
  // =========================

  socket.on("user:online", (userId) => {
    if (!userId) {
      return;
    }

    const userIdString =
      userId.toString();

    onlineUsers.set(
      userIdString,
      socket.id
    );

    console.log(
      "User online:",
      userIdString
    );

    console.log(
      "Online users:",
      onlineUsers
    );
  });

  // =========================
  // User Disconnects
  // =========================

  socket.on("disconnect", () => {
    console.log(
      "Socket disconnected:",
      socket.id
    );

    // Find the user belonging
    // to this socket
    for (
      const [userId, socketId]
      of onlineUsers.entries()
    ) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);

        console.log(
          "User offline:",
          userId
        );

        break;
      }
    }

    console.log(
      "Online users:",
      onlineUsers
    );
  });
});

// =========================
// Start Server
// =========================

const PORT =
  process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});