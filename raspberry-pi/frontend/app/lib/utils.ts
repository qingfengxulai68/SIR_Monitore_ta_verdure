import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Plant } from "./types"
import { MODULE_HB_TIMEOUT } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to get plant status from new structure
export function getPlantStatus(plant: Plant): "ok" | "alert" | "offline" {
  if (!plant.module.connectivity.isOnline) {
    return "offline"
  }

  if (!plant.lastMetricsUpdate) {
    return "offline"
  }

  // Check if data is fresh (less than MODULE_HB_TIMEOUT seconds old)
  const metricsTimestamp = new Date(plant.lastMetricsUpdate.timestamp).getTime()
  const now = Date.now()
  const ageInSeconds = (now - metricsTimestamp) / 1000

  if (ageInSeconds > MODULE_HB_TIMEOUT) {
    return "offline"
  }

  if (!plant.lastMetricsUpdate.isHealthy) {
    return "alert"
  }

  return "ok"
}
