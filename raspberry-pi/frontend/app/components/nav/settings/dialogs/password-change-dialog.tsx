import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { Field, FieldGroup, FieldLabel, FieldError } from "~/components/ui/field"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "~/components/ui/dialog"
import {
  changePasswordRequestSchema as passwordChangeSchema,
  type changePasswordRequest as PasswordChangeFormData
} from "~/lib/auth"
import { changePassword } from "~/lib/auth"
import { Spinner } from "~/components/ui/spinner"

interface PasswordChangeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PasswordChangeDialog({ open, onOpenChange }: PasswordChangeDialogProps) {
  const form = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  })

  const onSubmit = async (data: PasswordChangeFormData) => {
    try {
      await changePassword(data.currentPassword, data.newPassword)
      toast.success("Your password has been updated successfully.")
      onOpenChange(false)
    } catch (error) {
      const errorMessage = (error as Error).message

      // If it's a current password error, set it on the field
      if (errorMessage.toLowerCase().includes("current password")) {
        form.setError("currentPassword", {
          type: "manual",
          message: errorMessage
        })
      } else {
        alert(errorMessage)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25 gap-7">
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>Enter your current password and choose a new one.</DialogDescription>
        </DialogHeader>
        <form id="password-change-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="currentPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Current password</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="password"
                    aria-invalid={fieldState.invalid}
                    autoComplete="current-password"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="newPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>New password</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="password"
                    aria-invalid={fieldState.invalid}
                    autoComplete="new-password"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Confirm password</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="password"
                    aria-invalid={fieldState.invalid}
                    autoComplete="new-password"
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
          <Button type="submit" form="password-change-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Spinner /> : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
