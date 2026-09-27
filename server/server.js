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

// ==========================================
// DATABASE
// ==========================================

connectDB();

// ==========================================
// MIDDLEWARE
// ==========================================

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

// ==========================================
// API ROUTES
// ==========================================

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

// ==========================================
// TEST ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.json({
    message: "Chatly API is running 🚀",
  });
});

// ==========================================
// HTTP SERVER
// ==========================================

const server = http.createServer(app);

// ==========================================
// SOCKET.IO
// ==========================================

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// ==========================================
// ONLINE USERS
// ==========================================

const onlineUsers = new Map();

// userId => socketId

const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};

// ==========================================
// SOCKET CONNECTION
// ==========================================

io.on("connection", (socket) => {
  console.log(
    "🟢 New socket connected:",
    socket.id
  );

  // ========================================
  // USER ONLINE
  // ========================================

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
      "👤 User online:",
      userIdString
    );

    console.log(
      "🟢 Online users:",
      getOnlineUsers()
    );

    io.emit(
      "users:online",
      getOnlineUsers()
    );
  });

  // ========================================
  // TYPING START
  // ========================================

  socket.on(
    "typing:start",
    ({
      conversationId,
      senderId,
      receiverId,
    }) => {
      console.log(
        "⌨️ typing:start received:",
        {
          conversationId,
          senderId,
          receiverId,
        }
      );

      if (
        !conversationId ||
        !senderId ||
        !receiverId
      ) {
        console.log(
          "❌ Missing typing data"
        );

        return;
      }

      const receiverSocketId =
        onlineUsers.get(
          receiverId.toString()
        );

      console.log(
        "Receiver socket:",
        receiverSocketId
      );

      if (!receiverSocketId) {
        console.log(
          "❌ Receiver is offline"
        );

        return;
      }

      io.to(
        receiverSocketId
      ).emit(
        "typing:start",
        {
          conversationId:
            conversationId.toString(),

          senderId:
            senderId.toString(),
        }
      );

      console.log(
        "✅ typing:start sent"
      );
    }
  );

  // ========================================
  // TYPING STOP
  // ========================================

  socket.on(
    "typing:stop",
    ({
      conversationId,
      senderId,
      receiverId,
    }) => {
      console.log(
        "⌨️ typing:stop received:",
        {
          conversationId,
          senderId,
          receiverId,
        }
      );

      if (
        !conversationId ||
        !senderId ||
        !receiverId
      ) {
        return;
      }

      const receiverSocketId =
        onlineUsers.get(
          receiverId.toString()
        );

      if (!receiverSocketId) {
        return;
      }

      io.to(
        receiverSocketId
      ).emit(
        "typing:stop",
        {
          conversationId:
            conversationId.toString(),

          senderId:
            senderId.toString(),
        }
      );

      console.log(
        "✅ typing:stop sent"
      );
    }
  );

  // ========================================
  // SEND MESSAGE
  // ========================================

  socket.on(
    "message:send",
    async (data) => {
      try {
        const {
          conversationId,
          senderId,
          receiverId,
          text,
        } = data;

        if (
          !conversationId ||
          !senderId ||
          !receiverId ||
          !text?.trim()
        ) {
          return;
        }

        // ------------------------------------
        // Find conversation
        // ------------------------------------

        const conversation =
          await Conversation.findById(
            conversationId
          );

        if (!conversation) {
          console.log(
            "❌ Conversation not found"
          );

          return;
        }

        // ------------------------------------
        // Check sender participant
        // ------------------------------------

        const isParticipant =
          conversation.participants.some(
            (participant) =>
              participant.toString() ===
              senderId.toString()
          );

        if (!isParticipant) {
          console.log(
            "❌ Sender is not participant"
          );

          return;
        }

        // ------------------------------------
        // Save message
        // ------------------------------------

        const message =
          await Message.create({
            conversation:
              conversationId,

            sender: senderId,

            text: text.trim(),
          });

        // ------------------------------------
        // Populate sender
        // ------------------------------------

        await message.populate(
          "sender",
          "-password"
        );

        console.log(
          "💬 Message saved:",
          message.text
        );

        // ------------------------------------
        // Receiver socket
        // ------------------------------------

        const receiverSocketId =
          onlineUsers.get(
            receiverId.toString()
          );

        // ------------------------------------
        // Send to receiver
        // ------------------------------------

        if (receiverSocketId) {
          io.to(
            receiverSocketId
          ).emit(
            "message:receive",
            message
          );
        }

        // ------------------------------------
        // Send back to sender
        // ------------------------------------

        socket.emit(
          "message:sent",
          message
        );
      } catch (error) {
        console.error(
          "❌ SOCKET MESSAGE ERROR:",
          error
        );
      }
    }
  );

  // ========================================
  // DISCONNECT
  // ========================================

  socket.on("disconnect", () => {
    console.log(
      "🔴 Socket disconnected:",
      socket.id
    );

    let disconnectedUserId =
      null;

    for (
      const [userId, socketId] of
      onlineUsers.entries()
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
        "🔴 User offline:",
        disconnectedUserId
      );

      io.emit(
        "users:online",
        getOnlineUsers()
      );
    }

    console.log(
      "🟢 Online users:",
      getOnlineUsers()
    );
  });
});

// ==========================================
// START SERVER
// ==========================================

const PORT =
  process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT}`
  );
});