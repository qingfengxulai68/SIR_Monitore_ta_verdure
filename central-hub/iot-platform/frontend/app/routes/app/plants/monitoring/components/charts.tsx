import { useEffect, useState } from "react"
import { Cloud, Sun, Droplets, Thermometer } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"

import type { Metrics, Plant } from "~/lib/types"

const MAX_DATA_POINTS = 20

const getChartColor = (key: string) => {
  const style = getComputedStyle(document.documentElement)
  return style.getPropertyValue(`--${key}`).trim()
}

export function Charts({
  plant,
  showGrid,
  showThresholds
}: {
  plant: Plant
  showGrid: boolean
  showThresholds: boolean
}) {
  const [chartData, setChartData] = useState<Metrics[]>([])

  useEffect(() => {
    if (plant.lastMetricsUpdate) {
      const newTimestamp = new Date(plant.lastMetricsUpdate.timestamp).toLocaleTimeString();
      setChartData((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].timestamp === newTimestamp) {
          return prev;
        }
        return [
          ...prev,
          {
            ...plant.lastMetricsUpdate,
            timestamp: newTimestamp
          } as Metrics
        ].slice(-MAX_DATA_POINTS);
      });
    }
  }, [plant.lastMetricsUpdate]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Moisture Chart */}
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
              {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
              <XAxis dataKey="timestamp" fontSize={12} />
              <YAxis domain={[0, 100]} fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              {showThresholds && (
                <>
                  <ReferenceLine
                    y={plant.thresholds.soilMoist.min}
                    strokeDasharray="3 3"
                    strokeOpacity={0.7}
                    label={{ value: "Min", position: "insideTopRight", fontSize: 10 }}
                  />
                  <ReferenceLine
                    y={plant.thresholds.soilMoist.max}
                    strokeDasharray="3 3"
                    strokeOpacity={0.7}
                    label={{ value: "Max", position: "insideBottomRight", fontSize: 10 }}
                  />
                </>
              )}
              <Line
                type="monotone"
                dataKey="soilMoist"
                stroke={getChartColor("moisture")}
                strokeWidth={2}
                dot={{ fill: getChartColor("moisture"), strokeWidth: 2, r: 1 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Humidity Chart */}
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
              {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
              <XAxis dataKey="timestamp" fontSize={12} />
              <YAxis domain={[0, 100]} fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              {showThresholds && (
                <>
                  <ReferenceLine
                    y={plant.thresholds.humidity.min}
                    strokeDasharray="3 3"
                    strokeOpacity={0.7}
                    label={{ value: "Min", position: "insideTopRight", fontSize: 10 }}
                  />
                  <ReferenceLine
                    y={plant.thresholds.humidity.max}
                    strokeDasharray="3 3"
                    strokeOpacity={0.7}
                    label={{ value: "Max", position: "insideBottomRight", fontSize: 10 }}
                  />
                </>
              )}
              <Line
                type="monotone"
                dataKey="humidity"
                stroke={getChartColor("humidity")}
                strokeWidth={2}
                dot={{ fill: getChartColor("moisture"), strokeWidth: 2, r: 1 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Temperature Chart */}
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
              {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
              <XAxis dataKey="timestamp" fontSize={12} />
              <YAxis domain={[0, 50]} fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              {showThresholds && (
                <>
                  <ReferenceLine
                    y={plant.thresholds.temp.min}
                    strokeDasharray="3 3"
                    strokeOpacity={0.7}
                    label={{ value: "Min", position: "insideTopRight", fontSize: 10 }}
                  />
                  <ReferenceLine
                    y={plant.thresholds.temp.max}
                    strokeDasharray="3 3"
                    strokeOpacity={0.7}
                    label={{ value: "Max", position: "insideBottomRight", fontSize: 10 }}
                  />
                </>
              )}
              <Line
                type="monotone"
                dataKey="temp"
                stroke={getChartColor("temperature")}
                strokeWidth={2}
                dot={{ fill: getChartColor("moisture"), strokeWidth: 2, r: 1 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Light Chart */}
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
              {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
              <XAxis dataKey="timestamp" fontSize={12} />
              <YAxis domain={[0, 20000]} fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              {showThresholds && (
                <>
                  <ReferenceLine
                    y={plant.thresholds.light.min}
                    strokeDasharray="3 3"
                    strokeOpacity={0.7}
                    label={{ value: "Min", position: "insideTopRight", fontSize: 10 }}
                  />
                  <ReferenceLine
                    y={plant.thresholds.light.max}
                    strokeDasharray="3 3"
                    strokeOpacity={0.7}
                    label={{ value: "Max", position: "insideBottomRight", fontSize: 10 }}
                  />
                </>
              )}
              <Line
                type="monotone"
                dataKey="light"
                stroke={getChartColor("light")}
                strokeWidth={2}
                dot={{ fill: getChartColor("moisture"), strokeWidth: 2, r: 1 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="border-border/50 bg-background grid items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
        <p className="font-medium">{label}</p>
        <div className="flex w-full flex-wrap items-stretch gap-2">
          <div
            className="shrink-0 h-2.5 w-2.5 rounded-[2px]"
            style={{
              backgroundColor: payload[0].color
            }}
          />
          <div className="flex flex-1 justify-between leading-none items-center gap-4">
            <span className="text-muted-foreground">
              {payload[0].dataKey === "humidity" && "Humidity"}
              {payload[0].dataKey === "light" && "Light"}
              {payload[0].dataKey === "soilMoist" && "Moisture"}
              {payload[0].dataKey === "temp" && "Temperature"}
            </span>
            <span className="text-foreground font-mono font-medium tabular-nums">
              {payload[0].dataKey === "humidity" && `${payload[0].value}%`}
              {payload[0].dataKey === "light" && `${payload[0].value} lux`}
              {payload[0].dataKey === "soilMoist" && `${payload[0].value}%`}
              {payload[0].dataKey === "temp" && `${payload[0].value}°C`}
            </span>
          </div>
        </div>
      </div>
    )
  }
  return null
}
