import { useState } from "react"
import { Flower2 } from "lucide-react"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "~/components/ui/empty"
import { Button } from "~/components/ui/button"
import { CreatePlantDialog } from "./add-plant-dialog"

export function PlantsEmpty() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Flower2 />
        </EmptyMedia>
        <EmptyTitle>No plants yet</EmptyTitle>
        <EmptyDescription>
          Get started by adding your first plant to monitor its environment and health.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={() => setCreateDialogOpen(true)} size="sm" variant={"outline"}>
          Add Plant
        </Button>
      </EmptyContent>
      {createDialogOpen && <CreatePlantDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />}
    </Empty>
  )
}
