"use server"

import prisma from "./db"
import { requireAuth } from "./auth"
import { revalidatePath } from "next/cache"

// Cập nhật thông tin cá nhân
export async function updateUserProfile(data: { name: string }) {
  const user = await requireAuth()

  try {
    await prisma.user.update({
      where: { id: user.id as string },
      data: {
        name: data.name,
      },
    })

    revalidatePath("/dashboard/profile")
    return true
  } catch (error) {
    console.error("Update user profile error:", error)
    throw new Error("Không thể cập nhật thông tin cá nhân. Vui lòng thử lại.")
  }
}

// Lấy hoạt động gần đây của người dùng
export async function getUserActivity() {
  const user = await requireAuth()

  try {
    // Lấy các dự án gần đây
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: user.id as string },
          {
            members: {
              some: { userId: user.id as string },
            },
          },
        ],
      },
      orderBy: { updatedAt: "desc" },
      take: 3,
    })

    // Lấy các công việc gần đây
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { assigneeId: user.id as string },
          {
            project: {
              ownerId: user.id as string,
            },
          },
        ],
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    })

    // Lấy các bình luận gần đây
    const comments = await prisma.comment.findMany({
      where: { userId: user.id as string },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            projectId: true,
            project: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    })

    // Kết hợp và sắp xếp theo thời gian
    const activities = [
      ...projects.map((project) => ({
        id: `project-${project.id}`,
        type: "project" as const,
        title: `Dự án: ${project.name}`,
        description: project.description,
        timestamp: project.updatedAt.toISOString(),
        projectId: project.id,
        projectName: project.name,
      })),
      ...tasks.map((task) => ({
        id: `task-${task.id}`,
        type: "task" as const,
        title: `Công việc: ${task.title}`,
        description: task.description,
        timestamp: task.updatedAt.toISOString(),
        projectId: task.projectId,
        projectName: task.project.name,
        taskId: task.id,
      })),
      ...comments.map((comment) => ({
        id: `comment-${comment.id}`,
        type: "comment" as const,
        title: `Bình luận về công việc: ${comment.task.title}`,
        description: comment.content,
        timestamp: comment.createdAt.toISOString(),
        projectId: comment.task.projectId,
        projectName: comment.task.project.name,
        taskId: comment.task.id,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return activities.slice(0, 10) // Giới hạn 10 hoạt động gần nhất
  } catch (error) {
    console.error("Get user activity error:", error)
    return []
  }
}

// Lấy thống kê về người dùng
export async function getUserStats() {
  const user = await requireAuth()

  try {
    // Số lượng dự án tham gia
    const projectCount = await prisma.projectMember.count({
      where: { userId: user.id as string },
    })

    // Số lượng dự án sở hữu
    const ownedProjectCount = await prisma.project.count({
      where: { ownerId: user.id as string },
    })

    // Số lượng công việc được giao
    const assignedTaskCount = await prisma.task.count({
      where: { assigneeId: user.id as string },
    })

    // Số lượng công việc đã hoàn thành
    const completedTaskCount = await prisma.task.count({
      where: {
        assigneeId: user.id as string,
        status: "DONE",
      },
    })

    // Số lượng bình luận
    const commentCount = await prisma.comment.count({
      where: { userId: user.id as string },
    })

    return {
      projectCount,
      ownedProjectCount,
      assignedTaskCount,
      completedTaskCount,
      commentCount,
    }
  } catch (error) {
    console.error("Get user stats error:", error)
    return {
      projectCount: 0,
      ownedProjectCount: 0,
      assignedTaskCount: 0,
      completedTaskCount: 0,
      commentCount: 0,
    }
  }
}
