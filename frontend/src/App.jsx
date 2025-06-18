"use client"

import { useEffect } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { Toaster } from "react-hot-toast"
import { checkAuth } from "./store/slices/authSlice"

// Components
import Navbar from "./components/Navbar"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import EnhancedFileUpload from "./pages/EnhancedFileUpload"
import Analytics from "./pages/Analytics"
import Profile from "./pages/Profile"
import LoadingSpinner from "./components/LoadingSpinner"
import AdminDashboard from "./pages/AdminDashboard"

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, loading } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {isAuthenticated && <Navbar />}

      <main className={isAuthenticated ? "pt-16" : ""}>
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/upload" element={isAuthenticated ? <EnhancedFileUpload /> : <Navigate to="/login" />} />
          <Route path="/analytics/:fileId" element={isAuthenticated ? <Analytics /> : <Navigate to="/login" />} />
          <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/admin" element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
