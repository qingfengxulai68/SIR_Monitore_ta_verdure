import { Outlet, redirect } from "react-router"
import type { Route } from "./+types/layout"

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const isLoggedIn = false // Replace with real authentication check

  if (!isLoggedIn) {
    throw redirect("/")
  }

  return null
}

export default function AppLayout() {
  return (
    <div className="flex h-screen border-4 border-blue-500 p-4">
      <aside className="w-64 bg-gray-100 p-4">
        <h2 className="font-bold">App Sidebar</h2>
        <nav>
          <ul>
            <li>
              <a href="/app">Dashboard</a>
            </li>
            <li>
              <a href="/app/modules">Modules</a>
            </li>
            <li>
              <a href="/app/plants">Plants</a>
              <ul>
                <li>
                  <a href="/app/plants/1">Plant 1</a>
                </li>
                <li>
                  <a href="/app/plants/1/monitoring">Plant 1 Monitoring</a>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="flex-1 p-4 border-2 border-dashed border-blue-300">
        <h1>App Layout Shell</h1>
        <Outlet />
      </main>
    </div>
  )
}
