"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { fetchUserFiles } from "../store/slices/fileSlice"
import { fetchAnalysisHistory } from "../store/slices/analyticsSlice"
import { Upload, FileSpreadsheet, BarChart3, Calendar } from "lucide-react"
import LoadingSpinner from "../components/LoadingSpinner"

const Dashboard = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { files = [], loading } = useSelector((state) => state.files)
  const { analysisHistory = [] } = useSelector((state) => state.analytics)

  useEffect(() => {
    dispatch(fetchUserFiles())
    dispatch(fetchAnalysisHistory())
  }, [dispatch])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.username || "User"}!</h1>
        <p className="mt-2 text-gray-600">Manage your Excel files and create beautiful analytics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileSpreadsheet className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Files</p>
              <p className="text-2xl font-bold text-gray-900">{files?.length ?? 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Analyses Created</p>
              <p className="text-2xl font-bold text-gray-900">{analysisHistory?.length ?? 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Upload className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Storage Used</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatFileSize((files || []).reduce((total, file) => total + (file?.fileSize || 0), 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Files */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Recent Files</h2>
              <Link
                to="/upload"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload New
              </Link>
            </div>
          </div>
          <div className="px-6 py-4">
            {files?.length === 0 ? (
              <div className="text-center py-8">
                <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No files uploaded</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by uploading your first Excel file.</p>
                <div className="mt-6">
                  <Link
                    to="/upload"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Excel File
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {(files || []).slice(0, 5).map((file) => (
                  <div
                    key={file._id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <FileSpreadsheet className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.originalName}</p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.fileSize)} • {formatDate(file.uploadDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/analytics/${file._id}`}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                      >
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Analyze
                      </Link>
                    </div>
                  </div>
                ))}
                {files?.length > 5 && (
                  <div className="text-center">
                    <p className="text-sm text-gray-500">And {files.length - 5} more files...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Analysis */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Analysis</h2>
          </div>
          <div className="px-6 py-4">
            {analysisHistory?.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No analysis yet</h3>
                <p className="mt-1 text-sm text-gray-500">Upload a file and create your first chart analysis.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(analysisHistory || []).slice(0, 5).map((analysis) => (
                  <div
                    key={analysis._id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <BarChart3 className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {analysis.chartType?.charAt(0).toUpperCase() + analysis.chartType?.slice(1)} Chart
                        </p>
                        <p className="text-sm text-gray-500">
                          {analysis.xAxis} vs {analysis.yAxis} • {formatDate(analysis.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
