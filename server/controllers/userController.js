const User = require("../models/User");

// ================= GET ALL USERS =================

const getUsers = async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.userId },
    }).select("-password");

    res.status(200).json({
      users,
    });
  } catch (error) {
    console.error("GET USERS ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};


// ================= SEARCH USERS =================

const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    const users = await User.find({
      _id: { $ne: req.userId },

      $or: [
        {
          name: {
            $regex: query,
            $options: "i",
          },
        },
        {
          email: {
            $regex: query,
            $options: "i",
          },
        },
      ],
    }).select("-password");

    res.status(200).json({
      users,
    });
  } catch (error) {
    console.error("SEARCH USERS ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};


module.exports = {
  getUsers,
  searchUsers,
};