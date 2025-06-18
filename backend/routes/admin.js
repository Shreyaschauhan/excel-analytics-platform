const express = require("express")
const {
  getAllUsers,
  getUserDetails,
  updateUserRole,
  deleteUser,
  getAllFiles,
  deleteAnyFile,
  getSystemStats,
  getAllAnalyses,
  deleteAnyAnalysis,
} = require("../controllers/adminController")
const { adminAuth } = require("../middleware/auth")

const router = express.Router()

// User management routes
router.get("/users", adminAuth, getAllUsers)
router.get("/users/:userId", adminAuth, getUserDetails)
router.put("/users/:userId/role", adminAuth, updateUserRole)
router.delete("/users/:userId", adminAuth, deleteUser)

// File management routes
router.get("/files", adminAuth, getAllFiles)
router.delete("/files/:fileId", adminAuth, deleteAnyFile)

// Analysis management routes
router.get("/analyses", adminAuth, getAllAnalyses)
router.delete("/analyses/:analysisId", adminAuth, deleteAnyAnalysis)

// System statistics
router.get("/stats", adminAuth, getSystemStats)

module.exports = router
