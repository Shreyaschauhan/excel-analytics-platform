const mongoose = require("mongoose")

const excelFileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sheets: [
    {
      name: String,
      data: mongoose.Schema.Types.Mixed,
      headers: [String],
      rowCount: Number,
    },
  ],
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  lastAnalyzed: {
    type: Date,
  },
  analysisCount: {
    type: Number,
    default: 0,
  },
  description: {
    type: String,
    maxlength: 500,
  },
})

module.exports = mongoose.model("ExcelFile", excelFileSchema)
