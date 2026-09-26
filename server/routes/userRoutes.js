const express = require("express");

const {
  getUsers,
  searchUsers,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// Get all users
router.get(
  "/",
  authMiddleware,
  getUsers
);


// Search users
router.get(
  "/search",
  authMiddleware,
  searchUsers
);


module.exports = router;