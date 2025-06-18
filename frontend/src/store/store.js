import { configureStore } from "@reduxjs/toolkit"
import authSlice from "./slices/authSlice"
import fileSlice from "./slices/fileSlice"
import analyticsSlice from "./slices/analyticsSlice"
import adminSlice from "./slices/adminSlice"
import profileSlice from "./slices/profileSlice"

export const store = configureStore({
  reducer: {
    auth: authSlice,
    files: fileSlice,
    analytics: analyticsSlice,
    admin: adminSlice,
    profile: profileSlice,
  },
})
