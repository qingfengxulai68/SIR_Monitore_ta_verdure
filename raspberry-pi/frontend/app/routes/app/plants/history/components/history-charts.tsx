import { Cloud, Sun, Droplets, Thermometer } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { useMemo } from "react"

import type { HistoryMetrics, Plant } from "~/lib/types"

const getChartColor = (key: string) => {
  const style = getComputedStyle(document.documentElement)
  return style.getPropertyValue(`--${key}`).trim()
}

export function HistoryCharts({
  plant,
  data,
  showGrid,
  showThresholds
}: {
  plant: Plant
  data: HistoryMetrics[]
  showGrid: boolean
  showThresholds: boolean
}) {
  // Format data for charts - memoized to avoid recalculation on every render
  const chartData = useMemo(() => data.map((item) => ({
    ...item,
    timestamp: new Date(item.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    })
  })), [data])

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
                dot={{ fill: getChartColor("humidity"), strokeWidth: 2, r: 1 }}
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
                dot={{ fill: getChartColor("temperature"), strokeWidth: 2, r: 1 }}
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
                dot={{ fill: getChartColor("light"), strokeWidth: 2, r: 1 }}
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
    const value = payload[0].value

    // Skip rendering if value is null
    if (value === null || value === undefined) {
      return null
    }

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
              {payload[0].dataKey === "humidity" && `${value}%`}
              {payload[0].dataKey === "light" && `${value} lux`}
              {payload[0].dataKey === "soilMoist" && `${value}%`}
              {payload[0].dataKey === "temp" && `${value}°C`}
            </span>
          </div>
        </div>
      </div>
    )
  }
  return null
}
