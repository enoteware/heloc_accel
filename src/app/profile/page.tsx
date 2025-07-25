'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  createdAt: string
  updatedAt: string
  lastLogin?: string
  emailVerified: boolean
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: ''
  })

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  // Redirect to login if not authenticated (skip in demo mode)
  useEffect(() => {
    if (isDemoMode) return // Skip auth check in demo mode
    if (status === 'loading') return
    if (!session) {
      router.push('/login?callbackUrl=/profile')
    }
  }, [session, status, router, isDemoMode])

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true)
      
      if (isDemoMode) {
        // In demo mode, create mock profile data
        const demoUser = session?.user || { id: 'demo-user-001', email: 'demo@helocaccel.com', name: 'Demo User' }
        const mockProfile: UserProfile = {
          id: demoUser.id,
          email: demoUser.email || 'demo@helocaccel.com',
          firstName: demoUser.name?.split(' ')[0] || 'Demo',
          lastName: demoUser.name?.split(' ')[1] || 'User',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          emailVerified: true
        }
        
        setProfile(mockProfile)
        setProfileForm({
          firstName: mockProfile.firstName,
          lastName: mockProfile.lastName,
          email: mockProfile.email
        })
      } else {
        // Production mode - fetch from API
        const response = await fetch('/api/profile')
        
        if (!response.ok) {
          throw new Error('Failed to load profile')
        }

        const data = await response.json()
        if (data.success) {
          setProfile(data.data)
          setProfileForm({
            firstName: data.data.firstName || '',
            lastName: data.data.lastName || '',
            email: data.data.email || ''
          })
        } else {
          throw new Error(data.error || 'Failed to load profile')
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err)
      setError('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }, [isDemoMode, session?.user])

  // Load profile data
  useEffect(() => {
    if (isDemoMode || session) {
      loadProfile()
    }
  }, [session, isDemoMode, loadProfile])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      setSaving(true)
      
      if (isDemoMode) {
        // In demo mode, simulate profile update
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate network delay
        setProfile(prev => prev ? { 
          ...prev, 
          firstName: profileForm.firstName,
          lastName: profileForm.lastName,
          email: profileForm.email,
          updatedAt: new Date().toISOString()
        } : null)
        setSuccess('Profile updated successfully (Demo Mode)')
      } else {
        // Production mode - send to API
        const response = await fetch('/api/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(profileForm)
        })

        const data = await response.json()
        if (data.success) {
          setProfile(prev => prev ? { ...prev, ...data.data } : null)
          setSuccess('Profile updated successfully')
        } else {
          throw new Error(data.error || 'Failed to update profile')
        }
      }
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      setSaving(true)
      
      if (isDemoMode) {
        // In demo mode, simulate password change
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate network delay
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        setShowPasswordForm(false)
        setSuccess('Password changed successfully (Demo Mode)')
      } else {
        // Production mode - send to API
        const response = await fetch('/api/profile/password', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(passwordForm)
        })

        const data = await response.json()
        if (data.success) {
          setPasswordForm({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          })
          setShowPasswordForm(false)
          setSuccess('Password changed successfully')
        } else {
          throw new Error(data.error || 'Failed to change password')
        }
      }
    } catch (err) {
      console.error('Error changing password:', err)
      setError(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!isDemoMode && !session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-green-800">Demo Mode - Profile Settings</h3>
                <p className="text-sm text-green-700">
                  Profile changes are simulated and will not be saved to a database. Password changes are for demonstration only.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Profile Settings
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Manage your account information and security settings
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition duration-200 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Account Security */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Account Security</h2>
            </div>
            <div className="p-6">
              {!showPasswordForm ? (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Password</h3>
                    <p className="text-gray-600">Change your account password</p>
                  </div>
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium transition duration-200"
                  >
                    Change Password
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password *
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password *
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Must be at least 8 characters with uppercase, lowercase, and number
                    </p>
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false)
                        setPasswordForm({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        })
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium transition duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition duration-200 disabled:opacity-50"
                    >
                      {saving ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Account Information */}
          {profile && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Account Information</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Account Created</h3>
                    <p className="text-gray-900">{formatDate(profile.createdAt)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Last Updated</h3>
                    <p className="text-gray-900">{formatDate(profile.updatedAt)}</p>
                  </div>
                  {profile.lastLogin && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Last Login</h3>
                      <p className="text-gray-900">{formatDate(profile.lastLogin)}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Email Verified</h3>
                    <p className={`font-medium ${profile.emailVerified ? 'text-green-600' : 'text-red-600'}`}>
                      {profile.emailVerified ? 'Verified' : 'Not Verified'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
