import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import type { Route } from "./+types/page"
import {
  Flower2,
  Droplets,
  Thermometer,
  Cloud,
  Sun,
  Cpu,
  AlertCircle,
  TrendingUp,
  Activity,
  CheckCircle2,
  MoreHorizontal,
  Settings,
  Trash2
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Skeleton } from "~/components/ui/skeleton"
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
import {
  mockGetPlants,
  mockGetModules,
  mockDeletePlant,
  mockGetCurrentSensorData,
  type Plant,
  type Module,
  type SensorData
} from "~/lib/mocks"
import { useHeader } from "~/hooks/use-header"

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [plantToDelete, setPlantToDelete] = useState<Plant | null>(null)

  const navigate = useNavigate()
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

  const handleDelete = async () => {
    if (!plantToDelete) return

    const success = await mockDeletePlant(plantToDelete.id)

    if (success) {
      toast.success(`${plantToDelete.name} has been removed.`)
      loadData()
    } else {
      toast.error("Failed to delete plant.")
    }

    setDeleteDialogOpen(false)
    setPlantToDelete(null)
  }

  // Calculate stats
  const plantsWithAlerts = plants.filter((plant) => checkPlantStatus(plant, sensorData[plant.moduleId]) === "alert")
  const systemHealth =
    plants.length > 0 ? Math.round(((plants.length - plantsWithAlerts.length) / plants.length) * 100) : 100

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
          <Skeleton className="h-32" />
        </div>
      ) : (
        <>
          {/* System Overview */}
          <div>
            <h2 className="text-lg font-semibold tracking-tight">System Overview</h2>
            <p className="text-sm text-muted-foreground">Real-time status of your IoT monitoring system</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="gap-0">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Flower2 className="h-4 w-4 text-green-600" />
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Plants</CardTitle>
                </div>
                <p className="text-3xl font-semibold">{plants.length}</p>
              </CardHeader>
            </Card>

            <Card className="gap-0">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-blue-600" />
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Modules</CardTitle>
                </div>
                <p className="text-3xl font-semibold">{modules.length}</p>
              </CardHeader>
            </Card>

            <Card className="gap-0">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Alerts</CardTitle>
                </div>
                <p className={`text-3xl font-semibold ${plantsWithAlerts.length > 0 ? "text-destructive" : ""}`}>
                  {plantsWithAlerts.length}
                </p>
              </CardHeader>
            </Card>

            <Card className="gap-0">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-600" />
                  <CardTitle className="text-sm font-medium text-muted-foreground">System Health</CardTitle>
                </div>
                <p className="text-3xl font-semibold">{systemHealth}%</p>
              </CardHeader>
            </Card>
          </div>

          {/* Plants Status - Only show if there are alerts or no plants */}
          {plants.length === 0 ? (
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
                  <Flower2 className="h-4 w-4" />
                  Add Plant
                </Button>
              </EmptyContent>
            </Empty>
          ) : plantsWithAlerts.length > 0 ? (
            <>
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Plants Requiring Attention</h2>
                <p className="text-sm text-muted-foreground">
                  {plantsWithAlerts.length} {plantsWithAlerts.length === 1 ? "plant needs" : "plants need"} immediate
                  action
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plantsWithAlerts.map((plant) => {
                  const data = sensorData[plant.moduleId]
                  const status = checkPlantStatus(plant, data)
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
                                  isOutOfRange(
                                    data.moisture,
                                    plant.thresholds.moisture.min,
                                    plant.thresholds.moisture.max
                                  )
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
                                  isOutOfRange(
                                    data.humidity,
                                    plant.thresholds.humidity.min,
                                    plant.thresholds.humidity.max
                                  )
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
            </>
          ) : (
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
                      All {plants.length} {plants.length === 1 ? "plant is" : "plants are"} operating within normal
                      parameters
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}

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
    </div>
  )
}
