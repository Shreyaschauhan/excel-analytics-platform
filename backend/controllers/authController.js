const jwt = require("jsonwebtoken")
const User = require("../models/User")
const ExcelFile = require("../models/ExcelFile")
const Analysis = require("../models/Analysis")
const fs = require("fs")

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "fallback_secret", { expiresIn: "7d" })
}

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please provide all required fields" })
    }

    if (username.length < 3) {
      return res.status(400).json({ message: "Username must be at least 3 characters" })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" })
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email or username already exists",
      })
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      role: role || "user",
    })

    await user.save()

    // Generate JWT token
    const token = generateToken(user._id)

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ message: "Server error during registration" })
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" })
    }

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate JWT token
    const token = generateToken(user._id)

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error during login" })
  }
}

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password")
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body
    const userId = req.user._id

    // Check if username/email already exists (excluding current user)
    const existingUser = await User.findOne({
      $and: [{ _id: { $ne: userId } }, { $or: [{ email }, { username }] }],
    })

    if (existingUser) {
      return res.status(400).json({ message: "Username or email already exists" })
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, email },
      { new: true, runValidators: true },
    ).select("-password")

    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
      },
    })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const userId = req.user._id

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Please provide current and new password" })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" })
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ message: "New password cannot be the same as the current password" });
    }

    const user = await User.findById(userId)
    const isMatch = await user.comparePassword(currentPassword)

    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" })
    }

    user.password = newPassword
    await user.save()

    res.json({ message: "Password changed successfully" })
  } catch (error) {
    console.error("Change password error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Export user data
// @route   GET /api/auth/export-data
// @access  Private
const exportUserData = async (req, res) => {
  try {
    const userId = req.user._id

    // Get user data
    const user = await User.findById(userId).select("-password")
    const files = await ExcelFile.find({ uploadedBy: userId }).select("-sheets.data")
    const analyses = await Analysis.find({ userId })

    const exportData = {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
      files: files.map((file) => ({
        id: file._id,
        originalName: file.originalName,
        fileSize: file.fileSize,
        uploadDate: file.uploadDate,
        analysisCount: file.analysisCount,
        sheets: file.sheets.map((sheet) => ({
          name: sheet.name,
          headers: sheet.headers,
          rowCount: sheet.rowCount,
        })),
      })),
      analyses: analyses.map((analysis) => ({
        id: analysis._id,
        chartType: analysis.chartType,
        xAxis: analysis.xAxis,
        yAxis: analysis.yAxis,
        sheetName: analysis.sheetName,
        createdAt: analysis.createdAt,
      })),
      exportDate: new Date().toISOString(),
    }

    res.setHeader("Content-Type", "application/json")
    res.setHeader("Content-Disposition", `attachment; filename="user-data-${user.username}-${Date.now()}.json"`)
    res.json(exportData)
  } catch (error) {
    console.error("Export data error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Delete user account
// @route   DELETE /api/auth/delete-account
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body
    const userId = req.user._id

    if (!password) {
      return res.status(400).json({ message: "Password is required" })
    }

    const user = await User.findById(userId)
    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" })
    }

    // Delete user's files from filesystem
    const userFiles = await ExcelFile.find({ uploadedBy: userId })
    for (const file of userFiles) {
      if (fs.existsSync(file.filePath)) {
        fs.unlinkSync(file.filePath)
      }
    }

    // Delete user's data from database
    await ExcelFile.deleteMany({ uploadedBy: userId })
    await Analysis.deleteMany({ userId })
    await User.findByIdAndDelete(userId)

    res.json({ message: "Account deleted successfully" })
  } catch (error) {
    console.error("Delete account error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  changePassword,
  exportUserData,
  deleteAccount,
}
