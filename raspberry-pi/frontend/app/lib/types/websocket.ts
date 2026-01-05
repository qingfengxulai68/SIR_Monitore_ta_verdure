import type { PlantMetrics, PlantStatus } from "./plant"

// WebSocket message type (Server → Client)
export type WebSocketMessageType = "PLANT_METRICS" | "MODULE_CONNECTION" | "ENTITY_CHANGE" | "PONG"

// Base WebSocket message
export interface WebSocketMessage<T = unknown> {
  type: WebSocketMessageType
  payload: T
}

// PLANT_METRICS - Sensor data update (Optimistic Update)
export interface PlantMetricsPayload {
  plantId: number
  values: PlantMetrics
  status: PlantStatus
}

export type PlantMetricsMessage = WebSocketMessage<PlantMetricsPayload>

// MODULE_CONNECTION - Module connection status change (Optimistic Update)
export interface ModuleConnectionPayload {
  moduleId: string
  isOnline: boolean
  coupledPlantId: number | null
}

export type ModuleConnectionMessage = WebSocketMessage<ModuleConnectionPayload>

// ENTITY_CHANGE - Cache invalidation signal (Refetch)
export interface EntityChangePayload {
  entity: "plant" | "module"
  action: "create" | "update" | "delete"
  id: number | string
}

export type EntityChangeMessage = WebSocketMessage<EntityChangePayload>

// Union of all possible messages
export type IncomingWebSocketMessage =
  | PlantMetricsMessage
  | ModuleConnectionMessage
  | EntityChangeMessage
  | WebSocketMessage<null> // For PONG
