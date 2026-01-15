import type { Metrics } from "./metrics"

// PLANT_METRICS - Sensor data update (Optimistic Update)
export type PlantMetricsPayload = {
  plantId: number
  metrics: Metrics
}

export type PlantMetricsMessage = {
  type: "PLANT_METRICS"
  payload: PlantMetricsPayload
}

// MODULE_CONNECTIVITY - Live module connectivity status (Optimistic Update)
export type ModuleConnectivityPayload = {
  moduleId: string
  connectivity: {
    isOnline: boolean
    lastSeen: string
  }
}

export type ModuleConnectivityMessage = {
  type: "MODULE_CONNECTIVITY"
  payload: ModuleConnectivityPayload
}

// ENTITY_CHANGE - Cache invalidation signal (Refetch)
export type EntityChangePayload = {
  entity: "plant" | "module"
  action: "create" | "update" | "delete"
  id: number | string
}

export type EntityChangeMessage = {
  type: "ENTITY_CHANGE"
  payload: EntityChangePayload
}

// Union of all possible messages
export type IncomingWebSocketMessage =
  | PlantMetricsMessage
  | ModuleConnectivityMessage
  | EntityChangeMessage
  | { type: "PONG" }
