// API Client with debug logging
import { logInfo, logError, logDebug } from '@/lib/debug-logger'

interface ApiOptions extends RequestInit {
  skipAuth?: boolean
}

class ApiClient {
  private baseUrl = ''

  async request<T = any>(
    url: string, 
    options: ApiOptions = {}
  ): Promise<T> {
    const { skipAuth = false, ...fetchOptions } = options
    
    // Default options
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(fetchOptions.headers || {})
      },
      credentials: skipAuth ? 'omit' : 'include',
    }

    // Merge options
    const finalOptions = {
      ...defaultOptions,
      ...fetchOptions,
      headers: {
        ...defaultOptions.headers,
        ...fetchOptions.headers
      }
    }

    // Log request
    logInfo('API:Client', `${finalOptions.method || 'GET'} ${url}`, {
      headers: finalOptions.headers,
      hasBody: !!finalOptions.body
    })

    if (finalOptions.body) {
      logDebug('API:Client', 'Request body', 
        typeof finalOptions.body === 'string' 
          ? JSON.parse(finalOptions.body) 
          : finalOptions.body
      )
    }

    try {
      const startTime = Date.now()
      const response = await fetch(url, finalOptions)
      const duration = Date.now() - startTime

      logInfo('API:Client', `Response ${response.status} in ${duration}ms`, {
        url,
        status: response.status,
        statusText: response.statusText,
        duration
      })

      // Clone response to read body for logging
      const clonedResponse = response.clone()
      
      let data: any
      const contentType = response.headers.get('content-type')
      
      if (contentType?.includes('application/json')) {
        data = await response.json()
        logDebug('API:Client', 'Response data', data)
      } else {
        data = await response.text()
        logDebug('API:Client', 'Response text', { text: data.substring(0, 200) })
      }

      if (!response.ok) {
        logError('API:Client', `API Error ${response.status}`, {
          url,
          status: response.status,
          data
        })
        throw new ApiError(response.status, data?.error || response.statusText, data)
      }

      return data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      
      logError('API:Client', 'Request failed', {
        url,
        error: error instanceof Error ? error.message : error
      })
      
      throw new ApiError(0, 'Network error', error)
    }
  }

  async get<T = any>(url: string, options?: ApiOptions): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' })
  }

  async post<T = any>(url: string, data?: any, options?: ApiOptions): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async put<T = any>(url: string, data?: any, options?: ApiOptions): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async delete<T = any>(url: string, options?: ApiOptions): Promise<T> {
    return this.request<T>(url, { ...options, method: 'DELETE' })
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export convenience methods
export const api = {
  get: apiClient.get.bind(apiClient),
  post: apiClient.post.bind(apiClient),
  put: apiClient.put.bind(apiClient),
  delete: apiClient.delete.bind(apiClient),
}