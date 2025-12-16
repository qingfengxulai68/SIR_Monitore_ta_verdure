import { type RouteConfig, index, route, prefix } from "@react-router/dev/routes"

export default [
  // Public: Root entry point (handles Login logic & redirections)
  index("routes/public/signin.tsx"),

  // App: Protected shell containing the Sidebar & Auth Guard
  route("app", "routes/app/layout.tsx", [
    // Dashboard
    index("routes/app/dashboard/page.tsx"),

    // Modules
    route("modules", "routes/app/modules/list.tsx"),

    // Plants
    ...prefix("plants", [
      index("routes/app/plants/list.tsx"),
      route(":id", "routes/app/plants/settings.tsx"),
      route(":id/monitoring", "routes/app/plants/monitoring.tsx")
    ])
  ])
] satisfies RouteConfig
