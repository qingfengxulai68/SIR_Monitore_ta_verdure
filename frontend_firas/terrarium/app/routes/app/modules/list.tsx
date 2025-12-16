import type { Route } from "./+types/list"

export function meta({}: Route.MetaArgs) {
  return [{ title: "Modules - Terrarium" }, { name: "description", content: "Manage system modules." }]
}

export default function ModulesList() {
  return (
    <div>
      <h1 className="text-2xl">Modules List</h1>
      <p>Route: /app/modules</p>
    </div>
  )
}
