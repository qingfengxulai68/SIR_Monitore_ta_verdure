import { useState } from "react"
import { Link } from "react-router"
import { MoreHorizontal, Unlink } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip"
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
import { useUncoupleModule } from "~/lib/hooks/use-modules"
import type { Module, Plant } from "~/lib/types"

interface ModulesTableProps {
  modules: Module[]
  plants: Plant[]
}

export function ModulesTable({ modules, plants }: ModulesTableProps) {
  const [uncoupleDialogOpen, setUncoupleDialogOpen] = useState(false)
  const [moduleToUncouple, setModuleToUncouple] = useState<Module | null>(null)
  const uncoupleModuleMutation = useUncoupleModule()

  const getPlantName = (plantId: number) => {
    const plant = plants.find((p) => p.id === plantId)
    return plant?.name || `Plant ${plantId}`
  }

  const formatLastSeen = (lastSeen: string | null) => {
    if (!lastSeen) return "Never seen"
    return new Date(lastSeen).toLocaleString()
  }

  const handleUncouple = () => {
    if (!moduleToUncouple) return

    uncoupleModuleMutation.mutate(moduleToUncouple.id, {
      onSuccess: () => {
        setUncoupleDialogOpen(false)
        setModuleToUncouple(null)
      },
      onError: () => {
        setUncoupleDialogOpen(false)
        setModuleToUncouple(null)
      }
    })
  }

  return (
    <>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Module ID</TableHead>
              <TableHead>Connection</TableHead>
              <TableHead>Plant</TableHead>
              <TableHead className="w-12 pr-4"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modules.map((module) => (
              <TableRow key={module.id} className="group h-12.25">
                <TableCell className="font-mono text-sm font-medium pl-4">{module.id}</TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant={module.connectivity.isOnline ? undefined : "destructive"}
                          className={module.connectivity.isOnline ? "bg-green-600" : ""}
                        >
                          {module.connectivity.isOnline ? "Online" : "Offline"}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Last seen: {formatLastSeen(module.connectivity.lastSeen)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell className="text-sm">
                  {module.coupledPlantId ? (
                    <Link to={`/app/plants/${module.coupledPlantId}`} className="hover:underline">
                      {getPlantName(module.coupledPlantId)}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="pr-4">
                  {module.coupledPlantId && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setModuleToUncouple(module)
                            setUncoupleDialogOpen(true)
                          }}
                          className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                        >
                          <Unlink className="h-4 w-4 text-destructive" />
                          Release
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={uncoupleDialogOpen} onOpenChange={setUncoupleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Release module?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently release module "{moduleToUncouple?.id}" and delete its associated plant "
              {moduleToUncouple?.coupledPlantId}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUncouple} className="bg-destructive hover:bg-destructive/90">
              Release
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
