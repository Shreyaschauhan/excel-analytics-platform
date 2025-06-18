const express = require("express")
const {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  changePassword,
  exportUserData,
  deleteAccount,
} = require("../controllers/authController")
const { auth } = require("../middleware/auth")

const router = express.Router()

// Authentication routes
router.post("/register", registerUser)
router.post("/login", loginUser)
router.get("/me", auth, getCurrentUser)

// Profile management routes
router.put("/profile", auth, updateProfile)
router.put("/change-password", auth, changePassword)
router.get("/export-data", auth, exportUserData)
router.delete("/delete-account", auth, deleteAccount)

module.exports = router
