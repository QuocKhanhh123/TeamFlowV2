"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { getProject } from "@/lib/project-actions"
import { Skeleton } from "@/components/ui/skeleton"
import { EditProjectButton } from "@/components/projects/edit-project-button"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface ProjectHeaderProps {
  id: string
  heading?: string
  text?: string
  children?: React.ReactNode
}

interface Project {
  id: string
  name: string
  description: string
  status: "ACTIVE" | "COMPLETED" | "ON_HOLD"
}

export function ProjectHeader({ id, heading, text, children }: ProjectHeaderProps) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    const fetchProject = async () => {
      try {
        // In a real app, this would fetch from a backend
        const data = await getProject(id)
        setProject(data)
      } catch (error) {
        console.error("Failed to fetch project:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id])

  const isTasksPage = pathname === `/dashboard/projects/${id}` || pathname.startsWith(`/dashboard/projects/${id}/tasks`)
  const isMembersPage = pathname === `/dashboard/projects/${id}/members`

  if (loading) {
    return (
      <div className="flex flex-col space-y-4 px-2 mb-6">
        <div className="flex items-center justify-between">
          <div className="grid gap-1">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
          <Skeleton className="h-10 w-[150px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-4 px-2 mb-6">
      <div className="flex items-center justify-between">
        <div className="grid gap-1">
          <h1 className="font-heading text-3xl md:text-4xl">{project?.name || heading}</h1>
          <p className="text-lg text-muted-foreground">{project?.description || text}</p>
        </div>
        {project && <EditProjectButton projectId={id} initialData={project} />}
      </div>

      <div className="border-b">
        <div className="flex">
          <Link href={`/dashboard/projects/${id}`}>
            <div
              className={`px-4 py-2 ${
                isTasksPage
                  ? "border-b-2 border-primary font-medium text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Công việc
            </div>
          </Link>
          <Link href={`/dashboard/projects/${id}/members`}>
            <div
              className={`px-4 py-2 ${
                isMembersPage
                  ? "border-b-2 border-primary font-medium text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Thành viên
            </div>
          </Link>
        </div>
      </div>

      {children}
    </div>
  )
}
