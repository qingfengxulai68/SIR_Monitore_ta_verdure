import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { apiClient } from "~/lib/api-client"
import type { LoginRequest, LoginResponse, ChangePasswordRequest, User } from "~/lib/types"

// ============================================================================
// Auth Store (Internal)
// ============================================================================

type AuthState = {
  isAuthenticated: boolean
  token: string | null
  user: User | null
  login: (userData: User, token: string) => void
  logout: () => void
} & ({ isAuthenticated: false; token: null; user: null } | { isAuthenticated: true; token: string; user: User })

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: (userData: User, token: string) =>
        set({
          user: userData,
          token: token,
          isAuthenticated: true
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false
        })
    }),
    {
      name: "auth-storage"
    }
  )
)

// ============================================================================
// Auth Utilities
// ============================================================================

// Get current token from store
export function getToken(): string {
  const token = useAuthStore.getState().token
  if (!token) throw new Error("Not authenticated")
  return token
}

// Get current user from store
export function getUser(): User {
  const user = useAuthStore.getState().user
  if (!user) throw new Error("Not authenticated")
  return user
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return useAuthStore.getState().isAuthenticated
}

// Logout utility
export function logout(): void {
  const navigate = useNavigate()
  useAuthStore.getState().logout()
  toast.info("Logged out")
  navigate("/public/signin")
}

// ============================================================================
// React Hooks
// ============================================================================

// Hook to perform login
export function useLogin() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (credentials: LoginRequest) =>
      apiClient.post<LoginResponse, LoginRequest>("/auth/login", credentials, false),

    onSuccess: (data) => {
      useAuthStore.getState().login(data.user, data.token)
      toast.success("Login successful")
      navigate("/app/")
    },

    onError: (error) => {
      toast.error(error.message)
    }
  })
}

// Hook to change password
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) =>
      apiClient.post<void, ChangePasswordRequest>("/auth/change-password", data),

    onSuccess: () => {
      toast.success("Password changed")
    },

    onError: (error) => {
      toast.error(error.message)
    }
  })
}
