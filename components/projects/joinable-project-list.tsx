"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { getJoinableProjects, joinProject } from "@/lib/project-actions"
import { toast } from "@/lib/toast-utils"
import { Users } from "lucide-react"

interface Project {
  id: string
  name: string
  description: string
  status: "active" | "completed" | "on-hold"
  memberCount: number
  owner: {
    name: string
  }
}

export function JoinableProjectList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [joiningProjectId, setJoiningProjectId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // In a real app, this would fetch from a backend
        const data = await getJoinableProjects()
        setProjects(data)
      } catch (error) {
        console.error("Failed to fetch joinable projects:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const handleJoinProject = async (projectId: string) => {
    setJoiningProjectId(projectId)
    try {
      // In a real app, this would join the project in the backend
      await joinProject(projectId)
      toast.success("Tham gia thành công", {
        description: "Bạn đã tham gia dự án thành công.",
      })
      // Remove the project from the list
      setProjects(projects.filter((p) => p.id !== projectId))
      router.refresh()
    } catch (error) {
      console.error("Failed to join project:", error)
      toast.error("Lỗi", {
        description: "Không thể tham gia dự án. Vui lòng thử lại sau.",
      })
    } finally {
      setJoiningProjectId(null)
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
        <h3 className="text-lg font-medium">Không có dự án nào để tham gia</h3>
        <p className="text-muted-foreground mt-1">Hiện tại không có dự án nào có sẵn để bạn tham gia.</p>
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
                  project.status === "active" ? "default" : project.status === "completed" ? "success" : "secondary"
                }
              >
                {project.status === "active"
                  ? "Đang hoạt động"
                  : project.status === "completed"
                    ? "Hoàn thành"
                    : "Tạm dừng"}
              </Badge>
            </div>
            <CardDescription>{project.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{project.memberCount} thành viên</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Chủ dự án: {project.owner.name}</p>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={() => handleJoinProject(project.id)} disabled={joiningProjectId === project.id}>
              {joiningProjectId === project.id ? "Đang tham gia..." : "Tham gia dự án"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
