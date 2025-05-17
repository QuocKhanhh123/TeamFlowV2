"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { getArchivedProjects, restoreProject } from "@/lib/project-actions"
import { toast } from "@/lib/toast-utils"
import { ArchiveRestore } from "lucide-react"

interface Project {
  id: string
  name: string
  description: string
  status: "completed" | "on-hold"
  taskCount: number
  archivedAt: string
}

export function ArchivedProjectList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [restoringId, setRestoringId] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getArchivedProjects()
        setProjects(data)
      } catch (error) {
        console.error("Failed to fetch archived projects:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const handleRestore = async (id: string) => {
    setRestoringId(id)
    try {
      await restoreProject(id)
      setProjects(projects.filter((p) => p.id !== id))
      toast.success("Khôi phục thành công", {
        description: "Dự án đã được khôi phục.",
      })
    } catch (error) {
      console.error("Failed to restore project:", error)
      toast.error("Lỗi", {
        description: "Không thể khôi phục dự án. Vui lòng thử lại sau.",
      })
    } finally {
      setRestoringId(null)
    }
  }

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
        <h3 className="text-lg font-medium">Không có dự án nào đã lưu trữ</h3>
        <p className="text-muted-foreground mt-1">Các dự án đã lưu trữ sẽ xuất hiện ở đây.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card key={project.id} className="border-dashed">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{project.name}</CardTitle>
              <Badge variant={project.status === "completed" ? "success" : "secondary"}>
                {project.status === "completed" ? "Hoàn thành" : "Tạm dừng"}
              </Badge>
            </div>
            <CardDescription>{project.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{project.taskCount} công việc</p>
            <p className="text-sm text-muted-foreground mt-1">
              Lưu trữ lúc: {new Date(project.archivedAt).toLocaleDateString("vi-VN")}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRestore(project.id)}
              disabled={restoringId === project.id}
            >
              <ArchiveRestore className="mr-2 h-4 w-4" />
              {restoringId === project.id ? "Đang khôi phục..." : "Khôi phục"}
            </Button>
            <Link href={`/projects/${project.id}`}>
              <Button size="sm">Xem chi tiết</Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
