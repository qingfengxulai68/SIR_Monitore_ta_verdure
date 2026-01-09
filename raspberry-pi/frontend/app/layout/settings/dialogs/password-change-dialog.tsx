import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { Spinner } from "~/components/ui/spinner"
import { useChangePassword } from "~/lib/hooks/use-auth"
import { changePasswordRequestSchema, type ChangePasswordRequest } from "~/lib/types"

interface PasswordChangeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PasswordChangeDialog({ open, onOpenChange }: PasswordChangeDialogProps) {
  const changePasswordMutation = useChangePassword()

  const form = useForm<ChangePasswordRequest>({
    resolver: zodResolver(changePasswordRequestSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  })

  const onSubmit = async (data: ChangePasswordRequest) => {
    changePasswordMutation.mutate(
      { currentPassword: data.currentPassword, newPassword: data.newPassword, confirmPassword: data.confirmPassword },
      {
        onSuccess: () => {
          onOpenChange(false)
          form.reset()
        },
        onError: (error) => {
          const errorMessage = (error as Error).message
          // If it's a current password error, set it on the field
          if (errorMessage.toLowerCase().includes("current password")) {
            form.setError("currentPassword", {
              type: "manual",
              message: errorMessage
            })
          }
        }
      }
    )
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
            disabled={changePasswordMutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" form="password-change-form" disabled={changePasswordMutation.isPending}>
            {changePasswordMutation.isPending ? <Spinner /> : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
