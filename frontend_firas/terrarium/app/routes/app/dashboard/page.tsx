import { useEffect, useState } from "react"
import type { Route } from "./+types/page"
import { Skeleton } from "~/components/ui/skeleton"
import {
  mockGetPlants,
  mockGetModules,
  mockGetCurrentSensorData,
  type Plant,
  type Module,
  type SensorData
} from "~/lib/mocks"
import { useHeader } from "~/hooks/use-header"
import { SystemOverview } from "./components/system-overview"
import { PlantsStatus } from "./components/plants-status"

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
  const [sensorData, setSensorData] = useState<Record<string, SensorData>>({})

  const { setHeaderContent } = useHeader()

  useEffect(() => {
    setHeaderContent({
      breadcrumbs: [{ label: "Dashboard" }]
    })
  }, [setHeaderContent])

  const loadData = async () => {
    const [plantsData, modulesData] = await Promise.all([mockGetPlants(), mockGetModules()])

    setPlants(plantsData)
    setModules(modulesData)
    setIsLoading(false)

    // Load initial sensor data
    const initialSensorData: Record<string, SensorData> = {}
    plantsData.forEach((plant) => {
      initialSensorData[plant.moduleId] = mockGetCurrentSensorData(plant.moduleId)
    })
    setSensorData(initialSensorData)
  }

  useEffect(() => {
    loadData()

    // Update sensor data every 5 seconds
    const interval = setInterval(() => {
      setPlants((currentPlants) => {
        const updatedSensorData: Record<string, SensorData> = {}
        currentPlants.forEach((plant) => {
          updatedSensorData[plant.moduleId] = mockGetCurrentSensorData(plant.moduleId)
        })
        setSensorData(updatedSensorData)
        return currentPlants
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-48" />
        </div>
      ) : (
        <>
          <SystemOverview plants={plants} modules={modules} sensorData={sensorData} />
          <PlantsStatus plants={plants} sensorData={sensorData} onDataChange={loadData} />
        </>
      )}
    </div>
  )
}
