import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { UserProfile } from "@/components/profile/user-profile"
import { UserActivity } from "@/components/profile/user-activity"
import { UserStats } from "@/components/profile/user-stats"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProfilePage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Hồ sơ cá nhân" text="Xem và quản lý thông tin cá nhân của bạn." />

      <UserStats />

      <Tabs defaultValue="profile" className="mt-6">
        <TabsList>
          <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="activity">Hoạt động gần đây</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-4">
          <UserProfile />
        </TabsContent>
        <TabsContent value="activity" className="mt-4">
          <UserActivity />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
