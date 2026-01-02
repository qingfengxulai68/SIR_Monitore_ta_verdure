import { useEffect, useState } from "react"
import type { Route } from "./+types/page"
import { getAllPlants, type Plant } from "~/lib/api/plants"
import { getAllModules, type Module } from "~/lib/api/modules"
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
  const [plants, setPlants] = useState<Plant[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // TODO: Define proper SensorData type when WebSocket is implemented
  const [sensorData, setSensorData] = useState<Record<string, any>>({})

  const { setHeaderContent } = useHeader()

  useEffect(() => {
    setHeaderContent({
      breadcrumbs: [{ label: "Dashboard" }]
    })
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [plantsData, modulesData] = await Promise.all([getAllPlants(), getAllModules()])

      setPlants(plantsData)
      setModules(modulesData)

      // TODO: Load initial sensor data via WebSocket/API
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // TODO: Implement WebSocket connection for real-time sensor updates
    // TODO: Remove when WebSocket is implemented
  }, [])

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] p-6">
      <main className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner />
          </div>
        ) : error ? (
          <ErrorWithRetry error={error} onRetry={loadData} />
        ) : (
          <>
            <SystemOverview plants={plants} modules={modules} sensorData={sensorData} />
            <PlantsStatus plants={plants} sensorData={sensorData} onDataChange={loadData} />
          </>
        )}
      </main>
    </ScrollArea>
  )
}
