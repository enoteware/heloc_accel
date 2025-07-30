'use client'

import React from 'react'
import { User, Mail, Phone, MapPin, Award } from 'lucide-react'
import type { Agent } from '@/lib/company-data'

interface AgentFormProps {
  agent?: Agent
  onSubmit: (data: Partial<Agent>) => void
  onCancel: () => void
  loading?: boolean
}

export default function AgentForm({ agent, onSubmit, onCancel, loading = false }: AgentFormProps) {
  const [formData, setFormData] = React.useState<Partial<Agent>>({
    firstName: agent?.firstName || '',
    lastName: agent?.lastName || '',
    title: agent?.title || '',
    email: agent?.email || '',
    phone: agent?.phone || '',
    phoneExtension: agent?.phoneExtension || '',
    mobilePhone: agent?.mobilePhone || '',
    bio: agent?.bio || '',
    nmlsNumber: agent?.nmlsNumber || '',
    licenseStates: agent?.licenseStates || [],
    specialties: agent?.specialties || [],
    yearsExperience: agent?.yearsExperience || 0,
    isActive: agent?.isActive ?? true,
    displayOrder: agent?.displayOrder || 0
  })

  const handleChange = (field: keyof Agent, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayChange = (field: 'licenseStates' | 'specialties', value: string) => {
    const values = value.split(',').map(v => v.trim()).filter(v => v)
    handleChange(field, values)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
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
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title/Position
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Senior Loan Officer"
              />
            </div>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
              Bio/Description
            </label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief professional biography..."
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Information
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Office Phone
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="555-0100"
              />
            </div>

            <div>
              <label htmlFor="phoneExtension" className="block text-sm font-medium text-gray-700 mb-1">
                Extension
              </label>
              <input
                type="text"
                id="phoneExtension"
                value={formData.phoneExtension}
                onChange={(e) => handleChange('phoneExtension', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="101"
              />
            </div>
          </div>

          <div>
            <label htmlFor="mobilePhone" className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Phone
            </label>
            <input
              type="tel"
              id="mobilePhone"
              value={formData.mobilePhone}
              onChange={(e) => handleChange('mobilePhone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="555-555-0100"
            />
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Award className="h-5 w-5" />
            Professional Information
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nmlsNumber" className="block text-sm font-medium text-gray-700 mb-1">
                NMLS Number
              </label>
              <input
                type="text"
                id="nmlsNumber"
                value={formData.nmlsNumber}
                onChange={(e) => handleChange('nmlsNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123456"
              />
            </div>

            <div>
              <label htmlFor="yearsExperience" className="block text-sm font-medium text-gray-700 mb-1">
                Years of Experience
              </label>
              <input
                type="number"
                id="yearsExperience"
                value={formData.yearsExperience}
                onChange={(e) => handleChange('yearsExperience', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
          </div>

          <div>
            <label htmlFor="licenseStates" className="block text-sm font-medium text-gray-700 mb-1">
              Licensed States
            </label>
            <input
              type="text"
              id="licenseStates"
              value={formData.licenseStates?.join(', ')}
              onChange={(e) => handleArrayChange('licenseStates', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="CA, TX, FL (comma separated)"
            />
            <p className="mt-1 text-xs text-gray-500">Enter state abbreviations separated by commas</p>
          </div>

          <div>
            <label htmlFor="specialties" className="block text-sm font-medium text-gray-700 mb-1">
              Specialties
            </label>
            <input
              type="text"
              id="specialties"
              value={formData.specialties?.join(', ')}
              onChange={(e) => handleArrayChange('specialties', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="HELOC, FHA, VA (comma separated)"
            />
            <p className="mt-1 text-xs text-gray-500">Enter specialties separated by commas</p>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active Status
              </label>
              <p className="text-xs text-gray-500">Inactive agents won't be assigned to new users</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-700 mb-1">
              Display Order
            </label>
            <input
              type="number"
              id="displayOrder"
              value={formData.displayOrder}
              onChange={(e) => handleChange('displayOrder', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
            <p className="mt-1 text-xs text-gray-500">Lower numbers appear first in lists</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : agent ? 'Update Agent' : 'Create Agent'}
        </button>
      </div>
    </form>
  )
}