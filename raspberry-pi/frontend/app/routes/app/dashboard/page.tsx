import { useEffect } from "react"
import type { Route } from "./+types/page"
import { useModules } from "~/hooks/use-modules"
import { usePlants } from "~/hooks/use-plants"
import { useHeader } from "~/components/nav/header/header-provider"
import { SystemOverview } from "./components/system-overview"
import { PlantsStatus } from "./components/plants-status"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Spinner } from "~/components/ui/spinner"
import { ErrorWithRetry } from "~/components/other/error-with-retry"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard - Terrarium" },
    { name: "description", content: "Overview of all active plants and modules." }
  ]
}

export default function DashboardPage() {
  const { data: plants = [], isLoading: plantsLoading, error: plantsError, refetch: refetchPlants } = usePlants()
  const { data: modules = [], isLoading: modulesLoading, error: modulesError, refetch: refetchModules } = useModules()

  const { setHeaderContent } = useHeader()

  const isLoading = plantsLoading || modulesLoading
  const error = plantsError || modulesError

  useEffect(() => {
    setHeaderContent({
      breadcrumbs: [{ label: "Dashboard" }]
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
        ) : (
          <>
            <SystemOverview plants={plants} modules={modules} />
            <PlantsStatus plants={plants} />
          </>
        )}
      </main>
    </ScrollArea>
  )
}
