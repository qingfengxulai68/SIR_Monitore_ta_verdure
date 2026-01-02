import { useEffect, useState } from "react"
import type { Route } from "./+types/page"
import { Plus } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Spinner } from "~/components/ui/spinner"
import { getAllPlants, type Plant } from "~/lib/api/plants"
import { useHeader } from "~/components/nav/header/header-provider"
import { CreatePlantDialog } from "./components/add-plant-dialog"
import { PlantsList } from "./components/plants-list"
import { PlantsEmpty } from "./components/plants-empty"
import { ScrollArea } from "~/components/ui/scroll-area"
import { ErrorWithRetry } from "~/components/other/error-with-retry"

export function meta({}: Route.MetaArgs) {
  return [{ title: "All Plants - Terrarium" }, { name: "description", content: "List of all registered plants." }]
}

export default function PlantsListPage() {
  const [plants, setPlants] = useState<Plant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const { setHeaderContent } = useHeader()

  useEffect(() => {
    setHeaderContent({
      breadcrumbs: [{ label: "Plants" }],
      actions: (
        <Button onClick={() => setCreateDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      )
    })
  }, [])

  const loadPlants = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getAllPlants()
      setPlants(data)
      // TODO: implement WebSocket subscription for real-time sensor updates.
      // use a WebSocket to receive `latestValues` updates per plant.
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPlants()
  }, [])

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] p-6">
      <main className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner />
          </div>
        ) : error ? (
          <ErrorWithRetry error={error} onRetry={loadPlants} />
        ) : plants.length === 0 ? (
          <PlantsEmpty onAddPlant={() => setCreateDialogOpen(true)} />
        ) : (
          <PlantsList plants={plants} onDataChange={loadPlants} />
        )}

        {createDialogOpen && (
          <CreatePlantDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onCreated={loadPlants} />
        )}
      </main>
    </ScrollArea>
  )
}
