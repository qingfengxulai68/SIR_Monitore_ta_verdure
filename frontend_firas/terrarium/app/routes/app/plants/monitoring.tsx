import { useEffect } from "react"
import type { Route } from "./+types/monitoring"
import { useParams } from "react-router"
import { useHeader } from "~/hooks/use-header"

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Live Monitor: ${params.id} - Terrarium` },
    { name: "description", content: "Real-time performance monitoring." }
  ]
}

export default function PlantMonitoring() {
  const { id } = useParams()
  const { setHeaderContent } = useHeader()

  useEffect(() => {
    setHeaderContent({
      breadcrumbs: [
        { label: "Plants", href: "/app/plants" },
        { label: `${id}`, href: `/app/plants/${id}` },
        { label: "Monitoring" }
      ]
    })
  }, [setHeaderContent, id])

  return (
    <div>
      <h1 className="text-2xl">Plant Monitoring</h1>
      <p>Route: /app/plants/{id}/monitoring</p>
      <div className="bg-purple-100 p-2 mt-2">
        <strong>Monitoring Plant ID:</strong> {id}
      </div>
    </div>
  )
}
