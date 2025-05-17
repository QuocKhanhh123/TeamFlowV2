import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ProjectsOverview } from "@/components/projects/projects-overview"
import { CreateProjectButton } from "@/components/dashboard/create-project-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjectList } from "@/components/dashboard/project-list"
import { ArchivedProjectList } from "@/components/projects/archived-project-list"

export default function ProjectsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Quản lý dự án" text="Xem và quản lý tất cả các dự án của bạn.">
        <CreateProjectButton />
      </DashboardHeader>

      <ProjectsOverview />

      <Tabs defaultValue="active" className="mt-6">
        <TabsList>
          <TabsTrigger value="active">Đang hoạt động</TabsTrigger>
          <TabsTrigger value="archived">Đã lưu trữ</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-4">
          <ProjectList />
        </TabsContent>
        <TabsContent value="archived" className="mt-4">
          <ArchivedProjectList />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
