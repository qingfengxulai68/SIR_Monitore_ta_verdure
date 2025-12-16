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
    moisture: Math.round(30 + Math.random() * 50), // 30-80%
    humidity: Math.round(40 + Math.random() * 40), // 40-80%
    temperature: Math.round(16 + Math.random() * 14), // 16-30°C
    light: Math.round(500 + Math.random() * 15000) // 500-15500 lux
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
