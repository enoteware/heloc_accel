/**
 * Input sanitization and validation utilities
 */

/**
 * Sanitize string input to prevent XSS attacks
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .slice(0, 1000) // Limit length
}

/**
 * Sanitize HTML content (basic implementation)
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }
  
  // Allow only safe HTML tags and attributes
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li']
  const allowedAttributes: string[] = []
  
  // Remove all HTML tags except allowed ones
  let sanitized = input.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^<>]*>/gi, (match, tag) => {
    if (allowedTags.includes(tag.toLowerCase())) {
      return match
    }
    return ''
  })
  
  // Remove all attributes for simplicity
  sanitized = sanitized.replace(/\s+\w+\s*=\s*["'][^"']*["']/gi, '')
  
  return sanitized.slice(0, 5000) // Limit length
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') {
    return ''
  }
  
  return email
    .trim()
    .toLowerCase()
    .replace(/[^\w@.-]/g, '') // Only allow word chars, @, ., -
    .slice(0, 254) // RFC 5321 limit
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(input: any): number {
  const num = parseFloat(input)
  
  if (isNaN(num) || !isFinite(num)) {
    return 0
  }
  
  // Prevent extremely large numbers that could cause issues
  if (Math.abs(num) > Number.MAX_SAFE_INTEGER) {
    return 0
  }
  
  return num
}

/**
 * Sanitize integer input
 */
export function sanitizeInteger(input: any, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): number {
  const num = parseInt(input, 10)
  
  if (isNaN(num)) {
    return min
  }
  
  return Math.max(min, Math.min(max, num))
}

/**
 * Sanitize boolean input
 */
export function sanitizeBoolean(input: any): boolean {
  if (typeof input === 'boolean') {
    return input
  }
  
  if (typeof input === 'string') {
    return input.toLowerCase() === 'true'
  }
  
  return Boolean(input)
}

/**
 * Sanitize URL input
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') {
    return ''
  }
  
  try {
    const parsed = new URL(url)
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return ''
    }
    
    return parsed.toString()
  } catch {
    return ''
  }
}

/**
 * Sanitize file name
 */
export function sanitizeFileName(fileName: string): string {
  if (typeof fileName !== 'string') {
    return ''
  }
  
  return fileName
    .trim()
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
    .replace(/\.{2,}/g, '.') // Replace multiple dots with single dot
    .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots
    .slice(0, 255) // Limit length
}

/**
 * Sanitize SQL input (basic protection)
 */
export function sanitizeSqlInput(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }
  
  // Remove common SQL injection patterns
  return input
    .replace(/['";\\]/g, '') // Remove quotes and backslashes
    .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b/gi, '') // Remove SQL keywords
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove SQL block comments
    .trim()
    .slice(0, 1000)
}

/**
 * Validate and sanitize calculator input
 */
export interface SanitizedCalculatorInput {
  currentMortgageBalance: number
  currentInterestRate: number
  remainingTermMonths: number
  monthlyPayment: number
  propertyValue?: number
  propertyTaxMonthly?: number
  insuranceMonthly?: number
  hoaFeesMonthly?: number
  helocLimit?: number
  helocInterestRate?: number
  helocAvailableCredit?: number
  monthlyGrossIncome: number
  monthlyNetIncome: number
  monthlyExpenses: number
  monthlyDiscretionaryIncome: number
  scenarioName: string
  description?: string
}

export function sanitizeCalculatorInput(input: any): SanitizedCalculatorInput {
  return {
    currentMortgageBalance: sanitizeNumber(input.currentMortgageBalance),
    currentInterestRate: sanitizeNumber(input.currentInterestRate),
    remainingTermMonths: sanitizeInteger(input.remainingTermMonths, 1, 600),
    monthlyPayment: sanitizeNumber(input.monthlyPayment),
    propertyValue: input.propertyValue ? sanitizeNumber(input.propertyValue) : undefined,
    propertyTaxMonthly: input.propertyTaxMonthly ? sanitizeNumber(input.propertyTaxMonthly) : undefined,
    insuranceMonthly: input.insuranceMonthly ? sanitizeNumber(input.insuranceMonthly) : undefined,
    hoaFeesMonthly: input.hoaFeesMonthly ? sanitizeNumber(input.hoaFeesMonthly) : undefined,
    helocLimit: input.helocLimit ? sanitizeNumber(input.helocLimit) : undefined,
    helocInterestRate: input.helocInterestRate ? sanitizeNumber(input.helocInterestRate) : undefined,
    helocAvailableCredit: input.helocAvailableCredit ? sanitizeNumber(input.helocAvailableCredit) : undefined,
    monthlyGrossIncome: sanitizeNumber(input.monthlyGrossIncome),
    monthlyNetIncome: sanitizeNumber(input.monthlyNetIncome),
    monthlyExpenses: sanitizeNumber(input.monthlyExpenses),
    monthlyDiscretionaryIncome: sanitizeNumber(input.monthlyDiscretionaryIncome),
    scenarioName: sanitizeString(input.scenarioName),
    description: input.description ? sanitizeString(input.description) : undefined
  }
}

/**
 * Validate and sanitize user registration input
 */
export interface SanitizedUserInput {
  firstName: string
  lastName: string
  email: string
  password: string
}

export function sanitizeUserInput(input: any): SanitizedUserInput {
  return {
    firstName: sanitizeString(input.firstName),
    lastName: sanitizeString(input.lastName),
    email: sanitizeEmail(input.email),
    password: typeof input.password === 'string' ? input.password : '' // Don't sanitize password content
  }
}

/**
 * Validate and sanitize profile update input
 */
export interface SanitizedProfileInput {
  firstName?: string
  lastName?: string
  email?: string
}

export function sanitizeProfileInput(input: any): SanitizedProfileInput {
  const sanitized: SanitizedProfileInput = {}
  
  if (input.firstName !== undefined) {
    sanitized.firstName = sanitizeString(input.firstName)
  }
  
  if (input.lastName !== undefined) {
    sanitized.lastName = sanitizeString(input.lastName)
  }
  
  if (input.email !== undefined) {
    sanitized.email = sanitizeEmail(input.email)
  }
  
  return sanitized
}

/**
 * Remove potentially dangerous characters from object keys
 */
export function sanitizeObjectKeys(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObjectKeys)
  }
  
  const sanitized: any = {}
  
  for (const [key, value] of Object.entries(obj)) {
    const sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, '')
    
    if (sanitizedKey.length > 0) {
      sanitized[sanitizedKey] = sanitizeObjectKeys(value)
    }
  }
  
  return sanitized
}

/**
 * Validate content length
 */
export function validateContentLength(content: string, maxLength: number): boolean {
  return typeof content === 'string' && content.length <= maxLength
}

/**
 * Validate file upload
 */
export function validateFileUpload(file: File, allowedTypes: string[], maxSize: number): {
  valid: boolean
  error?: string
} {
  if (!file) {
    return { valid: false, error: 'No file provided' }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' }
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File too large' }
  }
  
  return { valid: true }
}

/**
 * Rate limit key sanitization
 */
export function sanitizeRateLimitKey(key: string): string {
  return key
    .replace(/[^a-zA-Z0-9:.-]/g, '_')
    .slice(0, 100)
}
