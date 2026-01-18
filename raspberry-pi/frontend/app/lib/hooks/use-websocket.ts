import { useQueryClient } from "@tanstack/react-query"
import { useRef, useState } from "react"
import useWebSocket, { ReadyState } from "react-use-websocket"
import { toast } from "sonner"
import { getToken } from "./use-auth"
import { WS_PING_INTERVAL, WS_BASE_URL, WS_RECONNECT_ATTEMPTS, WS_RECONNECT_INTERVAL } from "../constants"
import type {
  IncomingWebSocketMessage,
  PlantMetricsMessage,
  ModuleConnectivityMessage,
  EntityChangeMessage,
  Plant,
  Module
} from "../types"
import { QueryKeys } from "../types"

export function useSystemWebSocket() {
  const queryClient = useQueryClient()
  const token = getToken()

  const hasShownOfflineToast = useRef(false)
  const offlineToastId = useRef<string | number | null>(null)
  const hasEverConnected = useRef(false)
  const [reconnectKey, setReconnectKey] = useState(0)

  const reconnect = () => setReconnectKey((prev) => prev + 1)

  const { readyState } = useWebSocket(`${WS_BASE_URL}/ws?token=${token}&key=${reconnectKey}`, {
    onOpen: () => {
      if (offlineToastId.current) {
        // Dismiss the offline toast when connection is restored
        toast.dismiss(offlineToastId.current)
        offlineToastId.current = null

        // Refetch cache on connect
        queryClient.invalidateQueries({ queryKey: QueryKeys.plants, refetchType: "all" })
        queryClient.invalidateQueries({ queryKey: QueryKeys.modules(), refetchType: "all" })
        toast.success(hasEverConnected.current ? "Connection restored." : "Connected.")
        hasEverConnected.current = true
      }
      hasShownOfflineToast.current = false
    },
    onClose: () => {
      // Don't show offline toast if user is not authenticated (e.g., logged out)
      if (!getToken()) {
        if (offlineToastId.current) {
          toast.dismiss(offlineToastId.current)
          offlineToastId.current = null
        }
        return
      }

      if (!hasShownOfflineToast.current) {
        hasShownOfflineToast.current = true
        offlineToastId.current = toast.error("You are currently offline.", { duration: Infinity })
      }
    },
    onMessage: (event) => {
      // Check for the raw "PONG" message first
      if (event.data === "PONG") {
        return
      }

      // If it's not "PONG", it must be a JSON message
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
    reconnectAttempts: WS_RECONNECT_ATTEMPTS,
    reconnectInterval: WS_RECONNECT_INTERVAL,
    heartbeat: {
      message: () => "PING",
      interval: WS_PING_INTERVAL,
      returnMessage: "PONG"
    }
  })

  function handleMetrics(message: PlantMetricsMessage) {
    const { plantId, metrics } = message.payload

    queryClient.setQueryData<Plant[]>(QueryKeys.plants, (plants) =>
      plants?.map((plant) => (plant.id === plantId ? { ...plant, lastMetricsUpdate: metrics } : plant))
    )

    queryClient.setQueryData<Plant>(QueryKeys.plant(plantId), (plant) =>
      plant ? { ...plant, lastMetricsUpdate: metrics } : plant
    )
  }

  function handleModuleConnectivity(message: ModuleConnectivityMessage) {
    const { moduleId, connectivity } = message.payload

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
      queryClient.setQueryData<Plant[]>(QueryKeys.plants, (list) =>
        list?.map((p) => (p.id === plantIdToUpdate ? { ...p, module: { ...p.module, connectivity: connectivity } } : p))
      )
      queryClient.setQueryData<Plant>(QueryKeys.plant(plantIdToUpdate), (p) =>
        p ? { ...p, module: { ...p.module, connectivity: connectivity } } : p
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
    isReconnecting: readyState === ReadyState.CONNECTING,
    reconnect
  }
}
