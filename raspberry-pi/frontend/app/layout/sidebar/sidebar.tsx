import * as React from "react"
import { SidebarMain } from "~/layout/sidebar/sidebar-main"
import { SidebarUser } from "~/layout/sidebar/sidebar-user"
import { SidebarTitle } from "~/layout/sidebar/sidebar-title"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "~/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarTitle />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMain />
      </SidebarContent>
      <SidebarFooter>
        <SidebarUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
