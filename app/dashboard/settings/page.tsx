"use client"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/lib/toast-utils"

export default function SettingsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Cài đặt" text="Quản lý cài đặt tài khoản và ứng dụng." />

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Thông báo</CardTitle>
            <CardDescription>Cấu hình cài đặt thông báo của bạn.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                <span>Thông báo qua email</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Nhận thông báo qua email khi có cập nhật mới.
                </span>
              </Label>
              <Switch
                id="email-notifications"
                defaultChecked
                onCheckedChange={() => {
                  toast.success("Đã lưu cài đặt", {
                    description: "Cài đặt thông báo email đã được cập nhật.",
                  })
                }}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="push-notifications" className="flex flex-col space-y-1">
                <span>Thông báo đẩy</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Nhận thông báo đẩy trên trình duyệt khi có cập nhật mới.
                </span>
              </Label>
              <Switch
                id="push-notifications"
                onCheckedChange={() => {
                  toast.success("Đã lưu cài đặt", {
                    description: "Cài đặt thông báo đẩy đã được cập nhật.",
                  })
                }}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="task-reminders" className="flex flex-col space-y-1">
                <span>Nhắc nhở công việc</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Nhận thông báo nhắc nhở về công việc sắp đến hạn.
                </span>
              </Label>
              <Switch
                id="task-reminders"
                defaultChecked
                onCheckedChange={() => {
                  toast.success("Đã lưu cài đặt", {
                    description: "Cài đặt nhắc nhở công việc đã được cập nhật.",
                  })
                }}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => {
                toast("Đã lưu thay đổi", {
                  description: "Tất cả cài đặt thông báo đã được lưu.",
                })
              }}
            >
              Lưu thay đổi
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hiển thị</CardTitle>
            <CardDescription>Tùy chỉnh giao diện người dùng.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="compact-view" className="flex flex-col space-y-1">
                <span>Chế độ xem gọn</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Hiển thị nhiều nội dung hơn trên mỗi trang.
                </span>
              </Label>
              <Switch
                id="compact-view"
                onCheckedChange={(checked) => {
                  toast.success("Đã lưu cài đặt", {
                    description: `Chế độ xem gọn đã được ${checked ? "bật" : "tắt"}.`,
                  })
                }}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="animations" className="flex flex-col space-y-1">
                <span>Hiệu ứng chuyển động</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Bật hiệu ứng chuyển động trong giao diện.
                </span>
              </Label>
              <Switch
                id="animations"
                defaultChecked
                onCheckedChange={(checked) => {
                  toast.success("Đã lưu cài đặt", {
                    description: `Hiệu ứng chuyển động đã được ${checked ? "bật" : "tắt"}.`,
                  })
                }}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => {
                toast.success("Đã lưu thay đổi", {
                  description: "Tất cả cài đặt hiển thị đã được lưu.",
                })
              }}
            >
              Lưu thay đổi
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardShell>
  )
}
