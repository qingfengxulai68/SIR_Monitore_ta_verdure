import { useEffect } from "react"
import type { Route } from "./+types/page"
import { Spinner } from "~/components/ui/spinner"
import { useModules } from "~/lib/hooks/use-modules"
import { usePlants } from "~/lib/hooks/use-plants"
import { useHeader } from "~/layout/header/header-provider"
import ModulesEmpty from "./components/modules-empty"
import { ModulesBrowser } from "./components/modules-browser"
import { ScrollArea } from "~/components/ui/scroll-area"
import { ErrorWithRetry } from "~/components/other/error-with-retry"

export function meta({}: Route.MetaArgs) {
  return [{ title: "Modules - Terrarium" }, { name: "description", content: "Manage system modules." }]
}

export default function ModulesBrowserPage() {
  const { data: plants = [], isLoading: plantsLoading, error: plantsError, refetch: refetchPlants } = usePlants()
  const { data: modules = [], isLoading: modulesLoading, error: modulesError, refetch: refetchModules } = useModules()

  const { setHeaderContent } = useHeader()

  const isLoading = plantsLoading || modulesLoading
  const error = plantsError || modulesError

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
          <ErrorWithRetry
            error={error.message}
            onRetry={() => {
              refetchPlants()
              refetchModules()
            }}
          />
        ) : !modules || modules.length === 0 ? (
          <ModulesEmpty />
        ) : (
          <ModulesBrowser modules={modules} plants={plants} />
        )}
      </main>
    </ScrollArea>
  )
}
