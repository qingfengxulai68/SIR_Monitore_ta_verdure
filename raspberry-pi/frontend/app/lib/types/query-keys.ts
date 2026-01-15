// Query keys (TanStack Query)
export const QueryKeys = {
  // Auth
  auth: ["auth"] as const,

  // Plants
  plants: ["plants"] as const,
  plant: (id: number) => ["plants", id] as const,
  plantHistory: (id: number, range: string) => ["plants", id, "history", range] as const,

  // Modules
  modules: () => ["modules"] as const,

  // Settings
  alertsSettings: ["settings", "alerts"] as const
} as const
