const Conversation = require("../models/Conversation");
const User = require("../models/User");

// =====================================================
// CREATE OR GET CONVERSATION
// ONLY FRIENDS CAN CREATE/GET CONVERSATION
// =====================================================

const createOrGetConversation = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    if (
      currentUserId.toString() ===
      userId.toString()
    ) {
      return res.status(400).json({
        message: "You cannot chat with yourself",
      });
    }

    // =================================================
    // CHECK CURRENT USER
    // =================================================

    const currentUser =
      await User.findById(currentUserId);

    if (!currentUser) {
      return res.status(404).json({
        message: "Current user not found",
      });
    }

    // =================================================
    // CHECK FRIENDSHIP
    // =================================================

    const areFriends =
      currentUser.friends.some(
        (friendId) =>
          friendId.toString() ===
          userId.toString()
      );

    if (!areFriends) {
      return res.status(403).json({
        message:
          "You can only chat with your friends",
      });
    }

    // =================================================
    // CHECK TARGET USER
    // =================================================

    const targetUser =
      await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // =================================================
    // FIND EXISTING CONVERSATION
    // =================================================

    let conversation =
      await Conversation.findOne({
        participants: {
          $all: [
            currentUserId,
            userId,
          ],
        },
      }).populate(
        "participants",
        "-password"
      );

    // =================================================
    // CREATE IF NOT EXISTS
    // =================================================

    if (!conversation) {
      conversation =
        await Conversation.create({
          participants: [
            currentUserId,
            userId,
          ],
        });

      conversation =
        await conversation.populate(
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