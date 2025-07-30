'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Building, Save, X } from 'lucide-react'
import { useCompany } from '@/contexts/CompanyContext'
import { getDemoCompanySettings, updateDemoCompanySettings } from '@/lib/company-data'
import type { CompanySettings } from '@/lib/company-data'

export default function CompanySettingsPage() {
  const router = useRouter()
  const { companySettings, refreshCompanyData } = useCompany()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<CompanySettings>({
    companyName: '',
    companyLogoUrl: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyWebsite: '',
    companyLicenseNumber: '',
    companyNmlsNumber: '',
    companyDescription: '',
    primaryColor: '#2563eb',
    secondaryColor: '#10b981'
  })

  // Load company settings
  useEffect(() => {
    if (companySettings) {
      setFormData(companySettings)
    } else {
      // Load from demo storage if available
      const demoSettings = getDemoCompanySettings()
      if (demoSettings) {
        setFormData(demoSettings)
      }
    }
  }, [companySettings])

  const handleChange = (field: keyof CompanySettings, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

      if (isDemoMode) {
        // Update demo storage
        updateDemoCompanySettings(formData)
        await refreshCompanyData()
        alert('Company settings updated successfully!')
      } else {
        // Update via API
        const response = await fetch('/api/company', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          await refreshCompanyData()
          alert('Company settings updated successfully!')
        } else {
          throw new Error('Failed to update settings')
        }
      }
    } catch (error) {
      console.error('Error saving company settings:', error)
      alert('Failed to save company settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Building className="h-6 w-6 text-gray-600" />
          <h1 className="text-2xl font-bold text-gray-900">Company Settings</h1>
        </div>
        <p className="text-sm text-gray-600">
          Manage your company information and branding
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="companyPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="companyPhone"
                  value={formData.companyPhone || ''}
                  onChange={(e) => handleChange('companyPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1-800-HELOC-01"
                  required
                />
              </div>

              <div>
                <label htmlFor="companyEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="companyEmail"
                  value={formData.companyEmail || ''}
                  onChange={(e) => handleChange('companyEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="companyWebsite" className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  id="companyWebsite"
                  value={formData.companyWebsite || ''}
                  onChange={(e) => handleChange('companyWebsite', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700 mb-1">
                Company Address
              </label>
              <textarea
                id="companyAddress"
                value={formData.companyAddress || ''}
                onChange={(e) => handleChange('companyAddress', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123 Main Street, Suite 100&#10;City, State 12345"
              />
            </div>

            <div>
              <label htmlFor="companyDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Company Description
              </label>
              <textarea
                id="companyDescription"
                value={formData.companyDescription || ''}
                onChange={(e) => handleChange('companyDescription', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of your company and services..."
              />
            </div>
          </div>
        </div>

        {/* Licensing Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Licensing Information</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="companyLicenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Company License Number
                </label>
                <input
                  type="text"
                  id="companyLicenseNumber"
                  value={formData.companyLicenseNumber || ''}
                  onChange={(e) => handleChange('companyLicenseNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ML-123456"
                />
              </div>

              <div>
                <label htmlFor="companyNmlsNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  NMLS Number
                </label>
                <input
                  type="text"
                  id="companyNmlsNumber"
                  value={formData.companyNmlsNumber || ''}
                  onChange={(e) => handleChange('companyNmlsNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1234567"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Branding</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="companyLogoUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Logo URL
              </label>
              <input
                type="url"
                id="companyLogoUrl"
                value={formData.companyLogoUrl || ''}
                onChange={(e) => handleChange('companyLogoUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="primaryColor"
                    value={formData.primaryColor || '#2563eb'}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    className="h-10 w-16 border border-gray-300 rounded-md cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor || '#2563eb'}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#2563eb"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700 mb-1">
                  Secondary Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="secondaryColor"
                    value={formData.secondaryColor || '#10b981'}
                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                    className="h-10 w-16 border border-gray-300 rounded-md cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.secondaryColor || '#10b981'}
                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#10b981"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}