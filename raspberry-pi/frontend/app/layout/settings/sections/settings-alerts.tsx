import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Switch } from "~/components/ui/switch"
import { Edit2 } from "lucide-react"
import { EmailDialog } from "../dialogs/email-dialog"
import { Spinner } from "~/components/ui/spinner"
import { ErrorWithRetry } from "~/components/other/error-with-retry"
import { useAlertsSettings, useUpdateDiscordAlerts, useUpdateEmailAlerts } from "~/lib/hooks/use-settings"

export function AlertsSection() {
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)

  const { data: alertsSettings, isLoading, error, refetch } = useAlertsSettings()
  const updateDiscordAlertsMutation = useUpdateDiscordAlerts()
  const updateEmailAlertsMutation = useUpdateEmailAlerts()

  const discordEnabled = alertsSettings?.discord_enabled || false
  const emailEnabled = alertsSettings?.email_enabled || false
  const receiverEmail = alertsSettings?.receiver_email || ""

  const handleDiscordToggle = (checked: boolean) => {
    if (checked) {
      // Open Discord OAuth in a popup
      const popup = window.open(
        "http://localhost:8001/auth/discord/login",
        "discord-oauth",
        `width=${screen.width},height=${screen.height},left=0,top=0,scrollbars=yes,resizable=yes`
      )

      if (popup) {
        // Refetch settings after popup is closed
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed)
            console.log("Discord OAuth popup closed")
            refetch()
          }
        }, 1000)
      }
    } else {
      // Disable Discord alerts
      updateDiscordAlertsMutation.mutate({ discord_enabled: false, discord_webhook_url: null })
    }
  }

  const handleEmailToggle = (checked: boolean) => {
    if (checked) {
      setEmailDialogOpen(true)
    } else {
      // Disable Email alerts
      updateEmailAlertsMutation.mutate({ email_enabled: false, receiver_email: null })
    }
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
        {/* Discord Alerts */}
        <div className="flex items-center justify-between space-x-2">
          <div>
            <label className="text-sm">Enable Discord Alerts</label>
            <p className="text-xs text-muted-foreground">Receive notifications on Discord</p>
          </div>
          <Switch id="discord-alerts-toggle" checked={discordEnabled} onCheckedChange={handleDiscordToggle} />
        </div>

        {/* Email Alerts */}
        <div className="flex items-center justify-between space-x-2">
          <div>
            <label className="text-sm">Enable Email Alerts</label>
            <p className="text-xs text-muted-foreground">Receive notifications via email</p>
          </div>
          <Switch id="email-alerts-toggle" checked={emailEnabled} onCheckedChange={handleEmailToggle} />
        </div>

        {emailEnabled && receiverEmail && (
          <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs truncate font-mono text-muted-foreground">{receiverEmail}</p>
            </div>
            <Button variant="ghost" size="sm" className="ml-2 h-8 w-8 p-0" onClick={() => setEmailDialogOpen(true)}>
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Dialogs */}
      {emailDialogOpen && (
        <EmailDialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen} currentEmail={receiverEmail} />
      )}
    </div>
  )
}
