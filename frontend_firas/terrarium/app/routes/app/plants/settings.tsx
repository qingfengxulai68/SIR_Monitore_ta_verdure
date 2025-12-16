import type { Route } from "./+types/settings"

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `Plant: ${params.id} - Terrarium` }, { name: "description", content: "Edit plant configuration." }]
}

import { useParams } from "react-router"

export default function PlantSettings() {
  const { id } = useParams()

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
