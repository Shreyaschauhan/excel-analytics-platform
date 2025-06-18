const express = require("express")
const {
  upload,
  uploadFile,
  getUserFiles,
  getFileById,
  updateFile,
  deleteFile,
  getFileStats,
} = require("../controllers/fileController")
const { auth } = require("../middleware/auth")

const router = express.Router()

// File management routes
router.post("/upload", auth, upload.single("excelFile"), uploadFile)

router.get("/my-files", auth, getUserFiles)
router.get("/stats", auth, getFileStats)
router.get("/:fileId", auth, getFileById)
router.put("/:fileId", auth, updateFile)
router.delete("/:fileId", auth, deleteFile)

module.exports = router
