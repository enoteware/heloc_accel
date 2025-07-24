/**
 * Simple health check endpoint
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/health
 * Simple health check endpoint
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const response = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      demo_mode: process.env.DEMO_MODE === 'true'
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    }, { status: 503 })
  }
}

