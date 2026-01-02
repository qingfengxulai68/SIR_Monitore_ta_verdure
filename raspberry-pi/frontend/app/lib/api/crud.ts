import { getToken, logout } from "~/lib/auth"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string

// Generic request function
async function request<T>(
  baseUrl: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  expectedStatus: number,
  data?: object
): Promise<T> {
  const options: {
    method: string
    headers: Record<string, string>
    body?: string
  } = {
    method,
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  }

  if (data) {
    options.headers["Content-Type"] = "application/json"
    options.body = JSON.stringify(data)
  }

  const response = await fetch(`${baseUrl}${path}`, options)

  if (response.status !== expectedStatus) {
    if (response.status === 401) {
      await logout()
    }
    throw new Error((await response.json()).detail)
  } else if (response.status === 204) {
    return null as T
  } else {
    return response.json() as T
  }
}

// Define and export HTTP method functions
function get<T>(path: string, expectedStatus: number): Promise<T> {
  return request<T>(API_BASE_URL, "GET", path, expectedStatus)
}

function post<T>(path: string, data: object, expectedStatus: number): Promise<T> {
  return request<T>(API_BASE_URL, "POST", path, expectedStatus, data)
}

function put<T>(path: string, data: object, expectedStatus: number): Promise<T> {
  return request<T>(API_BASE_URL, "PUT", path, expectedStatus, data)
}

function del<T>(path: string, expectedStatus: number): Promise<T> {
  return request<T>(API_BASE_URL, "DELETE", path, expectedStatus)
}

export { get, post, put, del }
