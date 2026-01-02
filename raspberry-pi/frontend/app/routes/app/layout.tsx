import { Outlet, redirect } from "react-router"
import type { Route } from "./+types/layout"
import { isAuthenticated } from "~/lib/auth"
import { AppSidebar } from "~/components/nav/sidebar/sidebar"
import { SidebarProvider, SidebarInset } from "~/components/ui/sidebar"
import { AppHeaderProvider } from "~/components/nav/header/header-provider"
import AppHeader from "~/components/nav/header/header"

// Client-side loader to enforce authentication
export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  if (!isAuthenticated()) {
    throw redirect("/")
  }
  return null
}

export default function AppLayout() {
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
