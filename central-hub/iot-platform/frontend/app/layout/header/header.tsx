import React from "react"
import { useNavigate } from "react-router"
import { SidebarTrigger } from "~/components/ui/sidebar"
import { Separator } from "~/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "~/components/ui/breadcrumb"
import { useHeader } from "~/layout/header/header-provider"

export default function AppHeader() {
  const { headerContent } = useHeader()
  const navigate = useNavigate()

  return (
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
                    <BreadcrumbLink
                      href={crumb.href}
                      onClick={(e) => {
                        e.preventDefault()
                        navigate(crumb.href!)
                      }}
                    >
                      {crumb.label}
                    </BreadcrumbLink>
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
  )
}
