// Simulated WebSocket for real-time sensor data

import type { SensorData } from "./mocks"

type Callback = (data: SensorData) => void

interface Subscription {
  plantId: number
  callback: Callback
  intervalId: NodeJS.Timeout
}

const subscriptions: Map<string, Subscription> = new Map()

function generateSensorData(): SensorData {
  return {
    timestamp: new Date(),
    moisture: Math.round(45 + Math.random() * 20), // 45-65% (more centered)
    humidity: Math.round(55 + Math.random() * 15), // 55-70% (more centered)
    temperature: Math.round(20 + Math.random() * 6), // 20-26°C (more centered)
    light: Math.round(3000 + Math.random() * 6000) // 3000-9000 lux (more centered)
  }
}

export function mockSubscribeToPlant(plantId: number, callback: Callback, intervalMs: number = 2000): string {
  const subscriptionId = `sub_${plantId}_${Date.now()}`

  // Send initial data immediately
  callback(generateSensorData())

  // Set up interval for continuous updates
  const intervalId = setInterval(() => {
    callback(generateSensorData())
  }, intervalMs)

  subscriptions.set(subscriptionId, {
    plantId,
    callback,
    intervalId
  })

  return subscriptionId
}

export function mockUnsubscribe(subscriptionId: string): void {
  const subscription = subscriptions.get(subscriptionId)
  if (subscription) {
    clearInterval(subscription.intervalId)
    subscriptions.delete(subscriptionId)
  }
}

export function mockUnsubscribeAll(): void {
  subscriptions.forEach((sub) => {
    clearInterval(sub.intervalId)
  })
  subscriptions.clear()
}
