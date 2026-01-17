import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient } from "~/lib/api-client"
import type { AlertsSettings, DiscordAlertsUpdateRequest, EmailAlertsUpdateRequest } from "~/lib/types"
import { QueryKeys } from "~/lib/types"

// Hook to fetch alerts settings
export function useAlertsSettings() {
  return useQuery({
    queryKey: QueryKeys.alertsSettings,
    queryFn: () => apiClient.get<AlertsSettings>("/settings/alerts")
  })
}

// Hook to update Discord alerts
export function useUpdateDiscordAlerts() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: DiscordAlertsUpdateRequest) =>
      apiClient.put<void, DiscordAlertsUpdateRequest>("/settings/alerts/discord", data),

    onSuccess: () => {
      // Invalidate cache to reload settings
      queryClient.invalidateQueries({ queryKey: QueryKeys.alertsSettings, refetchType: "all" })

      toast.success("Discord alerts updated")
    },

    onError: (error) => {
      toast.error(error.message)
    }
  })
}

// Hook to update Email alerts
export function useUpdateEmailAlerts() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: EmailAlertsUpdateRequest) =>
      apiClient.put<void, EmailAlertsUpdateRequest>("/settings/alerts/email", data),

    onSuccess: () => {
      // Invalidate cache to reload settings
      queryClient.invalidateQueries({ queryKey: QueryKeys.alertsSettings, refetchType: "all" })

      toast.success("Email alerts updated")
    },

    onError: (error) => {
      toast.error(error.message)
    }
  })
}
