import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import toast from "react-hot-toast"

const API_URL = "http://localhost:5040/api/files"

// Async thunks
export const uploadFile = createAsyncThunk("files/uploadFile", async (formData, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    toast.success("File uploaded successfully!")
    return response.data
  } catch (error) {
    const message = error.response?.data?.message || "Upload failed"
    toast.error(message)
    return rejectWithValue(message)
  }
})


export const fetchUserFiles = createAsyncThunk("files/fetchUserFiles", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_URL}/my-files`)
    return response.data.files
  } catch (error) {
    const message = error.response?.data?.message || "Failed to fetch files"
    return rejectWithValue(message)
  }
})

export const deleteFile = createAsyncThunk("files/deleteFile", async (fileId, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_URL}/${fileId}`)
    toast.success("File deleted successfully!")
    return fileId
  } catch (error) {
    const message = error.response?.data?.message || "Delete failed"
    toast.error(message)
    return rejectWithValue(message)
  }
})

const fileSlice = createSlice({
  name: "files",
  initialState: {
    files: [],
    currentFile: null,
    loading: false,
    uploading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentFile: (state, action) => {
      state.currentFile = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload file
      .addCase(uploadFile.pending, (state) => {
        state.uploading = true
        state.error = null
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.uploading = false
        state.files.unshift(action.payload.file)
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.uploading = false
        state.error = action.payload
      })
      // Fetch files
      .addCase(fetchUserFiles.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserFiles.fulfilled, (state, action) => {
        state.loading = false
        state.files = action.payload
      })
      .addCase(fetchUserFiles.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete file
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.files = state.files.filter((file) => file._id !== action.payload)
      })
  },
})

export const { clearError, setCurrentFile } = fileSlice.actions
export default fileSlice.reducer
