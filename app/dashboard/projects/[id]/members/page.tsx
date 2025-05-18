import { ProjectHeader } from "@/components/projects/project-header"
import { ProjectMembers } from "@/components/projects/project-members"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProjectMembersPage({ params }: { params: { id: string } }) {
  return (
    <DashboardShell>
      <ProjectHeader id={params.id} heading="Thành viên dự án" text="Quản lý thành viên trong dự án." />
      <Tabs defaultValue="members" className="mt-6">
        {/* <TabsList>
          <TabsTrigger value="members">Thành viên</TabsTrigger>
        </TabsList> */}
        <TabsContent value="members" className="mt-4">
          <ProjectMembers projectId={params.id} />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
