import { createContext, useContext, useState, type ReactNode } from "react"

export type HeaderContent = { breadcrumbs: Array<{ label: string; href?: string }>; actions?: ReactNode }

interface HeaderContextType {
  headerContent: HeaderContent
  setHeaderContent: (content: HeaderContent) => void
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined)

// Provider Component
export function HeaderProvider({ children }: { children: ReactNode }) {
  const [headerContent, setHeaderContent] = useState<HeaderContent>({ breadcrumbs: [] })

  return <HeaderContext.Provider value={{ headerContent, setHeaderContent }}>{children}</HeaderContext.Provider>
}

// Hook to use the header context
export function useHeader() {
  const context = useContext(HeaderContext)
  if (!context) {
    throw new Error("useHeader must be used within HeaderProvider")
  }
  return context
}
