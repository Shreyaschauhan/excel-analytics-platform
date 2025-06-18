const User = require("../models/User")
const ExcelFile = require("../models/ExcelFile")
const Analysis = require("../models/Analysis")
const fs = require("fs")

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit
    const search = req.query.search || ""

    let query = {}
    if (search) {
      query = {
        $or: [{ username: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }],
      }
    }

    const users = await User.find(query).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit)

    const totalUsers = await User.countDocuments(query)

    // Get user statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ])

    res.json({
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        hasNext: page < Math.ceil(totalUsers / limit),
        hasPrev: page > 1,
      },
      userStats,
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({ message: "Error fetching users" })
  }
}

// @desc    Get user details (Admin only)
// @route   GET /api/admin/users/:userId
// @access  Private/Admin
const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Get user's file statistics
    const fileStats = await ExcelFile.aggregate([
      { $match: { uploadedBy: user._id } },
      {
        $group: {
          _id: null,
          totalFiles: { $sum: 1 },
          totalSize: { $sum: "$fileSize" },
          totalAnalyses: { $sum: "$analysisCount" },
        },
      },
    ])

    // Get user's recent files
    const recentFiles = await ExcelFile.find({ uploadedBy: user._id })
      .select("originalName uploadDate fileSize")
      .sort({ uploadDate: -1 })
      .limit(5)

    // Get user's recent analyses
    const recentAnalyses = await Analysis.find({ userId: user._id })
      .populate("fileId", "originalName")
      .sort({ createdAt: -1 })
      .limit(5)

    res.json({
      user,
      stats: fileStats[0] || { totalFiles: 0, totalSize: 0, totalAnalyses: 0 },
      recentFiles,
      recentAnalyses,
    })
  } catch (error) {
    console.error("Error fetching user details:", error)
    res.status(500).json({ message: "Error fetching user details" })
  }
}

// @desc    Update user role (Admin only)
// @route   PUT /api/admin/users/:userId/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body
    const userId = req.params.userId

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" })
    }

    // Prevent admin from changing their own role
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot change your own role" })
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({
      message: "User role updated successfully",
      user,
    })
  } catch (error) {
    console.error("Error updating user role:", error)
    res.status(500).json({ message: "Error updating user role" })
  }
}

// @desc    Delete user (Admin only)
// @route   DELETE /api/admin/users/:userId
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId

    // Prevent admin from deleting themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot delete your own account" })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
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

    res.json({ message: "User and all associated data deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    res.status(500).json({ message: "Error deleting user" })
  }
}

// @desc    Get all files (Admin only)
// @route   GET /api/admin/files
// @access  Private/Admin
const getAllFiles = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const files = await ExcelFile.find()
      .populate("uploadedBy", "username email")
      .select("-sheets.data")
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(limit)

    const totalFiles = await ExcelFile.countDocuments()

    // Get file statistics
    const fileStats = await ExcelFile.aggregate([
      {
        $group: {
          _id: null,
          totalFiles: { $sum: 1 },
          totalSize: { $sum: "$fileSize" },
          avgSize: { $avg: "$fileSize" },
          totalAnalyses: { $sum: "$analysisCount" },
        },
      },
    ])

    res.json({
      files,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalFiles / limit),
        totalFiles,
        hasNext: page < Math.ceil(totalFiles / limit),
        hasPrev: page > 1,
      },
      stats: fileStats[0] || { totalFiles: 0, totalSize: 0, avgSize: 0, totalAnalyses: 0 },
    })
  } catch (error) {
    console.error("Error fetching files:", error)
    res.status(500).json({ message: "Error fetching files" })
  }
}

// @desc    Delete any file (Admin only)
// @route   DELETE /api/admin/files/:fileId
// @access  Private/Admin
const deleteAnyFile = async (req, res) => {
  try {
    const file = await ExcelFile.findById(req.params.fileId)

    if (!file) {
      return res.status(404).json({ message: "File not found" })
    }

    // Delete physical file
    if (fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath)
    }

    // Delete associated analyses
    await Analysis.deleteMany({ fileId: file._id })

    // Delete from database
    await ExcelFile.findByIdAndDelete(req.params.fileId)

    res.json({ message: "File and associated analyses deleted successfully" })
  } catch (error) {
    console.error("Error deleting file:", error)
    res.status(500).json({ message: "Error deleting file" })
  }
}

// @desc    Get system statistics (Admin only)
// @route   GET /api/admin/stats
// @access  Private/Admin
const getSystemStats = async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments()
    const adminUsers = await User.countDocuments({ role: "admin" })
    const regularUsers = await User.countDocuments({ role: "user" })

    // File statistics
    const fileStats = await ExcelFile.aggregate([
      {
        $group: {
          _id: null,
          totalFiles: { $sum: 1 },
          totalSize: { $sum: "$fileSize" },
          avgSize: { $avg: "$fileSize" },
        },
      },
    ])

    // Analysis statistics
    const totalAnalyses = await Analysis.countDocuments()
    const analysisTypeStats = await Analysis.aggregate([
      {
        $group: {
          _id: "$chartType",
          count: { $sum: 1 },
        },
      },
    ])

    // Recent activity
    const recentUsers = await User.find().select("username email createdAt").sort({ createdAt: -1 }).limit(5)

    const recentFiles = await ExcelFile.find()
      .populate("uploadedBy", "username")
      .select("originalName uploadDate fileSize uploadedBy")
      .sort({ uploadDate: -1 })
      .limit(5)

    // Storage usage by user
    const storageByUser = await ExcelFile.aggregate([
      {
        $group: {
          _id: "$uploadedBy",
          totalSize: { $sum: "$fileSize" },
          fileCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          username: "$user.username",
          email: "$user.email",
          totalSize: 1,
          fileCount: 1,
        },
      },
      { $sort: { totalSize: -1 } },
      { $limit: 10 },
    ])

    res.json({
      users: {
        total: totalUsers,
        admins: adminUsers,
        regular: regularUsers,
      },
      files: fileStats[0] || { totalFiles: 0, totalSize: 0, avgSize: 0 },
      analyses: {
        total: totalAnalyses,
        byType: analysisTypeStats,
      },
      recentActivity: {
        users: recentUsers,
        files: recentFiles,
      },
      storageByUser,
    })
  } catch (error) {
    console.error("Error fetching system stats:", error)
    res.status(500).json({ message: "Error fetching system statistics" })
  }
}

// @desc    Get all analyses (Admin only)
// @route   GET /api/admin/analyses
// @access  Private/Admin
const getAllAnalyses = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const analyses = await Analysis.find()
      .populate("userId", "username email")
      .populate("fileId", "originalName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const totalAnalyses = await Analysis.countDocuments()

    res.json({
      analyses,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalAnalyses / limit),
        totalAnalyses,
        hasNext: page < Math.ceil(totalAnalyses / limit),
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching analyses:", error)
    res.status(500).json({ message: "Error fetching analyses" })
  }
}

// @desc    Delete any analysis (Admin only)
// @route   DELETE /api/admin/analyses/:analysisId
// @access  Private/Admin
const deleteAnyAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findByIdAndDelete(req.params.analysisId)

    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found" })
    }

    res.json({ message: "Analysis deleted successfully" })
  } catch (error) {
    console.error("Error deleting analysis:", error)
    res.status(500).json({ message: "Error deleting analysis" })
  }
}

module.exports = {
  getAllUsers,
  getUserDetails,
  updateUserRole,
  deleteUser,
  getAllFiles,
  deleteAnyFile,
  getSystemStats,
  getAllAnalyses,
  deleteAnyAnalysis,
}
