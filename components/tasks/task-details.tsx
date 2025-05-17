"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { getTask, deleteTask, addComment } from "@/lib/task-actions"
import { Trash2, MessageSquare, Clock } from "lucide-react"
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

interface TaskDetailsProps {
  projectId: string
  taskId: string
}

interface Task {
  id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "done"
  priority: "low" | "medium" | "high"
  assignee: {
    name: string
    avatar?: string
  }
  createdAt: string
  comments: {
    id: string
    user: {
      name: string
      avatar?: string
    }
    content: string
    createdAt: string
  }[]
}

export function TaskDetails({ projectId, taskId }: TaskDetailsProps) {
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchTask = async () => {
      try {
        // In a real app, this would fetch from a backend
        const data = await getTask(projectId, taskId)
        setTask(data)
      } catch (error) {
        console.error("Failed to fetch task:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTask()
  }, [projectId, taskId])

  const handleDeleteTask = async () => {
    try {
      // In a real app, this would delete the task in the backend
      await deleteTask(projectId, taskId)
      router.push(`/projects/${projectId}`)
      router.refresh()
    } catch (error) {
      console.error("Failed to delete task:", error)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return

    setIsSubmitting(true)
    try {
      // In a real app, this would add a comment in the backend
      const newComment = await addComment(projectId, taskId, comment)
      setTask((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          comments: [...prev.comments, newComment],
        }
      })
      setComment("")
    } catch (error) {
      console.error("Failed to add comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-[300px]" />
          <div className="flex gap-2 mt-2">
            <Skeleton className="h-5 w-[80px]" />
            <Skeleton className="h-5 w-[80px]" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    )
  }

  if (!task) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <h3 className="text-lg font-medium">Không tìm thấy công việc</h3>
          <p className="text-muted-foreground mt-1">Công việc này có thể đã bị xóa hoặc không tồn tại.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{task.title}</CardTitle>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xóa công việc?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Hành động này không thể hoàn tác. Công việc này sẽ bị xóa vĩnh viễn.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteTask}>Xóa</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant={task.status === "todo" ? "outline" : task.status === "in-progress" ? "default" : "success"}>
              {task.status === "todo" ? "Cần làm" : task.status === "in-progress" ? "Đang thực hiện" : "Hoàn thành"}
            </Badge>
            <Badge
              variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"}
            >
              {task.priority === "high"
                ? "Ưu tiên cao"
                : task.priority === "medium"
                  ? "Ưu tiên trung bình"
                  : "Ưu tiên thấp"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Mô tả</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{task.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium">Người thực hiện:</h3>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={task.assignee?.avatar || "/placeholder.svg?height=24&width=24"}
                  alt={task.assignee?.name}
                />
                <AvatarFallback className="text-[10px]">
                  {task.assignee?.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{task.assignee?.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Tạo lúc: {new Date(task.createdAt).toLocaleString("vi-VN")}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Bình luận ({task.comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {task.comments.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Chưa có bình luận nào.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {task.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={comment.user.avatar || "/placeholder.svg?height=32&width=32"}
                      alt={comment.user.name}
                    />
                    <AvatarFallback>
                      {comment.user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{comment.user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleString("vi-VN")}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <form onSubmit={handleAddComment} className="w-full">
            <div className="flex gap-2 w-full">
              <Textarea
                placeholder="Thêm bình luận..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="flex-1 resize-none"
              />
              <Button type="submit" disabled={isSubmitting || !comment.trim()}>
                Gửi
              </Button>
            </div>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
