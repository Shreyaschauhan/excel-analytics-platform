const express = require("express")
const {
  generateChartData,
  getAnalysisHistory,
  generateInsights,
  deleteAnalysis,
  getDashboardStats,
} = require("../controllers/analyticsController")
const { auth } = require("../middleware/auth")

const router = express.Router()

// Analytics routes
router.post("/chart-data", auth, generateChartData)
router.get("/history", auth, getAnalysisHistory)
router.post("/insights", auth, generateInsights)
router.delete("/:analysisId", auth, deleteAnalysis)
router.get("/dashboard-stats", auth, getDashboardStats)

module.exports = router
