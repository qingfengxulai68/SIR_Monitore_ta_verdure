import { Outlet, redirect } from "react-router"
import React, { useState, type ReactNode } from "react"
import type { Route } from "./+types/layout"
import { useAuthStore } from "~/store/auth"
import { AppSidebar } from "~/components/nav/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "~/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "~/components/ui/breadcrumb"
import { Separator } from "~/components/ui/separator"
import { HeaderContext } from "~/hooks/use-header"

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const isLoggedIn = useAuthStore.getState().isAuthenticated

  if (!isLoggedIn) {
    throw redirect("/")
  }

  return null
}

export default function AppLayout() {
  const [headerContent, setHeaderContent] = useState<{
    breadcrumbs: Array<{ label: string; href?: string }>
    actions?: ReactNode
  }>({ breadcrumbs: [] })

  return (
    <HeaderContext.Provider value={{ setHeaderContent }}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  {headerContent.breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && <BreadcrumbSeparator />}
                      <BreadcrumbItem>
                        {crumb.href ? (
                          <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            {headerContent.actions && <div className="flex items-center gap-2">{headerContent.actions}</div>}
          </header>
          <main className="flex flex-1 flex-col gap-4 p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </HeaderContext.Provider>
  )
}
