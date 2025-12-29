import { useEffect, useState } from "react"
import type { Route } from "../+types/page"
import { useParams, useNavigate } from "react-router"

import { Card, CardContent, CardHeader } from "~/components/ui/card"
import { Skeleton } from "~/components/ui/skeleton"
import { ScrollArea } from "~/components/ui/scroll-area"
import { toast } from "sonner"
import { mockGetPlant, type Plant } from "~/lib/mocks"
import { useHeader } from "~/components/nav/header/header-provider"
import { GeneralInformation } from "~/routes/app/plants/settings/components/general-info"
import { SensorThresholds } from "~/routes/app/plants/settings/components/sensor-thresholds"

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `Plant: ${params.id} - Terrarium` }, { name: "description", content: "Edit plant configuration." }]
}

export default function PlantSettings() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { setHeaderContent } = useHeader()

  const [plant, setPlant] = useState<Plant | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (!id) return

      const plantData = await mockGetPlant(parseInt(id))

      if (!plantData) {
        toast.error("Plant not found")
        navigate("/app/plants")
        return
      }

      setPlant(plantData)

      setHeaderContent({
        breadcrumbs: [{ label: "Plants", href: "/app/plants" }, { label: plantData.name }]
      })

      setIsLoading(false)
    }

    loadData()
  }, [id, navigate, setHeaderContent])

  const handlePlantUpdate = (updatedPlant: Plant) => {
    setPlant(updatedPlant)
    setHeaderContent({
      breadcrumbs: [{ label: "Plants", href: "/app/plants" }, { label: updatedPlant.name }]
    })
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-60" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] p-6">
      <main className="max-w-4xl mx-auto space-y-6">
        {plant && (
          <>
            <GeneralInformation plant={plant} onPlantUpdate={handlePlantUpdate} />
            <SensorThresholds plant={plant} onPlantUpdate={handlePlantUpdate} />
          </>
        )}
      </main>
    </ScrollArea>
  )
}
