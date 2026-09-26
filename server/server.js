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

const Message = require("./models/Message");
const Conversation = require("./models/Conversation");

const app = express();

// =========================
// Database
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
// Routes
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
// HTTP Server
// =========================

const server = http.createServer(app);

// =========================
// Socket.IO
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
  // User Online
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
  // REAL-TIME SEND MESSAGE
  // =========================

  socket.on(
    "message:send",
    async (data) => {
      try {
        const {
          conversationId,
          senderId,
          text,
          receiverId,
        } = data;

        // =========================
        // Validation
        // =========================

        if (
          !conversationId ||
          !senderId ||
          !receiverId ||
          !text?.trim()
        ) {
          return;
        }

        // =========================
        // Check Conversation
        // =========================

        const conversation =
          await Conversation.findById(
            conversationId
          );

        if (!conversation) {
          console.log(
            "Conversation not found"
          );

          return;
        }

        // =========================
        // Check Sender
        // =========================

        const isParticipant =
          conversation.participants.some(
            (participant) =>
              participant.toString() ===
              senderId.toString()
          );

        if (!isParticipant) {
          console.log(
            "Sender is not participant"
          );

          return;
        }

        // =========================
        // Save Message
        // =========================

        const message =
          await Message.create({
            conversation:
              conversationId,

            sender: senderId,

            text: text.trim(),
          });

        // =========================
        // Populate Sender
        // =========================

        await message.populate(
          "sender",
          "-password"
        );

        console.log(
          "Message saved:",
          message.text
        );

        // =========================
        // Get Receiver Socket
        // =========================

        const receiverSocketId =
          onlineUsers.get(
            receiverId.toString()
          );

        // =========================
        // Send To Receiver
        // =========================

        if (receiverSocketId) {
          io.to(
            receiverSocketId
          ).emit(
            "message:receive",
            message
          );

          console.log(
            "Message sent to receiver"
          );
        }

        // =========================
        // Send Back To Sender
        // =========================

        socket.emit(
          "message:sent",
          message
        );
      } catch (error) {
        console.error(
          "SOCKET MESSAGE ERROR:",
          error
        );
      }
    }
  );

  // =========================
  // Disconnect
  // =========================

  socket.on("disconnect", () => {
    console.log(
      "Socket disconnected:",
      socket.id
    );

    // Find user
    for (
      const [userId, socketId]
      of onlineUsers.entries()
    ) {
      if (
        socketId === socket.id
      ) {
        onlineUsers.delete(
          userId
        );

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