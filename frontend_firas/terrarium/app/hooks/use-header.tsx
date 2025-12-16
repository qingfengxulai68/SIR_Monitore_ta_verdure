import { createContext, useContext, type ReactNode } from "react"

interface HeaderContextType {
  setHeaderContent: (content: { breadcrumbs: Array<{ label: string; href?: string }>; actions?: ReactNode }) => void
}

export const HeaderContext = createContext<HeaderContextType | null>(null)

export const useHeader = () => {
  const context = useContext(HeaderContext)
  if (!context) {
    throw new Error("useHeader must be used within AppLayout")
  }
  return context
}
