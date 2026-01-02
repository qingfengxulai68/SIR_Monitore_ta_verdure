import { Cpu } from "lucide-react"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "~/components/ui/empty"

export function ModulesEmpty() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-primary/10 text-primary">
          <Cpu className="size-6" />
        </EmptyMedia>
        <EmptyTitle>No modules yet</EmptyTitle>
        <EmptyDescription>No sensor modules have been registered in the system.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

export default ModulesEmpty
