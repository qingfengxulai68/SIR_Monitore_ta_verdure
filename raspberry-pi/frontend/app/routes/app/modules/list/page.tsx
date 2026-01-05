import { useEffect } from "react"
import type { Route } from "./+types/page"
import { Spinner } from "~/components/ui/spinner"
import { useModules } from "~/hooks/use-modules"
import { useHeader } from "~/components/nav/header/header-provider"
import ModulesEmpty from "./components/modules-empty"
import { ModulesList } from "./components/modules-list"
import { ScrollArea } from "~/components/ui/scroll-area"
import { ErrorWithRetry } from "~/components/other/error-with-retry"

export function meta({}: Route.MetaArgs) {
  return [{ title: "Modules - Terrarium" }, { name: "description", content: "Manage system modules." }]
}

export default function ModulesListPage() {
  const { data = [], isLoading, error, refetch } = useModules()
  const { setHeaderContent } = useHeader()

  useEffect(() => {
    setHeaderContent({
      breadcrumbs: [{ label: "Modules" }]
    })
  }, [])

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] p-6">
      <main className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner />
          </div>
        ) : error ? (
          <ErrorWithRetry error={error.message} onRetry={refetch} />
        ) : !data || data.length === 0 ? (
          <ModulesEmpty />
        ) : (
          <ModulesList data={data} />
        )}
      </main>
    </ScrollArea>
  )
}
