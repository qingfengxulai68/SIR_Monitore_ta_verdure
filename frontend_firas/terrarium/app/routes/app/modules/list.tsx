import { useEffect } from "react"
import type { Route } from "./+types/list"
import { useHeader } from "~/hooks/use-header"

export function meta({}: Route.MetaArgs) {
  return [{ title: "Modules - Terrarium" }, { name: "description", content: "Manage system modules." }]
}

export default function ModulesList() {
  const { setHeaderContent } = useHeader()

  useEffect(() => {
    setHeaderContent({
      breadcrumbs: [{ label: "Modules" }]
    })
  }, [setHeaderContent])

  return (
    <div>
      <h1 className="text-2xl">Modules List</h1>
      <p>Route: /app/modules</p>
    </div>
  )
}
