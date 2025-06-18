"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { generateChartData, generateInsights } from "../store/slices/analyticsSlice"
import { fetchUserFiles } from "../store/slices/fileSlice"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Bar, Line, Pie, Scatter } from "react-chartjs-2"
import { BarChart3, Download, Info, Brain } from "lucide-react"
import LoadingSpinner from "../components/LoadingSpinner"
import AIInsightsPanel from "../components/AIInsightsPanel"

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend)

const Analytics = () => {
  const { fileId } = useParams()
  const dispatch = useDispatch()
  const { files } = useSelector((state) => state.files)
  const { chartData, insights, loading } = useSelector((state) => state.analytics)

  const [selectedSheet, setSelectedSheet] = useState("")
  const [selectedXAxis, setSelectedXAxis] = useState("")
  const [selectedYAxis, setSelectedYAxis] = useState("")
  const [selectedChartType, setSelectedChartType] = useState("bar")
  const [currentFile, setCurrentFile] = useState(null)
  const [aiInsights, setAiInsights] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    if (files.length === 0) {
      dispatch(fetchUserFiles())
    }
  }, [dispatch, files.length])

  useEffect(() => {
    const file = files.find((f) => f._id === fileId)
    if (file) {
      setCurrentFile(file)
      if (file.sheets && file.sheets.length > 0) {
        setSelectedSheet(file.sheets[0].name)
      }
    }
  }, [files, fileId])

  const currentSheet = currentFile?.sheets?.find((sheet) => sheet.name === selectedSheet)

  const handleGenerateChart = () => {
    if (selectedSheet && selectedXAxis && selectedYAxis) {
      dispatch(
        generateChartData({
          fileId,
          sheetName: selectedSheet,
          xAxis: selectedXAxis,
          yAxis: selectedYAxis,
          chartType: selectedChartType,
        }),
      )
    }
  }

  const handleGenerateInsights = async () => {
    if (selectedSheet && selectedYAxis) {
      setAiLoading(true)
      try {
        const result = await dispatch(
          generateInsights({
            fileId,
            sheetName: selectedSheet,
            column: selectedYAxis,
          }),
        ).unwrap()

        if (result.aiInsights) {
          setAiInsights(result.aiInsights)
        }
      } catch (error) {
        console.error("Error generating insights:", error)
      } finally {
        setAiLoading(false)
      }
    }
  }

  const downloadChart = () => {
    const canvas = document.querySelector("canvas")
    if (canvas) {
      const url = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.download = `chart-${Date.now()}.png`
      link.href = url
      link.click()
    }
  }

  const renderChart = () => {
    if (!chartData) return null

    const chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: `${selectedXAxis} vs ${selectedYAxis}`,
        },
      },
      scales:
        selectedChartType !== "pie"
          ? {
              y: {
                beginAtZero: true,
              },
            }
          : {},
    }

    switch (selectedChartType) {
      case "line":
        return <Line data={chartData.chartData} options={chartOptions} />
      case "pie":
        return <Pie data={chartData.chartData} options={chartOptions} />
      case "scatter":
        return <Scatter data={chartData.chartData} options={chartOptions} />
      default:
        return <Bar data={chartData.chartData} options={chartOptions} />
    }
  }

  if (!currentFile) {
    return <LoadingSpinner text="Loading file..." />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Analyzing: <span className="font-medium">{currentFile.originalName}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Chart Configuration</h2>

            <div className="space-y-4">
              {/* Sheet Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Sheet</label>
                <select
                  value={selectedSheet}
                  onChange={(e) => setSelectedSheet(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {currentFile.sheets?.map((sheet) => (
                    <option key={sheet.name} value={sheet.name}>
                      {sheet.name} ({sheet.rowCount} rows)
                    </option>
                  ))}
                </select>
              </div>

              {/* Chart Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
                <select
                  value={selectedChartType}
                  onChange={(e) => setSelectedChartType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="pie">Pie Chart</option>
                  <option value="scatter">Scatter Plot</option>
                </select>
              </div>

              {/* X-Axis Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">X-Axis (Categories)</label>
                <select
                  value={selectedXAxis}
                  onChange={(e) => setSelectedXAxis(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select column...</option>
                  {currentSheet?.headers?.map((header) => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
              </div>

              {/* Y-Axis Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Y-Axis (Values)</label>
                <select
                  value={selectedYAxis}
                  onChange={(e) => setSelectedYAxis(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select column...</option>
                  {currentSheet?.headers?.map((header) => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
              </div>

              {/* Generate Chart Button */}
              <button
                onClick={handleGenerateChart}
                disabled={!selectedSheet || !selectedXAxis || !selectedYAxis || loading}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {loading ? "Generating..." : "Generate Chart"}
              </button>

              {/* Generate AI Insights Button */}
              <button
                onClick={handleGenerateInsights}
                disabled={!selectedSheet || !selectedYAxis || aiLoading}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Brain className="h-4 w-4 mr-2" />
                {aiLoading ? "Generating AI Insights..." : "Generate AI Insights"}
              </button>
            </div>
          </div>

          {/* Basic Insights Panel */}
          {insights && (
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Info className="h-5 w-5 mr-2 text-blue-600" />
                Statistical Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Column:</span>
                  <span className="font-medium">{insights.column}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Values:</span>
                  <span className="font-medium">{insights.totalValues}</span>
                </div>
                {insights.sum && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sum:</span>
                    <span className="font-medium">{insights.sum}</span>
                  </div>
                )}
                {insights.mean && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average:</span>
                    <span className="font-medium">{insights.mean}</span>
                  </div>
                )}
                {insights.median && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Median:</span>
                    <span className="font-medium">{insights.median}</span>
                  </div>
                )}
                {insights.min !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Min:</span>
                    <span className="font-medium">{insights.min}</span>
                  </div>
                )}
                {insights.max !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max:</span>
                    <span className="font-medium">{insights.max}</span>
                  </div>
                )}
                {insights.range && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Range:</span>
                    <span className="font-medium">{insights.range}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Chart Display */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">Chart Visualization</h2>
              {chartData && (
                <button
                  onClick={downloadChart}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PNG
                </button>
              )}
            </div>

            <div className="h-96">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <LoadingSpinner size="medium" text="Generating chart..." />
                </div>
              ) : chartData ? (
                renderChart()
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No chart generated</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Configure your chart settings and click "Generate Chart"
                    </p>
                  </div>
                </div>
              )}
            </div>

            {chartData && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Chart Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Data Points:</span> {chartData.summary?.totalDataPoints}
                  </div>
                  <div>
                    <span className="font-medium">Chart Type:</span> {chartData.summary?.chartType}
                  </div>
                  <div>
                    <span className="font-medium">X-Axis:</span> {chartData.summary?.xAxis}
                  </div>
                  <div>
                    <span className="font-medium">Y-Axis:</span> {chartData.summary?.yAxis}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Insights Panel */}
          <AIInsightsPanel aiInsights={aiInsights} loading={aiLoading} />
        </div>
      </div>
    </div>
  )
}

export default Analytics
