// Query keys (TanStack Query)
export const QueryKeys = {
  // Auth
  auth: ["auth"] as const,

  // Plants
  plants: ["plants"] as const,
  plant: (id: number) => ["plants", id] as const,

  // Modules
  modules: (coupled?: boolean) =>
    coupled === undefined ? (["modules"] as const) : (["modules", { coupled }] as const),

  // Settings
  alertsSettings: ["settings", "alerts"] as const
} as const
