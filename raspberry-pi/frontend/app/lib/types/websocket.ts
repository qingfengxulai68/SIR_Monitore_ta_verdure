import type { SensorValues } from "./sensor-values"

// PLANT_METRICS - Sensor data update (Optimistic Update)
export type PlantMetricsPayload = {
  plantId: number
  values: SensorValues
  status: "ok" | "alert" | "offline"
}

export type PlantMetricsMessage = {
  type: "PLANT_METRICS"
  payload: PlantMetricsPayload
}

// MODULE_CONNECTION - Module connection status change (Optimistic Update)
export type ModuleConnectionPayload = {
  moduleId: string
  isOnline: boolean
  coupledPlantId: number | null
}

export type ModuleConnectionMessage = {
  type: "MODULE_CONNECTION"
  payload: ModuleConnectionPayload
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
  | ModuleConnectionMessage
  | EntityChangeMessage
  | { type: "PONG" }
