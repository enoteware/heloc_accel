'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import type { PexelsPhoto } from '@/lib/pexels'

interface PexelsImageProps {
  theme?: 'home' | 'money' | 'success' | 'planning' | 'family'
  query?: string
  size?: 'small' | 'medium' | 'large'
  orientation?: 'landscape' | 'portrait' | 'square'
  className?: string
  alt?: string
  width?: number
  height?: number
  priority?: boolean
  fallbackSrc?: string
  onLoad?: (photo: PexelsPhoto) => void
  onError?: (error: string) => void
  showAttribution?: boolean
  attributionClassName?: string
}

export default function PexelsImage({
  theme,
  query,
  size = 'medium',
  orientation = 'landscape',
  className = '',
  alt,
  width = 800,
  height = 600,
  priority = false,
  fallbackSrc,
  onLoad,
  onError,
  showAttribution = true,
  attributionClassName = 'text-xs text-gray-500 mt-1'
}: PexelsImageProps) {
  const [photo, setPhoto] = useState<PexelsPhoto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams({
          per_page: '20',
          page: '1',
          size,
          orientation,
          random: 'true'
        })

        if (theme) {
          params.append('theme', theme)
        } else if (query) {
          params.append('query', query)
        } else {
          // Default to financial themed photos
          params.append('theme', 'money')
        }

        const response = await fetch(`/api/pexels/search?${params}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch image')
        }

        if (data.success && data.data.photos.length > 0) {
          const selectedPhoto = data.data.photos[0]
          setPhoto(selectedPhoto)
          onLoad?.(selectedPhoto)
        } else {
          throw new Error('No photos found')
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load image'
        setError(errorMessage)
        onError?.(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchPhoto()
  }, [theme, query, size, orientation, onLoad, onError])

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 ${className}`} style={{ width, height }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-400 text-sm">Loading image...</div>
        </div>
      </div>
    )
  }

  if (error || !photo) {
    if (fallbackSrc) {
      return (
        <div className={className}>
          <Image
            src={fallbackSrc}
            alt={alt || 'Fallback image'}
            width={width}
            height={height}
            priority={priority}
            className="object-cover"
          />
          {showAttribution && (
            <div className={attributionClassName}>
              <span>Image unavailable</span>
            </div>
          )}
        </div>
      )
    }

    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`} style={{ width, height }}>
        <div className="text-gray-400 text-sm text-center">
          <div>Image unavailable</div>
          {error && <div className="text-xs mt-1">{error}</div>}
        </div>
      </div>
    )
  }

  // Select appropriate image size from Pexels
  const getImageSrc = () => {
    switch (size) {
      case 'small':
        return photo.src.small
      case 'large':
        return photo.src.large
      default:
        return photo.src.medium
    }
  }

  return (
    <div className={className}>
      <Image
        src={getImageSrc()}
        alt={alt || photo.alt || `Photo by ${photo.photographer}`}
        width={width}
        height={height}
        priority={priority}
        className="object-cover"
        placeholder="blur"
        blurDataURL={`data:image/svg+xml;base64,${Buffer.from(
          `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${photo.avg_color}"/></svg>`
        ).toString('base64')}`}
      />
      {showAttribution && (
        <div className={attributionClassName}>
          <span>Photo by </span>
          <a
            href={photo.photographer_url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-700"
          >
            {photo.photographer}
          </a>
          <span> on </span>
          <a
            href="https://www.pexels.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-700"
          >
            Pexels
          </a>
        </div>
      )}
    </div>
  )
}

// Hook for using Pexels images in components
export function usePexelsImage(
  theme?: 'home' | 'money' | 'success' | 'planning' | 'family',
  query?: string,
  options: {
    size?: 'small' | 'medium' | 'large'
    orientation?: 'landscape' | 'portrait' | 'square'
    autoFetch?: boolean
  } = {}
) {
  const [photo, setPhoto] = useState<PexelsPhoto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPhoto = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        per_page: '20',
        page: '1',
        size: options.size || 'medium',
        orientation: options.orientation || 'landscape',
        random: 'true'
      })

      if (theme) {
        params.append('theme', theme)
      } else if (query) {
        params.append('query', query)
      } else {
        params.append('theme', 'money')
      }

      const response = await fetch(`/api/pexels/search?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch image')
      }

      if (data.success && data.data.photos.length > 0) {
        setPhoto(data.data.photos[0])
      } else {
        throw new Error('No photos found')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load image'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchPhoto()
    }
  }, [theme, query, options.size, options.orientation, options.autoFetch, fetchPhoto])

  return {
    photo,
    loading,
    error,
    refetch: fetchPhoto
  }
}