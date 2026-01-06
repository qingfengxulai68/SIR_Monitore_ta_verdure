import { useState } from "react"
import { useNavigate } from "react-router"
import {
  MoreHorizontal,
  Activity,
  Settings,
  Trash2,
  Search as SearchIcon,
  Droplets,
  Thermometer,
  Cloud,
  Sun,
  LayoutGrid,
  Table as TableIcon,
  WifiOff
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
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
import { Input } from "~/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "~/components/ui/empty"
import { useDeletePlant } from "~/hooks/use-plants"
import type { PlantResponse } from "~/lib/types"

interface PlantsListProps {
  data: PlantResponse[]
}

export function PlantsList({ data }: PlantsListProps) {
  const navigate = useNavigate()
  const deletePlantMutation = useDeletePlant()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [plantToDelete, setPlantToDelete] = useState<PlantResponse | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")

  const filteredPlants = data.filter((plant) => plant.name.toLowerCase().includes(searchQuery.toLowerCase()))

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

  if (filteredPlants.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-80">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search plants by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchIcon className="size-6" />
            </EmptyMedia>
            <EmptyTitle>No plants found</EmptyTitle>
            <EmptyDescription>Try searching with different keywords</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header with search and view toggle */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-80">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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

        {/* List content */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlants.map((plant) => {
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
                    {status !== "offline" ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Droplets className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">Moisture</span>
                          </div>
                          <p
                            className={`text-lg tabular-nums ${
                              isOutOfRange(
                                data.soilMoist,
                                plant.thresholds.soilMoist.min,
                                plant.thresholds.soilMoist.max
                              )
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
        ) : (
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-4">Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Moisture</TableHead>
                  <TableHead>Temperature</TableHead>
                  <TableHead>Humidity</TableHead>
                  <TableHead>Light</TableHead>
                  <TableHead className="w-12 pr-4"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlants.map((plant) => {
                  const data = plant.latestValues
                  const status = plant.status
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
                          variant={status === "alert" ? "destructive" : status === "ok" ? "default" : "secondary"}
                          className={status === "ok" ? "bg-green-600" : ""}
                        >
                          {status === "alert" ? "Alert" : status === "ok" ? "Normal" : "Offline"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        {data ? (
                          <span
                            className={`${
                              isOutOfRange(
                                data.soilMoist,
                                plant.thresholds.soilMoist.min,
                                plant.thresholds.soilMoist.max
                              )
                                ? "text-destructive"
                                : ""
                            }`}
                          >
                            {data.soilMoist}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4">
                        {data ? (
                          <span
                            className={`${
                              isOutOfRange(data.temp, plant.thresholds.temp.min, plant.thresholds.temp.max)
                                ? "text-destructive"
                                : ""
                            }`}
                          >
                            {data.temp}°C
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4">
                        {data ? (
                          <span
                            className={`${
                              isOutOfRange(data.humidity, plant.thresholds.humidity.min, plant.thresholds.humidity.max)
                                ? "text-destructive"
                                : ""
                            }`}
                          >
                            {data.humidity}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
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
                          <span className="text-muted-foreground">-</span>
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
