import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Field, FieldError, FieldGroup } from "~/components/ui/field"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "~/components/ui/dialog"
import { useEnableAlerts } from "~/lib/hooks/use-settings"
import { alertsEnableRequestSchema, type AlertsEnableRequest } from "~/lib/types"
import { Spinner } from "~/components/ui/spinner"

interface WebhookDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentWebhook: string
  mode?: "add" | "edit"
}

export function WebhookDialog({ open, onOpenChange, currentWebhook, mode = "add" }: WebhookDialogProps) {
  const enableAlertsMutation = useEnableAlerts()

  const form = useForm<AlertsEnableRequest>({
    resolver: zodResolver(alertsEnableRequestSchema),
    defaultValues: {
      discordWebhookUrl: currentWebhook
    }
  })

  const onSubmit = (data: AlertsEnableRequest) => {
    enableAlertsMutation.mutate(data, {
      onSuccess: () => {
        onOpenChange(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25 gap-7">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add Discord Webhook" : "Update Discord Webhook"}</DialogTitle>
          <DialogDescription>Enter your Discord webhook URL to receive alerts.</DialogDescription>
        </DialogHeader>
        <form id="webhook-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              control={form.control}
              name="discordWebhookUrl"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input
                    {...field}
                    placeholder="https://discord.com/api/webhooks/..."
                    aria-invalid={fieldState.invalid}
                    disabled={enableAlertsMutation.isPending}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={enableAlertsMutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" form="webhook-form" disabled={enableAlertsMutation.isPending}>
            {enableAlertsMutation.isPending ? <Spinner /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
