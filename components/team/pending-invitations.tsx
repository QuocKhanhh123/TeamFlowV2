"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getPendingInvitations, cancelInvitation, resendInvitation } from "@/lib/team-actions"
import { toast } from "@/lib/toast-utils"
import { Clock, RefreshCw, X } from "lucide-react"

interface Invitation {
  id: string
  email: string
  role: "admin" | "member"
  sentAt: string
  expiresAt: string
}

export function PendingInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [actionType, setActionType] = useState<"cancel" | "resend" | null>(null)

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const data = await getPendingInvitations()
        setInvitations(data)
      } catch (error) {
        console.error("Failed to fetch pending invitations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchInvitations()
  }, [])

  const handleCancelInvitation = async (id: string) => {
    setActionId(id)
    setActionType("cancel")
    try {
      await cancelInvitation(id)
      setInvitations(invitations.filter((inv) => inv.id !== id))
      toast.success("Hủy lời mời thành công", {
        description: "Lời mời đã được hủy.",
      })
    } catch (error) {
      console.error("Failed to cancel invitation:", error)
      toast.error("Lỗi", {
        description: "Không thể hủy lời mời. Vui lòng thử lại sau.",
      })
    } finally {
      setActionId(null)
      setActionType(null)
    }
  }

  const handleResendInvitation = async (id: string) => {
    setActionId(id)
    setActionType("resend")
    try {
      const updatedInvitation = await resendInvitation(id)
      setInvitations(invitations.map((inv) => (inv.id === id ? updatedInvitation : inv)))
      toast.success("Gửi lại lời mời thành công", {
        description: "Lời mời đã được gửi lại.",
      })
    } catch (error) {
      console.error("Failed to resend invitation:", error)
      toast.error("Lỗi", {
        description: "Không thể gửi lại lời mời. Vui lòng thử lại sau.",
      })
    } finally {
      setActionId(null)
      setActionType(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-[150px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="h-9 w-[100px]" />
                  <Skeleton className="h-9 w-[100px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (invitations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <p className="text-muted-foreground">Không có lời mời đang chờ.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lời mời đang chờ ({invitations.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invitations.map((invitation) => {
            const isExpired = new Date(invitation.expiresAt) < new Date()

            return (
              <div key={invitation.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{invitation.email}</p>
                    <Badge variant={invitation.role === "admin" ? "outline" : "secondary"}>
                      {invitation.role === "admin" ? "Quản trị viên" : "Thành viên"}
                    </Badge>
                    {isExpired && <Badge variant="destructive">Hết hạn</Badge>}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Clock className="mr-1 h-3 w-3" />
                    <span>Gửi lúc: {new Date(invitation.sentAt).toLocaleString("vi-VN")}</span>
                  </div>
                </div>
                <div className="flex space-x-2 self-end sm:self-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResendInvitation(invitation.id)}
                    disabled={actionId === invitation.id && actionType === "resend"}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {actionId === invitation.id && actionType === "resend" ? "Đang gửi..." : "Gửi lại"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCancelInvitation(invitation.id)}
                    disabled={actionId === invitation.id && actionType === "cancel"}
                  >
                    <X className="mr-2 h-4 w-4" />
                    {actionId === invitation.id && actionType === "cancel" ? "Đang hủy..." : "Hủy"}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
