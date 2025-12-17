// Mock data and functions simulating backend

export interface Module {
  id: string
  coupled: boolean
  plantId?: number
  plantName?: string
}

export interface Plant {
  id: number
  name: string
  moduleId: string
  thresholds: {
    moisture: { min: number; max: number }
    humidity: { min: number; max: number }
    temperature: { min: number; max: number }
    light: { min: number; max: number }
  }
  createdAt: Date
}

export interface SensorData {
  timestamp: Date
  moisture: number
  humidity: number
  temperature: number
  light: number
}

// Initial mock data
let modules: Module[] = [
  { id: "ESP32-A4B8F2", coupled: true, plantId: 1 },
  { id: "ESP32-C3E91A", coupled: true, plantId: 2 },
  { id: "ESP32-7D4F23", coupled: false },
  { id: "ESP32-B8A3D9", coupled: false },
  { id: "ESP32-F1C832", coupled: true, plantId: 3 }
]

let plants: Plant[] = [
  {
    id: 1,
    name: "Monstera Deliciosa",
    moduleId: "ESP32-A4B8F2",
    thresholds: {
      moisture: { min: 40, max: 70 },
      humidity: { min: 50, max: 80 },
      temperature: { min: 18, max: 28 },
      light: { min: 1000, max: 10000 }
    },
    createdAt: new Date("2024-01-15")
  },
  {
    id: 2,
    name: "Ficus Lyrata",
    moduleId: "ESP32-C3E91A",
    thresholds: {
      moisture: { min: 30, max: 60 },
      humidity: { min: 40, max: 70 },
      temperature: { min: 16, max: 26 },
      light: { min: 2000, max: 15000 }
    },
    createdAt: new Date("2024-02-20")
  },
  {
    id: 3,
    name: "Pothos Golden",
    moduleId: "ESP32-F1C832",
    thresholds: {
      moisture: { min: 35, max: 65 },
      humidity: { min: 45, max: 75 },
      temperature: { min: 15, max: 30 },
      light: { min: 500, max: 8000 }
    },
    createdAt: new Date("2024-03-10")
  }
]

let nextPlantId = 4

// User DB
const mockUser = {
  id: "1",
  name: "Admin User",
  username: "admin",
  password: "demo123",
  email: "admin@terrarium.com"
}

// Simulate async delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Mock API functions
export interface LoginResponse {
  success: boolean
  error?: string
  token?: string
  user?: {
    id: string
    username: string
    email: string
    name: string
  }
}

export async function mockLogin(username: string, password: string): Promise<LoginResponse> {
  await delay(800)

  // Only accept the correct admin credentials
  if (username === "admin" && password === "demo123") {
    return {
      success: true,
      token: "mock-jwt-token-" + Date.now(),
      user: {
        id: mockUser.id,
        name: mockUser.name,
        username: mockUser.username,
        email: mockUser.email
      }
    }
  }

  return { success: false, error: "Invalid credentials" }
}

export async function mockChangePassword(
  oldPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  await delay(800)

  // Verify old password
  if (oldPassword !== mockUser.password) {
    return { success: false, error: "Current password is incorrect" }
  }

  // Update password
  mockUser.password = newPassword
  return { success: true }
}

export async function mockGetModules(onlyAvailable: boolean = false): Promise<Module[]> {
  await delay(300)

  // Enrich modules with plant names
  const enrichedModules = modules.map((module) => {
    if (module.coupled && module.plantId) {
      const plant = plants.find((p) => p.id === module.plantId)
      return { ...module, plantName: plant?.name }
    }
    return module
  })

  if (onlyAvailable) {
    return enrichedModules.filter((m) => !m.coupled)
  }

  return enrichedModules
}

export async function mockGetPlants(): Promise<Plant[]> {
  await delay(300)
  return [...plants]
}

export async function mockGetPlant(id: number): Promise<Plant | null> {
  await delay(200)
  return plants.find((p) => p.id === id) || null
}

export async function mockCreatePlant(data: Omit<Plant, "id" | "createdAt">): Promise<Plant> {
  await delay(400)

  const newPlant: Plant = {
    ...data,
    id: nextPlantId++,
    createdAt: new Date()
  }

  plants.push(newPlant)

  // Couple the module
  modules = modules.map((m) => (m.id === data.moduleId ? { ...m, coupled: true, plantId: newPlant.id } : m))

  return newPlant
}

export async function mockUpdatePlant(id: number, data: Partial<Plant>): Promise<Plant | null> {
  await delay(400)

  const index = plants.findIndex((p) => p.id === id)
  if (index === -1) return null

  const oldPlant = plants[index]

  // Handle module changes
  if (data.moduleId !== undefined && data.moduleId !== oldPlant.moduleId) {
    // Uncouple old module
    modules = modules.map((m) => (m.id === oldPlant.moduleId ? { ...m, coupled: false, plantId: undefined } : m))
    // Couple new module
    modules = modules.map((m) => (m.id === data.moduleId ? { ...m, coupled: true, plantId: id } : m))
  }

  plants[index] = { ...oldPlant, ...data }
  return plants[index]
}

export async function mockDeletePlant(id: number): Promise<boolean> {
  await delay(300)

  const plant = plants.find((p) => p.id === id)
  if (!plant) return false

  // Uncouple module
  modules = modules.map((m) => (m.id === plant.moduleId ? { ...m, coupled: false, plantId: undefined } : m))

  plants = plants.filter((p) => p.id !== id)
  return true
}

// Generate random sensor data for real-time monitoring
export function mockGetCurrentSensorData(moduleId: string): SensorData {
  // Generate realistic random values
  return {
    timestamp: new Date(),
    moisture: Math.round(30 + Math.random() * 50), // 30-80%
    humidity: Math.round(40 + Math.random() * 40), // 40-80%
    temperature: Math.round(18 + Math.random() * 10), // 18-28°C
    light: Math.round(500 + Math.random() * 14500) // 500-15000 lux
  }
}
