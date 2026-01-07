import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import useWebSocket, { ReadyState } from "react-use-websocket"
import { getToken } from "./use-auth"
import type {
  IncomingWebSocketMessage,
  PlantMetricsMessage,
  ModuleConnectionMessage,
  EntityChangeMessage,
  Plant,
  Module
} from "../types"
import { QueryKeys } from "../types"

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL as string
const PING_INTERVAL = 30000

export function useSystemWebSocket() {
  const queryClient = useQueryClient()
  const token = getToken()

  const { readyState } = useWebSocket(`${WS_BASE_URL}/ws?token=${token}`, {
    onOpen: () => {
      console.log("[Websocket] Connection established")
    },
    onClose: () => console.log("[Websocket] Connection closed"),
    onError: () => console.log("[Websocket] Connection error"),
    onMessage: (event) => {
      const message = JSON.parse(event.data) as IncomingWebSocketMessage

      switch (message.type) {
        case "PLANT_METRICS":
          handleSensorValues(message as PlantMetricsMessage)
          break
        case "MODULE_CONNECTION":
          handleModuleConnection(message as ModuleConnectionMessage)
          break
        case "ENTITY_CHANGE":
          handleEntityChange(message as EntityChangeMessage)
          break
        case "PONG":
          break
      }
    },
    shouldReconnect: () => true,
    reconnectAttempts: Infinity,
    reconnectInterval: 3000,
    heartbeat: {
      message: () => JSON.stringify({ type: "PING" }),
      interval: PING_INTERVAL,
      returnMessage: "PONG"
    }
  })

  function handleSensorValues(message: PlantMetricsMessage) {
    const { plantId, values, status } = message.payload

    queryClient.setQueryData<Plant[]>(QueryKeys.plants, (plants) =>
      plants?.map((plant) => (plant.id === plantId ? { ...plant, status, latestValues: values } : plant))
    )

    queryClient.setQueryData<Plant>(QueryKeys.plant(plantId), (plant) =>
      plant ? { ...plant, status, latestValues: values } : plant
    )
  }

  function handleModuleConnection(message: ModuleConnectionMessage) {
    const { moduleId, isOnline, coupledPlantId } = message.payload

    // Update the specific module status
    ;[undefined, true, false].forEach((coupled) => {
      queryClient.setQueryData<Module[]>(QueryKeys.modules(coupled), (modules) =>
        modules?.map((module) => (module.id === moduleId ? { ...module, isOnline } : module))
      )
    })

    // Update coupled plant status
    if (coupledPlantId) {
      const updatePlantStatus = (plant: Plant) => ({
        ...plant,
        status: isOnline ? plant.status : ("offline" as const)
      })

      queryClient.setQueryData<Plant[]>(QueryKeys.plants, (plants) =>
        plants?.map((plant) => (plant.id === coupledPlantId ? updatePlantStatus(plant) : plant))
      )

      queryClient.setQueryData<Plant>(QueryKeys.plant(coupledPlantId), (plant) =>
        plant ? updatePlantStatus(plant) : plant
      )
    }
  }

  function handleEntityChange(message: EntityChangeMessage) {
    const { entity, action, id } = message.payload

    if (entity === "plant") {
      queryClient.invalidateQueries({ queryKey: QueryKeys.plants, refetchType: "all" })
      if (action === "update" || action === "delete") {
        queryClient.invalidateQueries({ queryKey: QueryKeys.plant(id as number), refetchType: "all" })
      }
    } else if (entity === "module") {
      queryClient.invalidateQueries({
        queryKey: ["modules"],
        refetchType: "all"
      })
    }
  }

  return {
    isConnected: readyState === ReadyState.OPEN,
    isReconnecting: readyState === ReadyState.CONNECTING
  }
}
