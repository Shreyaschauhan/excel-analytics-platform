import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import toast from "react-hot-toast"

const API_URL = `${import.meta.env.VITE_API_URL}/admin`;


// Async thunks for admin operations
export const fetchSystemStats = createAsyncThunk("admin/fetchSystemStats", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_URL}/stats`)
    return response.data
  } catch (error) {
    const message = error.response?.data?.message || "Failed to fetch system stats"
    return rejectWithValue(message)
  }
})

export const fetchAllUsers = createAsyncThunk(
  "admin/fetchAllUsers",
  async ({ page = 1, limit = 10, search = "" }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/users?page=${page}&limit=${limit}&search=${search}`)
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch users"
      return rejectWithValue(message)
    }
  },
)

export const fetchAllFiles = createAsyncThunk(
  "admin/fetchAllFiles",
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/files?page=${page}&limit=${limit}`)
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch files"
      return rejectWithValue(message)
    }
  },
)

export const fetchAllAnalyses = createAsyncThunk(
  "admin/fetchAllAnalyses",
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/analyses?page=${page}&limit=${limit}`)
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch analyses"
      return rejectWithValue(message)
    }
  },
)

export const updateUserRole = createAsyncThunk(
  "admin/updateUserRole",
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/users/${userId}/role`, { role })
      toast.success("User role updated successfully")
      return { userId, role, user: response.data.user }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update user role"
      toast.error(message)
      return rejectWithValue(message)
    }
  },
)

export const deleteUser = createAsyncThunk("admin/deleteUser", async (userId, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_URL}/users/${userId}`)
    toast.success("User deleted successfully")
    return userId
  } catch (error) {
    const message = error.response?.data?.message || "Failed to delete user"
    toast.error(message)
    return rejectWithValue(message)
  }
})

export const deleteFile = createAsyncThunk("admin/deleteFile", async (fileId, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_URL}/files/${fileId}`)
    toast.success("File deleted successfully")
    return fileId
  } catch (error) {
    const message = error.response?.data?.message || "Failed to delete file"
    toast.error(message)
    return rejectWithValue(message)
  }
})

export const deleteAnalysis = createAsyncThunk("admin/deleteAnalysis", async (analysisId, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_URL}/analyses/${analysisId}`)
    toast.success("Analysis deleted successfully")
    return analysisId
  } catch (error) {
    const message = error.response?.data?.message || "Failed to delete analysis"
    toast.error(message)
    return rejectWithValue(message)
  }
})

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    // System stats
    stats: null,

    // Users management
    users: [],
    usersPagination: null,

    // Files management
    files: [],
    filesPagination: null,

    // Analyses management
    analyses: [],
    analysesPagination: null,

    // Loading states
    loading: false,
    usersLoading: false,
    filesLoading: false,
    analysesLoading: false,

    // Error states
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch system stats
      .addCase(fetchSystemStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSystemStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload
      })
      .addCase(fetchSystemStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch all users
      .addCase(fetchAllUsers.pending, (state) => {
        state.usersLoading = true
        state.error = null
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.usersLoading = false
        state.users = action.payload.users
        state.usersPagination = action.payload.pagination
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.usersLoading = false
        state.error = action.payload
      })

      // Fetch all files
      .addCase(fetchAllFiles.pending, (state) => {
        state.filesLoading = true
        state.error = null
      })
      .addCase(fetchAllFiles.fulfilled, (state, action) => {
        state.filesLoading = false
        state.files = action.payload.files
        state.filesPagination = action.payload.pagination
      })
      .addCase(fetchAllFiles.rejected, (state, action) => {
        state.filesLoading = false
        state.error = action.payload
      })

      // Fetch all analyses
      .addCase(fetchAllAnalyses.pending, (state) => {
        state.analysesLoading = true
        state.error = null
      })
      .addCase(fetchAllAnalyses.fulfilled, (state, action) => {
        state.analysesLoading = false
        state.analyses = action.payload.analyses
        state.analysesPagination = action.payload.pagination
      })
      .addCase(fetchAllAnalyses.rejected, (state, action) => {
        state.analysesLoading = false
        state.error = action.payload
      })

      // Update user role
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const { userId, role } = action.payload
        const userIndex = state.users.findIndex((user) => user._id === userId)
        if (userIndex !== -1) {
          state.users[userIndex].role = role
        }
      })

      // Delete user
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user._id !== action.payload)
      })

      // Delete file
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.files = state.files.filter((file) => file._id !== action.payload)
      })

      // Delete analysis
      .addCase(deleteAnalysis.fulfilled, (state, action) => {
        state.analyses = state.analyses.filter((analysis) => analysis._id !== action.payload)
      })
  },
})

export const { clearError, setLoading } = adminSlice.actions
export default adminSlice.reducer
