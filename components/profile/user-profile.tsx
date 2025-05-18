"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {  updateUserProfile } from "@/lib/user-actions"
import { getCurrentUserInfo } from "@/lib/auth-actions"
import { toast } from "@/lib/toast-utils"
import { useRouter } from "next/navigation"

export function UserProfile() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<{
    id: string
    name: string
    email: string
    role: string
    lastActive?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const info = await getCurrentUserInfo()
        setUserInfo(info ? {
          ...info,
          lastActive: info.lastActive?.toISOString(),
          role: info.role.toString()
        } : null)
        setFormData({
          name: info?.name || "",
        })
      } catch (error) {
        console.error("Failed to fetch user info:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserInfo()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await updateUserProfile(formData)
      setUserInfo((prev) => (prev ? { ...prev, ...formData } : null))
      setIsEditing(false)
      toast.success("Cập nhật thành công", {
        description: "Thông tin cá nhân đã được cập nhật.",
      })
      router.refresh()
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast.error("Lỗi", {
        description: "Không thể cập nhật thông tin cá nhân. Vui lòng thử lại sau.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-[180px]" />
          <Skeleton className="h-4 w-[250px]" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!userInfo) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <p className="text-muted-foreground">Không thể tải thông tin người dùng.</p>
          <Button className="mt-4" onClick={() => router.refresh()}>
            Thử lại
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin cá nhân</CardTitle>
        <CardDescription>Xem và cập nhật thông tin cá nhân của bạn.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Avatar className="h-24 w-24">
            <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Avatar" />
            <AvatarFallback className="text-xl">{getInitials(userInfo.name || "User")}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-medium">{userInfo.name || "Người dùng"}</h3>
            <p className="text-sm text-muted-foreground">{userInfo.email}</p>
            <p className="text-sm text-muted-foreground">
              {userInfo.role === "ADMIN" ? "Quản trị viên" : "Thành viên"}
            </p>
            {userInfo.lastActive && (
              <p className="text-xs text-muted-foreground mt-1">
                Hoạt động lần cuối: {new Date(userInfo.lastActive).toLocaleString("vi-VN")}
              </p>
            )}
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Họ tên</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nhập họ tên của bạn"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={userInfo.email} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Email không thể thay đổi.</p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Họ tên</Label>
              <Input id="name" value={userInfo.name || ""} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={userInfo.email} disabled className="bg-muted" />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>{!isEditing && <Button onClick={() => setIsEditing(true)}>Chỉnh sửa thông tin</Button>}</CardFooter>
    </Card>
  )
}
