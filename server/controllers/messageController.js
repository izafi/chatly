const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

// Send message
const sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;

    if (!conversationId || !text) {
      return res.status(400).json({
        message: "Conversation ID and message are required",
      });
    }

    // Check conversation
    const conversation = await Conversation.findById(
      conversationId
    );

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    // Check if current user belongs to conversation
    const isParticipant =
      conversation.participants.some(
        (participant) =>
          participant.toString() ===
          req.userId.toString()
      );

    if (!isParticipant) {
      return res.status(403).json({
        message: "You are not a participant",
      });
    }

    // Create message
    const message = await Message.create({
      conversation: conversationId,
      sender: req.userId,
      text,
    });

    // Populate sender
    await message.populate(
      "sender",
      "-password"
    );

    res.status(201).json({
      message,
    });
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};


// Get messages
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Check conversation
    const conversation = await Conversation.findById(
      conversationId
    );

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    // Check participant
    const isParticipant =
      conversation.participants.some(
        (participant) =>
          participant.toString() ===
          req.userId.toString()
      );

    if (!isParticipant) {
      return res.status(403).json({
        message: "You are not a participant",
      });
    }

    const messages = await Message.find({
      conversation: conversationId,
    })
      .populate("sender", "-password")
      .sort({ createdAt: 1 });

    res.status(200).json({
      messages,
    });
  } catch (error) {
    console.error("GET MESSAGES ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};


module.exports = {
  sendMessage,
  getMessages,
};