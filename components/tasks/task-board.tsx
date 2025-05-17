"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { getTasks, updateTaskStatus } from "@/lib/task-actions"
import Link from "next/link"

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
}

interface Column {
  id: "TODO" | "IN_PROGRESS" | "DONE"
  title: string
  tasks: Task[]
}

interface TaskBoardProps {
  projectId: string
}

export function TaskBoard({ projectId }: TaskBoardProps) {
  const [columns, setColumns] = useState<any[]>([
    { id: "TODO", title: "Cần làm", tasks: [] },
    { id: "IN_PROGRESS", title: "Đang thực hiện", tasks: [] },
    { id: "DONE", title: "Hoàn thành", tasks: [] },
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // In a real app, this would fetch from a backend
        const tasks = await getTasks(projectId)

        // Group tasks by status
        const newColumns = columns.map((column) => ({
          ...column,
          tasks: tasks.filter((task) => task.status === column.id),
        }))

        setColumns(newColumns)
      } catch (error) {
        console.error("Failed to fetch tasks:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [projectId])

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result

    // If there's no destination or the item was dropped back to its original position
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return
    }

    // Find the task that was dragged
    const sourceColumn = columns.find((col) => col.id === source.droppableId)
    const task = sourceColumn?.tasks.find((t) => t.id === draggableId)

    if (!task) return

    // Create a new array of columns
    const newColumns = columns.map((column) => {
      // Remove from source column
      if (column.id === source.droppableId) {
        return {
          ...column,
          tasks: column.tasks.filter((t) => t.id !== draggableId),
        }
      }

      // Add to destination column
      if (column.id === destination.droppableId) {
        const newTasks = [...column.tasks]
        newTasks.splice(destination.index, 0, {
          ...task,
          status: destination.droppableId as "todo" | "in-progress" | "done",
        })
        return {
          ...column,
          tasks: newTasks,
        }
      }

      return column
    })

    setColumns(newColumns)

    // Update task status in the backend
    try {
      await updateTaskStatus(projectId, draggableId, destination.droppableId)
    } catch (error) {
      console.error("Failed to update task status:", error)
      // Revert the UI change if the API call fails
      setColumns(columns)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="px-4 py-3">
              <Skeleton className="h-5 w-[100px]" />
            </CardHeader>
            <CardContent className="px-4 py-0">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="mb-3">
                  <Skeleton className="h-[100px] w-full rounded-md" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((column) => (
          <Card key={column.id}>
            <CardHeader className="px-4 py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-md font-medium">{column.title}</CardTitle>
                <Badge variant="outline">{column.tasks.length}</Badge>
              </div>
            </CardHeader>
            <Droppable droppableId={column.id} isDropDisabled={loading} isCombineEnabled ={false} ignoreContainerClipping ={false}> 
              {(provided) => (
                <CardContent className="px-4 py-0" {...provided.droppableProps} ref={provided.innerRef}>
                  {column.tasks.length === 0 ? (
                    <div className="flex items-center justify-center h-24 border border-dashed rounded-md my-2">
                      <p className="text-sm text-muted-foreground">Không có công việc nào</p>
                    </div>
                  ) : (
                    column.tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <Link href={`/projects/${projectId}/tasks/${task.id}`}>
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="p-3 mb-3 bg-card border rounded-md shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-medium text-sm">{task.title}</h3>
                                  <Badge
                                    variant={
                                      task.priority === "high"
                                        ? "destructive"
                                        : task.priority === "medium"
                                          ? "default"
                                          : "secondary"
                                    }
                                    className="text-[10px]"
                                  >
                                    {task.priority === "high"
                                      ? "Cao"
                                      : task.priority === "medium"
                                        ? "Trung bình"
                                        : "Thấp"}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex items-center">
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
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </CardContent>
              )}
            </Droppable>
          </Card>
        ))}
      </div>
    </DragDropContext>
  )
}
