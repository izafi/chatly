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

const onlineUsers = new Map();

// =========================
// Get Online Users
// =========================

const getOnlineUsers = () => {
  return Array.from(
    onlineUsers.keys()
  );
};

// =========================
// Socket Connection
// =========================

io.on("connection", (socket) => {
  console.log(
    "New socket connected:",
    socket.id
  );

  // =========================
  // USER ONLINE
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

    io.emit(
      "users:online",
      getOnlineUsers()
    );
  });

  // =========================
  // TYPING START
  // =========================

  socket.on(
    "typing:start",
    ({
      receiverId,
      senderId,
    }) => {
      if (
        !receiverId ||
        !senderId
      ) {
        return;
      }

      const receiverSocketId =
        onlineUsers.get(
          receiverId.toString()
        );

      if (receiverSocketId) {
        io.to(
          receiverSocketId
        ).emit(
          "typing:start",
          {
            senderId:
              senderId.toString(),
          }
        );
      }
    }
  );

  // =========================
  // TYPING STOP
  // =========================

  socket.on(
    "typing:stop",
    ({
      receiverId,
      senderId,
    }) => {
      if (
        !receiverId ||
        !senderId
      ) {
        return;
      }

      const receiverSocketId =
        onlineUsers.get(
          receiverId.toString()
        );

      if (receiverSocketId) {
        io.to(
          receiverSocketId
        ).emit(
          "typing:stop",
          {
            senderId:
              senderId.toString(),
          }
        );
      }
    }
  );

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

        if (
          !conversationId ||
          !senderId ||
          !receiverId ||
          !text?.trim()
        ) {
          return;
        }

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

        const message =
          await Message.create({
            conversation:
              conversationId,

            sender: senderId,

            text: text.trim(),
          });

        await message.populate(
          "sender",
          "-password"
        );

        console.log(
          "Message saved:",
          message.text
        );

        const receiverSocketId =
          onlineUsers.get(
            receiverId.toString()
          );

        if (receiverSocketId) {
          io.to(
            receiverSocketId
          ).emit(
            "message:receive",
            message
          );
        }

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
  // DISCONNECT
  // =========================

  socket.on("disconnect", () => {
    console.log(
      "Socket disconnected:",
      socket.id
    );

    let disconnectedUserId =
      null;

    for (
      const [userId, socketId]
      of onlineUsers.entries()
    ) {
      if (
        socketId === socket.id
      ) {
        disconnectedUserId =
          userId;

        onlineUsers.delete(
          userId
        );

        break;
      }
    }

    if (disconnectedUserId) {
      console.log(
        "User offline:",
        disconnectedUserId
      );

      io.emit(
        "users:online",
        getOnlineUsers()
      );
    }
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