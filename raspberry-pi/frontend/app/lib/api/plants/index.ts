import { get, post, put, del } from "~/lib/api/crud"
import type {
  Plant,
  PlantCreateRequest,
  PlantUpdateInfoRequest,
  PlantUpdateThresholdsRequest
} from "~/lib/api/plants/types"

// Base API path for plant-related requests
const basePath = "/plants"

// Re-export types
export * from "./types"

// Fetch all plants
export function getAllPlants(): Promise<Plant[]> {
  return get<Plant[]>(`${basePath}`, 200)
}

// Fetch a specific plant by ID
export function getPlant(plantId: number): Promise<Plant> {
  return get<Plant>(`${basePath}/${plantId}`, 200)
}

// Create a new plant
export function createPlant(data: PlantCreateRequest): Promise<Plant> {
  return post<Plant>(`${basePath}`, data, 201)
}

// Update plant general information
export function updatePlantInfo(plantId: number, data: PlantUpdateInfoRequest): Promise<Plant> {
  return put<Plant>(`${basePath}/${plantId}`, data, 200)
}

// Update plant sensor thresholds
export function updatePlantThresholds(plantId: number, data: PlantUpdateThresholdsRequest): Promise<Plant> {
  return put<Plant>(`${basePath}/${plantId}`, data, 200)
}

// Delete a plant
export function deletePlant(plantId: number): Promise<void> {
  return del<void>(`${basePath}/${plantId}`, 204)
}
