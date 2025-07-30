import { NextRequest, NextResponse } from 'next/server'
import { getPexelsClient, FINANCIAL_THEMES, getRandomThemedPhoto } from '@/lib/pexels'
import type { PexelsPhoto } from '@/lib/pexels'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const theme = searchParams.get('theme') as keyof typeof FINANCIAL_THEMES | null
    const per_page = parseInt(searchParams.get('per_page') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    const orientation = searchParams.get('orientation') as 'landscape' | 'portrait' | 'square' | null
    const size = searchParams.get('size') as 'large' | 'medium' | 'small' | null
    const random = searchParams.get('random') === 'true'

    const client = getPexelsClient()

    let result: any

    if (theme && random) {
      // Get a random themed photo
      const photo = await getRandomThemedPhoto(theme, client, {
        ...(orientation && { orientation }),
        ...(size && { size })
      })
      
      result = {
        total_results: photo ? 1 : 0,
        page: 1,
        per_page: 1,
        photos: photo ? [photo] : [],
        theme: theme
      }
    } else if (query) {
      // Search for specific query
      result = await client.searchPhotos(query, {
        per_page: Math.min(per_page, 80), // Pexels max is 80
        page: Math.max(page, 1),
        ...(orientation && { orientation }),
        ...(size && { size })
      })
    } else if (theme) {
      // Search using theme queries
      const themes = FINANCIAL_THEMES[theme]
      const randomQuery = themes[Math.floor(Math.random() * themes.length)]
      
      result = await client.searchPhotos(randomQuery, {
        per_page: Math.min(per_page, 80),
        page: Math.max(page, 1),
        ...(orientation && { orientation }),
        ...(size && { size })
      })
      
      result.theme = theme
      result.query_used = randomQuery
    } else {
      // Get curated photos as fallback
      result = await client.getCuratedPhotos({
        per_page: Math.min(per_page, 80),
        page: Math.max(page, 1)
      })
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Pexels search API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to search photos',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { queries, theme, options = {} } = body

    if (!queries || !Array.isArray(queries)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request body',
        message: 'queries array is required'
      }, { status: 400 })
    }

    const client = getPexelsClient()
    const results: Array<{ query: string; photos: PexelsPhoto[]; error?: string }> = []

    // Search for multiple queries in parallel
    const searchPromises = queries.map(async (query: string) => {
      try {
        const result = await client.searchPhotos(query, {
          per_page: options.per_page || 10,
          page: options.page || 1,
          ...(options.orientation && { orientation: options.orientation }),
          ...(options.size && { size: options.size })
        })
        
        return {
          query,
          photos: result.photos
        }
      } catch (error) {
        return {
          query,
          photos: [],
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    })

    const searchResults = await Promise.all(searchPromises)
    results.push(...searchResults)

    return NextResponse.json({
      success: true,
      data: {
        results,
        theme,
        total_queries: queries.length,
        total_photos: results.reduce((sum, r) => sum + r.photos.length, 0)
      }
    })

  } catch (error) {
    console.error('Pexels batch search API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to perform batch search',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}