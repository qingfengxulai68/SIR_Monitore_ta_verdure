import { useEffect, useState } from "react"
import type { Route } from "./+types/page"
import { redirect } from "react-router"
import { Settings, Clock } from "lucide-react"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Spinner } from "~/components/ui/spinner"
import { usePlant } from "~/lib/hooks/use-plants"
import { usePlantHistory } from "~/lib/hooks/use-plants"
import { useHeader } from "~/layout/header/header-provider"
import { HistoryCharts } from "./components/history-charts"
import { HistoryEmpty } from "./components/history-empty"
import { ScrollArea } from "~/components/ui/scroll-area"
import { ErrorWithRetry } from "~/components/other/error-with-retry"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from "~/components/ui/dropdown-menu"

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const id = params.id
  if (!id || isNaN(Number(id)) || !Number.isInteger(Number(id)) || Number(id) <= 0) {
    throw redirect("/app/plants")
  }
  return null
}

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `Plant History ${params.id} - Terrarium` }]
}

export default function PlantHistory({ params }: Route.ComponentProps) {
  const { id } = params
  const { setHeaderContent } = useHeader()
  const { data: plant, isLoading: isLoadingPlant, error: plantError, refetch: refetchPlant } = usePlant(parseInt(id))
  const [timeRange, setTimeRange] = useState<"hour" | "day" | "week" | "month">("hour")
  const [chartOption, setChartOption] = useState<"cartesian" | "thresholds" | "none">("cartesian")

  const {
    data: historyData,
    isLoading: isLoadingHistory,
    error: historyError,
    refetch: refetchHistory
  } = usePlantHistory(parseInt(id), timeRange)

  const showGrid = chartOption === "cartesian"
  const showThresholds = chartOption === "thresholds"

  useEffect(() => {
    if (plant) {
      setHeaderContent({
        breadcrumbs: [
          { label: "Plants", href: "/app/plants" },
          { label: plant.name, href: `/app/plants/${plant.id}` },
          { label: "History" }
        ],
        actions: (
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Clock className="size-3.5" />
                  <span className="capitalize">{timeRange}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Time Range</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={timeRange}
                  onValueChange={(value) => setTimeRange(value as "hour" | "day" | "week" | "month")}
                >
                  <DropdownMenuRadioItem value="hour">Hour</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="day">Day</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="week">Week</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="month">Month</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-full h-7.5 w-7.5">
                  <Settings className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Chart Grid</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={chartOption}
                  onValueChange={(value) => setChartOption(value as "cartesian" | "thresholds" | "none")}
                >
                  <DropdownMenuRadioItem value="none">None</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="cartesian">Cartesian</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="thresholds">Thresholds</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      })
    }
  }, [plant, setHeaderContent, chartOption, timeRange])

  const isLoading = isLoadingPlant || isLoadingHistory
  const error = plantError || historyError
  const refetch = () => {
    refetchPlant()
    refetchHistory()
  }

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] p-6">
      <main className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner />
          </div>
        ) : error ? (
          <ErrorWithRetry error={error.message} onRetry={refetch} />
        ) : (
          <>
            {historyData && historyData.data.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing data from{" "}
                    <span className="font-medium">{new Date(historyData.meta.from).toLocaleString()}</span> to{" "}
                    <span className="font-medium">{new Date(historyData.meta.to).toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Aggregation: <span className="font-medium">{historyData.meta.aggregation}</span>
                  </div>
                </div>
                <HistoryCharts
                  plant={plant!}
                  data={historyData.data}
                  showGrid={showGrid}
                  showThresholds={showThresholds}
                />
              </>
            ) : (
              <HistoryEmpty />
            )}
          </>
        )}
      </main>
    </ScrollArea>
  )
}
