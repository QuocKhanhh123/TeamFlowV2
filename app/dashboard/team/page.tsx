import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { TeamMembers } from "@/components/team/team-members"
import { InviteTeamMemberButton } from "@/components/team/invite-team-member-button"
import { TeamOverview } from "@/components/team/team-overview"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PendingInvitations } from "@/components/team/pending-invitations"

export default function TeamPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Quản lý thành viên" text="Xem và quản lý thành viên trong nhóm của bạn.">
        {/* <InviteTeamMemberButton /> */}
      </DashboardHeader>

      <TeamOverview />

      <Tabs defaultValue="members" className="mt-6">
        <TabsList>
          <TabsTrigger value="members">Thành viên</TabsTrigger>
          {/* <TabsTrigger value="pending">Lời mời đang chờ</TabsTrigger> */}
        </TabsList>
        <TabsContent value="members" className="mt-4">
          <TeamMembers />
        </TabsContent>
        <TabsContent value="pending" className="mt-4">
          <PendingInvitations />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
