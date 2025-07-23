/**
 * Health check endpoint for monitoring application status
 */

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'
import { logger, logHealthCheck } from '@/lib/logger'

interface HealthCheckResult {
  service: string
  status: 'healthy' | 'unhealthy'
  responseTime?: number
  error?: string
  details?: Record<string, any>
}

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  version: string
  environment: string
  checks: HealthCheckResult[]
  summary: {
    total: number
    healthy: number
    unhealthy: number
  }
}

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<HealthCheckResult> {
  const startTime = Date.now()
  
  try {
    const result = await query('SELECT 1 as health_check', [])
    const responseTime = Date.now() - startTime
    
    if (result.rows.length === 1 && result.rows[0].health_check === 1) {
      logHealthCheck('database', 'healthy', { responseTime })
      return {
        service: 'database',
        status: 'healthy',
        responseTime,
        details: {
          connectionPool: 'active',
          queryExecuted: true
        }
      }
    } else {
      throw new Error('Unexpected query result')
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    logHealthCheck('database', 'unhealthy', { responseTime, error: errorMessage })
    return {
      service: 'database',
      status: 'unhealthy',
      responseTime,
      error: errorMessage
    }
  }
}

/**
 * Check memory usage
 */
function checkMemory(): HealthCheckResult {
  try {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage()
      const totalMB = Math.round(memUsage.heapTotal / 1024 / 1024)
      const usedMB = Math.round(memUsage.heapUsed / 1024 / 1024)
      const usagePercent = Math.round((usedMB / totalMB) * 100)
      
      // Consider unhealthy if memory usage is above 90%
      const status = usagePercent > 90 ? 'unhealthy' : 'healthy'
      
      logHealthCheck('memory', status, { totalMB, usedMB, usagePercent })
      
      return {
        service: 'memory',
        status,
        details: {
          totalMB,
          usedMB,
          usagePercent,
          rss: Math.round(memUsage.rss / 1024 / 1024),
          external: Math.round(memUsage.external / 1024 / 1024)
        }
      }
    } else {
      return {
        service: 'memory',
        status: 'healthy',
        details: {
          note: 'Memory monitoring not available in this environment'
        }
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logHealthCheck('memory', 'unhealthy', { error: errorMessage })
    
    return {
      service: 'memory',
      status: 'unhealthy',
      error: errorMessage
    }
  }
}

/**
 * Check application uptime
 */
function checkUptime(): HealthCheckResult {
  try {
    const uptime = typeof process !== 'undefined' && process.uptime ? process.uptime() : 0
    const uptimeHours = Math.round(uptime / 3600 * 100) / 100
    
    logHealthCheck('uptime', 'healthy', { uptimeSeconds: uptime, uptimeHours })
    
    return {
      service: 'uptime',
      status: 'healthy',
      details: {
        uptimeSeconds: uptime,
        uptimeHours,
        startTime: new Date(Date.now() - uptime * 1000).toISOString()
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logHealthCheck('uptime', 'unhealthy', { error: errorMessage })
    
    return {
      service: 'uptime',
      status: 'unhealthy',
      error: errorMessage
    }
  }
}

/**
 * Check environment variables
 */
function checkEnvironment(): HealthCheckResult {
  try {
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL'
    ]
    
    const missing = requiredEnvVars.filter(envVar => !process.env[envVar])
    
    if (missing.length > 0) {
      logHealthCheck('environment', 'unhealthy', { missingVars: missing })
      return {
        service: 'environment',
        status: 'unhealthy',
        error: `Missing required environment variables: ${missing.join(', ')}`,
        details: {
          missingVars: missing,
          totalRequired: requiredEnvVars.length
        }
      }
    }
    
    logHealthCheck('environment', 'healthy', { allVarsPresent: true })
    return {
      service: 'environment',
      status: 'healthy',
      details: {
        requiredVarsPresent: requiredEnvVars.length,
        nodeEnv: process.env.NODE_ENV
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logHealthCheck('environment', 'unhealthy', { error: errorMessage })
    
    return {
      service: 'environment',
      status: 'unhealthy',
      error: errorMessage
    }
  }
}

/**
 * Perform all health checks
 */
async function performHealthChecks(): Promise<HealthCheckResult[]> {
  const checks = await Promise.allSettled([
    checkDatabase(),
    Promise.resolve(checkMemory()),
    Promise.resolve(checkUptime()),
    Promise.resolve(checkEnvironment())
  ])
  
  return checks.map(result => {
    if (result.status === 'fulfilled') {
      return result.value
    } else {
      logger.error('Health check failed', result.reason)
      return {
        service: 'unknown',
        status: 'unhealthy' as const,
        error: result.reason?.message || 'Health check failed'
      }
    }
  })
}

/**
 * Determine overall application status
 */
function determineOverallStatus(checks: HealthCheckResult[]): 'healthy' | 'degraded' | 'unhealthy' {
  const unhealthyCount = checks.filter(check => check.status === 'unhealthy').length
  const totalCount = checks.length
  
  if (unhealthyCount === 0) {
    return 'healthy'
  } else if (unhealthyCount < totalCount) {
    return 'degraded'
  } else {
    return 'unhealthy'
  }
}

/**
 * GET /api/health
 * Returns comprehensive health check information
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now()
  
  try {
    logger.info('Health check requested', {
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    })
    
    const checks = await performHealthChecks()
    const overallStatus = determineOverallStatus(checks)
    const uptime = typeof process !== 'undefined' && process.uptime ? process.uptime() : 0
    
    const response: HealthCheckResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'unknown',
      checks,
      summary: {
        total: checks.length,
        healthy: checks.filter(check => check.status === 'healthy').length,
        unhealthy: checks.filter(check => check.status === 'unhealthy').length
      }
    }
    
    const duration = Date.now() - startTime
    logger.info('Health check completed', {
      status: overallStatus,
      duration,
      checksPerformed: checks.length
    })
    
    // Return appropriate HTTP status code based on health
    const httpStatus = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503
    
    return NextResponse.json(response, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Health check failed', error instanceof Error ? error : new Error(String(error)), {
      duration
    })
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 503 })
  }
}
