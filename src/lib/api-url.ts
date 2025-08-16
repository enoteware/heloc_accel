/**
 * Get the correct API URL based on environment
 * For Vercel deployment, APIs are served from /api in all environments
 */
export function getApiUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  // Always use root path for Vercel deployment
  return `/${cleanPath}`;
}
