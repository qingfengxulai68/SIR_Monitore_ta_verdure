import { useEffect, useState } from "react"
import type { Route } from "./+types/page"
import { Flower2, Plus } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Skeleton } from "~/components/ui/skeleton"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "~/components/ui/empty"
import { mockGetPlants, mockGetCurrentSensorData, type Plant, type SensorData } from "~/lib/mocks"
import { useHeader } from "~/hooks/use-header"
import { CreatePlantDialog } from "./components/add-plant-dialog"
import { PlantsHeader } from "./components/plants-header"
import { PlantsList } from "./components/plants-list"

export function meta({}: Route.MetaArgs) {
  return [{ title: "All Plants - Terrarium" }, { name: "description", content: "List of all registered plants." }]
}

export default function PlantsListPage() {
  const [plants, setPlants] = useState<Plant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sensorData, setSensorData] = useState<Record<string, SensorData>>({})
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const { setHeaderContent } = useHeader()

  const filteredPlants = plants.filter((plant) => plant.name.toLowerCase().includes(searchQuery.toLowerCase()))

  useEffect(() => {
    setHeaderContent({
      breadcrumbs: [{ label: "Plants" }],
      actions: (
        <Button onClick={() => setCreateDialogOpen(true)} variant="outline" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      )
    })
  }, [setHeaderContent])

  const loadPlants = async () => {
    const data = await mockGetPlants()
    setPlants(data)
    setIsLoading(false)

    // Load initial sensor data
    const initialSensorData: Record<string, SensorData> = {}
    data.forEach((plant) => {
      initialSensorData[plant.moduleId] = mockGetCurrentSensorData(plant.moduleId)
    })
    setSensorData(initialSensorData)
  }

  useEffect(() => {
    loadPlants()

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
          <Skeleton className="h-10 w-80" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      ) : plants.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon" className="bg-primary/10 text-primary">
              <Flower2 className="size-6" />
            </EmptyMedia>
            <EmptyTitle>No plants yet</EmptyTitle>
            <EmptyDescription>
              Get started by adding your first plant to monitor its environment and health.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => alert("In dev")} size="sm" className="gap-2">
              Add Plant
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <PlantsHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            filteredCount={filteredPlants.length}
          />
          <PlantsList plants={filteredPlants} sensorData={sensorData} viewMode={viewMode} onDataChange={loadPlants} />
        </>
      )}

      <CreatePlantDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onCreated={loadPlants} />
    </div>
  )
}
