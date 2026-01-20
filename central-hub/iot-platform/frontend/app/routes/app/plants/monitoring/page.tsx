import { useEffect, useState } from "react"
import type { Route } from "./+types/page"
import { redirect } from "react-router"
import { Settings } from "lucide-react"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Spinner } from "~/components/ui/spinner"
import { usePlant } from "~/lib/hooks/use-plants"
import { useHeader } from "~/layout/header/header-provider"
import { CurrentMetrics } from "./components/current-metrics"
import { Charts } from "./components/charts"
import { ScrollArea } from "~/components/ui/scroll-area"
import { ErrorWithRetry } from "~/components/other/error-with-retry"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from "~/components/ui/dropdown-menu"
import { formatLastSeen, getPlantHealthStatus } from "~/lib/utils"
import { IconCircleCheckFilled, IconAlertCircleFilled, IconLoader } from "@tabler/icons-react"

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const id = params.id
  if (!id || isNaN(Number(id)) || !Number.isInteger(Number(id)) || Number(id) <= 0) {
    throw redirect("/app/plants")
  }
  return null
}

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `Monitor Plant ${params.id} - Terrarium` }]
}

export default function PlantMonitoring({ params }: Route.ComponentProps) {
  const { id } = params
  const { setHeaderContent } = useHeader()
  const { data: plant, isLoading, error, refetch } = usePlant(parseInt(id))
  const [chartOption, setChartOption] = useState<"cartesian" | "thresholds" | "none">("cartesian")

  const showGrid = chartOption === "cartesian"
  const showThresholds = chartOption === "thresholds"

  useEffect(() => {
    if (plant) {
      const isOnline = plant.module.connectivity.isOnline
      const healthStatus = getPlantHealthStatus(plant)

      setHeaderContent({
        breadcrumbs: [
          { label: "Plants", href: "/app/plants" },
          { label: plant.name, href: `/app/plants/${plant.id}` },
          { label: "Monitoring" }
        ],
        actions: (
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="gap-2 px-3 py-1.5">
                    <span
                      className={`h-2 w-2 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
                    />
                    {isOnline ? "Online" : "Offline"}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Module: {plant.module.id}</p>
                  <p>Last seen: {formatLastSeen(plant.module.connectivity.lastSeen)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="gap-2 px-3 py-1.5">
                    {healthStatus === "healthy" ? (
                      <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
                    ) : healthStatus === "sick" ? (
                      <IconAlertCircleFilled className="fill-destructive" />
                    ) : (
                      <IconLoader />
                    )}
                    {healthStatus === "healthy" ? "Healthy" : healthStatus === "sick" ? "Sick" : "Unknown"}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Last update: {formatLastSeen(plant.lastMetricsUpdate?.timestamp || null)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
  }, [plant, setHeaderContent, chartOption])

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
            <CurrentMetrics plant={plant!} />
            <Charts plant={plant!} showGrid={showGrid} showThresholds={showThresholds} />
          </>
        )}
      </main>
    </ScrollArea>
  )
}
