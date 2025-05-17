import { TaskDetails } from "@/components/tasks/task-details"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TaskPage({
  params,
}: {
  params: { id: string; taskId: string }
}) {
  return (
    <DashboardShell>
      <div className="flex items-center">
        <Link href={`/projects/${params.id}`}>
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Quay lại dự án
          </Button>
        </Link>
      </div>
      <TaskDetails projectId={params.id} taskId={params.taskId} />
    </DashboardShell>
  )
}
