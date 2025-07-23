/**
 * Rate limiting utilities for API endpoints
 */

import { NextRequest } from 'next/server'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  message?: string // Custom error message
  skipSuccessfulRequests?: boolean // Don't count successful requests
  skipFailedRequests?: boolean // Don't count failed requests
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store for rate limiting (in production, use Redis)
const store: RateLimitStore = {}

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}, 5 * 60 * 1000)

/**
 * Get client identifier for rate limiting
 */
function getClientId(request: NextRequest): string {
  // Try to get IP from various headers (for proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'
  
  // Include user agent for additional uniqueness
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  return `${ip}:${userAgent.slice(0, 50)}`
}

/**
 * Rate limiting middleware
 */
export function rateLimit(config: RateLimitConfig) {
  return (request: NextRequest) => {
    const clientId = getClientId(request)
    const now = Date.now()
    const windowStart = now - config.windowMs
    
    // Initialize or get existing record
    if (!store[clientId] || store[clientId].resetTime < now) {
      store[clientId] = {
        count: 0,
        resetTime: now + config.windowMs
      }
    }
    
    const record = store[clientId]
    
    // Check if limit exceeded
    if (record.count >= config.maxRequests) {
      const resetIn = Math.ceil((record.resetTime - now) / 1000)
      
      return {
        success: false,
        error: config.message || 'Too many requests',
        retryAfter: resetIn,
        limit: config.maxRequests,
        remaining: 0,
        reset: record.resetTime
      }
    }
    
    // Increment counter
    record.count++
    
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - record.count,
      reset: record.resetTime
    }
  }
}

/**
 * Predefined rate limiters for different endpoints
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes
  message: 'Too many authentication attempts. Please try again later.'
})

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
  message: 'Too many API requests. Please slow down.'
})

export const calculationRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20, // 20 calculations per minute
  message: 'Too many calculation requests. Please wait before trying again.'
})

export const registrationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 registrations per hour per IP
  message: 'Too many registration attempts. Please try again later.'
})

/**
 * Apply rate limiting to API response
 */
export function applyRateLimit(
  request: NextRequest,
  rateLimiter: (req: NextRequest) => any
): Response | null {
  const result = rateLimiter(request)
  
  if (!result.success) {
    return new Response(
      JSON.stringify({
        success: false,
        error: result.error,
        retryAfter: result.retryAfter
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': result.retryAfter.toString(),
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.reset.toString()
        }
      }
    )
  }
  
  return null // No rate limit hit, continue processing
}

/**
 * Rate limit headers for successful responses
 */
export function getRateLimitHeaders(
  request: NextRequest,
  rateLimiter: (req: NextRequest) => any
): Record<string, string> {
  const result = rateLimiter(request)
  
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': Math.max(0, result.remaining).toString(),
    'X-RateLimit-Reset': result.reset.toString()
  }
}

/**
 * Sliding window rate limiter (more accurate but memory intensive)
 */
export class SlidingWindowRateLimit {
  private windows: Map<string, number[]> = new Map()
  
  constructor(
    private windowMs: number,
    private maxRequests: number
  ) {
    // Clean up old windows every minute
    setInterval(() => this.cleanup(), 60 * 1000)
  }
  
  isAllowed(clientId: string): boolean {
    const now = Date.now()
    const windowStart = now - this.windowMs
    
    // Get or create window for client
    let requests = this.windows.get(clientId) || []
    
    // Remove old requests outside the window
    requests = requests.filter(timestamp => timestamp > windowStart)
    
    // Check if limit would be exceeded
    if (requests.length >= this.maxRequests) {
      return false
    }
    
    // Add current request
    requests.push(now)
    this.windows.set(clientId, requests)
    
    return true
  }
  
  private cleanup(): void {
    const now = Date.now()
    const cutoff = now - this.windowMs

    this.windows.forEach((requests, clientId) => {
      const validRequests = requests.filter(timestamp => timestamp > cutoff)

      if (validRequests.length === 0) {
        this.windows.delete(clientId)
      } else {
        this.windows.set(clientId, validRequests)
      }
    })
  }
}

/**
 * Distributed rate limiter interface (for Redis implementation)
 */
export interface DistributedRateLimit {
  isAllowed(clientId: string): Promise<{
    allowed: boolean
    remaining: number
    resetTime: number
  }>
}

/**
 * Redis-based rate limiter (requires Redis connection)
 */
export class RedisRateLimit implements DistributedRateLimit {
  constructor(
    private redis: any, // Redis client
    private windowMs: number,
    private maxRequests: number,
    private keyPrefix: string = 'rate_limit:'
  ) {}
  
  async isAllowed(clientId: string): Promise<{
    allowed: boolean
    remaining: number
    resetTime: number
  }> {
    const key = `${this.keyPrefix}${clientId}`
    const now = Date.now()
    const windowStart = now - this.windowMs
    
    // Use Redis pipeline for atomic operations
    const pipeline = this.redis.pipeline()
    
    // Remove old entries
    pipeline.zremrangebyscore(key, 0, windowStart)
    
    // Count current entries
    pipeline.zcard(key)
    
    // Add current request
    pipeline.zadd(key, now, now)
    
    // Set expiration
    pipeline.expire(key, Math.ceil(this.windowMs / 1000))
    
    const results = await pipeline.exec()
    const count = results[1][1]
    
    const allowed = count <= this.maxRequests
    const remaining = Math.max(0, this.maxRequests - count)
    const resetTime = now + this.windowMs
    
    return {
      allowed,
      remaining,
      resetTime
    }
  }
}
