import { useEffect, useState } from "react"
import type { Route } from "./+types/page"
import { Plus } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Spinner } from "~/components/ui/spinner"
import { useHeader } from "~/components/nav/header/header-provider"
import { CreatePlantDialog } from "./components/add-plant-dialog"
import { PlantsList } from "./components/plants-list"
import { PlantsEmpty } from "./components/plants-empty"
import { ScrollArea } from "~/components/ui/scroll-area"
import { ErrorWithRetry } from "~/components/other/error-with-retry"
import { usePlants } from "~/hooks/use-plants"

export function meta({}: Route.MetaArgs) {
  return [{ title: "All Plants - Terrarium" }, { name: "description", content: "List of all registered plants." }]
}

export default function PlantsListPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const { data = [], isLoading, error, refetch } = usePlants()

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
          <PlantsEmpty onAddPlant={() => setCreateDialogOpen(true)} />
        ) : (
          <PlantsList data={data} />
        )}

        {createDialogOpen && <CreatePlantDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />}
      </main>
    </ScrollArea>
  )
}
