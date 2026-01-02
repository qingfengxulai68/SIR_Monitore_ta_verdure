import type { User } from "./types"
import { useAuthStore } from "./store"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string

// Re-export types
export * from "./types"

// Get token from store
export function getToken(): string {
  const token = useAuthStore.getState().token
  if (!token) throw new Error("Not authenticated")
  return token
}

// Get user from store
export function getUser(): User {
  const user = useAuthStore.getState().user
  if (!user) throw new Error("Not authenticated")
  return user
}

// Check if authenticated
export function isAuthenticated(): boolean {
  return useAuthStore.getState().isAuthenticated
}

// Login function
export async function login(username: string, password: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password })
  })

  if (response.status === 200) {
    const data: { token: string; user: User } = await response.json()
    useAuthStore.getState().login(data.user, data.token)
  } else if (response.status === 401) {
    throw new Error((await response.json()).detail)
  } else {
    throw new Error("Failed to login")
  }
}

// Change password function
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const token = await getToken()

  const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ currentPassword, newPassword })
  })

  if (response.status !== 204 && response.status === 403) {
    throw new Error((await response.json()).detail)
  } else {
    throw new Error("Failed to change password")
  }
}

// Logout function
export function logout(): void {
  useAuthStore.getState().logout()
}
