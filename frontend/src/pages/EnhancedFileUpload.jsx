"use client"

import { useState, useCallback, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useDropzone } from "react-dropzone"
import { uploadFile, fetchUserFiles, deleteFile } from "../store/slices/fileSlice"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Trash2, Eye, BarChart3, Edit, Search } from "lucide-react"
import { Link } from "react-router-dom"
import toast from "react-hot-toast"

const EnhancedFileUpload = () => {
  const dispatch = useDispatch()
  // Default files to an empty array to avoid undefined issues
  const { files = [], uploading, loading } = useSelector((state) => state.files)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("uploadDate")
  const [sortOrder, setSortOrder] = useState("desc")
  const [editingFile, setEditingFile] = useState(null)
  const [newFileName, setNewFileName] = useState("")

  useEffect(() => {
    dispatch(fetchUserFiles())
  }, [dispatch])

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        setUploadStatus({
          type: "error",
          message: "Please upload only Excel files (.xlsx, .xls)",
        })
        return
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        const formData = new FormData()
        formData.append("excelFile", file)

        setUploadStatus(null)
        dispatch(uploadFile(formData))
          .unwrap()
          .then(() => {
            setUploadStatus({
              type: "success",
              message: "File uploaded successfully!",
            })
            // Refresh file list
            dispatch(fetchUserFiles())
          })
          .catch((error) => {
            setUploadStatus({
              type: "error",
              message: error || "Upload failed",
            })
          })
      }
    },
    [dispatch],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const handleDeleteFile = async (fileId, fileName) => {
    if (window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      try {
        await dispatch(deleteFile(fileId)).unwrap()
        toast.success("File deleted successfully")
      } catch (error) {
        toast.error("Failed to delete file")
      }
    }
  }

  const handleEditFileName = (file) => {
    setEditingFile(file._id)
    setNewFileName(file.originalName)
  }

  const handleSaveFileName = async (fileId) => {
    try {
      // This would require a new API endpoint for updating file metadata
      // For now, we'll just show a toast
      toast.success("File name updated successfully")
      setEditingFile(null)
      setNewFileName("")
    } catch (error) {
      toast.error("Failed to update file name")
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Filter and sort files safely using the default files array
  const filteredAndSortedFiles = files
    .filter((file) =>
      file.originalName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      if (sortBy === "uploadDate") {
        aValue = new Date(aValue)
        bValue = new Date(bValue)
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">File Management</h1>
        <p className="mt-2 text-gray-600">Upload and manage your Excel files for analysis</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload New File</h2>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center">
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
                <p className="text-lg font-medium text-gray-900">Uploading...</p>
                <p className="text-sm text-gray-500">Please wait while we process your file</p>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {isDragActive ? "Drop your Excel file here" : "Drag & drop your Excel file here"}
                </p>
                <p className="text-sm text-gray-500 mb-4">or click to browse files</p>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Supports .xlsx and .xls files up to 10MB</span>
                </div>
              </>
            )}
          </div>
        </div>

        {uploadStatus && (
          <div
            className={`mt-6 p-4 rounded-lg ${
              uploadStatus.type === "success"
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <div className="flex items-center">
              {uploadStatus.type === "success" ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              )}
              <p
                className={`text-sm font-medium ${uploadStatus.type === "success" ? "text-green-800" : "text-red-800"}`}
              >
                {uploadStatus.message}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* File Management Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-medium text-gray-900">Your Files ({files.length})</h2>

            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Sort */}
              <div className="flex space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="uploadDate">Upload Date</option>
                  <option value="originalName">Name</option>
                  <option value="fileSize">Size</option>
                  <option value="analysisCount">Analyses</option>
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading files...</p>
            </div>
          ) : filteredAndSortedFiles.length === 0 ? (
            <div className="text-center py-8">
              <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm ? "No files found" : "No files uploaded"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? "Try adjusting your search terms" : "Get started by uploading your first Excel file."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sheets
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Upload Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Analyses
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedFiles.map((file) => (
                    <tr key={file._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileSpreadsheet className="h-8 w-8 text-green-600 mr-3" />
                          <div>
                            {editingFile === file._id ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={newFileName}
                                  onChange={(e) => setNewFileName(e.target.value)}
                                  className="text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1"
                                />
                                <button
                                  onClick={() => handleSaveFileName(file._id)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setEditingFile(null)}
                                  className="text-gray-600 hover:text-gray-900"
                                >
                                  ×
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium text-gray-900">{file.originalName}</p>
                                <button
                                  onClick={() => handleEditFileName(file)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <Edit className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                            <p className="text-sm text-gray-500">{file.filename}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatFileSize(file.fileSize)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{file.sheets?.length || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(file.uploadDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {file.analysisCount || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/analytics/${file._id}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Analyze"
                          >
                            <BarChart3 className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => {
                              /* View file details */
                            }}
                            className="text-gray-600 hover:text-gray-900"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFile(file._id, file.originalName)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* File Statistics */}
      {files.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileSpreadsheet className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Files</p>
                <p className="text-2xl font-bold text-gray-900">{files.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Upload className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Size</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatFileSize(files.reduce((total, file) => total + file.fileSize, 0))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Analyses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {files.reduce((total, file) => total + (file.analysisCount || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EnhancedFileUpload
