import { useEffect } from "react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
}

type ThemeStore = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const DEFAULT_THEME: Theme = "system"
const STORAGE_KEY = "ui-theme"

export const useTheme = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: DEFAULT_THEME,
      setTheme: (theme) => set({ theme })
    }),
    {
      name: STORAGE_KEY
    }
  )
)

export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = useTheme((state) => state.theme)

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  return <>{children}</>
}
