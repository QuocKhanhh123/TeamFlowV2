"use server"

import prisma from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-utils"
import { revalidatePath } from "next/cache"
import type { TaskStatus, TaskPriority } from "@prisma/client"

// Lấy danh sách công việc trong dự án
export async function getTasks(projectId: string) {
  const user = await requireAuth()

  try {
    // Kiểm tra người dùng có quyền truy cập dự án không
    const hasAccess = await checkProjectAccess(projectId, user.id as string)

    if (!hasAccess) {
      throw new Error("Bạn không có quyền truy cập dự án này")
    }

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignee: task.assignee
        ? {
            id: task.assignee.id,
            name: task.assignee.name,
            email: task.assignee.email,
          }
        : null,
      createdAt: task.createdAt.toISOString(),
    }))
  } catch (error) {
    console.error("Get tasks error:", error)
    throw new Error("Không thể lấy danh sách công việc. Vui lòng thử lại.")
  }
}

// Lấy thông tin chi tiết của một công việc
export async function getTask(projectId: string, taskId: string) {
  const user = await requireAuth()

  try {
    // Kiểm tra người dùng có quyền truy cập dự án không
    const hasAccess = await checkProjectAccess(projectId, user.id as string)

    if (!hasAccess) {
      throw new Error("Bạn không có quyền truy cập dự án này")
    }

    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
        projectId,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    })

    if (!task) {
      throw new Error("Công việc không tồn tại")
    }

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignee: task.assignee
        ? {
            id: task.assignee.id,
            name: task.assignee.name,
            email: task.assignee.email,
          }
        : null,
      createdAt: task.createdAt.toISOString(),
      comments: task.comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        user: {
          id: comment.user.id,
          name: comment.user.name,
          email: comment.user.email,
        },
      })),
    }
  } catch (error) {
    console.error("Get task error:", error)
    throw new Error("Không thể lấy thông tin công việc. Vui lòng thử lại.")
  }
}

// Tạo công việc mới
export async function createTask(
  projectId: string,
  data: {
    title: string
    description: string
    status: string
    priority: string
    assigneeId?: string
  },
) {
  const user = await requireAuth()

  try {
    // Kiểm tra người dùng có quyền truy cập dự án không
    const hasAccess = await checkProjectAccess(projectId, user.id as string)

    if (!hasAccess) {
      throw new Error("Bạn không có quyền truy cập dự án này")
    }

    // Tạo công việc mới
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status.toUpperCase().replace("-", "_") as TaskStatus,
        priority: data.priority.toUpperCase() as TaskPriority,
        project: {
          connect: { id: projectId },
        },
        assignee: data.assigneeId
          ? {
              connect: { id: data.assigneeId },
            }
          : undefined,
      },
    })

    revalidatePath(`/projects/${projectId}`)
    return task.id
  } catch (error) {
    console.error("Create task error:", error)
    throw new Error("Không thể tạo công việc. Vui lòng thử lại.")
  }
}

// Cập nhật trạng thái công việc
export async function updateTaskStatus(projectId: string, taskId: string, status: string) {
  const user = await requireAuth()

  try {
    // Kiểm tra người dùng có quyền truy cập dự án không
    const hasAccess = await checkProjectAccess(projectId, user.id as string)

    if (!hasAccess) {
      throw new Error("Bạn không có quyền truy cập dự án này")
    }

    // Cập nhật trạng thái công việc
    const task = await prisma.task.update({
      where: {
        id: taskId,
        projectId,
      },
      data: {
        status: status as TaskStatus,
      },
    })

    revalidatePath(`/projects/${projectId}`)
    return task
  } catch (error) {
    console.error("Update task status error:", error)
    throw new Error("Không thể cập nhật trạng thái công việc. Vui lòng thử lại.")
  }
}

// Cập nhật thông tin công việc
export async function updateTask(
  projectId: string,
  taskId: string,
  data: {
    title?: string
    description?: string
    status?: string
    priority?: string
    assigneeId?: string | null
  },
) {
  const user = await requireAuth()

  try {
    // Kiểm tra người dùng có quyền truy cập dự án không
    const hasAccess = await checkProjectAccess(projectId, user.id as string)

    if (!hasAccess) {
      throw new Error("Bạn không có quyền truy cập dự án này")
    }

    // Cập nhật thông tin công việc
    const task = await prisma.task.update({
      where: {
        id: taskId,
        projectId,
      },
      data: {
        title: data.title,
        description: data.description,
        status: data.status as TaskStatus | undefined,
        priority: data.priority as TaskPriority | undefined,
        assigneeId: data.assigneeId === null ? null : data.assigneeId,
      },
    })

    revalidatePath(`/projects/${projectId}/tasks/${taskId}`)
    return task
  } catch (error) {
    console.error("Update task error:", error)
    throw new Error("Không thể cập nhật thông tin công việc. Vui lòng thử lại.")
  }
}

// Xóa công việc
export async function deleteTask(projectId: string, taskId: string) {
  const user = await requireAuth()

  try {
    // Kiểm tra người dùng có quyền truy cập dự án không
    const hasAccess = await checkProjectAccess(projectId, user.id as string)

    if (!hasAccess) {
      throw new Error("Bạn không có quyền truy cập dự án này")
    }

    // Xóa công việc
    await prisma.task.delete({
      where: {
        id: taskId,
        projectId,
      },
    })

    revalidatePath(`/projects/${projectId}`)
    return true
  } catch (error) {
    console.error("Delete task error:", error)
    throw new Error("Không thể xóa công việc. Vui lòng thử lại.")
  }
}

// Thêm bình luận cho công việc
export async function addComment(projectId: string, taskId: string, content: string) {
  const user = await requireAuth()

  try {
    // Kiểm tra người dùng có quyền truy cập dự án không
    const hasAccess = await checkProjectAccess(projectId, user.id as string)

    if (!hasAccess) {
      throw new Error("Bạn không có quyền truy cập dự án này")
    }

    // Thêm bình luận
    const comment = await prisma.comment.create({
      data: {
        content,
        task: {
          connect: { id: taskId },
        },
        user: {
          connect: { id: user.id as string },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    revalidatePath(`/projects/${projectId}/tasks/${taskId}`)

    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      user: {
        id: comment.user.id,
        name: comment.user.name,
        email: comment.user.email,
      },
    }
  } catch (error) {
    console.error("Add comment error:", error)
    throw new Error("Không thể thêm bình luận. Vui lòng thử lại.")
  }
}

// Hàm kiểm tra người dùng có quyền truy cập dự án không
async function checkProjectAccess(projectId: string, userId: string) {
  // Kiểm tra người dùng có phải là chủ sở hữu hoặc thành viên của dự án không
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: userId },
        {
          members: {
            some: { userId },
          },
        },
      ],
    },
  })

  return !!project
}
