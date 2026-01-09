import { useState } from "react"
import { useNavigate } from "react-router"
import {
  MoreHorizontal,
  Activity,
  Settings,
  Trash2,
  Droplets,
  Thermometer,
  Cloud,
  Sun,
  WifiOff,
  Clock
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
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
import { useDeletePlant } from "~/lib/hooks/use-plants"
import type { Plant } from "~/lib/types"

interface PlantsGridProps {
  plants: Plant[]
}

export function PlantsGrid({ plants }: PlantsGridProps) {
  const navigate = useNavigate()
  const deletePlantMutation = useDeletePlant()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [plantToDelete, setPlantToDelete] = useState<Plant | null>(null)

  const handleDelete = () => {
    if (!plantToDelete) return

    deletePlantMutation.mutate(plantToDelete.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false)
        setPlantToDelete(null)
      },
      onError: () => {
        setDeleteDialogOpen(false)
        setPlantToDelete(null)
      }
    })
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plants.map((plant) => {
          const data = plant.latestValues
          const status = plant.status
          const isOutOfRange = (value: number, min: number, max: number) => value < min || value > max

          return (
            <Card key={plant.id} className="group transition-all hover:shadow-sm border-muted gap-0">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-semibold truncate">{plant.name}</CardTitle>
                    <Badge
                      variant={status === "alert" ? "destructive" : status === "ok" ? "default" : "secondary"}
                      className={status === "ok" ? "mt-1.5 text-xs bg-green-600" : "mt-1.5 text-xs"}
                    >
                      {status === "alert" ? "Alert" : status === "ok" ? "Normal" : "Offline"}
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
                {status !== "offline" && data ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Droplets className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">Moisture</span>
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
                ) : status === "offline" ? (
                  <div className="text-center py-5">
                    <WifiOff className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No recent data available</p>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Awaiting first data...</p>
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
            <AlertDialogTitle>Delete plant?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{plantToDelete?.name}" and disconnect its module. This action cannot be
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
