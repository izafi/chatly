const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");


// =====================================================
// GENERATE UNIQUE USERNAME
// =====================================================

const generateUsername = async (name) => {
  const baseUsername = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 15) || "user";

  let username = baseUsername;

  let exists = await User.findOne({
    username,
  });

  while (exists) {
    const randomNumber = Math.floor(
      1000 + Math.random() * 9000
    );

    username = `${baseUsername}${randomNumber}`;

    exists = await User.findOne({
      username,
    });
  }

  return username;
};


// =====================================================
// CREATE JWT
// =====================================================

const createToken = (userId) => {
  return jwt.sign(
    {
      userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};


// =====================================================
// REGISTER
// =====================================================

const register = async (req, res) => {
  try {
    const {
      name,
      username,
      email,
      password,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message:
          "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters",
      });
    }

    // Check email
    const existingEmail = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingEmail) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    let finalUsername;

    // User provided username
    if (username?.trim()) {
      finalUsername = username
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "");

      if (finalUsername.length < 3) {
        return res.status(400).json({
          message:
            "Username must be at least 3 characters",
        });
      }

      const usernameExists =
        await User.findOne({
          username: finalUsername,
        });

      if (usernameExists) {
        return res.status(400).json({
          message: "Username already exists",
        });
      }
    } else {
      // Automatically generate username
      finalUsername =
        await generateUsername(name);
    }

    // Hash password
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name: name.trim(),
      username: finalUsername,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    // Create token
    const token = createToken(user._id);

    // Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const safeUser = {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      friends: user.friends,
      isOnline: user.isOnline,
    };

    res.status(201).json({
      message: "Registration successful",
      user: safeUser,
    });
  } catch (error) {
    console.error(
      "REGISTER ERROR:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};


// =====================================================
// LOGIN
// =====================================================

const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    user.isOnline = true;

    await user.save();

    const token = createToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const safeUser = {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      friends: user.friends,
      isOnline: user.isOnline,
    };

    res.status(200).json({
      message: "Login successful",
      user: safeUser,
    });
  } catch (error) {
    console.error(
      "LOGIN ERROR:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};


// =====================================================
// LOGOUT
// =====================================================

const logout = async (req, res) => {
  try {
    if (req.userId) {
      await User.findByIdAndUpdate(
        req.userId,
        {
          isOnline: false,
          lastSeen: new Date(),
        }
      );
    }

    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    console.error(
      "LOGOUT ERROR:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};


// =====================================================
// GET CURRENT USER
// =====================================================

const getMe = async (req, res) => {
  try {
    const user =
      await User.findById(req.userId)
        .select("-password");

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
      "GET ME ERROR:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};


module.exports = {
  register,
  login,
  logout,
  getMe,
};