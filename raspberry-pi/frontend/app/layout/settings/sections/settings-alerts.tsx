import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Switch } from "~/components/ui/switch"
import { Edit2 } from "lucide-react"
import { WebhookDialog } from "../dialogs/webhook-dialog"
import { Spinner } from "~/components/ui/spinner"
import { ErrorWithRetry } from "~/components/other/error-with-retry"
import { useAlertsSettings, useDisableAlerts } from "~/lib/hooks/use-settings"

export function AlertsSection() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add")

  const { data: alertsSettings, isLoading, error, refetch } = useAlertsSettings()
  const disableAlertsMutation = useDisableAlerts()

  const discordWebhook = alertsSettings?.discordWebhookUrl || ""
  const alertsEnabled = alertsSettings?.enabled || false

  const handleAlertToggle = (checked: boolean) => {
    if (checked) {
      // Always open dialog when enabling alerts
      setDialogMode(discordWebhook ? "edit" : "add")
      setDialogOpen(true)
    } else {
      // Disable alerts and clear webhook
      disableAlertsMutation.mutate()
    }
  }

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open)
  }

  const handleEditWebhook = () => {
    setDialogMode("edit")
    setDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-112.5">
        <ErrorWithRetry error={error.message} onRetry={refetch} />
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
          mode={dialogMode}
        />
      )}
    </div>
  )
}
