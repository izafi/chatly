const User = require("../models/User");
const FriendRequest = require("../models/FriendRequest");


// =====================================================
// SEND FRIEND REQUEST
// =====================================================

const sendFriendRequest = async (
  req,
  res
) => {
  try {
    const senderId = req.userId;
    const receiverId = req.params.userId;

    if (
      senderId.toString() ===
      receiverId.toString()
    ) {
      return res.status(400).json({
        message:
          "You cannot add yourself",
      });
    }

    const receiver =
      await User.findById(
        receiverId
      );

    if (!receiver) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const sender =
      await User.findById(
        senderId
      );

    if (!sender) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Already friends
    const alreadyFriend =
      sender.friends.some(
        (friendId) =>
          friendId.toString() ===
          receiverId.toString()
      );

    if (alreadyFriend) {
      return res.status(400).json({
        message:
          "You are already friends",
      });
    }

    // Existing pending request
    const existingRequest =
      await FriendRequest.findOne({
        $or: [
          {
            sender: senderId,
            receiver: receiverId,
            status: "pending",
          },
          {
            sender: receiverId,
            receiver: senderId,
            status: "pending",
          },
        ],
      });

    if (existingRequest) {
      return res.status(400).json({
        message:
          "Friend request already exists",
      });
    }

    await FriendRequest.create({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });

    res.status(201).json({
      message:
        "Friend request sent",
    });
  } catch (error) {
    console.error(
      "SEND FRIEND REQUEST ERROR:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};


// =====================================================
// GET FRIEND REQUESTS
// =====================================================

const getFriendRequests = async (
  req,
  res
) => {
  try {
    const requests =
      await FriendRequest.find({
        receiver: req.userId,
        status: "pending",
      })
        .populate(
          "sender",
          "_id name username avatar bio isOnline lastSeen"
        )
        .sort({
          createdAt: -1,
        });

    res.status(200).json({
      requests,
    });
  } catch (error) {
    console.error(
      "GET FRIEND REQUESTS ERROR:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};


// =====================================================
// ACCEPT FRIEND REQUEST
// =====================================================

const acceptFriendRequest = async (
  req,
  res
) => {
  try {
    const request =
      await FriendRequest.findOne({
        _id: req.params.requestId,
        receiver: req.userId,
        status: "pending",
      });

    if (!request) {
      return res.status(404).json({
        message:
          "Friend request not found",
      });
    }

    const receiver =
      await User.findById(
        request.receiver
      );

    const sender =
      await User.findById(
        request.sender
      );

    if (!receiver || !sender) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

    // Add receiver -> sender
    const receiverAlreadyHasSender =
      receiver.friends.some(
        (friendId) =>
          friendId.toString() ===
          sender._id.toString()
      );

    if (
      !receiverAlreadyHasSender
    ) {
      receiver.friends.push(
        sender._id
      );
    }

    // Add sender -> receiver
    const senderAlreadyHasReceiver =
      sender.friends.some(
        (friendId) =>
          friendId.toString() ===
          receiver._id.toString()
      );

    if (
      !senderAlreadyHasReceiver
    ) {
      sender.friends.push(
        receiver._id
      );
    }

    request.status =
      "accepted";

    await receiver.save();
    await sender.save();
    await request.save();

    res.status(200).json({
      message:
        "Friend request accepted",
    });
  } catch (error) {
    console.error(
      "ACCEPT FRIEND REQUEST ERROR:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};


// =====================================================
// REJECT FRIEND REQUEST
// =====================================================

const rejectFriendRequest = async (
  req,
  res
) => {
  try {
    const request =
      await FriendRequest.findOne({
        _id: req.params.requestId,
        receiver: req.userId,
        status: "pending",
      });

    if (!request) {
      return res.status(404).json({
        message:
          "Friend request not found",
      });
    }

    request.status =
      "rejected";

    await request.save();

    res.status(200).json({
      message:
        "Friend request rejected",
    });
  } catch (error) {
    console.error(
      "REJECT FRIEND REQUEST ERROR:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};


// =====================================================
// GET MY FRIENDS
// =====================================================

const getFriends = async (
  req,
  res
) => {
  try {
    const user =
      await User.findById(
        req.userId
      ).populate(
        "friends",
        "_id name username email avatar bio isOnline lastSeen"
      );

    if (!user) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

    res.status(200).json({
      friends:
        user.friends || [],
    });
  } catch (error) {
    console.error(
      "GET FRIENDS ERROR:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};


// =====================================================
// UNFRIEND
// =====================================================

const unfriendUser = async (
  req,
  res
) => {
  try {
    const currentUserId =
      req.userId;

    const friendId =
      req.params.userId;

    if (
      currentUserId.toString() ===
      friendId.toString()
    ) {
      return res.status(400).json({
        message:
          "You cannot unfriend yourself",
      });
    }

    const currentUser =
      await User.findById(
        currentUserId
      );

    const friend =
      await User.findById(
        friendId
      );

    if (
      !currentUser ||
      !friend
    ) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

    // Check friendship
    const areFriends =
      currentUser.friends.some(
        (id) =>
          id.toString() ===
          friendId.toString()
      );

    if (!areFriends) {
      return res.status(400).json({
        message:
          "You are not friends",
      });
    }

    // Remove friend from current user
    currentUser.friends =
      currentUser.friends.filter(
        (id) =>
          id.toString() !==
          friendId.toString()
      );

    // Remove current user from other user
    friend.friends =
      friend.friends.filter(
        (id) =>
          id.toString() !==
          currentUserId.toString()
      );

    await currentUser.save();
    await friend.save();

    // Remove accepted request record
    await FriendRequest.deleteMany({
      $or: [
        {
          sender: currentUserId,
          receiver: friendId,
          status: "accepted",
        },
        {
          sender: friendId,
          receiver: currentUserId,
          status: "accepted",
        },
      ],
    });

    res.status(200).json({
      message:
        "Friend removed successfully",
    });
  } catch (error) {
    console.error(
      "UNFRIEND ERROR:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};


module.exports = {
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  unfriendUser,
};