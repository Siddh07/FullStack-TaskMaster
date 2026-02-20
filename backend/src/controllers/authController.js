const User = require("../models/User");
const { hashPassword, comparePassword } = require("../utils/password");
const { generateToken } = require("../utils/jwt");

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1) Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    // 2) Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    // 3) Hash password
    const hashedPassword = await hashPassword(password);

    // 4) Create user in database
    const createdUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // 5) Generate JWT token
    const token = generateToken({ userId: createdUser.id });

    // 6) Send response (never send password)
    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
      },
      token,
    });
  } catch (err) {
    console.log("Register error:", err);
    return res
      .status(500)
      .json({ message: "Server error during registration" });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1) Basic validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // 2) Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3) Compare password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 4) Generate token
    const token = generateToken({ userId: user.id });

    // 5) Send response
    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    console.log("Login error:", err);
    return res.status(500).json({ message: "Server error during login" });
  }
};

// GET /api/auth/me (requires auth middleware)
const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    return res.json({
      user: req.user,
    });
  } catch (error) {
    console.error("GetMe error:", error);
    return res.status(500).json({
      message: "Server error fetching current user",
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
};
