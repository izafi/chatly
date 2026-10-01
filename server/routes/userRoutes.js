const express = require("express");

const {
  getUsers,
  searchUsers,
  getMyProfile,
  updateProfile,
} = require("../controllers/userController");

const protect =
  require("../middleware/authMiddleware");

const router =
  express.Router();


// All users
router.get(
  "/",
  protect,
  getUsers
);


// Search users
router.get(
  "/search",
  protect,
  searchUsers
);


// My profile
router.get(
  "/profile",
  protect,
  getMyProfile
);


// Update profile
router.put(
  "/profile",
  protect,
  updateProfile
);


module.exports = router;