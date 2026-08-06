import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import toast from 'react-hot-toast'

/**
 * API Utility Functions
 * Handles HTTP requests with JWT authentication
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            { refresh_token: refreshToken }
          )

          const { access_token } = response.data
          localStorage.setItem('access_token', access_token)

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
      }
    }

    // Handle other errors
    if (error.response?.status === 403) {
      toast.error('Access denied')
    } else if (error.response?.status === 404) {
      toast.error('Resource not found')
    } else if (error.response?.status === 500) {
      toast.error('Server error')
    }

    return Promise.reject(error)
  }
)

/**
 * Generic API request helper
 */
export async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  data?: any
): Promise<T> {
  try {
    const config = {
      method,
      url,
      data,
    }
    const response = await apiClient(config)
    return response.data
  } catch (error) {
    console.error(`API Error: ${method} ${url}`, error)
    throw error
  }
}

/**
 * GET request
 */
export const apiGet = <T,>(url: string) =>
  apiRequest<T>('GET', url)

/**
 * POST request
 */
export const apiPost = <T,>(url: string, data?: any) =>
  apiRequest<T>('POST', url, data)

/**
 * PUT request
 */
export const apiPut = <T,>(url: string, data?: any) =>
  apiRequest<T>('PUT', url, data)

/**
 * DELETE request
 */
export const apiDelete = <T,>(url: string) =>
  apiRequest<T>('DELETE', url)

/**
 * PATCH request
 */
export const apiPatch = <T,>(url: string, data?: any) =>
  apiRequest<T>('PATCH', url, data)

export default apiClient
