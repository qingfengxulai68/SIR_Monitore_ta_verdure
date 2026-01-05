import { getToken, logout } from "~/hooks/use-auth"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public endpoint: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

// API request configuration interface
interface RequestConfig {
  method: "GET" | "POST" | "PUT" | "DELETE"
  endpoint: string
  body?: unknown
  requiresAuth?: boolean
  customHeaders?: Record<string, string>
}

// Generic request function
async function apiRequest<TResponse>(config: RequestConfig): Promise<TResponse> {
  const { method, endpoint, body, requiresAuth = true, customHeaders = {} } = config

  // Build headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...customHeaders
  }

  // Inject JWT token if authentication is required
  if (requiresAuth) {
    headers.Authorization = `Bearer ${getToken()}`
  }

  // Build request options
  const requestOptions: RequestInit = {
    method,
    headers
  }

  // Attach body if present
  if (body) {
    requestOptions.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions)

    if (!response.ok) {
      // Special case: 401 Unauthorized → Logout
      if (response.status === 401) {
        logout()
        throw new ApiError(401, "Session expired", endpoint)
      }

      // Attempt to extract backend error message
      let errorMessage = response.statusText
      try {
        const errorData = await response.json()
        errorMessage = errorData.detail || errorData.message || errorMessage
      } catch {}

      // Throw ApiError
      throw new ApiError(response.status, errorMessage, endpoint)
    }

    // Special case: 204 No Content
    if (response.status === 204) {
      return null as TResponse
    }

    // Check if response has content before parsing JSON
    const contentType = response.headers.get("content-type")
    const contentLength = response.headers.get("content-length")

    // If no content or not JSON, return null
    if (contentLength === "0" || !contentType?.includes("application/json")) {
      return null as TResponse
    }

    // Parse JSON
    return (await response.json()) as TResponse
  } catch (error) {
    // If it is already an ApiError, rethrow it
    if (error instanceof ApiError) {
      throw error
    }

    // Otherwise, it's a network or other error
    throw new ApiError(0, (error as Error).message || "Network error", endpoint)
  }
}

// Simplified HTTP methods (public API)
export const apiClient = {
  // GET - Read resource
  get: <TResponse>(endpoint: string, requiresAuth = true) =>
    apiRequest<TResponse>({ method: "GET", endpoint, requiresAuth }),

  // POST - Create resource
  post: <TResponse, TBody = unknown>(endpoint: string, body: TBody, requiresAuth = true) =>
    apiRequest<TResponse>({ method: "POST", endpoint, body, requiresAuth }),

  // PUT - Update resource
  put: <TResponse, TBody = unknown>(endpoint: string, body: TBody, requiresAuth = true) =>
    apiRequest<TResponse>({ method: "PUT", endpoint, body, requiresAuth }),

  // DELETE - Delete resource
  delete: <TResponse = void>(endpoint: string, requiresAuth = true) =>
    apiRequest<TResponse>({ method: "DELETE", endpoint, requiresAuth })
}
