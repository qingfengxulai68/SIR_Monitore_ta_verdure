import { get } from "~/lib/api/crud"
import type { Module } from "~/lib/api/modules/types"

// Base API path for module-related requests
const basePath = "/modules"

// Re-export types
export * from "./types"

// Fetch all modules
export function getAllModules(coupled?: boolean): Promise<Module[]> {
  const url = coupled !== undefined ? `${basePath}?coupled=${coupled}` : basePath
  return get<Module[]>(url, 200)
}
