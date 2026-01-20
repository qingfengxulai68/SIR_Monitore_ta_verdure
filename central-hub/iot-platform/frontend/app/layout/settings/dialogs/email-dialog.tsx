import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Field, FieldError, FieldGroup, FieldLabel } from "~/components/ui/field"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "~/components/ui/dialog"
import { useUpdateEmailAlerts } from "~/lib/hooks/use-settings"
import { emailAlertsUpdateRequestSchema, type EmailAlertsUpdateRequest } from "~/lib/types"
import { Spinner } from "~/components/ui/spinner"

interface EmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentEmail: string
}

export function EmailDialog({ open, onOpenChange, currentEmail }: EmailDialogProps) {
  const updateEmailAlertsMutation = useUpdateEmailAlerts()

  const form = useForm<EmailAlertsUpdateRequest>({
    resolver: zodResolver(emailAlertsUpdateRequestSchema),
    defaultValues: {
      email_enabled: true,
      receiver_email: currentEmail
    }
  })

  const onSubmit = (data: EmailAlertsUpdateRequest) => {
    updateEmailAlertsMutation.mutate(data, {
      onSuccess: () => {
        onOpenChange(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25 gap-7">
        <DialogHeader>
          <DialogTitle>Email Address</DialogTitle>
          <DialogDescription>Enter the email address to receive alerts.</DialogDescription>
        </DialogHeader>
        <form id="email-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              control={form.control}
              name="receiver_email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input
                    {...field}
                    value={field.value || ""}
                    placeholder="your-email@example.com"
                    aria-invalid={fieldState.invalid}
                    disabled={updateEmailAlertsMutation.isPending}
                    autoComplete="email"
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
            disabled={updateEmailAlertsMutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" form="email-form" disabled={updateEmailAlertsMutation.isPending}>
            {updateEmailAlertsMutation.isPending ? <Spinner /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
