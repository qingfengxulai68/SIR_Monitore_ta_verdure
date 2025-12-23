"use client"

import * as React from "react"
import { LayoutDashboard, Flower2, Cpu, Sprout } from "lucide-react"

import { NavMain } from "~/components/nav/nav-main"
import { NavUser } from "~/components/nav/nav-user"
import { TeamSwitcher } from "~/components/nav/team-switcher"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "~/components/ui/sidebar"
import { getUser } from "~/lib/auth"

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
        <TeamSwitcher app={appData.app} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={appData.navMain} />
      </SidebarContent>
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
