import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import useWebSocket, { ReadyState } from "react-use-websocket"
import { getToken } from "./use-auth"
import type {
  IncomingWebSocketMessage,
  PlantMetricsMessage,
  ModuleConnectivityMessage,
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
          handleMetrics(message as PlantMetricsMessage)
          break
        case "MODULE_CONNECTIVITY":
          handleModuleConnectivity(message as ModuleConnectivityMessage)
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

  function handleMetrics(message: PlantMetricsMessage) {
    const { plantId, timestamp, metrics, isHealthy } = message.payload

    queryClient.setQueryData<Plant[]>(QueryKeys.plants, (plants) =>
      plants?.map((plant) =>
        plant.id === plantId ? { ...plant, lastMetricsUpdate: { timestamp, metrics, isHealthy } } : plant
      )
    )

    queryClient.setQueryData<Plant>(QueryKeys.plant(plantId), (plant) =>
      plant ? { ...plant, lastMetricsUpdate: { timestamp, metrics, isHealthy } } : plant
    )
  }

  function handleModuleConnectivity(message: ModuleConnectivityMessage) {
    const { moduleId, connectivity } = message.payload
    const { isOnline, lastSeen } = connectivity

    let plantIdToUpdate: number | null = null

    // Update all existing module queries (fuzzy match on root key)
    queryClient.setQueriesData<Module[]>({ queryKey: QueryKeys.modules() }, (modules) => {
      if (!modules) return modules

      return modules.map((m) => {
        if (m.id !== moduleId) return m

        // Side-effect: Capture plant ID if found
        if (m.coupled) {
          plantIdToUpdate = m.coupledPlantId
        }

        return { ...m, connectivity }
      })
    })

    // If the module was coupled, update the related plant connectivity
    if (plantIdToUpdate) {
      const updatedConnectivity = { isOnline, lastSeen }
      queryClient.setQueryData<Plant[]>(QueryKeys.plants, (list) =>
        list?.map((p) =>
          p.id === plantIdToUpdate ? { ...p, module: { ...p.module, connectivity: updatedConnectivity } } : p
        )
      )
      queryClient.setQueryData<Plant>(QueryKeys.plant(plantIdToUpdate), (p) =>
        p ? { ...p, module: { ...p.module, connectivity: updatedConnectivity } } : p
      )
    }
  }

  function handleEntityChange(message: EntityChangeMessage) {
    const { entity, action, id } = message.payload

    if (entity === "plant") {
      const plantId = id as number

      if (action === "create") {
        // Refetch the main list to include the new plant (`exact: true` to avoid invalidating unrelated child keys).
        queryClient.invalidateQueries({
          queryKey: QueryKeys.plants,
          exact: true,
          refetchType: "all"
        })
      } else if (action === "delete") {
        // Manually remove from the list cache to avoid a refetch.
        queryClient.setQueryData<Plant[]>(QueryKeys.plants, (plants) => plants?.filter((plant) => plant.id !== plantId))

        // Garbage collect the specific plant cache since it no longer exists.
        queryClient.removeQueries({ queryKey: QueryKeys.plant(plantId) })
      } else if (action === "update") {
        // Refetch the specific plant details.
        queryClient.invalidateQueries({
          queryKey: QueryKeys.plant(plantId),
          refetchType: "all"
        })

        // Refetch the main list (`exact: true` to prevent invalidating ALL other plant details).
        queryClient.invalidateQueries({
          queryKey: QueryKeys.plants,
          exact: true,
          refetchType: "all"
        })
      }
    } else if (entity === "module") {
      if (action === "create" || action === "update") {
        // Refetch all module lists.
        queryClient.invalidateQueries({ queryKey: QueryKeys.modules(), refetchType: "all" })
      } else if (action === "delete") {
        // Manually remove from the modules list
        queryClient.setQueryData<Module[]>(QueryKeys.modules(), (modules) =>
          modules?.filter((module) => module.id !== id)
        )
      }
    }
  }

  return {
    isConnected: readyState === ReadyState.OPEN,
    isReconnecting: readyState === ReadyState.CONNECTING
  }
}
