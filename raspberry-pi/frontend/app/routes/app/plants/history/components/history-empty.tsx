import { BarChart3 } from "lucide-react"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "~/components/ui/empty"

export function HistoryEmpty() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BarChart3 />
        </EmptyMedia>
        <EmptyTitle>No history data available</EmptyTitle>
        <EmptyDescription>
          There is no historical data for the selected time range. Try selecting a different time period.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
