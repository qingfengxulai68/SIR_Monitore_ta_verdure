import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
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
import { enableAlerts, type AlertsEnableRequest, alertsEnableRequestSchema } from "~/lib/api/settings"
import { Spinner } from "~/components/ui/spinner"

interface WebhookDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentWebhook: string
  onSave: (webhook: string) => void
  mode?: "add" | "edit"
}

export function WebhookDialog({ open, onOpenChange, currentWebhook, onSave, mode = "add" }: WebhookDialogProps) {
  const form = useForm<AlertsEnableRequest>({
    resolver: zodResolver(alertsEnableRequestSchema),
    defaultValues: {
      discordWebhookUrl: currentWebhook
    }
  })

  const onSubmit = async (data: AlertsEnableRequest) => {
    try {
      await enableAlerts(data)
      onSave(data.discordWebhookUrl)
      toast.success(mode === "add" ? "Webhook added successfully." : "Webhook updated successfully.")
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save webhook.")
    }
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
                    disabled={form.formState.isSubmitting}
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
            disabled={form.formState.isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" form="webhook-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Spinner /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
