import { useState } from "react"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { getUser } from "~/lib/hooks/use-auth"
import { PasswordChangeDialog } from "../dialogs/password-change-dialog"

export function AccountSection() {
  const user = getUser()
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="space-y-6 max-w-112.5">
      <div className="space-y-4">
        <div className="flex items-center justify-between space-x-2">
          <div>
            <label className="text-sm">Username</label>
            <p className="text-xs text-muted-foreground">Your account username</p>
          </div>
          <Input value={user?.username || ""} disabled className="w-17" />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <div>
            <label className="text-sm">Password</label>
            <p className="text-xs text-muted-foreground">Change your password</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive focus:text-destructive"
            onClick={() => setDialogOpen(true)}
          >
            Change
          </Button>
        </div>
      </div>
      {dialogOpen && <PasswordChangeDialog open={dialogOpen} onOpenChange={setDialogOpen} />}
    </div>
  )
}
