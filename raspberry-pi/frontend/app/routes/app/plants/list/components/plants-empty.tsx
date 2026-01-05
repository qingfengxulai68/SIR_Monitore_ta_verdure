import { Flower2 } from "lucide-react"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "~/components/ui/empty"
import { Button } from "~/components/ui/button"

interface PlantsEmptyProps {
  onAddPlant: () => void
}

export function PlantsEmpty({ onAddPlant }: PlantsEmptyProps) {
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
        <Button onClick={onAddPlant} size="sm" variant={"outline"}>
          Add Plant
        </Button>
      </EmptyContent>
    </Empty>
  )
}
