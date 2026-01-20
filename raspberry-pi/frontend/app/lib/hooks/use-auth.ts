import { useMutation } from "@tanstack/react-query"
import { useQueryClient, QueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { apiClient } from "~/lib/api-client"
import type { LoginRequest, Login, ChangePasswordRequest, User, Plant, Module } from "~/lib/types"
import { QueryKeys } from "~/lib/types"

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
export function getToken(): string | null {
  return useAuthStore.getState().token
}

// Get current user from store
export function getUser(): User | null {
  return useAuthStore.getState().user
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
    mutationFn: (credentials: LoginRequest) => apiClient.post<Login, LoginRequest>("/auth/login", credentials, false),

    onSuccess: async (data) => {
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
export function useLogout(queryClient: QueryClient, message: string = "Logged out.") {
  const navigate = useNavigate()

  return () => {
    useAuthStore.getState().logout()
    queryClient.clear()
    toast.info(message)
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
