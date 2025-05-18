import { ProjectHeader } from "@/components/projects/project-header"
import { TaskBoard } from "@/components/tasks/task-board"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { CreateTaskButton } from "@/components/tasks/create-task-button"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <DashboardShell>
      <ProjectHeader id={id} heading="Dự án ABC" text="Quản lý công việc trong dự án.">
        <CreateTaskButton projectId={id} />
      </ProjectHeader>
      <div className="grid gap-4">
        <TaskBoard projectId={id} />
      </div>
    </DashboardShell>
  )
}
