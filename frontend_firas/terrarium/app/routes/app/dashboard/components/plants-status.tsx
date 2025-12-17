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
  CheckCircle2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
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
import { toast } from "sonner"
import { mockDeletePlant, type Plant, type SensorData } from "~/lib/mocks"

interface PlantsStatusProps {
  plants: Plant[]
  sensorData: Record<string, SensorData>
  onDataChange: () => void
}

export function PlantsStatus({ plants, sensorData, onDataChange }: PlantsStatusProps) {
  const navigate = useNavigate()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [plantToDelete, setPlantToDelete] = useState<Plant | null>(null)

  const checkPlantStatus = (plant: Plant, data: SensorData | undefined) => {
    if (!data) return "unknown"

    const isOutOfRange = (value: number, min: number, max: number) => value < min || value > max

    if (
      isOutOfRange(data.moisture, plant.thresholds.moisture.min, plant.thresholds.moisture.max) ||
      isOutOfRange(data.humidity, plant.thresholds.humidity.min, plant.thresholds.humidity.max) ||
      isOutOfRange(data.temperature, plant.thresholds.temperature.min, plant.thresholds.temperature.max) ||
      isOutOfRange(data.light, plant.thresholds.light.min, plant.thresholds.light.max)
    ) {
      return "alert"
    }

    return "ok"
  }

  const plantsWithAlerts = plants.filter((plant) => checkPlantStatus(plant, sensorData[plant.moduleId]) === "alert")

  const handleDelete = async () => {
    if (!plantToDelete) return

    const success = await mockDeletePlant(plantToDelete.id)

    if (success) {
      toast.success(`${plantToDelete.name} has been removed.`)
      onDataChange()
    } else {
      toast.error("Failed to delete plant.")
    }

    setDeleteDialogOpen(false)
    setPlantToDelete(null)
  }

  if (plants.length === 0) {
    return (
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
          <Button onClick={() => navigate("/app/plants")} size="sm" className="gap-2">
            Add Plant
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  if (plantsWithAlerts.length > 0) {
    return (
      <>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Plants Requiring Attention</h2>
          <p className="text-sm text-muted-foreground">
            {plantsWithAlerts.length} {plantsWithAlerts.length === 1 ? "plant needs" : "plants need"} immediate action
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plantsWithAlerts.map((plant) => {
            const data = sensorData[plant.moduleId]
            const isOutOfRange = (value: number, min: number, max: number) => value < min || value > max

            return (
              <Card key={plant.id} className="group transition-all hover:shadow-sm border-muted gap-0">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold truncate">{plant.name}</CardTitle>
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
                        <DropdownMenuItem
                          onClick={() => navigate(`/app/plants/${plant.id}/settings`)}
                          className="gap-2"
                        >
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
                  {data && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Droplets className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">Moisture</span>
                        </div>
                        <p
                          className={`text-lg tabular-nums ${
                            isOutOfRange(data.moisture, plant.thresholds.moisture.min, plant.thresholds.moisture.max)
                              ? "text-destructive"
                              : "text-foreground"
                          }`}
                        >
                          {data.moisture}%
                        </p>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Thermometer className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">Temp</span>
                        </div>
                        <p
                          className={`text-lg tabular-nums ${
                            isOutOfRange(
                              data.temperature,
                              plant.thresholds.temperature.min,
                              plant.thresholds.temperature.max
                            )
                              ? "text-destructive"
                              : "text-foreground"
                          }`}
                        >
                          {data.temperature}°C
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
        <h2 className="text-lg font-semibold tracking-tight">Your Plants</h2>
        <p className="text-sm text-muted-foreground">Real-time monitoring of your plant collection</p>
      </div>
      <Card className="border-muted">
        <CardContent className="flex items-center gap-3 py-8">
          <div className="rounded-lg bg-green-500/10 p-3">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-base font-semibold">All Plants Healthy</p>
            <p className="text-sm text-muted-foreground">
              All {plants.length} {plants.length === 1 ? "plant is" : "plants are"} operating within normal parameters
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
