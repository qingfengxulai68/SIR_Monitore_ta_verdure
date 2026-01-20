import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Plant } from "./types"
import { MODULE_HB_TIMEOUT } from "./constants"

// Utility function to merge class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get plant health status based on its properties
export const getPlantHealthStatus = (plant: Plant): "healthy" | "sick" | "unknown" => {
  if (!plant.lastMetricsUpdate) {
    return "unknown"
  }

  const metricsTimestamp = new Date(plant.lastMetricsUpdate.timestamp).getTime()
  const now = Date.now()
  const ageInSeconds = (now - metricsTimestamp) / 1000

  if (ageInSeconds > MODULE_HB_TIMEOUT) {
    return "unknown"
  }

  if (
    plant.lastMetricsUpdate.soilMoist < plant.thresholds.soilMoist.min ||
    plant.lastMetricsUpdate.soilMoist > plant.thresholds.soilMoist.max ||
    plant.lastMetricsUpdate.humidity < plant.thresholds.humidity.min ||
    plant.lastMetricsUpdate.humidity > plant.thresholds.humidity.max ||
    plant.lastMetricsUpdate.light < plant.thresholds.light.min ||
    plant.lastMetricsUpdate.light > plant.thresholds.light.max ||
    plant.lastMetricsUpdate.temp < plant.thresholds.temp.min ||
    plant.lastMetricsUpdate.temp > plant.thresholds.temp.max
  ) {
    return "sick"
  }

  return "healthy"
}

// Format last seen timestamp
export const formatLastSeen = (lastSeen: string | null) => {
  if (!lastSeen) return "Never"
  return new Date(lastSeen).toLocaleString()
}
