import { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Switch } from "~/components/ui/switch"
import { Edit2 } from "lucide-react"
import { WebhookDialog } from "../dialogs/webhook-dialog"
import { mockGetAlertsSettings, mockUpdateAlertsSettings } from "~/lib/mocks"

export function AlertsSection() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add")
  const [discordWebhook, setDiscordWebhook] = useState("")
  const [alertsEnabled, setAlertsEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load alerts settings on mount
  useEffect(() => {
    loadAlertsSettings()
  }, [])

  const loadAlertsSettings = async () => {
    try {
      const settings = await mockGetAlertsSettings()
      setAlertsEnabled(settings.alertsEnabled)
      setDiscordWebhook(settings.discordWebhook)
    } finally {
      setLoading(false)
    }
  }

  const handleAlertToggle = async (checked: boolean) => {
    if (checked) {
      // Always open dialog when enabling alerts
      setDialogMode(discordWebhook ? "edit" : "add")
      setDialogOpen(true)
    } else {
      // Disable alerts and clear webhook
      const settings = await mockUpdateAlertsSettings({ alertsEnabled: false, discordWebhook: "" })
      setAlertsEnabled(settings.alertsEnabled)
      setDiscordWebhook(settings.discordWebhook)
    }
  }

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open)
  }

  const handleSaveWebhook = async (webhook: string) => {
    const settings = await mockUpdateAlertsSettings({ discordWebhook: webhook, alertsEnabled: true })
    setDiscordWebhook(settings.discordWebhook)
    setAlertsEnabled(settings.alertsEnabled)
  }

  const handleEditWebhook = () => {
    setDialogMode("edit")
    setDialogOpen(true)
  }

  if (loading) {
    return <div className="space-y-6 max-w-112.5">Loading...</div>
  }

  return (
    <div className="space-y-6 max-w-112.5">
      <div className="space-y-4">
        <div className="flex items-center justify-between space-x-2">
          <div>
            <label className="text-sm">Enable Alerts</label>
            <p className="text-xs text-muted-foreground">Receive notifications on Discord</p>
          </div>
          <Switch id="alerts-toggle" checked={alertsEnabled} onCheckedChange={handleAlertToggle} />
        </div>

        {alertsEnabled && discordWebhook && (
          <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs truncate font-mono text-muted-foreground">{discordWebhook}</p>
            </div>
            <Button variant="ghost" size="sm" className="ml-2 h-8 w-8 p-0" onClick={handleEditWebhook}>
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      <WebhookDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        currentWebhook={discordWebhook}
        onSave={handleSaveWebhook}
        mode={dialogMode}
      />
    </div>
  )
}
