const User = require("../models/User");


// =====================================================
// GET ALL USERS
// =====================================================

const getUsers = async (req, res) => {
  try {
    const users = await User.find({
      _id: {
        $ne: req.userId,
      },
    })
      .select(
        "_id name username email avatar bio isOnline lastSeen"
      )
      .sort({
        name: 1,
      });

    res.status(200).json({
      users,
    });
  } catch (error) {
    console.error(
      "GET USERS ERROR:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};


// =====================================================
// SEARCH USERS
// =====================================================

const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query?.trim()) {
      return res.status(400).json({
        message:
          "Search query is required",
      });
    }

    const searchQuery =
      query.trim();

    const users = await User.find({
      _id: {
        $ne: req.userId,
      },

      $or: [
        {
          name: {
            $regex: searchQuery,
            $options: "i",
          },
        },

        {
          username: {
            $regex: searchQuery,
            $options: "i",
          },
        },

        {
          email: {
            $regex: searchQuery,
            $options: "i",
          },
        },
      ],
    })
      .select(
        "_id name username email avatar bio isOnline lastSeen"
      )
      .limit(30);

    res.status(200).json({
      users,
    });
  } catch (error) {
    console.error(
      "SEARCH USERS ERROR:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};


// =====================================================
// GET MY PROFILE
// =====================================================

const getMyProfile = async (
  req,
  res
) => {
  try {
    const user =
      await User.findById(
        req.userId
      )
        .select("-password")
        .populate(
          "friends",
          "_id name username avatar bio isOnline lastSeen"
        );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    console.error(
      "GET PROFILE ERROR:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};


// =====================================================
// UPDATE PROFILE
// =====================================================

const updateProfile = async (
  req,
  res
) => {
  try {
    const {
      name,
      username,
      bio,
      avatar,
    } = req.body;

    const user =
      await User.findById(
        req.userId
      );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (name?.trim()) {
      user.name =
        name.trim();
    }

    if (bio !== undefined) {
      user.bio =
        bio.trim().slice(0, 150);
    }

    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    if (
      username &&
      username.trim()
    ) {
      const cleanUsername =
        username
          .trim()
          .toLowerCase()
          .replace(
            /[^a-z0-9_]/g,
            ""
          );

      if (
        cleanUsername.length < 3
      ) {
        return res.status(400).json({
          message:
            "Username must be at least 3 characters",
        });
      }

      if (
        cleanUsername !==
        user.username
      ) {
        const existingUser =
          await User.findOne({
            username:
              cleanUsername,
            _id: {
              $ne: req.userId,
            },
          });

        if (existingUser) {
          return res.status(400).json({
            message:
              "Username already exists",
          });
        }

        user.username =
          cleanUsername;
      }
    }

    await user.save();

    const safeUser =
      await User.findById(
        user._id
      ).select("-password");

    res.status(200).json({
      message:
        "Profile updated successfully",
      user: safeUser,
    });
  } catch (error) {
    console.error(
      "UPDATE PROFILE ERROR:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};


module.exports = {
  getUsers,
  searchUsers,
  getMyProfile,
  updateProfile,
};