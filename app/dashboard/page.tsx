import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ProjectList } from "@/components/dashboard/project-list"
import { CreateProjectButton } from "@/components/dashboard/create-project-button"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Dự án" text="Quản lý tất cả các dự án của bạn.">
        <CreateProjectButton />
      </DashboardHeader>
      <div className="grid gap-4">
        <ProjectList />
      </div>
    </DashboardShell>
  )
}
