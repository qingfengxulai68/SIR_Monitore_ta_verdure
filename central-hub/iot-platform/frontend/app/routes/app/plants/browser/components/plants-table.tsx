import { useState } from "react"
import { useNavigate } from "react-router"
import { MoreHorizontal, Activity, Settings, Trash2, Clock } from "lucide-react"
import { IconCircleCheckFilled, IconAlertCircleFilled, IconLoader } from "@tabler/icons-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip"
import { useDeletePlant } from "~/lib/hooks/use-plants"
import { getPlantHealthStatus, formatLastSeen } from "~/lib/utils"
import type { Plant } from "~/lib/types"

interface PlantsTableProps {
  plants: Plant[]
}

export function PlantsTable({ plants }: PlantsTableProps) {
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
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/60 hover:bg-muted/60">
              <TableHead className="pl-4">Name</TableHead>
              <TableHead>Module</TableHead>
              <TableHead>Health</TableHead>
              <TableHead>Moisture</TableHead>
              <TableHead>Temperature</TableHead>
              <TableHead>Humidity</TableHead>
              <TableHead>Light</TableHead>
              <TableHead className="w-12 pr-4"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plants.map((plant) => {
              const data = plant.lastMetricsUpdate
              const healthStatus = getPlantHealthStatus(plant)
              const isOutOfRange = (value: number, min: number, max: number) => value < min || value > max

              return (
                <TableRow
                  key={plant.id}
                  className="group cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/app/plants/${plant.id}/monitoring`)}
                >
                  <TableCell className="py-4 pl-4">{plant.name}</TableCell>
                  <TableCell className="py-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="text-muted-foreground px-1.5">
                            {plant.module.connectivity.isOnline ? (
                              <div className="h-2 w-2 rounded-full bg-green-500" />
                            ) : (
                              <div className="h-2 w-2 rounded-full bg-red-500" />
                            )}
                            {plant.module.connectivity.isOnline ? "Online" : "Offline"}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Module: {plant.module.id}</p>
                          <p>Last seen: {formatLastSeen(plant.module.connectivity.lastSeen)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="py-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="text-muted-foreground px-1.5">
                            {healthStatus === "healthy" ? (
                              <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
                            ) : healthStatus === "sick" ? (
                              <IconAlertCircleFilled className="fill-destructive" />
                            ) : (
                              <IconLoader />
                            )}
                            {healthStatus === "sick" ? "Sick" : healthStatus === "healthy" ? "Healthy" : "Unknown"}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Last update: {formatLastSeen(plant.lastMetricsUpdate?.timestamp || null)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="py-4">
                    {data && healthStatus !== "unknown" ? (
                      <span
                        className={`${
                          isOutOfRange(data.soilMoist, plant.thresholds.soilMoist.min, plant.thresholds.soilMoist.max)
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
                    {data && healthStatus !== "unknown" ? (
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
                    {data && healthStatus !== "unknown" ? (
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
                    {data && healthStatus !== "unknown" ? (
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
                            navigate(`/app/plants/${plant.id}/history`)
                          }}
                          className="gap-2"
                        >
                          <Clock className="h-4 w-4" />
                          History
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
