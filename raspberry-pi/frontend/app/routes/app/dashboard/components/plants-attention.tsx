import { useState } from "react"
import { useNavigate } from "react-router"
import {
  Flower2,
  Droplets,
  Thermometer,
  Cloud,
  Sun,
  MoreHorizontal,
  Settings,
  Trash2,
  Activity,
  CheckCircle2,
  WifiOff
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "~/components/ui/empty"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "~/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "~/components/ui/alert-dialog"
import { useDeletePlant } from "~/hooks/use-plants"
import type { PlantResponse } from "~/lib/types"

interface PlantsAttentionProps {
  plants: PlantResponse[]
}

export function PlantsAttention({ plants }: PlantsAttentionProps) {
  const navigate = useNavigate()
  const deleteMutation = useDeletePlant()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [plantToDelete, setPlantToDelete] = useState<PlantResponse | null>(null)

  const plantsWithAlerts = plants.filter((plant) => plant.status === "alert")
  const offlinePlants = plants.filter((plant) => plant.status === "offline")
  const plantsNeedingAttention = [...plantsWithAlerts, ...offlinePlants]

  const handleDelete = () => {
    if (!plantToDelete) return

    deleteMutation.mutate(plantToDelete.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false)
        setPlantToDelete(null)
      }
    })
  }

  if (plants.length === 0) {
    return (
      <>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Plants Needing Attention</h2>
          <p className="text-sm text-muted-foreground">No plants added yet. Start monitoring your plant collection.</p>
        </div>
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
            <Button onClick={() => navigate("/app/plants")} size="sm" variant={"outline"}>
              Add Plant
            </Button>
          </EmptyContent>
        </Empty>
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
              ? `${plantsWithAlerts.length} ${plantsWithAlerts.length === 1 ? "alert" : "alerts"} and ${offlinePlants.length} offline`
              : plantsWithAlerts.length > 0
                ? `${plantsWithAlerts.length} ${plantsWithAlerts.length === 1 ? "plant needs" : "plants need"} immediate action`
                : `${offlinePlants.length} ${offlinePlants.length === 1 ? "plant is" : "plants are"} offline`}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plantsNeedingAttention.map((plant) => {
            const data = plant.latestValues
            const isOutOfRange = (value: number, min: number, max: number) => value < min || value > max
            const isOffline = plant.status === "offline"
            const isAlert = plant.status === "alert"

            return (
              <Card key={plant.id} className="group transition-all hover:shadow-sm border-muted gap-0">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold truncate">{plant.name}</CardTitle>
                      <Badge variant={isAlert ? "destructive" : "secondary"} className="mt-1.5 text-xs">
                        {isAlert ? "Alert" : "Offline"}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => navigate(`/app/plants/${plant.id}/monitoring`)}
                          className="gap-2"
                        >
                          <Activity className="h-4 w-4" />
                          Monitoring
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/app/plants/${plant.id}`)} className="gap-2">
                          <Settings className="h-4 w-4" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setPlantToDelete(plant)
                            setDeleteDialogOpen(true)
                          }}
                          className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {!isOffline ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Droplets className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">Soil Moisture</span>
                        </div>
                        <p
                          className={`text-lg tabular-nums ${
                            isOutOfRange(data.soilMoist, plant.thresholds.soilMoist.min, plant.thresholds.soilMoist.max)
                              ? "text-destructive"
                              : "text-foreground"
                          }`}
                        >
                          {data.soilMoist}%
                        </p>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Thermometer className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">Temp</span>
                        </div>
                        <p
                          className={`text-lg tabular-nums ${
                            isOutOfRange(data.temp, plant.thresholds.temp.min, plant.thresholds.temp.max)
                              ? "text-destructive"
                              : "text-foreground"
                          }`}
                        >
                          {data.temp}°C
                        </p>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Cloud className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">Humidity</span>
                        </div>
                        <p
                          className={`text-lg tabular-nums ${
                            isOutOfRange(data.humidity, plant.thresholds.humidity.min, plant.thresholds.humidity.max)
                              ? "text-destructive"
                              : "text-foreground"
                          }`}
                        >
                          {data.humidity}%
                        </p>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Sun className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">Light</span>
                        </div>
                        <p
                          className={`text-lg tabular-nums ${
                            isOutOfRange(data.light, plant.thresholds.light.min, plant.thresholds.light.max)
                              ? "text-destructive"
                              : "text-foreground"
                          }`}
                        >
                          {data.light.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <WifiOff className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No recent data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{plantToDelete?.name}" and uncouple its module. This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

  return (
    <>
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Plants Needing Attention</h2>
        <p className="text-sm text-muted-foreground">All plants are healthy and connected</p>
      </div>
      <Empty className="border">
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
