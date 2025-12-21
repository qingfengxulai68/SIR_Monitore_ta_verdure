import { Droplets, Thermometer, Cloud, Sun } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import type { Plant, SensorData } from "~/lib/mocks"

interface CurrentValuesProps {
  plant: Plant
  currentData: SensorData | null
}

const getStatusColor = (value: number, min: number, max: number) => {
  const range = max - min
  if (value < min || value > max) return "text-destructive"
  return ""
}

export function CurrentValues({ plant, currentData }: CurrentValuesProps) {
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
  )
}
