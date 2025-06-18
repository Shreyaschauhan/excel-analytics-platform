const multer = require("multer")
const XLSX = require("xlsx")
const path = require("path")
const fs = require("fs")
const ExcelFile = require("../models/ExcelFile")

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/"
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = [".xlsx", ".xls"]
  const fileExtension = path.extname(file.originalname).toLowerCase()

  if (allowedTypes.includes(fileExtension)) {
    cb(null, true)
  } else {
    cb(new Error("Only Excel files (.xlsx, .xls) are allowed"), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
})

// @desc    Upload Excel file
// @route   POST /api/files/upload
// @access  Private
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    // Read and parse Excel file
    const workbook = XLSX.readFile(req.file.path)
    const sheets = []

    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

      if (jsonData.length > 0) {
        const headers = jsonData[0]
        const data = jsonData.slice(1)

        sheets.push({
          name: sheetName,
          headers: headers,
          data: data,
          rowCount: data.length,
        })
      }
    })

    // Save file info to database
    const excelFile = new ExcelFile({
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      uploadedBy: req.user._id,
      sheets: sheets,
    })

    await excelFile.save()

    res.status(201).json({
      message: "File uploaded and processed successfully",
      file: {
        id: excelFile._id,
        originalName: excelFile.originalName,
        filename: excelFile.filename,
        fileSize: excelFile.fileSize,
        sheets: sheets.map((sheet) => ({
          name: sheet.name,
          headers: sheet.headers,
          rowCount: sheet.rowCount,
        })),
        uploadDate: excelFile.uploadDate,
        analysisCount: excelFile.analysisCount,
      },
    })
  } catch (error) {
    console.error("File upload error:", error)

    // Clean up uploaded file if processing failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }

    res.status(500).json({ message: "Error processing file" })
  }
}

// @desc    Get user's uploaded files
// @route   GET /api/files/my-files
// @access  Private
const getUserFiles = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const files = await ExcelFile.find({ uploadedBy: req.user._id })
      .select("-sheets.data")
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(limit)

    const totalFiles = await ExcelFile.countDocuments({ uploadedBy: req.user._id })

    res.json({
      files,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalFiles / limit),
        totalFiles,
        hasNext: page < Math.ceil(totalFiles / limit),
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching files:", error)
    res.status(500).json({ message: "Error fetching files" })
  }
}

// @desc    Get specific file details
// @route   GET /api/files/:fileId
// @access  Private
const getFileById = async (req, res) => {
  try {
    const file = await ExcelFile.findOne({
      _id: req.params.fileId,
      uploadedBy: req.user._id,
    }).populate("uploadedBy", "username email")

    if (!file) {
      return res.status(404).json({ message: "File not found" })
    }

    res.json({ file })
  } catch (error) {
    console.error("Error fetching file:", error)
    res.status(500).json({ message: "Error fetching file" })
  }
}

// @desc    Update file metadata
// @route   PUT /api/files/:fileId
// @access  Private
const updateFile = async (req, res) => {
  try {
    const { originalName, description } = req.body

    const file = await ExcelFile.findOneAndUpdate(
      { _id: req.params.fileId, uploadedBy: req.user._id },
      { originalName, description },
      { new: true },
    ).select("-sheets.data")

    if (!file) {
      return res.status(404).json({ message: "File not found" })
    }

    res.json({
      message: "File updated successfully",
      file,
    })
  } catch (error) {
    console.error("Error updating file:", error)
    res.status(500).json({ message: "Error updating file" })
  }
}

// @desc    Delete file
// @route   DELETE /api/files/:fileId
// @access  Private
const deleteFile = async (req, res) => {
  try {
    const file = await ExcelFile.findOne({
      _id: req.params.fileId,
      uploadedBy: req.user._id,
    })

    if (!file) {
      return res.status(404).json({ message: "File not found" })
    }

    // Delete physical file
    if (fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath)
    }

    // Delete from database
    await ExcelFile.findByIdAndDelete(req.params.fileId)

    res.json({ message: "File deleted successfully" })
  } catch (error) {
    console.error("Error deleting file:", error)
    res.status(500).json({ message: "Error deleting file" })
  }
}

// @desc    Get file statistics
// @route   GET /api/files/stats
// @access  Private
const getFileStats = async (req, res) => {
  try {
    const userId = req.user._id

    const stats = await ExcelFile.aggregate([
      { $match: { uploadedBy: userId } },
      {
        $group: {
          _id: null,
          totalFiles: { $sum: 1 },
          totalSize: { $sum: "$fileSize" },
          totalAnalyses: { $sum: "$analysisCount" },
          avgFileSize: { $avg: "$fileSize" },
        },
      },
    ])

    const recentFiles = await ExcelFile.find({ uploadedBy: userId })
      .select("originalName uploadDate fileSize")
      .sort({ uploadDate: -1 })
      .limit(5)

    res.json({
      stats: stats[0] || {
        totalFiles: 0,
        totalSize: 0,
        totalAnalyses: 0,
        avgFileSize: 0,
      },
      recentFiles,
    })
  } catch (error) {
    console.error("Error fetching file stats:", error)
    res.status(500).json({ message: "Error fetching file statistics" })
  }
}

module.exports = {
  upload,
  uploadFile,
  getUserFiles,
  getFileById,
  updateFile,
  deleteFile,
  getFileStats,
}
