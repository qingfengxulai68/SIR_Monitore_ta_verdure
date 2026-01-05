import { Cloud } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { CustomTooltip } from "./custom-tooltip"

interface ChartData {
  time: string
  moisture: number
  humidity: number
  temperature: number
  light: number
}

interface HumidityChartProps {
  data: ChartData[]
}

const getChartColor = (key: string) => {
  const style = getComputedStyle(document.documentElement)
  return style.getPropertyValue(`--${key}`).trim()
}

export function HumidityChart({ data }: HumidityChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-humidity" />
          Humidity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data} margin={{ left: -30, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="time" fontSize={12} />
            <YAxis domain={[0, 100]} fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="humidity" stroke={getChartColor("humidity")} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
