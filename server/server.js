const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");

// ==============================
// ROUTES
// ==============================

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const messageRoutes = require("./routes/messageRoutes");

// Agar friendRoutes file bana chuke ho
const friendRoutes = require("./routes/friendRoutes");

// ==============================
// MODELS
// ==============================

const User = require("./models/User");

// ==============================
// ENV CONFIG
// ==============================

dotenv.config();

// ==============================
// APP SETUP
// ==============================

const app = express();

const server = http.createServer(app);

// ==============================
// CORS
// ==============================

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// ==============================
// MIDDLEWARE
// ==============================

app.use(express.json({ limit: "10mb" }));

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());

// ==============================
// BASIC TEST ROUTE
// ==============================

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Chatly server is running 🚀",
  });
});

// ==============================
// API ROUTES
// ==============================

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

// Friend routes
app.use(
  "/api/friends",
  friendRoutes
);

// ==============================
// SOCKET.IO
// ==============================

const io = new Server(server, {
  cors: {
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173",

    credentials: true,
  },
});

// ==============================
// ONLINE USERS
// ==============================

// userId -> socketId
const onlineUsers = new Map();

// ==============================
// SOCKET CONNECTION
// ==============================

io.on("connection", (socket) => {
  console.log(
    "🔌 Socket connected:",
    socket.id
  );

  // ==========================================
  // USER ONLINE
  // ==========================================

  socket.on(
    "user:online",
    async (userId) => {
      try {
        if (!userId) {
          return;
        }

        const userIdString =
          userId.toString();

        // Save socket
        onlineUsers.set(
          userIdString,
          socket.id
        );

        // Update database
        await User.findByIdAndUpdate(
          userId,
          {
            isOnline: true,
            lastSeen: null,
          }
        );

        console.log(
          "🟢 User online:",
          userIdString
        );

        // Send all online users
        io.emit(
          "users:online",
          Array.from(
            onlineUsers.keys()
          )
        );
      } catch (error) {
        console.error(
          "USER ONLINE ERROR:",
          error
        );
      }
    }
  );

  // ==========================================
  // JOIN CONVERSATION ROOM
  // ==========================================

  socket.on(
    "conversation:join",
    (conversationId) => {
      if (!conversationId) {
        return;
      }

      socket.join(
        conversationId.toString()
      );

      console.log(
        `👥 Socket ${socket.id} joined conversation ${conversationId}`
      );
    }
  );

  // ==========================================
  // LEAVE CONVERSATION ROOM
  // ==========================================

  socket.on(
    "conversation:leave",
    (conversationId) => {
      if (!conversationId) {
        return;
      }

      socket.leave(
        conversationId.toString()
      );

      console.log(
        `🚪 Socket ${socket.id} left conversation ${conversationId}`
      );
    }
  );

  // ==========================================
  // TYPING START
  // ==========================================

  socket.on(
    "typing:start",
    ({
      conversationId,
      userId,
    }) => {
      if (
        !conversationId ||
        !userId
      ) {
        return;
      }

      socket
        .to(conversationId.toString())
        .emit("typing:start", {
          userId: userId.toString(),
        });
    }
  );

  // ==========================================
  // TYPING STOP
  // ==========================================

  socket.on(
    "typing:stop",
    ({
      conversationId,
      userId,
    }) => {
      if (
        !conversationId ||
        !userId
      ) {
        return;
      }

      socket
        .to(conversationId.toString())
        .emit("typing:stop", {
          userId: userId.toString(),
        });
    }
  );

  // ==========================================
  // REAL-TIME MESSAGE
  // ==========================================

  socket.on(
    "message:send",
    ({
      conversationId,
      message,
    }) => {
      if (
        !conversationId ||
        !message
      ) {
        return;
      }

      console.log(
        "💬 New socket message:",
        conversationId
      );

      socket
        .to(conversationId.toString())
        .emit(
          "message:receive",
          message
        );
    }
  );

  // ==========================================
  // USER DISCONNECT
  // ==========================================

  socket.on(
    "disconnect",
    async () => {
      try {
        console.log(
          "🔴 Socket disconnected:",
          socket.id
        );

        // Find user from socket ID
        let disconnectedUserId = null;

        for (const [
          userId,
          socketId,
        ] of onlineUsers.entries()) {
          if (
            socketId === socket.id
          ) {
            disconnectedUserId =
              userId;

            break;
          }
        }

        // Remove from online users
        if (disconnectedUserId) {
          onlineUsers.delete(
            disconnectedUserId
          );

          // Update database
          await User.findByIdAndUpdate(
            disconnectedUserId,
            {
              isOnline: false,
              lastSeen: new Date(),
            }
          );

          console.log(
            "🔴 User offline:",
            disconnectedUserId
          );
        }

        // Update everyone
        io.emit(
          "users:online",
          Array.from(
            onlineUsers.keys()
          )
        );
      } catch (error) {
        console.error(
          "DISCONNECT ERROR:",
          error
        );
      }
    }
  );
});

// ==============================
// SOCKET.IO ERROR HANDLING
// ==============================

io.engine.on(
  "connection_error",
  (error) => {
    console.error(
      "❌ Socket.IO connection error:",
      error.message
    );
  }
);

// ==============================
// MONGODB CONNECTION
// ==============================

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "🟢 MongoDB connected successfully"
    );
  } catch (error) {
    console.error(
      "❌ MongoDB connection failed:",
      error.message
    );

    process.exit(1);
  }
};

// ==============================
// SERVER START
// ==============================

const PORT =
  process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  server.listen(
    PORT,
    () => {
      console.log(
        `🚀 Chatly server running on http://localhost:${PORT}`
      );

      console.log(
        `🌐 Client: ${process.env.CLIENT_URL || "http://localhost:5173"}`
      );
    }
  );
};

startServer();