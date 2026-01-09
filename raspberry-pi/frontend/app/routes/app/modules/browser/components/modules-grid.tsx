import { useState } from "react"
import { Link } from "react-router"
import { MoreHorizontal, Unlink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu"
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

interface ModulesGridProps {
  modules: Module[]
  plants: Plant[]
}

export function ModulesGrid({ modules, plants }: ModulesGridProps) {
  const [uncoupleDialogOpen, setUncoupleDialogOpen] = useState(false)
  const [moduleToUncouple, setModuleToUncouple] = useState<Module | null>(null)
  const uncoupleModuleMutation = useUncoupleModule()

  const getPlantName = (plantId: number) => {
    const plant = plants.find((p) => p.id === plantId)
    return plant?.name || `Plant ${plantId}`
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module) => (
          <Card key={module.id} className="transition-all hover:shadow-sm border-muted gap-0">
            <CardHeader>
              <div className="flex items-start justify-between gap-2 h-7">
                <CardTitle className="text-base font-mono font-semibold">{module.id}</CardTitle>
                {module.coupledPlantId && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2">
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
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge
                  variant={module.isOnline ? undefined : "destructive"}
                  className={module.isOnline ? "bg-green-600" : ""}
                >
                  {module.isOnline ? "Online" : "Offline"}
                </Badge>
                {module.coupledPlantId && (
                  <Link to={`/app/plants/${module.coupledPlantId}`}>
                    <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent">
                      {getPlantName(module.coupledPlantId)}
                    </Badge>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
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
