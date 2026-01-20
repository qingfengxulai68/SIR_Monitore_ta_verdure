import { AlertCircle } from "lucide-react"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "~/components/ui/empty"
import { Button } from "~/components/ui/button"

interface ErrorWithRetryProps {
  error: string
  onRetry: () => void
}

export function ErrorWithRetry({ error, onRetry }: ErrorWithRetryProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-destructive/10">
          <AlertCircle className="size-6 text-destructive" />
        </EmptyMedia>
        <EmptyTitle>Something went wrong</EmptyTitle>
        <EmptyDescription>{error}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onRetry} size="sm" variant="outline">
          Retry
        </Button>
      </EmptyContent>
    </Empty>
  )
}
