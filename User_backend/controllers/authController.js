const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const bcrypt = require("bcryptjs");

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const emailExists = await User.findOne({ email });
    const phoneExists = phone ? await User.findOne({ phone }) : null;

    if (emailExists) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    if (phone && phoneExists) {
      return res.status(400).json({
        message: "Mobile number already registered"
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      token: generateToken(user._id)
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Guest login — used by the storefront so Add to Cart / Checkout work without
// forcing a visitor through a signup form. Creates (or reuses) a lightweight
// account keyed by a random id the frontend stores in localStorage.
const guestLogin = async (req, res) => {
  try {
    const { deviceId } = req.body;
    if (!deviceId || String(deviceId).length < 8) {
      return res.status(400).json({ message: "Valid deviceId is required" });
    }

    const guestEmail = `guest_${deviceId}@device.squirrelnuts.in`;
    let user = await User.findOne({ email: guestEmail });

    if (!user) {
      user = await User.create({
        name: "Guest",
        email: guestEmail,
        password: `${deviceId}${process.env.JWT_SECRET || "sn"}`, // never shown/used to log in manually
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isGuest: true,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        token: generateToken(user._id)
      });
    }

    res.status(401).json({
      message: "Invalid email or password"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email || !phone) {
      return res.status(400).json({ message: "Email and phone number are required" });
    }

    const user = await User.findOne({ email, phone });

    if (!user) {
      return res.status(404).json({ message: "No account found with this email and phone number" });
    }

    const tempPassword = Math.random().toString(36).slice(-8);
    user.password = tempPassword;
    await user.save();

    res.json({
      message: "Temporary password generated",
      tempPassword,
      email: user.email
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get Profile
const getProfile = async (req, res) => {
  const { _id, name, email, phone } = req.user;
  res.json({ _id, name, email, phone });
};

// Update Profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (req.body.email && req.body.email !== user.email) {
      return res.status(400).json({ message: "Email cannot be changed here" });
    }

    if (typeof req.body.name === 'string' && req.body.name.trim().length) {
      user.name = req.body.name.trim();
    }

    if (typeof req.body.phone === 'string') {
      user.phone = req.body.phone.trim();
    }

    if (req.body.newPassword) {
      if (!req.body.currentPassword) {
        return res.status(400).json({ message: "Current password is required to change your password" });
      }
      const isMatch = await user.matchPassword(req.body.currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      user.password = req.body.newPassword;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      token: generateToken(updatedUser._id)
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  guestLogin,
  forgotPassword,
  getProfile,
  updateProfile
};
