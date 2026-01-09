import { useEffect } from "react"
import type { Route } from "./+types/page"
import { redirect } from "react-router"
import { Badge } from "~/components/ui/badge"
import { Spinner } from "~/components/ui/spinner"
import { usePlant } from "~/lib/hooks/use-plants"
import { useHeader } from "~/layout/header/header-provider"
import { CurrentValues } from "./components/current-values"
import { Charts } from "./components/charts"
import { ScrollArea } from "~/components/ui/scroll-area"
import { ErrorWithRetry } from "~/components/other/error-with-retry"

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const id = params.id
  if (!id || isNaN(Number(id)) || !Number.isInteger(Number(id)) || Number(id) <= 0) {
    throw redirect("/app/plants")
  }
  return null
}

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `Monitor Plant ${params.id} - Terrarium` }]
}

export default function PlantMonitoring({ params }: Route.ComponentProps) {
  const { id } = params
  const { setHeaderContent } = useHeader()
  const { data: plant, isLoading, error, refetch } = usePlant(parseInt(id))

  useEffect(() => {
    if (plant) {
      const isOnline = plant.status !== "offline"

      setHeaderContent({
        breadcrumbs: [
          { label: "Plants", href: "/app/plants" },
          { label: plant.name, href: `/app/plants/${plant.id}` },
          { label: "Monitoring" }
        ],
        actions: (
          <Badge variant="outline" className="gap-2 px-3 py-1.5">
            <span className={`h-2 w-2 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
            {isOnline ? "Live" : "Offline"}
          </Badge>
        )
      })
    }
  }, [plant, setHeaderContent])

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] p-6">
      <main className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner />
          </div>
        ) : error ? (
          <ErrorWithRetry error={error.message} onRetry={refetch} />
        ) : (
          <>
            <CurrentValues plant={plant!} />
            <Charts plant={plant!} />
          </>
        )}
      </main>
    </ScrollArea>
  )
}
