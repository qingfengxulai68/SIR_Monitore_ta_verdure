import { useEffect, useState, useRef } from "react"
import type { Route } from "../+types/page"
import { useParams, useNavigate } from "react-router"
import { Badge } from "~/components/ui/badge"
import { Skeleton } from "~/components/ui/skeleton"
import { toast } from "sonner"
import { mockGetPlant, type Plant, type SensorData } from "~/lib/mocks"
import { mockSubscribeToPlant, mockUnsubscribe } from "~/lib/ws"
import { useHeader } from "~/components/nav/header/header-provider"
import { CurrentValues } from "./components/current-values"
import { MoistureChart } from "./components/moisture-chart"
import { HumidityChart } from "./components/humidity-chart"
import { TemperatureChart } from "./components/temperature-chart"
import { LightChart } from "./components/light-chart"
import { ScrollArea } from "~/components/ui/scroll-area"

const MAX_DATA_POINTS = 20

interface ChartData {
  time: string
  moisture: number
  humidity: number
  temperature: number
  light: number
}

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `Monitor Plant ${params.id} - Terrarium` }]
}

export default function PlantMonitoring() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { setHeaderContent } = useHeader()

  const [plant, setPlant] = useState<Plant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentData, setCurrentData] = useState<SensorData | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const subscriptionRef = useRef<string | null>(null)

  useEffect(() => {
    const loadPlant = async () => {
      if (!id) return

      const plantData = await mockGetPlant(parseInt(id))

      if (!plantData) {
        toast.error("Plant not found")
        navigate("/app/plants")
        return
      }

      setPlant(plantData)
      setIsLoading(false)

      setHeaderContent({
        breadcrumbs: [
          { label: "Plants", href: "/app/plants" },
          { label: plantData.name, href: `/app/plants/${plantData.id}` },
          { label: "Monitoring" }
        ],
        actions: (
          <Badge variant="outline" className="gap-2 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Live
          </Badge>
        )
      })

      // Subscribe to sensor data with fixed 2 second interval
      subscriptionRef.current = mockSubscribeToPlant(
        plantData.id,
        (data) => {
          setCurrentData(data)
          setChartData((prev) =>
            [
              ...prev,
              {
                time: data.timestamp.toLocaleTimeString(),
                moisture: data.moisture,
                humidity: data.humidity,
                temperature: data.temperature,
                light: data.light
              }
            ].slice(-MAX_DATA_POINTS)
          )
        },
        2000
      )
    }

    loadPlant()

    return () => {
      if (subscriptionRef.current) {
        mockUnsubscribe(subscriptionRef.current)
      }
    }
  }, [id, navigate, setHeaderContent])

  if (isLoading || !plant) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] p-6">
      <main className="space-y-6">
        <CurrentValues plant={plant} currentData={currentData} />
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
