import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import toast from "react-hot-toast"

const API_URL = "http://localhost:5040/api/analytics"

// Async thunks
export const generateChartData = createAsyncThunk(
  "analytics/generateChartData",
  async ({ fileId, sheetName, xAxis, yAxis, chartType }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/chart-data`, {
        fileId,
        sheetName,
        xAxis,
        yAxis,
        chartType,
      })

      return response.data
    } catch (error) {
      const message = error.response?.data?.message || "Failed to generate chart"
      toast.error(message)
      return rejectWithValue(message)
    }
  },
)

export const fetchAnalysisHistory = createAsyncThunk(
  "analytics/fetchAnalysisHistory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/history`)
      return response.data.analyses
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch history"
      return rejectWithValue(message)
    }
  },
)

export const generateInsights = createAsyncThunk(
  "analytics/generateInsights",
  async ({ fileId, sheetName, column }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/insights`, {
        fileId,
        sheetName,
        column,
      })

      return response.data.insights
    } catch (error) {
      const message = error.response?.data?.message || "Failed to generate insights"
      toast.error(message)
      return rejectWithValue(message)
    }
  },
)

const analyticsSlice = createSlice({
  name: "analytics",
  initialState: {
    chartData: null,
    analysisHistory: [],
    insights: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearChartData: (state) => {
      state.chartData = null
    },
    clearInsights: (state) => {
      state.insights = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Generate chart data
      .addCase(generateChartData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(generateChartData.fulfilled, (state, action) => {
        state.loading = false
        state.chartData = action.payload
      })
      .addCase(generateChartData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch analysis history
      .addCase(fetchAnalysisHistory.fulfilled, (state, action) => {
        state.analysisHistory = action.payload
      })
      // Generate insights
      .addCase(generateInsights.pending, (state) => {
        state.loading = true
      })
      .addCase(generateInsights.fulfilled, (state, action) => {
        state.loading = false
        state.insights = action.payload
      })
      .addCase(generateInsights.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearChartData, clearInsights, clearError } = analyticsSlice.actions
export default analyticsSlice.reducer
