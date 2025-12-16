import type { Route } from "./+types/page"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard - Terrarium" },
    { name: "description", content: "Overview of all active plants and modules." }
  ]
}

export default function DashboardPage() {
  return (
    <div className="p-4 bg-green-100">
      <h1 className="text-2xl">Dashboard</h1>
      <p>Route: /app</p>
    </div>
  )
}
