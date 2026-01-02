import { get, post } from "~/lib/api/crud"
import type { Alerts, AlertsEnableRequest } from "~/lib/api/settings/types"

// Base API path for settings-related requests
const basePath = "/settings"

// Re-export types
export * from "./types"

// Get global alert settings
export function getAlerts(): Promise<Alerts> {
  return get<Alerts>(`${basePath}/alerts`, 200)
}

// Enable alerts with Discord webhook URL
export function enableAlerts(data: AlertsEnableRequest): Promise<void> {
  return post<void>(`${basePath}/alerts/enable`, data, 204)
}

// Disable all alerts (Master Switch)
export function disableAlerts(): Promise<void> {
  return post<void>(`${basePath}/alerts/disable`, {}, 204)
}
