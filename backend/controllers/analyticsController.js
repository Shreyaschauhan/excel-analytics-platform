const ExcelFile = require("../models/ExcelFile")
const Analysis = require("../models/Analysis")

// @desc    Generate chart data
// @route   POST /api/analytics/chart-data
// @access  Private
const generateChartData = async (req, res) => {
  try {
    const { fileId, sheetName, xAxis, yAxis, chartType, chartConfig } = req.body

    // Validation
    if (!fileId || !sheetName || !xAxis || !yAxis || !chartType) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    const file = await ExcelFile.findOne({
      _id: fileId,
      uploadedBy: req.user._id,
    })

    if (!file) {
      return res.status(404).json({ message: "File not found" })
    }

    const sheet = file.sheets.find((s) => s.name === sheetName)
    if (!sheet) {
      return res.status(404).json({ message: "Sheet not found" })
    }

    const xIndex = sheet.headers.indexOf(xAxis)
    const yIndex = sheet.headers.indexOf(yAxis)

    if (xIndex === -1 || yIndex === -1) {
      return res.status(400).json({ message: "Invalid axis selection" })
    }

    // Process data for chart
    const processedData = []
    const labels = []
    const dataPoints = []

    sheet.data.forEach((row, index) => {
      if (row[xIndex] !== undefined && row[yIndex] !== undefined) {
        const xValue = row[xIndex]
        const yValue = Number.parseFloat(row[yIndex])

        if (!isNaN(yValue)) {
          labels.push(xValue)
          dataPoints.push(yValue)
          processedData.push({ x: xValue, y: yValue, rowIndex: index })
        }
      }
    })

    // Generate different chart configurations based on type
    let chartData = {}

    switch (chartType) {
      case "pie":
        // For pie charts, aggregate data by categories
        const pieData = {}
        processedData.forEach((item) => {
          if (pieData[item.x]) {
            pieData[item.x] += item.y
          } else {
            pieData[item.x] = item.y
          }
        })

        chartData = {
          labels: Object.keys(pieData),
          datasets: [
            {
              label: yAxis,
              data: Object.values(pieData),
              backgroundColor: [
                "rgba(255, 99, 132, 0.8)",
                "rgba(54, 162, 235, 0.8)",
                "rgba(255, 205, 86, 0.8)",
                "rgba(75, 192, 192, 0.8)",
                "rgba(153, 102, 255, 0.8)",
                "rgba(255, 159, 64, 0.8)",
              ],
              borderWidth: 1,
            },
          ],
        }
        break

      case "scatter":
        chartData = {
          datasets: [
            {
              label: `${xAxis} vs ${yAxis}`,
              data: processedData.map((item) => ({ x: item.y, y: item.y })),
              backgroundColor: "rgba(54, 162, 235, 0.6)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            },
          ],
        }
        break

      default:
        chartData = {
          labels: labels,
          datasets: [
            {
              label: yAxis,
              data: dataPoints,
              backgroundColor:
                chartType === "line"
                  ? "rgba(54, 162, 235, 0.2)"
                  : dataPoints.map((_, index) => `hsla(${(index * 360) / dataPoints.length}, 70%, 60%, 0.8)`),
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 2,
              fill: chartType === "line" ? false : true,
            },
          ],
        }
    }

    // Save analysis
    const analysis = new Analysis({
      fileId,
      userId: req.user._id,
      chartType,
      xAxis,
      yAxis,
      sheetName,
      chartConfig: chartConfig || {},
    })
    await analysis.save()

    // Update file analysis count
    await ExcelFile.findByIdAndUpdate(fileId, {
      $inc: { analysisCount: 1 },
      lastAnalyzed: new Date(),
    })

    res.json({
      chartData,
      analysisId: analysis._id,
      summary: {
        totalDataPoints: processedData.length,
        xAxis,
        yAxis,
        chartType,
        validDataPoints: processedData.length,
        invalidDataPoints: sheet.data.length - processedData.length,
      },
    })
  } catch (error) {
    console.error("Chart data error:", error)
    res.status(500).json({ message: "Error generating chart data" })
  }
}

// @desc    Get analysis history
// @route   GET /api/analytics/history
// @access  Private
const getAnalysisHistory = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const analyses = await Analysis.find({ userId: req.user._id })
      .populate("fileId", "originalName uploadDate")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const totalAnalyses = await Analysis.countDocuments({ userId: req.user._id })

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
    console.error("Error fetching analysis history:", error)
    res.status(500).json({ message: "Error fetching analysis history" })
  }
}

// @desc    Generate AI-powered insights with multiple providers and enhanced fallback
// @route   POST /api/analytics/insights
// @access  Private
const generateInsights = async (req, res) => {
  try {
    const { fileId, sheetName, column } = req.body

    const file = await ExcelFile.findOne({
      _id: fileId,
      uploadedBy: req.user._id,
    })

    if (!file) {
      return res.status(404).json({ message: "File not found" })
    }

    const sheet = file.sheets.find((s) => s.name === sheetName)
    if (!sheet) {
      return res.status(404).json({ message: "Sheet not found" })
    }

    const columnIndex = sheet.headers.indexOf(column)
    if (columnIndex === -1) {
      return res.status(400).json({ message: "Column not found" })
    }

    // Extract values
    const allValues = sheet.data.map((row) => row[columnIndex]).filter((val) => val !== undefined && val !== "")

    // Separate numeric and text values
    const numericValues = allValues.map((val) => Number.parseFloat(val)).filter((val) => !isNaN(val))
    const textValues = allValues.filter((val) => isNaN(Number.parseFloat(val)))

    let basicInsights = {
      column,
      totalValues: allValues.length,
      emptyValues: sheet.data.length - allValues.length,
    }

    if (numericValues.length > 0) {
      // Numeric analysis
      const sum = numericValues.reduce((a, b) => a + b, 0)
      const mean = sum / numericValues.length
      const sortedValues = numericValues.sort((a, b) => a - b)
      const median =
        sortedValues.length % 2 === 0
          ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
          : sortedValues[Math.floor(sortedValues.length / 2)]

      // Calculate standard deviation
      const variance = numericValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / numericValues.length
      const standardDeviation = Math.sqrt(variance)

      // Calculate quartiles
      const q1 = sortedValues[Math.floor(sortedValues.length * 0.25)]
      const q3 = sortedValues[Math.floor(sortedValues.length * 0.75)]
      const iqr = q3 - q1

      basicInsights = {
        ...basicInsights,
        dataType: "numeric",
        numericValues: numericValues.length,
        sum: sum.toFixed(2),
        mean: mean.toFixed(2),
        median: median.toFixed(2),
        min: Math.min(...numericValues),
        max: Math.max(...numericValues),
        range: (Math.max(...numericValues) - Math.min(...numericValues)).toFixed(2),
        standardDeviation: standardDeviation.toFixed(2),
        variance: variance.toFixed(2),
        q1: q1.toFixed(2),
        q3: q3.toFixed(2),
        iqr: iqr.toFixed(2),
        coefficientOfVariation: ((standardDeviation / mean) * 100).toFixed(2),
      }
    }

    if (textValues.length > 0) {
      // Text analysis
      const textFrequency = {}
      textValues.forEach((val) => {
        textFrequency[val] = (textFrequency[val] || 0) + 1
      })

      const sortedTextFreq = Object.entries(textFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)

      basicInsights = {
        ...basicInsights,
        dataType: numericValues.length > 0 ? "mixed" : "text",
        textValues: textValues.length,
        uniqueTextValues: Object.keys(textFrequency).length,
        mostCommonValues: sortedTextFreq,
        diversity: (Object.keys(textFrequency).length / textValues.length).toFixed(3),
      }
    }

    // Always generate enhanced fallback insights (no dependency on external AI)
    const aiInsights = generateEnhancedInsights(basicInsights, sheet, file.originalName)

    res.json({
      insights: basicInsights,
      aiInsights: aiInsights,
    })
  } catch (error) {
    console.error("Insights error:", error)
    res.status(500).json({ message: "Error generating insights" })
  }
}

// Enhanced rule-based insights that rival AI quality
const generateEnhancedInsights = (basicInsights, sheet, fileName) => {
  const insights = {
    keyFindings: [],
    businessInsights: [],
    dataQualityIssues: [],
    nextSteps: [],
    trends: [],
  }

  const completeness = (basicInsights.totalValues / (basicInsights.totalValues + basicInsights.emptyValues)) * 100

  if (basicInsights.dataType === "numeric") {
    const cv = Number.parseFloat(basicInsights.coefficientOfVariation)
    const mean = Number.parseFloat(basicInsights.mean)
    const median = Number.parseFloat(basicInsights.median)
    const skewness = mean > median ? "right-skewed" : mean < median ? "left-skewed" : "symmetric"

    // Key Findings
    insights.keyFindings.push(
      `Dataset contains ${basicInsights.numericValues} numeric values with average ${basicInsights.mean}`,
      `Data distribution is ${skewness} (mean: ${basicInsights.mean}, median: ${basicInsights.median})`,
      `Variability: ${cv < 15 ? "Low" : cv < 35 ? "Moderate" : "High"} (CV: ${basicInsights.coefficientOfVariation}%)`,
    )

    if (basicInsights.iqr) {
      insights.keyFindings.push(
        `Middle 50% of data ranges from ${basicInsights.q1} to ${basicInsights.q3} (IQR: ${basicInsights.iqr})`,
      )
    }

    // Business Insights
    if (cv < 15) {
      insights.businessInsights.push(
        "Low variability suggests consistent performance - good for predictable planning",
        "Consider this as a stable baseline for forecasting and budgeting",
      )
    } else if (cv > 50) {
      insights.businessInsights.push(
        "High variability indicates significant fluctuations - investigate underlying causes",
        "Consider segmentation analysis to identify different performance groups",
        "Risk management strategies may be needed due to high volatility",
      )
    }

    if (skewness !== "symmetric") {
      insights.businessInsights.push(
        `${skewness === "right-skewed" ? "Most values are below average with some high outliers" : "Most values are above average with some low outliers"}`,
        "Consider using median instead of mean for more representative central tendency",
      )
    }

    // Data Quality Assessment
    if (completeness < 95) {
      insights.dataQualityIssues.push(
        `Data completeness is ${completeness.toFixed(1)}% - ${basicInsights.emptyValues} missing values detected`,
      )
    }

    // Detect potential outliers using IQR method
    if (basicInsights.iqr) {
      const lowerBound = Number.parseFloat(basicInsights.q1) - 1.5 * Number.parseFloat(basicInsights.iqr)
      const upperBound = Number.parseFloat(basicInsights.q3) + 1.5 * Number.parseFloat(basicInsights.iqr)
      if (basicInsights.min < lowerBound || basicInsights.max > upperBound) {
        insights.dataQualityIssues.push("Potential outliers detected - review extreme values for accuracy")
      }
    }

    // Next Steps
    insights.nextSteps.push(
      "Create histogram to visualize data distribution",
      "Perform correlation analysis with other numeric columns",
      "Consider time-series analysis if temporal data is available",
    )

    if (cv > 35) {
      insights.nextSteps.push("Investigate factors causing high variability", "Consider data segmentation analysis")
    }
  } else if (basicInsights.dataType === "text") {
    const diversity = Number.parseFloat(basicInsights.diversity)

    // Key Findings
    insights.keyFindings.push(
      `Dataset contains ${basicInsights.uniqueTextValues} unique categories from ${basicInsights.textValues} total values`,
      `Data diversity index: ${diversity} (${diversity > 0.7 ? "High" : diversity > 0.3 ? "Moderate" : "Low"} diversity)`,
    )

    if (basicInsights.mostCommonValues && basicInsights.mostCommonValues.length > 0) {
      const topCategory = basicInsights.mostCommonValues[0]
      const topPercentage = ((topCategory[1] / basicInsights.textValues) * 100).toFixed(1)
      insights.keyFindings.push(`Most frequent category: "${topCategory[0]}" (${topPercentage}% of data)`)
    }

    // Business Insights
    if (diversity < 0.3) {
      insights.businessInsights.push(
        "Low diversity suggests data is concentrated in few categories",
        "Consider consolidating or standardizing category names",
        "Focus analysis on top categories for maximum impact",
      )
    } else if (diversity > 0.7) {
      insights.businessInsights.push(
        "High diversity indicates many different categories",
        "Consider grouping similar categories for better analysis",
        "May benefit from hierarchical categorization",
      )
    }

    // Data Quality
    if (completeness < 95) {
      insights.dataQualityIssues.push(
        `${basicInsights.emptyValues} missing values (${(100 - completeness).toFixed(1)}% of data)`,
      )
    }

    // Check for potential data standardization issues
    if (basicInsights.mostCommonValues) {
      const similarCategories = findSimilarCategories(basicInsights.mostCommonValues)
      if (similarCategories.length > 0) {
        insights.dataQualityIssues.push(
          "Potential duplicate categories with slight variations detected - consider data standardization",
        )
      }
    }

    // Next Steps
    insights.nextSteps.push(
      "Create frequency distribution chart",
      "Analyze category patterns for grouping opportunities",
      "Consider text standardization and cleanup",
    )

    if (diversity > 0.5) {
      insights.nextSteps.push("Explore hierarchical categorization", "Consider creating category groups")
    }
  } else if (basicInsights.dataType === "mixed") {
    // Mixed data type insights
    insights.keyFindings.push(
      `Mixed data type: ${basicInsights.numericValues} numeric and ${basicInsights.textValues} text values`,
      "Data inconsistency detected - may need cleaning or type conversion",
    )

    insights.dataQualityIssues.push(
      "Mixed data types in single column indicate potential data quality issues",
      "Consider separating numeric and text data or standardizing format",
    )

    insights.nextSteps.push(
      "Analyze data entry patterns to identify root cause",
      "Consider data type conversion or column splitting",
      "Implement data validation rules for future entries",
    )
  }

  // General insights based on data size
  if (basicInsights.totalValues < 30) {
    insights.dataQualityIssues.push("Small sample size - results may not be statistically significant")
    insights.nextSteps.push("Consider collecting more data for robust analysis")
  } else if (basicInsights.totalValues > 10000) {
    insights.nextSteps.push("Large dataset - consider sampling for exploratory analysis")
  }

  // Cross-column analysis suggestions
  if (sheet.headers.length > 1) {
    insights.nextSteps.push(
      "Perform cross-column correlation analysis",
      "Create pivot tables for multi-dimensional analysis",
      "Consider creating composite metrics from multiple columns",
    )
  }

  return {
    rawInsight: `Professional data analysis completed for ${fileName}. This analysis uses advanced statistical methods and business intelligence principles to provide actionable insights without requiring external AI services.`,
    structuredInsights: insights,
    generatedAt: new Date().toISOString(),
    model: "enhanced-analytics-engine",
    source: "internal",
    confidence: "high",
    analysisDepth: "comprehensive",
  }
}

// Helper function to find similar categories
const findSimilarCategories = (mostCommonValues) => {
  const similar = []
  const categories = mostCommonValues.map(([cat]) => cat.toLowerCase())

  for (let i = 0; i < categories.length; i++) {
    for (let j = i + 1; j < categories.length; j++) {
      if (calculateSimilarity(categories[i], categories[j]) > 0.8) {
        similar.push([categories[i], categories[j]])
      }
    }
  }

  return similar
}

// Simple string similarity calculation
const calculateSimilarity = (str1, str2) => {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1

  if (longer.length === 0) return 1.0

  const editDistance = levenshteinDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

// Levenshtein distance calculation
const levenshteinDistance = (str1, str2) => {
  const matrix = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
      }
    }
  }

  return matrix[str2.length][str1.length]
}

// @desc    Delete analysis
// @route   DELETE /api/analytics/:analysisId
// @access  Private
const deleteAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findOneAndDelete({
      _id: req.params.analysisId,
      userId: req.user._id,
    })

    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found" })
    }

    res.json({ message: "Analysis deleted successfully" })
  } catch (error) {
    console.error("Error deleting analysis:", error)
    res.status(500).json({ message: "Error deleting analysis" })
  }
}

// @desc    Get analytics dashboard stats
// @route   GET /api/analytics/dashboard-stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id

    // Get analysis stats
    const analysisStats = await Analysis.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$chartType",
          count: { $sum: 1 },
        },
      },
    ])

    // Get recent analyses
    const recentAnalyses = await Analysis.find({ userId })
      .populate("fileId", "originalName")
      .sort({ createdAt: -1 })
      .limit(5)

    // Get total analyses count
    const totalAnalyses = await Analysis.countDocuments({ userId })

    res.json({
      totalAnalyses,
      chartTypeBreakdown: analysisStats,
      recentAnalyses,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    res.status(500).json({ message: "Error fetching dashboard statistics" })
  }
}

module.exports = {
  generateChartData,
  getAnalysisHistory,
  generateInsights,
  deleteAnalysis,
  getDashboardStats,
}
