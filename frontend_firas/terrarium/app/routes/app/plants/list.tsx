import { useEffect, useState } from "react"
import type { Route } from "./+types/list"
import { useNavigate } from "react-router"
import {
  Flower2,
  Plus,
  MoreHorizontal,
  Activity,
  Settings,
  Trash2,
  Search,
  Droplets,
  Thermometer,
  Cloud,
  Sun,
  LayoutGrid,
  Table as TableIcon
} from "lucide-react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group"

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
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Skeleton } from "~/components/ui/skeleton"
import { Input } from "~/components/ui/input"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "~/components/ui/empty"
import { toast } from "sonner"
import { mockGetPlants, mockDeletePlant, mockGetCurrentSensorData, type Plant, type SensorData } from "~/lib/mocks"
import { useHeader } from "~/hooks/use-header"

export function meta({}: Route.MetaArgs) {
  return [{ title: "All Plants - Terrarium" }, { name: "description", content: "List of all registered plants." }]
}

export default function PlantsList() {
  const [plants, setPlants] = useState<Plant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [plantToDelete, setPlantToDelete] = useState<Plant | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sensorData, setSensorData] = useState<Record<string, SensorData>>({})
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")

  const navigate = useNavigate()
  const { setHeaderContent } = useHeader()

  const filteredPlants = plants.filter((plant) => plant.name.toLowerCase().includes(searchQuery.toLowerCase()))

  useEffect(() => {
    setHeaderContent({
      breadcrumbs: [{ label: "Plants" }],
      actions: (
        <Button onClick={() => alert("In dev")} variant="outline" size="icon">
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

  const handleDelete = async () => {
    if (!plantToDelete) return

    const success = await mockDeletePlant(plantToDelete.id)

    if (success) {
      toast.success(`${plantToDelete.name} has been removed.`)
      loadPlants()
    } else {
      toast.error("Failed to delete plant.")
    }

    setDeleteDialogOpen(false)
    setPlantToDelete(null)
  }

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
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search plants by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">
                {filteredPlants.length} {filteredPlants.length === 1 ? "plant" : "plants"}
              </div>
              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(value) => value && setViewMode(value as "grid" | "table")}
              >
                <ToggleGroupItem value="grid" aria-label="Grid view">
                  <LayoutGrid className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="table" aria-label="Table view">
                  <TableIcon className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {filteredPlants.length === 0 ? (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Search className="size-6" />
                </EmptyMedia>
                <EmptyTitle>No plants found</EmptyTitle>
                <EmptyDescription>Try searching with different keywords</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlants.map((plant) => {
                const data = sensorData[plant.moduleId]
                const status = checkPlantStatus(plant, data)
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
                            {status === "alert" ? "Alert" : status === "ok" ? "Normal" : "Unknown"}
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
                      {data ? (
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
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          <p className="text-sm">No sensor data</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold pl-4">Name</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Moisture</TableHead>
                    <TableHead className="font-semibold">Temperature</TableHead>
                    <TableHead className="font-semibold">Humidity</TableHead>
                    <TableHead className="font-semibold">Light</TableHead>
                    <TableHead className="w-12 pr-4"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlants.map((plant) => {
                    const data = sensorData[plant.moduleId]
                    const isOutOfRange = (value: number, min: number, max: number) => value < min || value > max

                    return (
                      <TableRow
                        key={plant.id}
                        className="group cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/app/plants/${plant.id}/monitoring`)}
                      >
                        <TableCell className="py-4 pl-4">{plant.name}</TableCell>
                        <TableCell className="py-4">
                          <Badge
                            variant={
                              checkPlantStatus(plant, data) === "alert"
                                ? "destructive"
                                : checkPlantStatus(plant, data) === "ok"
                                  ? "default"
                                  : "secondary"
                            }
                            className={checkPlantStatus(plant, data) === "ok" ? "bg-green-600" : ""}
                          >
                            {checkPlantStatus(plant, data) === "alert"
                              ? "Alert"
                              : checkPlantStatus(plant, data) === "ok"
                                ? "Normal"
                                : "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          {data ? (
                            <span
                              className={`${
                                isOutOfRange(
                                  data.moisture,
                                  plant.thresholds.moisture.min,
                                  plant.thresholds.moisture.max
                                )
                                  ? "text-destructive"
                                  : ""
                              }`}
                            >
                              {data.moisture}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="py-4">
                          {data ? (
                            <span
                              className={`${
                                isOutOfRange(
                                  data.temperature,
                                  plant.thresholds.temperature.min,
                                  plant.thresholds.temperature.max
                                )
                                  ? "text-destructive"
                                  : ""
                              }`}
                            >
                              {data.temperature}°C
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="py-4">
                          {data ? (
                            <span
                              className={`${
                                isOutOfRange(
                                  data.humidity,
                                  plant.thresholds.humidity.min,
                                  plant.thresholds.humidity.max
                                )
                                  ? "text-destructive"
                                  : ""
                              }`}
                            >
                              {data.humidity}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="py-4">
                          {data ? (
                            <span
                              className={`${
                                isOutOfRange(data.light, plant.thresholds.light.min, plant.thresholds.light.max)
                                  ? "text-destructive"
                                  : ""
                              }`}
                            >
                              {data.light.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="py-4 pr-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  navigate(`/app/plants/${plant.id}/monitoring`)
                                }}
                                className="gap-2"
                              >
                                <Activity className="h-4 w-4" />
                                Monitoring
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  navigate(`/app/plants/${plant.id}`)
                                }}
                                className="gap-2"
                              >
                                <Settings className="h-4 w-4" />
                                Settings
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
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
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}

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
    </div>
  )
}
