// Module heartbeat configuration
export const MODULE_HB_INTERVAL = 30
export const MODULE_HB_TIMEOUT = 3 * MODULE_HB_INTERVAL
export const MODULE_HB_CHECK_INTERVAL = MODULE_HB_INTERVAL

// Sensor ranges
export const SENSOR_THRESHOLDS = {
  SOIL_MOIST: { MIN: 0, MAX: 100 },
  HUMIDITY: { MIN: 0, MAX: 100 },
  LIGHT: { MIN: 0, MAX: 65000 },
  TEMP: { MIN: -20, MAX: 50 }
} as const
