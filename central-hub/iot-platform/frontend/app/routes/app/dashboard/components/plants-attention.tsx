import { CheckCircle2 } from "lucide-react"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "~/components/ui/empty"
import type { Plant } from "~/lib/types"
import { getPlantHealthStatus } from "~/lib/utils"
import { PlantsEmpty } from "../../plants/browser/components/plants-empty"
import { PlantsGrid } from "../../plants/browser/components/plants-grid"

interface PlantsAttentionProps {
  plants: Plant[]
}

export function PlantsAttention({ plants }: PlantsAttentionProps) {
  const plantsWithAlerts = plants.filter((plant) => getPlantHealthStatus(plant) === "sick")
  const offlinePlants = plants.filter((plant) => plant.module.connectivity.isOnline === false)
  const plantsNeedingAttention = [...plantsWithAlerts, ...offlinePlants]

  if (plants.length === 0) {
    return (
      <>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Plants Needing Attention</h2>
          <p className="text-sm text-muted-foreground">No plants added yet.</p>
        </div>
        <div className="border border-dashed rounded-lg">
          <PlantsEmpty />
        </div>
      </>
    )
  }

  if (plantsNeedingAttention.length > 0) {
    return (
      <>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Plants Needing Attention</h2>
          <p className="text-sm text-muted-foreground">
            {plantsWithAlerts.length > 0 && offlinePlants.length > 0
              ? `${plantsWithAlerts.length} ${plantsWithAlerts.length === 1 ? "sick plant" : "sick plants"} and ${offlinePlants.length} offline`
              : plantsWithAlerts.length > 0
                ? `${plantsWithAlerts.length} ${plantsWithAlerts.length === 1 ? "plant needs" : "plants need"} immediate action`
                : `${offlinePlants.length} ${offlinePlants.length === 1 ? "plant is" : "plants are"} offline`}
          </p>
        </div>
        <PlantsGrid plants={plantsNeedingAttention} />
      </>
    )
  }

  return (
    <>
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Plants Needing Attention</h2>
        <p className="text-sm text-muted-foreground">All plants are healthy and connected</p>
      </div>
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CheckCircle2 />
          </EmptyMedia>
          <EmptyTitle>All Plants Healthy</EmptyTitle>
          <EmptyDescription>
            All {plants.length} {plants.length === 1 ? "plant is" : "plants are"} operating within normal parameters.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </>
  )
}
