import { useEffect, useState } from "react"
import type { Route } from "./+types/page"
import { redirect } from "react-router"
import { Badge } from "~/components/ui/badge"
import { Spinner } from "~/components/ui/spinner"
import { usePlant } from "~/hooks/use-plants"
import { useHeader } from "~/components/nav/header/header-provider"
import { CurrentValues } from "./components/current-values"
import { MoistureChart } from "./components/moisture-chart"
import { HumidityChart } from "./components/humidity-chart"
import { TemperatureChart } from "./components/temperature-chart"
import { LightChart } from "./components/light-chart"
import { ScrollArea } from "~/components/ui/scroll-area"
import { ErrorWithRetry } from "~/components/other/error-with-retry"

const MAX_DATA_POINTS = 20

interface ChartData {
  time: string
  moisture: number
  humidity: number
  temperature: number
  light: number
}

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
  const plantId = parseInt(id)
  const { setHeaderContent } = useHeader()

  const { data: plant, isLoading, error, refetch } = usePlant(plantId)

  const [chartData, setChartData] = useState<ChartData[]>([])

  // Update chart data when plant.latestValues changes (via WebSocket)
  useEffect(() => {
    if (plant?.latestValues) {
      const metrics = plant.latestValues
      setChartData((prev) =>
        [
          ...prev,
          {
            time: new Date(metrics.timestamp).toLocaleTimeString(),
            moisture: metrics.soilMoist,
            humidity: metrics.humidity,
            temperature: metrics.temp,
            light: metrics.light
          }
        ].slice(-MAX_DATA_POINTS)
      )
    }
  }, [plant?.latestValues])

  useEffect(() => {
    if (plant) {
      const isOnline = plant.status !== "offline"

      setHeaderContent({
        breadcrumbs: [
          { label: "Plants", href: "/app/plants" },
          { label: plant.name, href: `/app/plants/${plant.id}` },
          { label: "Monitoring" }
        ],
        actions: (
          <Badge variant="outline" className="gap-2 px-3 py-1.5">
            <span className={`h-2 w-2 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
            {isOnline ? "Live" : "Offline"}
          </Badge>
        )
      })
    }
  }, [plant, setHeaderContent])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-4">
          <Spinner />
          <p className="text-muted-foreground">Loading plant monitoring...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <ErrorWithRetry error={error.message} onRetry={refetch} />
      </div>
    )
  }

  if (!plant) {
    return null
  }

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] p-6">
      <main className="space-y-6">
        <CurrentValues plant={plant} />
        <div className="grid gap-6 lg:grid-cols-2">
          <MoistureChart data={chartData} />
          <HumidityChart data={chartData} />
          <TemperatureChart data={chartData} />
          <LightChart data={chartData} />
        </div>
      </main>
    </ScrollArea>
  )
}
