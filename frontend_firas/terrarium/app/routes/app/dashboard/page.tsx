import { useEffect } from "react"
import { Link } from "react-router"
import type { Route } from "./+types/page"
import { useHeader } from "~/hooks/use-header"
import { Button } from "~/components/ui/button"
import { Flower2, Cpu, Activity, Settings } from "lucide-react"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard - Terrarium" },
    { name: "description", content: "Overview of all active plants and modules." }
  ]
}

export default function DashboardPage() {
  const { setHeaderContent } = useHeader()

  useEffect(() => {
    setHeaderContent({
      breadcrumbs: [{ label: "Dashboard" }]
    })
  }, [setHeaderContent])

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link to="/app/plants">
          <Button variant="outline" className="h-24 w-full flex-col gap-2">
            <Flower2 className="h-8 w-8" />
            <span>All Plants</span>
          </Button>
        </Link>

        <Link to="/app/modules">
          <Button variant="outline" className="h-24 w-full flex-col gap-2">
            <Cpu className="h-8 w-8" />
            <span>Modules</span>
          </Button>
        </Link>

        <Link to="/app/plants/1">
          <Button variant="outline" className="h-24 w-full flex-col gap-2">
            <Settings className="h-8 w-8" />
            <span>Plant Settings (ID: 1)</span>
          </Button>
        </Link>

        <Link to="/app/plants/1/monitoring">
          <Button variant="outline" className="h-24 w-full flex-col gap-2">
            <Activity className="h-8 w-8" />
            <span>Live Monitoring (ID: 1)</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
