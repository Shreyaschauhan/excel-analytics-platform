"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  fetchSystemStats,
  fetchAllUsers,
  fetchAllFiles,
  fetchAllAnalyses,
  updateUserRole,
  deleteUser,
  deleteFile,
} from "../store/slices/adminSlice"
import { Users, FileText, BarChart3, HardDrive, Shield, Trash2 } from "lucide-react"
import LoadingSpinner from "../components/LoadingSpinner"

const AdminDashboard = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { stats, users, files, analyses, loading, usersLoading, filesLoading, analysesLoading } = useSelector(
    (state) => state.admin,
  )

  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (user?.role === "admin") {
      dispatch(fetchSystemStats())
      dispatch(fetchAllUsers({ page: 1, limit: 10 }))
      dispatch(fetchAllFiles({ page: 1, limit: 10 }))
      dispatch(fetchAllAnalyses({ page: 1, limit: 10 }))
    }
  }, [dispatch, user])

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      dispatch(deleteUser(userId))
    }
  }

  const handleDeleteFile = async (fileId) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      dispatch(deleteFile(fileId))
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    dispatch(updateUserRole({ userId, role: newRole }))
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

  if (user?.role !== "admin") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return <LoadingSpinner text="Loading admin dashboard..." />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage users, files, and system statistics</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "overview", name: "Overview", icon: BarChart3 },
            { id: "users", name: "Users", icon: Users },
            { id: "files", name: "Files", icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && stats && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.users?.total || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Files</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.files?.totalFiles || 0}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{stats.analyses?.total || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <HardDrive className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Storage Used</p>
                  <p className="text-2xl font-bold text-gray-900">{formatFileSize(stats.files?.totalSize || 0)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Users</h3>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-4">
                  {stats.recentActivity?.users?.map((user) => (
                    <div key={user._id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <p className="text-sm text-gray-500">{formatDate(user.createdAt)}</p>
                    </div>
                  )) || <p className="text-gray-500">No recent users</p>}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Files</h3>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-4">
                  {stats.recentActivity?.files?.map((file) => (
                    <div key={file._id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.originalName}</p>
                        <p className="text-sm text-gray-500">by {file.uploadedBy?.username}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-900">{formatFileSize(file.fileSize)}</p>
                        <p className="text-sm text-gray-500">{formatDate(file.uploadDate)}</p>
                      </div>
                    </div>
                  )) || <p className="text-gray-500">No recent files</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">User Management</h3>
          </div>
          <div className="overflow-x-auto">
            {usersLoading ? (
              <div className="p-8 text-center">
                <LoadingSpinner size="medium" text="Loading users..." />
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users?.length > 0 && users.map((userData) => (
                    <tr key={userData._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{userData.username}</div>
                          <div className="text-sm text-gray-500">{userData.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={userData.role}
                          onChange={(e) => handleRoleChange(userData._id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                          disabled={userData._id === user._id} // Prevent changing own role
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(userData.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {userData.lastLogin ? formatDate(userData.lastLogin) : "Never"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteUser(userData._id)}
                          disabled={userData._id === user._id} // Prevent deleting own account
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Files Tab */}
      {activeTab === "files" && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">File Management</h3>
          </div>
          <div className="overflow-x-auto">
            {filesLoading ? (
              <div className="p-8 text-center">
                <LoadingSpinner size="medium" text="Loading files..." />
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
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
                  {Array.isArray(files) && files.map((file) => (
                    <tr key={file._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{file.originalName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{file.uploadedBy?.username}</div>
                        <div className="text-sm text-gray-500">{file.uploadedBy?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatFileSize(file.fileSize)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(file.uploadDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{file.analysisCount || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => handleDeleteFile(file._id)} className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
