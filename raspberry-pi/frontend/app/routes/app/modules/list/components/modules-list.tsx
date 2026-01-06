import { useState } from "react"
import { Search, LayoutGrid, Table as TableIcon, MoreHorizontal, Unlink } from "lucide-react"
import { Link } from "react-router"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "~/components/ui/empty"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group"
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
import { useUncoupleModule } from "~/hooks/use-modules"
import type { ModuleResponse } from "~/lib/types"

interface ModulesListProps {
  data: ModuleResponse[]
}

export function ModulesList({ data }: ModulesListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [uncoupleDialogOpen, setUncoupleDialogOpen] = useState(false)
  const [moduleToUncouple, setModuleToUncouple] = useState<ModuleResponse | null>(null)
  const uncoupleModuleMutation = useUncoupleModule()

  const filteredModules = data.filter((module) => module.id.toLowerCase().includes(searchQuery.toLowerCase()))

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search modules by ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">
              {filteredModules.length} {filteredModules.length === 1 ? "module" : "modules"}
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

        {/* Empty state for filtered results */}
        {filteredModules.length === 0 && (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Search className="size-6" />
              </EmptyMedia>
              <EmptyTitle>No modules found</EmptyTitle>
              <EmptyDescription>Try searching with different keywords</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {/* Grid View */}
        {filteredModules.length > 0 && viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModules.map((module) => (
              <Card key={module.id} className="transition-all hover:shadow-sm border-muted gap-0">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 h-7">
                    <CardTitle className="text-base font-mono font-semibold">{module.id}</CardTitle>
                    {module.coupledPlant && (
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
                    {module.coupledPlant && (
                      <Link to={`/app/plants/${module.coupledPlant.id}`}>
                        <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent">
                          {module.coupledPlant.name}
                        </Badge>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Table View */}
        {filteredModules.length > 0 && viewMode === "table" && (
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
                {filteredModules.map((module) => (
                  <TableRow key={module.id} className="group h-12.25">
                    <TableCell className="font-mono text-sm font-medium pl-4">{module.id}</TableCell>
                    <TableCell>
                      <Badge
                        variant={module.isOnline ? undefined : "destructive"}
                        className={module.isOnline ? "bg-green-600" : ""}
                      >
                        {module.isOnline ? "Online" : "Offline"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {module.coupledPlant ? (
                        <Link to={`/app/plants/${module.coupledPlant.id}`} className="hover:underline">
                          {module.coupledPlant.name}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="pr-4">
                      {module.coupledPlant && (
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
        )}
      </div>

      <AlertDialog open={uncoupleDialogOpen} onOpenChange={setUncoupleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Release module?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently release module "{moduleToUncouple?.id}" and delete its associated plant "
              {moduleToUncouple?.coupledPlant?.name}". This action cannot be undone.
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
