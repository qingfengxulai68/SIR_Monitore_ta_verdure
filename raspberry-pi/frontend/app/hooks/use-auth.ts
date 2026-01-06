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
  token: string | null
  user: User | null
  login: (userData: User, token: string) => void
  logout: () => void
} & ({ token: null; user: null } | { token: string; user: User })

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: (userData: User, token: string) =>
        set({
          user: userData,
          token: token
        }),

      logout: () =>
        set({
          user: null,
          token: null
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
  return useAuthStore.getState().token !== null && useAuthStore.getState().user !== null
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

// Hook to logout
export function useLogout() {
  const navigate = useNavigate()

  return () => {
    useAuthStore.getState().logout()
    toast.info("Logged out")
    navigate("/")
  }
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
