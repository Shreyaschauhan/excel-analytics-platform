import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import toast from "react-hot-toast"

const API_URL = "http://localhost:5040/api/auth"

// Async thunks for profile operations
export const updateProfile = createAsyncThunk(
  "profile/updateProfile",
  async ({ username, email }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/profile`, { username, email })
      toast.success("Profile updated successfully!")
      return response.data.user
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update profile"
      toast.error(message)
      return rejectWithValue(message)
    }
  },
)

export const changePassword = createAsyncThunk(
  "profile/changePassword",
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      await axios.put(`${API_URL}/change-password`, { currentPassword, newPassword })
      toast.success("Password changed successfully!")
      return true
    } catch (error) {
      const message = error.response?.data?.message || "Failed to change password"
      toast.error(message)
      return rejectWithValue(message)
    }
  },
)

export const exportUserData = createAsyncThunk("profile/exportUserData", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_URL}/export-data`, {
      responseType: "blob",
    })

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `user-data-${new Date().toISOString().split("T")[0]}.json`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    toast.success("Data exported successfully!")
    return true
  } catch (error) {
    const message = error.response?.data?.message || "Failed to export data"
    toast.error(message)
    return rejectWithValue(message)
  }
})

export const deleteAccount = createAsyncThunk("profile/deleteAccount", async (password, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_URL}/delete-account`, {
      data: { password },
    })
    toast.success("Account deleted successfully")
    return true
  } catch (error) {
    const message = error.response?.data?.message || "Failed to delete account"
    toast.error(message)
    return rejectWithValue(message)
  }
})

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    loading: false,
    updating: false,
    changingPassword: false,
    exporting: false,
    deleting: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.updating = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state) => {
        state.updating = false
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updating = false
        state.error = action.payload
      })

      // Change password
      .addCase(changePassword.pending, (state) => {
        state.changingPassword = true
        state.error = null
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.changingPassword = false
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.changingPassword = false
        state.error = action.payload
      })

      // Export data
      .addCase(exportUserData.pending, (state) => {
        state.exporting = true
        state.error = null
      })
      .addCase(exportUserData.fulfilled, (state) => {
        state.exporting = false
      })
      .addCase(exportUserData.rejected, (state, action) => {
        state.exporting = false
        state.error = action.payload
      })

      // Delete account
      .addCase(deleteAccount.pending, (state) => {
        state.deleting = true
        state.error = null
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.deleting = false
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.deleting = false
        state.error = action.payload
      })
  },
})

export const { clearError } = profileSlice.actions
export default profileSlice.reducer
