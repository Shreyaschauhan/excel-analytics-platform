const mongoose = require("mongoose")

const analysisSchema = new mongoose.Schema({
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExcelFile",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  chartType: {
    type: String,
    enum: ["bar", "line", "pie", "scatter", "column3d"],
    required: true,
  },
  xAxis: {
    type: String,
    required: true,
  },
  yAxis: {
    type: String,
    required: true,
  },
  sheetName: {
    type: String,
    required: true,
  },
  chartConfig: {
    title: String,
    backgroundColor: String,
    borderColor: String,
    borderWidth: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Analysis", analysisSchema)
