import { Search } from "lucide-react"
import { Link } from "react-router"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "~/components/ui/empty"
import type { Module } from "~/lib/mocks"

interface ModulesListProps {
  modules: Module[]
  viewMode: "grid" | "table"
}

export function ModulesList({ modules, viewMode }: ModulesListProps) {
  if (modules.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Search className="size-6" />
          </EmptyMedia>
          <EmptyTitle>No modules found</EmptyTitle>
          <EmptyDescription>Try searching with different keywords</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module) => (
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
                {module.plantName && module.plantId && (
                  <Link to={`/app/plants/${module.plantId}`}>
                    <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent">
                      {module.plantName}
                    </Badge>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
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
          {modules.map((module) => (
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
                {module.plantName && module.plantId ? (
                  <Link to={`/app/plants/${module.plantId}`} className="hover:underline">
                    {module.plantName}
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
  )
}
