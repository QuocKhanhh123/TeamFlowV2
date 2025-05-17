"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { getProject } from "@/lib/project-actions"
import { Skeleton } from "@/components/ui/skeleton"

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
}

export function ProjectHeader({ id, heading, text, children }: ProjectHeaderProps) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <div className="flex items-center justify-between px-2 mb-6">
        <div className="grid gap-1">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between px-2 mb-6">
      <div className="grid gap-1">
        <h1 className="font-heading text-3xl md:text-4xl">{project?.name || heading}</h1>
        <p className="text-lg text-muted-foreground">{project?.description || text}</p>
      </div>
      {children}
    </div>
  )
}
