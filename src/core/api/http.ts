import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios"
import { generateRequestId } from "@/core/utils/request-id"
import { useAuthStore } from "@/app/stores/auth-store"

// Create axios instance
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1",
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "X-Client-Platform": "web",
  },
  timeout: 30000,
})

// Flag to prevent multiple refresh attempts
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: Error | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

// Request interceptor
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add X-Request-Id if not present
    if (!config.headers["X-Request-Id"]) {
      config.headers["X-Request-Id"] = generateRequestId()
    }

    const accessToken = useAuthStore.getState().accessToken
    if (accessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor
http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // If 401 and not already retrying and not a login/refresh endpoint
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url &&
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      if (isRefreshing) {
        // Queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => {
            const newToken = useAuthStore.getState().accessToken
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`
            }
            return http(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Attempt to refresh the token
        await refreshAccessToken()
        processQueue()

        // Retry the original request with new token
        const newToken = useAuthStore.getState().accessToken
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
        }
        return http(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError as Error)
        useAuthStore.getState().clearSession()
        window.location.href = "/login"
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

async function refreshAccessToken(): Promise<void> {
  // Call refresh endpoint (WEB: uses httpOnly cookie)
  const response = await axios.post(
    `${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/auth/refresh`,
    {},
    {
      withCredentials: true, // Important for cookie-based refresh
    },
  )

  const { data } = response.data
  if (data?.tokens?.accessToken) {
    const currentUser = useAuthStore.getState().user
    if (currentUser) {
      useAuthStore.getState().setSession(currentUser, data.tokens.accessToken)
    }
  } else {
    throw new Error("No access token in refresh response")
  }
}
