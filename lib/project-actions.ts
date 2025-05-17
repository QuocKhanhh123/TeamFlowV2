"use server"

import prisma from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-utils"
import { revalidatePath } from "next/cache"
import { ProjectStatus, MemberRole, InvitationStatus } from "@prisma/client"

// Lấy danh sách dự án của người dùng hiện tại
export async function getProjects() {
  const user = await requireAuth()

  try {
    // Lấy dự án mà người dùng là thành viên
    const projectMembers = await prisma.projectMember.findMany({
      where: { userId: user.id as string },
      include: {
        project: {
          include: {
            tasks: true,
            members: true,
          },
        },
      },
    })

    // Lấy dự án mà người dùng là chủ sở hữu
    const ownedProjects = await prisma.project.findMany({
      where: { ownerId: user.id as string },
      include: {
        tasks: true,
        members: true,
      },
    })

    // Kết hợp và loại bỏ trùng lặp
    const memberProjects = projectMembers.map((pm) => pm.project)
    const allProjects = [...ownedProjects]

    // Thêm các dự án mà người dùng là thành viên nhưng không phải chủ sở hữu
    memberProjects.forEach((project) => {
      if (!allProjects.some((p) => p.id === project.id)) {
        allProjects.push(project)
      }
    })

    // Định dạng dữ liệu trả về
    return allProjects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      taskCount: project.tasks.length,
      memberCount: project.members.length,
      createdAt: project.createdAt.toISOString(),
    }))
  } catch (error) {
    console.error("Get projects error:", error)
    throw new Error("Không thể lấy danh sách dự án. Vui lòng thử lại.")
  }
}

// Lấy thông tin chi tiết của một dự án
export async function getProject(id: string) {
  const user = await requireAuth()

  try {
    // Kiểm tra người dùng có quyền truy cập dự án không
    const projectAccess = await checkProjectAccess(id, user.id as string)

    if (!projectAccess) {
      throw new Error("Bạn không có quyền truy cập dự án này")
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    if (!project) {
      throw new Error("Dự án không tồn tại")
    }

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      createdAt: project.createdAt.toISOString(),
      owner: project.owner,
      members: project.members.map((member) => ({
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        role: member.role,
        joinedAt: member.joinedAt.toISOString(),
      })),
    }
  } catch (error) {
    console.error("Get project error:", error)
    throw new Error("Không thể lấy thông tin dự án. Vui lòng thử lại.")
  }
}

// Tạo dự án mới
export async function createProject(data: { name: string; description: string }) {
  const user = await requireAuth()

  try {
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        status: ProjectStatus.ACTIVE,
        owner: {
          connect: { id: user.id as string },
        },
        members: {
          create: {
            user: {
              connect: { id: user.id as string },
            },
            role: MemberRole.OWNER,
          },
        },
      },
    })

    revalidatePath("/dashboard")
    return project.id
  } catch (error) {
    console.error("Create project error:", error)
    throw new Error("Không thể tạo dự án. Vui lòng thử lại.")
  }
}

// Cập nhật thông tin dự án
export async function updateProject(id: string, data: { name?: string; description?: string; status?: ProjectStatus }) {
  const user = await requireAuth()

  try {
    // Kiểm tra người dùng có quyền chỉnh sửa dự án không
    const canEdit = await checkProjectEditPermission(id, user.id as string)

    if (!canEdit) {
      throw new Error("Bạn không có quyền chỉnh sửa dự án này")
    }

    const project = await prisma.project.update({
      where: { id },
      data,
    })

    revalidatePath(`/projects/${id}`)
    return project
  } catch (error) {
    console.error("Update project error:", error)
    throw new Error("Không thể cập nhật dự án. Vui lòng thử lại.")
  }
}

// Xóa dự án
export async function deleteProject(id: string) {
  const user = await requireAuth()

  try {
    // Kiểm tra người dùng có phải là chủ sở hữu dự án không
    const project = await prisma.project.findUnique({
      where: { id },
      select: { ownerId: true },
    })

    if (!project) {
      throw new Error("Dự án không tồn tại")
    }

    if (project.ownerId !== user.id) {
      throw new Error("Chỉ chủ sở hữu mới có thể xóa dự án")
    }

    await prisma.project.delete({
      where: { id },
    })

    revalidatePath("/dashboard")
    return true
  } catch (error) {
    console.error("Delete project error:", error)
    throw new Error("Không thể xóa dự án. Vui lòng thử lại.")
  }
}

// Lưu trữ dự án
export async function archiveProject(id: string) {
  const user = await requireAuth()

  try {
    // Kiểm tra người dùng có quyền chỉnh sửa dự án không
    const canEdit = await checkProjectEditPermission(id, user.id as string)

    if (!canEdit) {
      throw new Error("Bạn không có quyền lưu trữ dự án này")
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        archivedAt: new Date(),
      },
    })

    revalidatePath("/dashboard")
    return project
  } catch (error) {
    console.error("Archive project error:", error)
    throw new Error("Không thể lưu trữ dự án. Vui lòng thử lại.")
  }
}

// Khôi phục dự án đã lưu trữ
export async function restoreProject(id: string) {
  const user = await requireAuth()

  try {
    // Kiểm tra người dùng có quyền chỉnh sửa dự án không
    const canEdit = await checkProjectEditPermission(id, user.id as string)

    if (!canEdit) {
      throw new Error("Bạn không có quyền khôi phục dự án này")
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        archivedAt: null,
      },
    })

    revalidatePath("/dashboard")
    return project
  } catch (error) {
    console.error("Restore project error:", error)
    throw new Error("Không thể khôi phục dự án. Vui lòng thử lại.")
  }
}

// Lấy danh sách dự án đã lưu trữ
export async function getArchivedProjects() {
  const user = await requireAuth()

  try {
    // Lấy dự án đã lưu trữ mà người dùng là thành viên hoặc chủ sở hữu
    const projects = await prisma.project.findMany({
      where: {
        archivedAt: { not: null },
        OR: [
          { ownerId: user.id as string },
          {
            members: {
              some: { userId: user.id as string },
            },
          },
        ],
      },
      include: {
        tasks: true,
      },
    })

    return projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      taskCount: project.tasks.length,
      archivedAt: project.archivedAt?.toISOString() || "",
    }))
  } catch (error) {
    console.error("Get archived projects error:", error)
    throw new Error("Không thể lấy danh sách dự án đã lưu trữ. Vui lòng thử lại.")
  }
}

// Lấy thống kê về dự án
export async function getProjectsStats() {
  const user = await requireAuth()

  try {
    // Lấy tất cả dự án mà người dùng tham gia
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
    })

    // Tính toán thống kê
    const total = projects.length
    const active = projects.filter((p) => p.status === ProjectStatus.ACTIVE && !p.archivedAt).length
    const completed = projects.filter((p) => p.status === ProjectStatus.COMPLETED && !p.archivedAt).length
    const onHold = projects.filter((p) => p.status === ProjectStatus.ON_HOLD && !p.archivedAt).length

    return {
      total,
      active,
      completed,
      onHold,
    }
  } catch (error) {
    console.error("Get projects stats error:", error)
    throw new Error("Không thể lấy thống kê dự án. Vui lòng thử lại.")
  }
}

// Lấy danh sách dự án có thể tham gia
export async function getJoinableProjects() {
  const user = await requireAuth()

  try {
    // Lấy tất cả dự án công khai mà người dùng chưa tham gia
    const joinableProjects = await prisma.project.findMany({
      where: {
        status: ProjectStatus.ACTIVE,
        archivedAt: null,
        AND: [
          { ownerId: { not: user.id as string } },
          {
            members: {
              none: { userId: user.id as string },
            },
          },
          {
            invitations: {
              none: {
                receiverEmail: user.email as string,
                status: InvitationStatus.PENDING,
              },
            },
          },
        ],
      },
      include: {
        owner: {
          select: {
            name: true,
          },
        },
        members: true,
      },
      take: 10, // Giới hạn số lượng dự án trả về
    })

    return joinableProjects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      memberCount: project.members.length,
      owner: {
        name: project.owner.name,
      },
    }))
  } catch (error) {
    console.error("Get joinable projects error:", error)
    throw new Error("Không thể lấy danh sách dự án có thể tham gia. Vui lòng thử lại.")
  }
}

// Tham gia dự án
export async function joinProject(projectId: string) {
  const user = await requireAuth()

  try {
    // Kiểm tra dự án có tồn tại không
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      throw new Error("Dự án không tồn tại")
    }

    // Kiểm tra người dùng đã là thành viên chưa
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: user.id as string,
          projectId,
        },
      },
    })

    if (existingMember) {
      throw new Error("Bạn đã là thành viên của dự án này")
    }

    // Thêm người dùng vào dự án
    await prisma.projectMember.create({
      data: {
        user: {
          connect: { id: user.id as string },
        },
        project: {
          connect: { id: projectId },
        },
        role: MemberRole.MEMBER,
      },
    })

    revalidatePath("/dashboard")
    return true
  } catch (error) {
    console.error("Join project error:", error)
    throw new Error("Không thể tham gia dự án. Vui lòng thử lại.")
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

// Hàm kiểm tra người dùng có quyền chỉnh sửa dự án không
async function checkProjectEditPermission(projectId: string, userId: string) {
  // Kiểm tra người dùng có phải là chủ sở hữu hoặc admin của dự án không
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: userId },
        {
          members: {
            some: {
              userId,
              role: { in: [MemberRole.OWNER, MemberRole.ADMIN] },
            },
          },
        },
      ],
    },
  })

  return !!project
}
