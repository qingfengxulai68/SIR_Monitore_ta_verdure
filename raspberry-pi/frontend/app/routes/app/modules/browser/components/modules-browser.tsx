import { useState } from "react"
import { Search, LayoutGrid, Table as TableIcon } from "lucide-react"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "~/components/ui/empty"
import { Input } from "~/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group"
import { ModulesGrid } from "./modules-grid"
import { ModulesTable } from "./modules-table"
import type { Module, Plant } from "~/lib/types"

interface ModulesBrowserProps {
  modules: Module[]
  plants: Plant[]
}

export function ModulesBrowser({ modules, plants }: ModulesBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")

  console.log(modules)
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
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search className="size-6" />
            </EmptyMedia>
            <EmptyTitle>No modules found</EmptyTitle>
            <EmptyDescription>Try searching with different keywords</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {/* Content */}
      {filteredModules.length > 0 &&
        (viewMode === "grid" ? (
          <ModulesGrid modules={filteredModules} plants={plants} />
        ) : (
          <ModulesTable modules={filteredModules} plants={plants} />
        ))}
    </div>
  )
}
