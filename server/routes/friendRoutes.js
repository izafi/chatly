const express = require("express");

const {
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  unfriendUser,
} = require("../controllers/friendController");

const protect =
  require("../middleware/authMiddleware");

const router =
  express.Router();


// Send friend request
router.post(
  "/request/:userId",
  protect,
  sendFriendRequest
);


// Get incoming requests
router.get(
  "/requests",
  protect,
  getFriendRequests
);


// Accept
router.put(
  "/request/:requestId/accept",
  protect,
  acceptFriendRequest
);


// Reject
router.put(
  "/request/:requestId/reject",
  protect,
  rejectFriendRequest
);


// Get friends
router.get(
  "/",
  protect,
  getFriends
);


// Unfriend
router.delete(
  "/:userId",
  protect,
  unfriendUser
);


module.exports = router;