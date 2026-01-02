import { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Switch } from "~/components/ui/switch"
import { Edit2 } from "lucide-react"
import { WebhookDialog } from "../dialogs/webhook-dialog"
import { getAlerts, disableAlerts } from "~/lib/api/settings"
import { toast } from "sonner"
import { Spinner } from "~/components/ui/spinner"
import { ErrorWithRetry } from "~/components/other/error-with-retry"

export function AlertsSection() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add")
  const [discordWebhook, setDiscordWebhook] = useState("")
  const [alertsEnabled, setAlertsEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load alerts settings on mount
  useEffect(() => {
    loadAlertsSettings()
  }, [])

  const loadAlertsSettings = async () => {
    setLoading(true)
    setError(null)
    try {
      const settings = await getAlerts()
      setAlertsEnabled(settings.enabled)
      setDiscordWebhook(settings.discordWebhookUrl || "")
    } catch (err) {
      setError((err as Error).message)
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
      try {
        await disableAlerts()
        setAlertsEnabled(false)
        setDiscordWebhook("")
        toast.success("Alerts disabled")
      } catch (err) {
        toast.error("Failed to disable alerts")
      }
    }
  }

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open)
  }

  const handleSaveWebhook = async (webhook: string) => {
    setDiscordWebhook(webhook)
    setAlertsEnabled(true)
  }

  const handleEditWebhook = () => {
    setDialogMode("edit")
    setDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-112.5">
        <ErrorWithRetry error={error} onRetry={loadAlertsSettings} />
      </div>
    )
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
      {dialogOpen && (
        <WebhookDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          currentWebhook={discordWebhook}
          onSave={handleSaveWebhook}
          mode={dialogMode}
        />
      )}
    </div>
  )
}
