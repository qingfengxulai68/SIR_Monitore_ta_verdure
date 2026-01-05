"use client"

import * as React from "react"
import { LayoutDashboard, Flower2, Cpu, Sprout } from "lucide-react"

import { SidebarMain } from "~/components/nav/sidebar/sidebar-main"
import { SidebarUser } from "~/components/nav/sidebar/sidebar-user"
import { SidebarTitle } from "~/components/nav/sidebar/sidebar-title"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "~/components/ui/sidebar"
import { getUser } from "~/hooks/use-auth"

// Application data
const appData = {
  app: {
    name: "Terrarium",
    logo: Sprout
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/app/",
      icon: LayoutDashboard
    },
    {
      title: "Plants",
      url: "/app/plants",
      icon: Flower2
    },
    {
      title: "Modules",
      url: "/app/modules",
      icon: Cpu
    }
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = getUser()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarTitle app={appData.app} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMain items={appData.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
