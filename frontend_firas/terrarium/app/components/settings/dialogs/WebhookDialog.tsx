import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Field, FieldError } from "~/components/ui/field"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "~/components/ui/dialog"
import { settingsSchema, type SettingsFormData } from "~/lib/validation"
import { Spinner } from "~/components/ui/spinner"

interface WebhookDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentWebhook: string
  onSave: (webhook: string) => void
  mode?: "add" | "edit"
}

export function WebhookDialog({ open, onOpenChange, currentWebhook, onSave, mode = "add" }: WebhookDialogProps) {
  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      discordWebhook: currentWebhook
    }
  })

  // Reset form when dialog opens or currentWebhook changes
  useEffect(() => {
    if (open) {
      form.reset({ discordWebhook: currentWebhook })
    }
  }, [open, currentWebhook, form])

  const onSubmit = async (data: SettingsFormData) => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    onSave(data.discordWebhook)
    toast.success(mode === "add" ? "Webhook added successfully." : "Webhook updated successfully.")
    onOpenChange(false)
  }

  const handleDialogChange = (isOpen: boolean) => {
    onOpenChange(isOpen)
    if (!isOpen) {
      form.reset({ discordWebhook: currentWebhook })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add Discord Webhook" : "Update Discord Webhook"}</DialogTitle>
          <DialogDescription>Enter your Discord webhook URL to receive alerts.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            control={form.control}
            name="discordWebhook"
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
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={form.formState.isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Spinner /> : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
