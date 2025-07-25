/**
 * Get the correct API URL based on environment
 * In production, APIs are served from /heloc/api
 * In development, APIs are served from /api
 */
export function getApiUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  
  // In production, use the basePath
  if (process.env.NODE_ENV === 'production') {
    return `/heloc/${cleanPath}`
  }
  
  // In development, use root path
  return `/${cleanPath}`
}