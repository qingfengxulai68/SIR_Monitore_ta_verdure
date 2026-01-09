import { Outlet, redirect } from "react-router"
import type { Route } from "./+types/layout"
import { isAuthenticated } from "~/lib/hooks/use-auth"
import { AppSidebar } from "~/layout/sidebar/sidebar"
import { SidebarProvider, SidebarInset } from "~/components/ui/sidebar"
import { AppHeaderProvider } from "~/layout/header/header-provider"
import AppHeader from "~/layout/header/header"
import { useSystemWebSocket } from "~/lib/hooks/use-websocket"

// Client-side loader to enforce authentication
export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  if (!isAuthenticated()) {
    throw redirect("/")
  }
  return null
}

export default function AppLayout() {
  // Establish system WebSocket connection
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
