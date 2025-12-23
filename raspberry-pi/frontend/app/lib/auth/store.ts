import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "./types"

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

export { useAuthStore }
