import { useEffect } from "react"
import type { Route } from "./+types/settings"
import { useParams } from "react-router"
import { useHeader } from "~/hooks/use-header"

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `Plant: ${params.id} - Terrarium` }, { name: "description", content: "Edit plant configuration." }]
}

export default function PlantSettings() {
  const { id } = useParams()
  const { setHeaderContent } = useHeader()

  useEffect(() => {
    setHeaderContent({
      breadcrumbs: [{ label: "Plants", href: "/app/plants" }, { label: `${id}` }]
    })
  }, [setHeaderContent, id])

  return (
    <div>
      <h1 className="text-2xl">Plant Settings</h1>
      <p>Route: /app/plants/{id}</p>
      <div className="bg-yellow-100 p-2 mt-2">
        <strong>Current Plant ID:</strong> {id}
      </div>
    </div>
  )
}
