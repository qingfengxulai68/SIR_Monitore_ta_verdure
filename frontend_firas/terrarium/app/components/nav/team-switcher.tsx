"use client"

import * as React from "react"

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "~/components/ui/sidebar"

export function TeamSwitcher({
  app
}: {
  app: {
    name: string
    logo: React.ElementType
  }
}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="bg-sidebar-accent text-sidebar-accent-foreground">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <app.logo className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{app.name}</span>
            <span className="truncate text-xs">Plant Monitoring</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
