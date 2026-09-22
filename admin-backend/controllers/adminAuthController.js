const Admin = require("../models/Admin");
const generateToken = require("../utils/generateToken");
const bcrypt = require("bcryptjs");

const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const emailExists = await Admin.findOne({ email });
    const phoneExists = phone ? await Admin.findOne({ phone }) : null;

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

    const admin = await Admin.create({
      name,
      email,
      password,
      phone,
    });

    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin._id)
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (admin && (await admin.matchPassword(password))) {
      if (!admin.isActive) {
        return res.status(403).json({
          message: "Admin account is inactive"
        });
      }
      admin.lastLogin = new Date();
      await admin.save();
      return res.json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token: generateToken(admin._id)
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

const forgotPassword = async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email || !phone) {
      return res.status(400).json({ message: "Email and phone number are required" });
    }

    const admin = await Admin.findOne({ email, phone });

    if (!admin) {
      return res.status(404).json({ message: "No account found with this email and phone number" });
    }

    const tempPassword = Math.random().toString(36).slice(-8);
    admin.password = tempPassword;
    await admin.save();

    res.json({
      message: "Temporary password generated",
      tempPassword,
      email: admin.email
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.user._id);

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found"
      });
    }

    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect"
      });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({ message: "Password changed successfully" });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const getAdminProfile = async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    phone: req.user.phone,
    role: req.user.role,
    isActive: req.user.isActive,
  });
};

const changePassword = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id);

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found"
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters"
      });
    }

    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect"
      });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({ message: "Password changed successfully" });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const updateAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id);

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found"
      });
    }

    admin.name = req.body.name || admin.name;
    admin.phone = req.body.phone || admin.phone;
    admin.email = req.body.email || admin.email;

    if (req.body.password) {
      admin.password = req.body.password;
    }

    const updatedAdmin = await admin.save();

    res.json({
      _id: updatedAdmin._id,
      name: updatedAdmin.name,
      email: updatedAdmin.email,
      phone: updatedAdmin.phone,
      role: updatedAdmin.role,
      token: generateToken(updatedAdmin._id)
    });

  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already in use" });
    }
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  changePassword,
  updateAdminProfile,
  forgotPassword,
  resetPassword
};
