import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import useWebSocket, { ReadyState } from "react-use-websocket"
import { getToken } from "./use-auth"
import type {
  IncomingWebSocketMessage,
  PlantMetricsMessage,
  ModuleConnectionMessage,
  EntityChangeMessage,
  PlantResponse,
  ModuleResponse
} from "../lib/types"
import { QueryKeys } from "../lib/types"

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL as string
const PING_INTERVAL = 30000

export function useSystemWebSocket() {
  const queryClient = useQueryClient()
  const token = getToken()

  const { readyState } = useWebSocket(`${WS_BASE_URL}/ws?token=${token}`, {
    onOpen: () => {
      toast.success("[Websocket] Connection established")
    },
    onClose: () => toast.error("[Websocket] Connection closed"),
    onError: () => toast.error("[Websocket] Connection error"),
    onMessage: (event) => {
      const message = JSON.parse(event.data) as IncomingWebSocketMessage

      switch (message.type) {
        case "PLANT_METRICS":
          handlePlantMetrics(message as PlantMetricsMessage)
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

  function handlePlantMetrics(message: PlantMetricsMessage) {
    const { plantId, values, status } = message.payload

    queryClient.setQueryData<PlantResponse[]>(QueryKeys.plants, (plants) =>
      plants?.map((plant) => (plant.id === plantId ? { ...plant, status, latestValues: values } : plant))
    )

    queryClient.setQueryData<PlantResponse>(QueryKeys.plant(plantId), (plant) =>
      plant ? { ...plant, status, latestValues: values } : plant
    )
  }

  function handleModuleConnection(message: ModuleConnectionMessage) {
    const { moduleId, isOnline, coupledPlantId } = message.payload

    // Update the specific module status
    ;[undefined, true, false].forEach((coupled) => {
      queryClient.setQueryData<ModuleResponse[]>(QueryKeys.modules(coupled), (modules) =>
        modules?.map((module) => (module.id === moduleId ? { ...module, isOnline } : module))
      )
    })

    // Update coupled plant status
    if (coupledPlantId) {
      const updatePlantStatus = (plant: PlantResponse) => ({
        ...plant,
        status: isOnline ? plant.status : ("offline" as const)
      })

      queryClient.setQueryData<PlantResponse[]>(QueryKeys.plants, (plants) =>
        plants?.map((plant) => (plant.id === coupledPlantId ? updatePlantStatus(plant) : plant))
      )

      queryClient.setQueryData<PlantResponse>(QueryKeys.plant(coupledPlantId), (plant) =>
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
