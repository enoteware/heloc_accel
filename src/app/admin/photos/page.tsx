'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { usePexelsImage } from '@/components/PexelsImage'
import type { PexelsPhoto } from '@/lib/pexels'
import { FINANCIAL_THEMES } from '@/lib/pexels'

interface PhotoCollection {
  theme: keyof typeof FINANCIAL_THEMES
  photos: PexelsPhoto[]
  loading: boolean
  error: string | null
}

export default function PhotosAdminPage() {
  const [collections, setCollections] = useState<PhotoCollection[]>([])
  const [selectedTheme, setSelectedTheme] = useState<keyof typeof FINANCIAL_THEMES>('home')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<PexelsPhoto[]>([])

  // Initialize collections
  useEffect(() => {
    const themes: (keyof typeof FINANCIAL_THEMES)[] = ['home', 'money', 'success', 'planning', 'family']
    const initialCollections: PhotoCollection[] = themes.map(theme => ({
      theme,
      photos: [],
      loading: false,
      error: null
    }))
    setCollections(initialCollections)
  }, [])

  const fetchThemePhotos = async (theme: keyof typeof FINANCIAL_THEMES) => {
    setCollections(prev => prev.map(col => 
      col.theme === theme ? { ...col, loading: true, error: null } : col
    ))

    try {
      const response = await fetch(`/api/pexels/search?theme=${theme}&per_page=30`)
      const data = await response.json()

      if (data.success) {
        setCollections(prev => prev.map(col => 
          col.theme === theme 
            ? { ...col, photos: data.data.photos, loading: false }
            : col
        ))
      } else {
        throw new Error(data.message || 'Failed to fetch photos')
      }
    } catch (error) {
      setCollections(prev => prev.map(col => 
        col.theme === theme 
          ? { ...col, loading: false, error: error instanceof Error ? error.message : 'Unknown error' }
          : col
      ))
    }
  }

  const searchPhotos = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch(`/api/pexels/search?query=${encodeURIComponent(searchQuery)}&per_page=40`)
      const data = await response.json()

      if (data.success) {
        setSearchResults(data.data.photos)
      } else {
        throw new Error(data.message || 'Search failed')
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const PhotoGrid = ({ photos, loading, error }: { photos: PexelsPhoto[], loading: boolean, error: string | null }) => {
    if (loading) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <p className="text-red-600">Error: {error}</p>
        </div>
      )
    }

    if (photos.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No photos loaded. Click "Load Photos" to fetch images.</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {photos.map((photo) => (
          <div key={photo.id} className="group relative">
            <Image
              src={photo.src.small}
              alt={photo.alt}
              width={300}
              height={300}
              className="w-full aspect-square object-cover rounded-lg hover:opacity-75 cursor-pointer transition-opacity"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 text-white text-center">
                <p className="text-xs font-medium">{photo.photographer}</p>
                <p className="text-xs">{photo.width} × {photo.height}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pexels Photo Management
          </h1>
          <p className="text-gray-600">
            Browse and manage stock photos for the HELOC Accelerator application
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Photos</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for photos..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && searchPhotos()}
            />
            <button
              onClick={searchPhotos}
              disabled={isSearching || !searchQuery.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Search Results ({searchResults.length} photos)
              </h3>
              <PhotoGrid photos={searchResults} loading={false} error={null} />
            </div>
          )}
        </div>

        {/* Theme Collections */}
        <div className="space-y-8">
          {collections.map((collection) => (
            <div key={collection.theme} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 capitalize">
                    {collection.theme} Theme
                  </h2>
                  <p className="text-gray-600">
                    {FINANCIAL_THEMES[collection.theme].join(', ')}
                  </p>
                </div>
                <button
                  onClick={() => fetchThemePhotos(collection.theme)}
                  disabled={collection.loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {collection.loading ? 'Loading...' : 'Load Photos'}
                </button>
              </div>

              <PhotoGrid
                photos={collection.photos}
                loading={collection.loading}
                error={collection.error}
              />

              {collection.photos.length > 0 && (
                <div className="mt-4 text-sm text-gray-500">
                  Loaded {collection.photos.length} photos
                </div>
              )}
            </div>
          ))}
        </div>

        {/* API Status */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">API Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium text-gray-900">Rate Limits</h3>
              <p className="text-gray-600">200 requests/hour, 20,000/month</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Attribution</h3>
              <p className="text-gray-600">Required for all photos used</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Available Themes</h3>
              <p className="text-gray-600">{Object.keys(FINANCIAL_THEMES).join(', ')}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Cache Duration</h3>
              <p className="text-gray-600">15 minutes per request</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}