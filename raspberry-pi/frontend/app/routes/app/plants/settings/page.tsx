import { useEffect } from "react"
import type { Route } from "./+types/page"
import { useNavigate, redirect } from "react-router"
import { ScrollArea } from "~/components/ui/scroll-area"
import { usePlant } from "~/hooks/use-plants"
import { useModules } from "~/hooks/use-modules"
import { useHeader } from "~/components/nav/header/header-provider"
import { GeneralInformation } from "~/routes/app/plants/settings/components/general-info"
import { SensorThresholds } from "~/routes/app/plants/settings/components/sensor-thresholds"
import { Spinner } from "~/components/ui/spinner"
import { ErrorWithRetry } from "~/components/other/error-with-retry"
import { toast } from "sonner"

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `Plant: ${params.id} - Terrarium` }, { name: "description", content: "Edit plant configuration." }]
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const id = params.id

  // Validate that id is a valid integer
  if (!id || isNaN(Number(id)) || !Number.isInteger(Number(id)) || Number(id) <= 0) {
    throw redirect("/app/plants")
  }

  return null
}

export default function PlantSettings({ params }: Route.ComponentProps) {
  const { id } = params
  const navigate = useNavigate()
  const { setHeaderContent } = useHeader()

  const plantId = parseInt(id)

  const { data, isLoading: plantLoading, error: plantError, refetch: refetchPlant } = usePlant(plantId)
  const { data: modules = [], isLoading: modulesLoading, refetch: refetchModules } = useModules()

  const isLoading = plantLoading || modulesLoading
  const error = plantError

  useEffect(() => {
    if (data) {
      setHeaderContent({
        breadcrumbs: [{ label: "Plants", href: "/app/plants" }, { label: data.name }]
      })
    } else {
      setHeaderContent({
        breadcrumbs: [{ label: "Plants", href: "/app/plants" }, { label: "..." }]
      })
    }
  }, [data])

  useEffect(() => {
    if (plantError && !plantLoading) {
      toast.error("Plant not found")
      navigate("/app/plants")
    }
  }, [plantError, plantLoading])

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
          data && (
            <>
              <GeneralInformation data={data} modules={modules} />
              <SensorThresholds data={data} />
            </>
          )
        )}
      </main>
    </ScrollArea>
  )
}
