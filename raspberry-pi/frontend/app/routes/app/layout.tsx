import { Outlet, redirect } from "react-router"
import type { Route } from "./+types/layout"
import { isAuthenticated } from "~/lib/auth"
import { AppSidebar } from "~/components/nav/sidebar/sidebar"
import { SidebarProvider, SidebarInset } from "~/components/ui/sidebar"
import Header from "~/components/nav/header/header"
import { HeaderProvider } from "~/components/nav/header/header-provider"

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
        <HeaderProvider>
          <Header />
          <Outlet />
        </HeaderProvider>
      </SidebarInset>
    </SidebarProvider>
  )
}
