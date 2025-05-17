"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getTeamMembers, updateMemberRole, removeMember } from "@/lib/team-actions"
import { toast } from "@/lib/toast-utils"
import { MoreHorizontal, Shield, User, UserX } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"

interface TeamMember {
  id: string
  name: string
  email: string
  role: "owner" | "admin" | "member"
  avatar?: string
  joinedAt: string
  lastActive: string
}

export function TeamMembers() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await getTeamMembers()
        setMembers(data)
      } catch (error) {
        console.error("Failed to fetch team members:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [])

  const handleUpdateRole = async (memberId: string, newRole: "admin" | "member") => {
    try {
      await updateMemberRole(memberId, newRole)
      setMembers(members.map((member) => (member.id === memberId ? { ...member, role: newRole } : member)))
      toast.success("Cập nhật thành công", {
        description: "Vai trò thành viên đã được cập nhật.",
      })
    } catch (error) {
      console.error("Failed to update member role:", error)
      toast.error("Lỗi", {
        description: "Không thể cập nhật vai trò thành viên. Vui lòng thử lại sau.",
      })
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    setRemovingId(memberId)
    try {
      await removeMember(memberId)
      setMembers(members.filter((member) => member.id !== memberId))
      toast.success("Xóa thành công", {
        description: "Thành viên đã được xóa khỏi nhóm.",
      })
    } catch (error) {
      console.error("Failed to remove member:", error)
      toast.error("Lỗi", {
        description: "Không thể xóa thành viên. Vui lòng thử lại sau.",
      })
    } finally {
      setRemovingId(null)
    }
  }

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex w-full max-w-sm items-center space-x-2 mb-4">
          <Skeleton className="h-10 w-full" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-[150px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex w-full max-w-sm items-center space-x-2 mb-4">
        <Input
          type="text"
          placeholder="Tìm kiếm thành viên..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thành viên nhóm ({filteredMembers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6">
              <p className="text-muted-foreground">Không tìm thấy thành viên nào.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={member.avatar || "/placeholder.svg?height=40&width=40"} alt={member.name} />
                      <AvatarFallback>
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium leading-none">{member.name}</p>
                        <Badge
                          variant={
                            member.role === "owner" ? "default" : member.role === "admin" ? "outline" : "secondary"
                          }
                        >
                          {member.role === "owner"
                            ? "Chủ sở hữu"
                            : member.role === "admin"
                              ? "Quản trị viên"
                              : "Thành viên"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Tham gia: {new Date(member.joinedAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>

                  {member.role !== "owner" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Mở menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {member.role === "member" ? (
                          <DropdownMenuItem onClick={() => handleUpdateRole(member.id, "admin")}>
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Đặt làm quản trị viên</span>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleUpdateRole(member.id, "member")}>
                            <User className="mr-2 h-4 w-4" />
                            <span>Đặt làm thành viên</span>
                          </DropdownMenuItem>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <UserX className="mr-2 h-4 w-4" />
                              <span>Xóa khỏi nhóm</span>
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xóa thành viên?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bạn có chắc chắn muốn xóa {member.name} khỏi nhóm? Hành động này không thể hoàn tác.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveMember(member.id)}
                                disabled={removingId === member.id}
                              >
                                {removingId === member.id ? "Đang xóa..." : "Xóa"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
