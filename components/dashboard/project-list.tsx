"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getProjects } from "@/lib/project-actions"

interface Project {
  id: string
  name: string
  description: string
  status: "ACTIVE" | "COMPLETED" | "ON_HOLD"
  taskCount: number
  memberCount: number
  createdAt: string
}

export function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // In a real app, this would fetch from a backend
        const data = await getProjects()
        setProjects(data)
      } catch (error) {
        console.error("Failed to fetch projects:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="p-4">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Skeleton className="h-4 w-full" />
            </CardContent>
            <CardFooter className="p-4 flex justify-between">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-9 w-[100px]" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h3 className="text-lg font-medium">Chưa có dự án nào</h3>
        <p className="text-muted-foreground mt-1">Tạo dự án đầu tiên của bạn để bắt đầu.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card key={project.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{project.name}</CardTitle>
              <Badge
                variant={
                  project.status === "ACTIVE" ? "default" : project.status === "COMPLETED" ? "default" : "secondary"
                }
              >
                {project.status === "ACTIVE"
                  ? "Đang hoạt động"
                  : project.status === "COMPLETED"
                    ? "Hoàn thành"
                    : "Tạm dừng"}
              </Badge>
            </div>
            <CardDescription>{project.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{project.taskCount} công việc</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" size="sm">
              Chỉnh sửa
            </Button>
            <Link href={`/dashboard/projects/${project.id}`}>
              <Button size="sm">Xem chi tiết</Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
