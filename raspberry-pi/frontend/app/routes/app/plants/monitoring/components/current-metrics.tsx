import { Droplets, Thermometer, Cloud, Sun } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import type { Plant } from "~/lib/types"
import { getPlantStatus } from "~/lib/utils"

interface CurrentMetricsProps {
  plant: Plant
}

const getStatusColor = (value: number, min: number, max: number) => {
  if (value < min || value > max) return "text-destructive"
  return ""
}

export function CurrentMetrics({ plant }: CurrentMetricsProps) {
  const currentData = plant.lastMetricsUpdate?.metrics
  const isOffline = getPlantStatus(plant) === "offline"

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="gap-0">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-moisture" />
            <CardDescription>Moisture</CardDescription>
          </div>
          <CardTitle
            className={`text-3xl ${
              currentData && !isOffline
                ? getStatusColor(currentData.soilMoist, plant.thresholds.soilMoist.min, plant.thresholds.soilMoist.max)
                : ""
            }`}
          >
            {currentData && !isOffline ? `${currentData.soilMoist}%` : "-"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Range: {plant.thresholds.soilMoist.min}% - {plant.thresholds.soilMoist.max}%
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
              currentData && !isOffline
                ? getStatusColor(currentData.humidity, plant.thresholds.humidity.min, plant.thresholds.humidity.max)
                : ""
            }`}
          >
            {currentData && !isOffline ? `${currentData.humidity}%` : "-"}
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
              currentData && !isOffline
                ? getStatusColor(currentData.temp, plant.thresholds.temp.min, plant.thresholds.temp.max)
                : ""
            }`}
          >
            {currentData && !isOffline ? `${currentData.temp}°C` : "-"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Range: {plant.thresholds.temp.min}°C - {plant.thresholds.temp.max}°C
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
              currentData && !isOffline
                ? getStatusColor(currentData.light, plant.thresholds.light.min, plant.thresholds.light.max)
                : ""
            }`}
          >
            {currentData && !isOffline ? `${currentData.light.toLocaleString()}` : "-"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Range: {plant.thresholds.light.min.toLocaleString()} - {plant.thresholds.light.max.toLocaleString()} lux
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
