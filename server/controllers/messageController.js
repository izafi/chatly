const Message =
  require("../models/Message");

const Conversation =
  require("../models/Conversation");

const User =
  require("../models/User");


// =====================================================
// CHECK FRIENDSHIP
// =====================================================

const checkFriendship = async (
  userId,
  otherUserId
) => {
  const user =
    await User.findById(
      userId
    );

  if (!user) {
    return false;
  }

  return user.friends.some(
    (friendId) =>
      friendId.toString() ===
      otherUserId.toString()
  );
};


// =====================================================
// SEND MESSAGE
// =====================================================

const sendMessage = async (
  req,
  res
) => {
  try {
    const {
      conversationId,
      text,
    } = req.body;

    if (
      !conversationId ||
      !text?.trim()
    ) {
      return res.status(400).json({
        message:
          "Conversation ID and message are required",
      });
    }

    const conversation =
      await Conversation.findById(
        conversationId
      );

    if (!conversation) {
      return res.status(404).json({
        message:
          "Conversation not found",
      });
    }

    const isParticipant =
      conversation.participants.some(
        (participant) =>
          participant.toString() ===
          req.userId.toString()
      );

    if (!isParticipant) {
      return res.status(403).json({
        message:
          "You are not a participant",
      });
    }

    // Find other participant
    const otherParticipant =
      conversation.participants.find(
        (participant) =>
          participant.toString() !==
          req.userId.toString()
      );

    if (!otherParticipant) {
      return res.status(400).json({
        message:
          "Invalid conversation",
      });
    }

    // Check friendship
    const areFriends =
      await checkFriendship(
        req.userId,
        otherParticipant
      );

    if (!areFriends) {
      return res.status(403).json({
        message:
          "You can only message your friends",
      });
    }

    const message =
      await Message.create({
        conversation:
          conversationId,

        sender:
          req.userId,

        text:
          text.trim(),
      });

    await message.populate(
      "sender",
      "-password"
    );

    res.status(201).json({
      message,
    });
  } catch (error) {
    console.error(
      "SEND MESSAGE ERROR:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};


// =====================================================
// GET MESSAGES
// =====================================================

const getMessages = async (
  req,
  res
) => {
  try {
    const {
      conversationId,
    } = req.params;

    const conversation =
      await Conversation.findById(
        conversationId
      );

    if (!conversation) {
      return res.status(404).json({
        message:
          "Conversation not found",
      });
    }

    const isParticipant =
      conversation.participants.some(
        (participant) =>
          participant.toString() ===
          req.userId.toString()
      );

    if (!isParticipant) {
      return res.status(403).json({
        message:
          "You are not a participant",
      });
    }

    const otherParticipant =
      conversation.participants.find(
        (participant) =>
          participant.toString() !==
          req.userId.toString()
      );

    if (!otherParticipant) {
      return res.status(400).json({
        message:
          "Invalid conversation",
      });
    }

    // Check friendship
    const areFriends =
      await checkFriendship(
        req.userId,
        otherParticipant
      );

    if (!areFriends) {
      return res.status(403).json({
        message:
          "You can only access chats with your friends",
      });
    }

    const messages =
      await Message.find({
        conversation:
          conversationId,
      })
        .populate(
          "sender",
          "-password"
        )
        .sort({
          createdAt: 1,
        });

    res.status(200).json({
      messages,
    });
  } catch (error) {
    console.error(
      "GET MESSAGES ERROR:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};


module.exports = {
  sendMessage,
  getMessages,
};