import { useEffect, useState } from "react"
import type { Route } from "../+types/page"
import { Cpu } from "lucide-react"
import { Skeleton } from "~/components/ui/skeleton"
import { Card } from "~/components/ui/card"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "~/components/ui/empty"
import { mockGetModules, type Module } from "~/lib/mocks"
import { useHeader } from "~/hooks/use-header"
import { ModulesHeader } from "./components/modules-header"
import { ModulesList } from "./components/modules-list"

export function meta({}: Route.MetaArgs) {
  return [{ title: "Modules - Terrarium" }, { name: "description", content: "Manage system modules." }]
}

export default function ModulesListPage() {
  const [modules, setModules] = useState<Module[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const { setHeaderContent } = useHeader()

  const filteredModules = modules.filter((module) => module.id.toLowerCase().includes(searchQuery.toLowerCase()))

  useEffect(() => {
    setHeaderContent({
      breadcrumbs: [{ label: "Modules" }]
    })
  }, [setHeaderContent])

  useEffect(() => {
    const loadModules = async () => {
      const data = await mockGetModules()
      setModules(data)
      setIsLoading(false)
    }

    loadModules()
  }, [])

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-80" />
          <Card>
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </Card>
        </div>
      ) : modules.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon" className="bg-primary/10 text-primary">
              <Cpu className="size-6" />
            </EmptyMedia>
            <EmptyTitle>No modules yet</EmptyTitle>
            <EmptyDescription>No sensor modules have been registered in the system.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <ModulesHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            filteredCount={filteredModules.length}
          />
          <ModulesList modules={filteredModules} viewMode={viewMode} />
        </>
      )}
    </div>
  )
}
