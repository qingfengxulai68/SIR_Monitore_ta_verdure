import { useState } from "react"
import { Search, LayoutGrid, Table as TableIcon } from "lucide-react"
import { Link } from "react-router"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "~/components/ui/empty"
import { Input } from "~/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group"
import { type Module } from "~/lib/api/modules"

interface ModulesListProps {
  modules: Module[]
}

export function ModulesList({ modules }: ModulesListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")

  const filteredModules = modules.filter((module) => module.id.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
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
                <CardTitle className="text-base font-mono font-semibold">{module.id}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {module.coupled ? (
                    <Badge className="bg-yellow-500">Assigned</Badge>
                  ) : (
                    <Badge className="bg-green-600 text-xs">Available</Badge>
                  )}
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
                <TableHead>Status</TableHead>
                <TableHead>Plant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredModules.map((module) => (
                <TableRow key={module.id} className="group h-12.25">
                  <TableCell className="font-mono text-sm font-medium pl-4">{module.id}</TableCell>
                  <TableCell>
                    {module.coupled ? (
                      <Badge className="bg-yellow-500">Assigned</Badge>
                    ) : (
                      <Badge className="bg-green-600">Available</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {module.coupledPlant ? (
                      <Link to={`/app/plants/${module.coupledPlant.id}`} className="hover:underline">
                        {module.coupledPlant.name}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
