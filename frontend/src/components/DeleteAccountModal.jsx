"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { deleteAccount } from "../store/slices/profileSlice"
import { logout } from "../store/slices/authSlice"
import { X, AlertTriangle, Lock } from "lucide-react"

const DeleteAccountModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { deleting } = useSelector((state) => state.profile)
  const { user } = useSelector((state) => state.auth)

  const [password, setPassword] = useState("")
  const [confirmText, setConfirmText] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!password) {
      setError("Password is required")
      return
    }

    if (confirmText !== "DELETE") {
      setError('Please type "DELETE" to confirm')
      return
    }

    const result = await dispatch(deleteAccount(password))

    if (deleteAccount.fulfilled.match(result)) {
      dispatch(logout())
      navigate("/login")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-medium text-gray-900">Delete Account</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Warning</h4>
                <p className="mt-1 text-sm text-red-700">
                  This action cannot be undone. This will permanently delete your account and remove all your data from
                  our servers.
                </p>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600 space-y-2">
            <p>
              <strong>What will be deleted:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Your user account and profile</li>
              <li>All uploaded Excel files</li>
              <li>All created charts and analyses</li>
              <li>All associated data and history</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password Confirmation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enter your password to confirm</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {/* Confirmation Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type <span className="font-bold text-red-600">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Type DELETE here"
            />
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">{error}</div>}

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={deleting || !password || confirmText !== "DELETE"}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DeleteAccountModal
