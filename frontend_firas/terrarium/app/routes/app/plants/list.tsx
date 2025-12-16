import { useEffect } from "react"
import type { Route } from "./+types/list"
import { useHeader } from "~/hooks/use-header"

export function meta({}: Route.MetaArgs) {
  return [{ title: "All Plants - Terrarium" }, { name: "description", content: "List of all registered plants." }]
}

export default function PlantsList() {
  const { setHeaderContent } = useHeader()

  useEffect(() => {
    setHeaderContent({
      breadcrumbs: [{ label: "Plants" }]
    })
  }, [setHeaderContent])

  return (
    <div>
      <h1 className="text-2xl">Plants List</h1>
      <p>Route: /app/plants</p>
    </div>
  )
}
