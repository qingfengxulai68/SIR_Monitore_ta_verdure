import { useEffect, useState } from "react"
import type { Route } from "./+types/page"
import { Spinner } from "~/components/ui/spinner"
import { getAllModules, type Module } from "~/lib/api/modules"
import { useHeader } from "~/components/nav/header/header-provider"
import ModulesEmpty from "./components/modules-empty"
import { ModulesList } from "./components/modules-list"
import { ScrollArea } from "~/components/ui/scroll-area"
import { ErrorWithRetry } from "~/components/other/error-with-retry"

export function meta({}: Route.MetaArgs) {
  return [{ title: "Modules - Terrarium" }, { name: "description", content: "Manage system modules." }]
}

export default function ModulesListPage() {
  const [modules, setModules] = useState<Module[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { setHeaderContent } = useHeader()

  useEffect(() => {
    setHeaderContent({
      breadcrumbs: [{ label: "Modules" }]
    })
  }, [])

  const loadModules = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getAllModules()
      setModules(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadModules()
  }, [])

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] p-6">
      <main className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner />
          </div>
        ) : error ? (
          <ErrorWithRetry error={error} onRetry={loadModules} />
        ) : modules.length === 0 ? (
          <ModulesEmpty />
        ) : (
          <ModulesList modules={modules} />
        )}
      </main>
    </ScrollArea>
  )
}
