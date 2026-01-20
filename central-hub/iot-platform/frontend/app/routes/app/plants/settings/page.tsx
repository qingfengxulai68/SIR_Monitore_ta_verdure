import { useEffect } from "react"
import type { Route } from "./+types/page"
import { redirect } from "react-router"
import { ScrollArea } from "~/components/ui/scroll-area"
import { usePlant } from "~/lib/hooks/use-plants"
import { useModules } from "~/lib/hooks/use-modules"
import { useHeader } from "~/layout/header/header-provider"
import { GeneralInformation } from "~/routes/app/plants/settings/components/general-info"
import { SensorThresholds } from "~/routes/app/plants/settings/components/sensor-thresholds"
import { Spinner } from "~/components/ui/spinner"
import { ErrorWithRetry } from "~/components/other/error-with-retry"

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `Plant: ${params.id} - Terrarium` }, { name: "description", content: "Edit plant configuration." }]
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const id = params.id
  if (!id || isNaN(Number(id)) || !Number.isInteger(Number(id)) || Number(id) <= 0) {
    throw redirect("/app/plants")
  }
  return null
}

export default function PlantSettings({ params }: Route.ComponentProps) {
  const { id } = params

  const { setHeaderContent } = useHeader()

  const { data: plant, isLoading: plantLoading, error: plantError, refetch: refetchPlant } = usePlant(parseInt(id))
  const { data: modules = [], isLoading: modulesLoading, refetch: refetchModules } = useModules()

  const isLoading = plantLoading || modulesLoading
  const error = plantError

  useEffect(() => {
    if (plant) {
      setHeaderContent({
        breadcrumbs: [{ label: "Plants", href: "/app/plants" }, { label: plant.name }]
      })
    }
  }, [plant])

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] p-6">
      <main className="max-w-4xl mx-auto space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner />
          </div>
        ) : error ? (
          <ErrorWithRetry
            error={error.message}
            onRetry={() => {
              refetchPlant()
              refetchModules()
            }}
          />
        ) : (
          <>
            <GeneralInformation plant={plant!} modules={modules} />
            <SensorThresholds plant={plant!} />
          </>
        )}
      </main>
    </ScrollArea>
  )
}
