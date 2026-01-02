import { useEffect, useState, useCallback } from "react"
import type { Route } from "./+types/page"
import { useNavigate, redirect } from "react-router"
import { ScrollArea } from "~/components/ui/scroll-area"
import { toast } from "sonner"
import { getPlant, type Plant } from "~/lib/api/plants"
import { getAllModules, type Module } from "~/lib/api/modules"
import { useHeader } from "~/components/nav/header/header-provider"
import { GeneralInformation } from "~/routes/app/plants/settings/components/general-info"
import { SensorThresholds } from "~/routes/app/plants/settings/components/sensor-thresholds"
import { Spinner } from "~/components/ui/spinner"
import { ErrorWithRetry } from "~/components/other/error-with-retry"

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

  const [plant, setPlant] = useState<Plant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modules, setModules] = useState<Module[]>([])

  const loadData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [plantData, modules] = await Promise.all([getPlant(parseInt(id)), getAllModules()])

      if (!plantData) {
        toast.error("Plant not found")
        navigate("/app/plants")
        return
      }

      setPlant(plantData)
      setModules(modules)
      setHeaderContent({
        breadcrumbs: [{ label: "Plants", href: "/app/plants" }, { label: plantData.name }]
      })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setHeaderContent({
      breadcrumbs: [{ label: "Plants", href: "/app/plants" }, { label: "..." }]
    })
    loadData()
  }, [])

  const handlePlantUpdate = (updatedPlant: Plant) => {
    setPlant(updatedPlant)
    setHeaderContent({
      breadcrumbs: [{ label: "Plants", href: "/app/plants" }, { label: updatedPlant.name }]
    })
  }

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] p-6">
      <main className="max-w-4xl mx-auto space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner />
          </div>
        ) : error ? (
          <ErrorWithRetry error={error} onRetry={loadData} />
        ) : (
          plant && (
            <>
              <GeneralInformation plant={plant} onPlantUpdate={handlePlantUpdate} modules={modules} />
              <SensorThresholds plant={plant} onPlantUpdate={handlePlantUpdate} />
            </>
          )
        )}
      </main>
    </ScrollArea>
  )
}
