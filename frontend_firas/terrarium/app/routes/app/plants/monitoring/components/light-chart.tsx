import { Sun } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"

interface ChartData {
  time: string
  moisture: number
  humidity: number
  temperature: number
  light: number
}

interface LightChartProps {
  data: ChartData[]
}

const getChartColor = (key: string) => {
  const style = getComputedStyle(document.documentElement)
  return style.getPropertyValue(`--${key}`).trim()
}

export function LightChart({ data }: LightChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-5 w-5 text-light" />
          Light
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data} margin={{ left: -10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="time" fontSize={12} />
            <YAxis domain={[0, 20000]} fontSize={12} />
            <Tooltip />
            <Line type="monotone" dataKey="light" stroke={getChartColor("light")} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
