"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { updateProfile, exportUserData } from "../store/slices/profileSlice"
import { User, Mail, Calendar, Shield, Edit, Download, Trash2, Lock } from "lucide-react"
import ChangePasswordModal from "../components/ChangePasswordModal"
import DeleteAccountModal from "../components/DeleteAccountModal"

const Profile = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { files } = useSelector((state) => state.files)
  const { analysisHistory } = useSelector((state) => state.analytics)
  const { updating, exporting } = useSelector((state) => state.profile)

  const [isEditing, setIsEditing] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  const [editForm, setEditForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
  })

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form if canceling
      setEditForm({
        username: user?.username || "",
        email: user?.email || "",
      })
    }
    setIsEditing(!isEditing)
  }

  const handleSaveProfile = async () => {
    const result = await dispatch(updateProfile(editForm))
    if (updateProfile.fulfilled.match(result)) {
      setIsEditing(false)
    }
  }

  const handleExportData = () => {
    dispatch(exportUserData())
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="mt-2 text-gray-600">Manage your account information and view your activity</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">Account Information</h2>
              <button
                onClick={handleEditToggle}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? "Cancel" : "Edit"}
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Username</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-lg text-gray-900">{user?.username}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Mail className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Email Address</p>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-lg text-gray-900">{user?.email}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Account Type</p>
                  <p className="text-lg text-gray-900 capitalize">{user?.role}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Member Since</p>
                  <p className="text-lg text-gray-900">{formatDate(user?.createdAt)}</p>
                </div>
              </div>

              {isEditing && (
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleSaveProfile}
                    disabled={updating}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {updating ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={handleEditToggle}
                    className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Activity Stats & Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Overview</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Files Uploaded</span>
                <span className="text-2xl font-bold text-blue-600">{files.length}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Charts Created</span>
                <span className="text-2xl font-bold text-green-600">{analysisHistory.length}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Storage</span>
                <span className="text-2xl font-bold text-purple-600">
                  {(files.reduce((total, file) => total + file.fileSize, 0) / (1024 * 1024)).toFixed(1)}MB
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>

            <div className="space-y-3">
              <button
                onClick={() => setShowChangePassword(true)}
                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </button>

              <button
                onClick={handleExportData}
                disabled={exporting}
                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
              >
                <Download className="h-4 w-4 mr-2" />
                {exporting ? "Exporting..." : "Export Data"}
              </button>

              <button
                onClick={() => setShowDeleteAccount(true)}
                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ChangePasswordModal isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />

      <DeleteAccountModal isOpen={showDeleteAccount} onClose={() => setShowDeleteAccount(false)} />
    </div>
  )
}

export default Profile
