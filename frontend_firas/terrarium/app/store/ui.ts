import { create } from "zustand"
import { persist } from "zustand/middleware"

interface UIState {
  // Settings dialog
  settingsOpen: boolean
  setSettingsOpen: (open: boolean) => void

  // Alerts settings
  alertsEnabled: boolean
  setAlertsEnabled: (enabled: boolean) => void
  discordWebhook: string
  setDiscordWebhook: (webhook: string) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Settings dialog
      settingsOpen: false,
      setSettingsOpen: (open) => set({ settingsOpen: open }),

      // Alerts settings
      alertsEnabled: false,
      setAlertsEnabled: (enabled) => set({ alertsEnabled: enabled }),
      discordWebhook: "",
      setDiscordWebhook: (webhook) => set({ discordWebhook: webhook })
    }),
    {
      name: "ui-storage"
    }
  )
)
