import { Flower2, Cpu, AlertCircle, Activity } from "lucide-react"
import { Card, CardHeader, CardTitle } from "~/components/ui/card"
import type { Plant } from "~/lib/api/plants"
import type { Module } from "~/lib/api/modules"

interface SystemOverviewProps {
  plants: Plant[]
  modules: Module[]
  sensorData: Record<string, any>
}

export function SystemOverview({ plants, modules, sensorData }: SystemOverviewProps) {
  const plantsWithAlerts = plants.filter((plant) => plant.status === "alert")
  const systemHealth =
    plants.length > 0 ? Math.round(((plants.length - plantsWithAlerts.length) / plants.length) * 100) : 100
  return (
    <>
      <div>
        <h2 className="text-lg font-semibold tracking-tight">System Overview</h2>
        <p className="text-sm text-muted-foreground">Real-time status of your IoT monitoring system</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="gap-0">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Flower2 className="h-4 w-4 text-green-600" />
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Plants</CardTitle>
            </div>
            <p className="text-3xl font-semibold">{plants.length}</p>
          </CardHeader>
        </Card>

        <Card className="gap-0">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Modules</CardTitle>
            </div>
            <p className="text-3xl font-semibold">{modules.length}</p>
          </CardHeader>
        </Card>

        <Card className="gap-0">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Alerts</CardTitle>
            </div>
            <p className={`text-3xl font-semibold ${plantsWithAlerts.length > 0 ? "text-destructive" : ""}`}>
              {plantsWithAlerts.length}
            </p>
          </CardHeader>
        </Card>

        <Card className="gap-0">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-600" />
              <CardTitle className="text-sm font-medium text-muted-foreground">System Health</CardTitle>
            </div>
            <p className="text-3xl font-semibold">{systemHealth}%</p>
          </CardHeader>
        </Card>
      </div>
    </>
  )
}
