import { useEffect, useState, useRef } from "react"
import type { Route } from "./+types/monitoring"
import { useParams, useNavigate } from "react-router"
import { Droplets, Thermometer, Cloud, Sun } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Skeleton } from "~/components/ui/skeleton"
import { toast } from "sonner"
import { mockGetPlant, type Plant, type SensorData } from "~/lib/mocks"
import { mockSubscribeToPlant, mockUnsubscribe } from "~/lib/ws"
import { useHeader } from "~/hooks/use-header"

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

  const getStatusColor = (value: number, min: number, max: number) => {
    const range = max - min
    if (value < min || value > max) return "text-destructive"
    if (value < min + range * 0.1 || value > max - range * 0.1) return "text-muted-foreground"
    return "text-primary"
  }

  const getChartColor = (key: string) => {
    const style = getComputedStyle(document.documentElement)
    return style.getPropertyValue(`--${key}`).trim()
  }

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
    <div className="space-y-6">
      {/* Current Values */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="gap-0">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-moisture" />
              <CardDescription>Moisture</CardDescription>
            </div>
            <CardTitle
              className={`text-3xl ${
                currentData
                  ? getStatusColor(currentData.moisture, plant.thresholds.moisture.min, plant.thresholds.moisture.max)
                  : ""
              }`}
            >
              {currentData ? `${currentData.moisture}%` : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Range: {plant.thresholds.moisture.min}% - {plant.thresholds.moisture.max}%
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Cloud className="h-4 w-4 text-humidity" />
              <CardDescription>Humidity</CardDescription>
            </div>
            <CardTitle
              className={`text-3xl ${
                currentData
                  ? getStatusColor(currentData.humidity, plant.thresholds.humidity.min, plant.thresholds.humidity.max)
                  : ""
              }`}
            >
              {currentData ? `${currentData.humidity}%` : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Range: {plant.thresholds.humidity.min}% - {plant.thresholds.humidity.max}%
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-temperature" />
              <CardDescription>Temperature</CardDescription>
            </div>
            <CardTitle
              className={`text-3xl ${
                currentData
                  ? getStatusColor(
                      currentData.temperature,
                      plant.thresholds.temperature.min,
                      plant.thresholds.temperature.max
                    )
                  : ""
              }`}
            >
              {currentData ? `${currentData.temperature}°C` : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Range: {plant.thresholds.temperature.min}°C - {plant.thresholds.temperature.max}°C
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-light" />
              <CardDescription>Light</CardDescription>
            </div>
            <CardTitle
              className={`text-3xl ${
                currentData
                  ? getStatusColor(currentData.light, plant.thresholds.light.min, plant.thresholds.light.max)
                  : ""
              }`}
            >
              {currentData ? `${currentData.light.toLocaleString()}` : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Range: {plant.thresholds.light.min.toLocaleString()} - {plant.thresholds.light.max.toLocaleString()} lux
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-moisture" />
              Moisture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData} margin={{ left: -30, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="time" fontSize={12} />
                <YAxis domain={[0, 100]} fontSize={12} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="moisture"
                  stroke={getChartColor("moisture")}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-humidity" />
              Humidity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData} margin={{ left: -30, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="time" fontSize={12} />
                <YAxis domain={[0, 100]} fontSize={12} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="humidity"
                  stroke={getChartColor("humidity")}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-temperature" />
              Temperature
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData} margin={{ left: -30, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="time" fontSize={12} />
                <YAxis domain={[0, 50]} fontSize={12} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke={getChartColor("temperature")}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-light" />
              Light
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="time" fontSize={12} />
                <YAxis domain={[0, 20000]} fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="light" stroke={getChartColor("light")} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
