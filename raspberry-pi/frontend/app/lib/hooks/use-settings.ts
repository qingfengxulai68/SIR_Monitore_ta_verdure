import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient } from "~/lib/api-client"
import type { AlertsSettings } from "~/lib/types"
import { QueryKeys } from "~/lib/types"

// Hook to fetch alerts settings
export function useAlertsSettings() {
  return useQuery({
    queryKey: QueryKeys.alertsSettings,
    queryFn: () => apiClient.get<AlertsSettings>("/settings/alerts")
  })
}

// Hook to enable alerts
export function useEnableAlerts() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { discordWebhookUrl: string }) =>
      apiClient.post<void, { discordWebhookUrl: string }>("/settings/alerts/enable", data),

    onSuccess: () => {
      // Invalidate cache to reload settings
      queryClient.invalidateQueries({ queryKey: QueryKeys.alertsSettings, refetchType: "all" })

      toast.success("Alerts enabled")
    },

    onError: (error) => {
      toast.error(error.message)
    }
  })
}

// Hook to disable alerts
export function useDisableAlerts() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => apiClient.post<void, {}>("/settings/alerts/disable", {}),

    onSuccess: () => {
      // Invalidate cache to reload settings
      queryClient.invalidateQueries({ queryKey: QueryKeys.alertsSettings, refetchType: "all" })

      toast.success("Alerts disabled")
    },

    onError: (error) => {
      toast.error(error.message)
    }
  })
}
