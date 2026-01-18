import { Outlet, redirect } from "react-router"
import type { Route } from "./+types/layout"
import { isAuthenticated, useLogout } from "~/lib/hooks/use-auth"
import { AppSidebar } from "~/layout/sidebar/sidebar"
import { SidebarProvider, SidebarInset } from "~/components/ui/sidebar"
import { AppHeaderProvider } from "~/layout/header/header-provider"
import AppHeader from "~/layout/header/header"
import { useSystemWebSocket } from "~/lib/hooks/use-websocket"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"

// Client-side loader to enforce authentication
export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  if (!isAuthenticated()) {
    throw redirect("/")
  }
  return null
}

export default function AppLayout() {
  const queryClient = useQueryClient()
  const logout = useLogout(queryClient, "Session expired. Please log in again.")

  // Handle session expired events
  useEffect(() => {
    const handleSessionExpired = () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired)
      logout()
    }

    window.addEventListener("auth:session-expired", handleSessionExpired)
    return () => window.removeEventListener("auth:session-expired", handleSessionExpired)
  }, [logout])

  // Establish system WebSocket connection (it will close itself when unmounted)
  useSystemWebSocket()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeaderProvider>
          <AppHeader />
          <Outlet />
        </AppHeaderProvider>
      </SidebarInset>
    </SidebarProvider>
  )
}
