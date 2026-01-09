import { useState } from "react"
import { Search as SearchIcon, LayoutGrid, Table as TableIcon } from "lucide-react"
import { Input } from "~/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "~/components/ui/empty"
import { PlantsGrid } from "./plants-grid"
import { PlantsTable } from "./plants-table"
import type { Plant } from "~/lib/types"

interface PlantsBrowserProps {
  plants: Plant[]
}

export function PlantsBrowser({ plants }: PlantsBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")

  const filteredPlants = plants.filter((plant) => plant.name.toLowerCase().includes(searchQuery.toLowerCase()))

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

      {/* Content */}
      {viewMode === "grid" ? <PlantsGrid plants={filteredPlants} /> : <PlantsTable plants={filteredPlants} />}
    </div>
  )
}
