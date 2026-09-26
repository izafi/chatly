const Conversation = require("../models/Conversation");

// Create or get conversation
const createOrGetConversation = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    if (currentUserId.toString() === userId.toString()) {
      return res.status(400).json({
        message: "You cannot chat with yourself",
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: {
        $all: [currentUserId, userId],
      },
    }).populate(
      "participants",
      "-password"
    );

    // If conversation doesn't exist, create it
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [
          currentUserId,
          userId,
        ],
      });

      conversation = await conversation.populate(
        "participants",
        "-password"
      );
    }

    res.status(200).json({
      conversation,
    });
  } catch (error) {
    console.error(
      "CREATE CONVERSATION ERROR:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createOrGetConversation,
};