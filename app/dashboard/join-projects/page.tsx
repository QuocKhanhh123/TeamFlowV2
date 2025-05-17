import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { JoinableProjectList } from "@/components/projects/joinable-project-list"

export default function JoinProjectsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Tham gia dự án" text="Xem và tham gia các dự án có sẵn." />
      <div className="grid gap-4">
        <JoinableProjectList />
      </div>
    </DashboardShell>
  )
}
