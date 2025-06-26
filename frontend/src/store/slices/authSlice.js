import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import toast from "react-hot-toast"


const API_URL = `${import.meta.env.VITE_API_URL}/auth`



// Set up axios defaults
const token = localStorage.getItem("token")
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
}

// Async thunks
export const login = createAsyncThunk("auth/login", async ({ email, password }, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password })
    const { token, user } = response.data

    localStorage.setItem("token", token)
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

    toast.success("Login successful!")
    return { token, user }
  } catch (error) {
    const message = error.response?.data?.message || "Login failed"
    toast.error(message)
    return rejectWithValue(message)
  }
})


console.log("✅ VITE_API_URL:", import.meta.env.VITE_API_URL);


export const register = createAsyncThunk(
  "auth/register",
  async ({ username, email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/register`, {
        username,
        email,
        password,
      })
      const { token, user } = response.data

      localStorage.setItem("token", token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

      toast.success("Registration successful!")
      return { token, user }
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed"
      toast.error(message)
      return rejectWithValue(message)
    }
  },
)

export const checkAuth = createAsyncThunk("auth/checkAuth", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token")
    if (!token) {
      return rejectWithValue("No token found")
    }

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    const response = await axios.get(`${API_URL}/me`)

    return { token, user: response.data.user }
  } catch (error) {
    localStorage.removeItem("token")
    delete axios.defaults.headers.common["Authorization"]
    return rejectWithValue("Token invalid")
  }
})

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem("token")
      delete axios.defaults.headers.common["Authorization"]
      state.user = null
      state.token = null
      state.isAuthenticated = false
      toast.success("Logged out successfully")
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false
        state.isAuthenticated = false
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
