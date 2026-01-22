// Module heartbeat configuration
export const MODULE_HB_INTERVAL = 30
export const MODULE_HB_TIMEOUT = 3 * MODULE_HB_INTERVAL
export const MODULE_HB_CHECK_INTERVAL = MODULE_HB_INTERVAL

// WebSocket configuration
export const WS_PING_INTERVAL = 30000
export const getWsBaseUrl = () => {
  const backendUrl = "/api"
  if (typeof window !== "undefined") {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
    return `${protocol}//${window.location.host}${backendUrl}`
  }
  return backendUrl
}
export const WS_BASE_URL = getWsBaseUrl()
export const WS_RECONNECT_ATTEMPTS = Infinity
export const WS_RECONNECT_INTERVAL = 3000

// API configuration
export const getApiBaseUrl = () => {
  const backendUrl = "/api"
  if (typeof window !== "undefined") {
    return `${window.location.origin}${backendUrl}`
  }
  return backendUrl
}
export const API_BASE_URL = getApiBaseUrl()

// Sensor ranges
export const SENSOR_THRESHOLDS = {
  SOIL_MOIST: { MIN: 0, MAX: 100 },
  HUMIDITY: { MIN: 0, MAX: 100 },
  LIGHT: { MIN: 0, MAX: 65000 },
  TEMP: { MIN: -10, MAX: 50 }
} as const
