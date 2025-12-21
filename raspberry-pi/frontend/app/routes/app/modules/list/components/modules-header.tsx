import { Search, LayoutGrid, Table as TableIcon } from "lucide-react"
import { Input } from "~/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group"

interface ModulesHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  viewMode: "grid" | "table"
  onViewModeChange: (mode: "grid" | "table") => void
  filteredCount: number
}

export function ModulesHeader({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  filteredCount
}: ModulesHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search modules by ID..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="flex items-center gap-3">
        <div className="text-sm text-muted-foreground">
          {filteredCount} {filteredCount === 1 ? "module" : "modules"}
        </div>
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(value) => value && onViewModeChange(value as "grid" | "table")}
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
  )
}
