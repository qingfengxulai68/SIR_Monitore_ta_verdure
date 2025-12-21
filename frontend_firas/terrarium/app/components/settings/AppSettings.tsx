import { useState } from "react"
import { User, Bell, Palette } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "~/components/ui/dialog"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "~/components/ui/breadcrumb"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider
} from "~/components/ui/sidebar"
import { AccountSection } from "./AccountSection"
import { AlertsSection } from "./AlertsSection"
import { AppearanceSection } from "./AppearanceSection"

interface AppSettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AppSettings({ open, onOpenChange }: AppSettingsProps) {
  const [activeSection, setActiveSection] = useState("account")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 h-125 w-162.5 sm:max-w-none">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">Customize your settings here.</DialogDescription>
        <SidebarProvider className="items-start">
          <Sidebar collapsible="none" className="hidden md:flex w-50">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={activeSection === "account"}>
                        <button onClick={() => setActiveSection("account")}>
                          <User className="h-4 w-4" />
                          <span>Account</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={activeSection === "alerts"}>
                        <button onClick={() => setActiveSection("alerts")}>
                          <Bell className="h-4 w-4" />
                          <span>Alerts</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={activeSection === "appearance"}>
                        <button onClick={() => setActiveSection("appearance")}>
                          <Palette className="h-4 w-4" />
                          <span>Appearance</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex flex-1 flex-col overflow-hidden">
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#">Settings</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>
                        {activeSection === "account" ? "Account" : activeSection === "alerts" ? "Alerts" : "Appearance"}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0">
              {activeSection === "account" ? (
                <AccountSection />
              ) : activeSection === "alerts" ? (
                <AlertsSection />
              ) : (
                <AppearanceSection />
              )}
            </div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  )
}
