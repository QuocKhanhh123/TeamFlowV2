"use server"

import prisma from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-utils"
import { revalidatePath } from "next/cache"
import { MemberRole, InvitationStatus } from "@prisma/client"

// Lấy danh sách thành viên trong nhóm
export async function getTeamMembers() {
  const user = await requireAuth()

  try {
    // Lấy tất cả người dùng là thành viên của các dự án mà người dùng hiện tại tham gia
    const projectMembers = await prisma.projectMember.findMany({
      where: {
        project: {
          OR: [
            { ownerId: user.id as string },
            {
              members: {
                some: { userId: user.id as string },
              },
            },
          ],
        },
      },
      include: {
        user: true,
      },
      distinct: ["userId"],
    })

    // Lọc và định dạng dữ liệu
    const members = projectMembers.map((member) => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      role: member.role,
      joinedAt: member.joinedAt.toISOString(),
      lastActive: member.user.lastActive.toISOString(),
    }))

    // Sắp xếp theo vai trò và thời gian tham gia
    return members.sort((a, b) => {
      // Sắp xếp theo vai trò: OWNER > ADMIN > MEMBER
      if (a.role !== b.role) {
        if (a.role === MemberRole.OWNER) return -1
        if (b.role === MemberRole.OWNER) return 1
        if (a.role === MemberRole.ADMIN) return -1
        if (b.role === MemberRole.ADMIN) return 1
      }

      // Nếu vai trò giống nhau, sắp xếp theo thời gian tham gia (mới nhất lên đầu)
      return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
    })
  } catch (error) {
    console.error("Get team members error:", error)
    throw new Error("Không thể lấy danh sách thành viên. Vui lòng thử lại.")
  }
}

// Lấy thống kê về thành viên trong nhóm
export async function getTeamStats() {
  const user = await requireAuth()

  try {
    // Lấy tất cả thành viên trong các dự án mà người dùng hiện tại tham gia
    const projectMembers = await prisma.projectMember.findMany({
      where: {
        project: {
          OR: [
            { ownerId: user.id as string },
            {
              members: {
                some: { userId: user.id as string },
              },
            },
          ],
        },
      },
      include: {
        user: true,
      },
      distinct: ["userId"],
    })

    // Lấy tất cả lời mời đang chờ
    const pendingInvitations = await prisma.projectInvitation.findMany({
      where: {
        status: InvitationStatus.PENDING,
        project: {
          OR: [
            { ownerId: user.id as string },
            {
              members: {
                some: { userId: user.id as string },
              },
            },
          ],
        },
      },
    })

    // Tính toán thống kê
    const totalMembers = projectMembers.length
    const pendingInvitationsCount = pendingInvitations.length
    const activeMembers = projectMembers.filter(
      (member) => new Date(member.user.lastActive) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    ).length
    const admins = projectMembers.filter(
      (member) => member.role === MemberRole.OWNER || member.role === MemberRole.ADMIN,
    ).length

    return {
      totalMembers,
      pendingInvitations: pendingInvitationsCount,
      activeMembers,
      admins,
    }
  } catch (error) {
    console.error("Get team stats error:", error)
    throw new Error("Không thể lấy thống kê thành viên. Vui lòng thử lại.")
  }
}

// Cập nhật vai trò của thành viên
export async function updateMemberRole(memberId: string, newRole: "admin" | "member") {
  const user = await requireAuth()

  try {
    // Kiểm tra người dùng có quyền cập nhật vai trò không
    const canUpdateRole = await checkRoleUpdatePermission(user.id as string, memberId)

    if (!canUpdateRole) {
      throw new Error("Bạn không có quyền cập nhật vai trò của thành viên này")
    }

    // Lấy tất cả dự án mà cả hai người dùng đều tham gia
    const sharedProjects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: user.id as string },
          {
            members: {
              some: {
                userId: user.id as string,
                role: { in: [MemberRole.OWNER, MemberRole.ADMIN] },
              },
            },
          },
        ],
        members: {
          some: { userId: memberId },
        },
      },
      select: { id: true },
    })

    // Cập nhật vai trò trong tất cả các dự án chung
    for (const project of sharedProjects) {
      await prisma.projectMember.updateMany({
        where: {
          projectId: project.id,
          userId: memberId,
          // Không cho phép cập nhật vai trò của chủ sở hữu
          role: { not: MemberRole.OWNER },
        },
        data: {
          role: newRole === "admin" ? MemberRole.ADMIN : MemberRole.MEMBER,
        },
      })
    }

    revalidatePath("/dashboard/team")
    return true
  } catch (error) {
    console.error("Update member role error:", error)
    throw new Error("Không thể cập nhật vai trò thành viên. Vui lòng thử lại.")
  }
}

// Xóa thành viên khỏi nhóm
export async function removeMember(memberId: string) {
  const user = await requireAuth()

  try {
    // Kiểm tra người dùng có quyền xóa thành viên không
    const canRemoveMember = await checkRemoveMemberPermission(user.id as string, memberId)

    if (!canRemoveMember) {
      throw new Error("Bạn không có quyền xóa thành viên này")
    }

    // Lấy tất cả dự án mà cả hai người dùng đều tham gia
    const sharedProjects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: user.id as string },
          {
            members: {
              some: {
                userId: user.id as string,
                role: { in: [MemberRole.OWNER, MemberRole.ADMIN] },
              },
            },
          },
        ],
        members: {
          some: {
            userId: memberId,
            // Không cho phép xóa chủ sở hữu
            role: { not: MemberRole.OWNER },
          },
        },
      },
      select: { id: true },
    })

    // Xóa thành viên khỏi tất cả các dự án chung
    for (const project of sharedProjects) {
      await prisma.projectMember.deleteMany({
        where: {
          projectId: project.id,
          userId: memberId,
          // Không cho phép xóa chủ sở hữu
          role: { not: MemberRole.OWNER },
        },
      })
    }

    revalidatePath("/dashboard/team")
    return true
  } catch (error) {
    console.error("Remove member error:", error)
    throw new Error("Không thể xóa thành viên. Vui lòng thử lại.")
  }
}

// Mời thành viên mới
export async function inviteTeamMember(data: { email: string; role: "admin" | "member" }) {
  const user = await requireAuth()

  try {
    // Kiểm tra email có tồn tại không
    const invitedUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    // Lấy tất cả dự án mà người dùng hiện tại là chủ sở hữu hoặc admin
    const userProjects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: user.id as string },
          {
            members: {
              some: {
                userId: user.id as string,
                role: { in: [MemberRole.OWNER, MemberRole.ADMIN] },
              },
            },
          },
        ],
      },
      select: { id: true },
    })

    if (userProjects.length === 0) {
      throw new Error("Bạn không có quyền mời thành viên vào bất kỳ dự án nào")
    }

    // Tạo lời mời cho mỗi dự án
    const invitations = []

    for (const project of userProjects) {
      // Kiểm tra xem người dùng đã là thành viên của dự án chưa
      if (invitedUser) {
        const existingMember = await prisma.projectMember.findUnique({
          where: {
            userId_projectId: {
              userId: invitedUser.id,
              projectId: project.id,
            },
          },
        })

        if (existingMember) {
          continue // Bỏ qua dự án mà người dùng đã là thành viên
        }
      }

      // Kiểm tra xem đã có lời mời đang chờ cho email và dự án này chưa
      const existingInvitation = await prisma.projectInvitation.findUnique({
        where: {
          receiverEmail_projectId: {
            receiverEmail: data.email,
            projectId: project.id,
          },
        },
      })

      if (existingInvitation && existingInvitation.status === InvitationStatus.PENDING) {
        continue // Bỏ qua dự án đã có lời mời đang chờ
      }

      // Tạo lời mời mới hoặc cập nhật lời mời cũ
      const invitation = await prisma.projectInvitation.upsert({
        where: {
          receiverEmail_projectId: {
            receiverEmail: data.email,
            projectId: project.id,
          },
        },
        update: {
          role: data.role === "admin" ? MemberRole.ADMIN : MemberRole.MEMBER,
          status: InvitationStatus.PENDING,
          sentAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày
        },
        create: {
          receiverEmail: data.email,
          role: data.role === "admin" ? MemberRole.ADMIN : MemberRole.MEMBER,
          status: InvitationStatus.PENDING,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày
          sender: {
            connect: { id: user.id as string },
          },
          project: {
            connect: { id: project.id },
          },
        },
      })

      invitations.push(invitation)
    }

    // Trong ứng dụng thực tế, bạn sẽ gửi email thông báo ở đây

    revalidatePath("/dashboard/team")
    return invitations
  } catch (error) {
    console.error("Invite team member error:", error)
    throw new Error("Không thể mời thành viên. Vui lòng thử lại.")
  }
}

// Lấy danh sách lời mời đang chờ
export async function getPendingInvitations() {
  const user = await requireAuth()

  try {
    // Lấy tất cả lời mời đang chờ trong các dự án mà người dùng hiện tại là chủ sở hữu hoặc admin
    const pendingInvitations = await prisma.projectInvitation.findMany({
      where: {
        status: InvitationStatus.PENDING,
        project: {
          OR: [
            { ownerId: user.id as string },
            {
              members: {
                some: {
                  userId: user.id as string,
                  role: { in: [MemberRole.OWNER, MemberRole.ADMIN] },
                },
              },
            },
          ],
        },
      },
      orderBy: { sentAt: "desc" },
    })

    return pendingInvitations.map((invitation) => ({
      id: invitation.id,
      email: invitation.receiverEmail,
      role: invitation.role,
      sentAt: invitation.sentAt.toISOString(),
      expiresAt: invitation.expiresAt.toISOString(),
    }))
  } catch (error) {
    console.error("Get pending invitations error:", error)
    throw new Error("Không thể lấy danh sách lời mời đang chờ. Vui lòng thử lại.")
  }
}

// Hủy lời mời
export async function cancelInvitation(invitationId: string) {
  const user = await requireAuth()

  try {
    // Kiểm tra lời mời có tồn tại không và người dùng có quyền hủy không
    const invitation = await prisma.projectInvitation.findFirst({
      where: {
        id: invitationId,
        project: {
          OR: [
            { ownerId: user.id as string },
            {
              members: {
                some: {
                  userId: user.id as string,
                  role: { in: [MemberRole.OWNER, MemberRole.ADMIN] },
                },
              },
            },
          ],
        },
      },
    })

    if (!invitation) {
      throw new Error("Lời mời không tồn tại hoặc bạn không có quyền hủy")
    }

    // Xóa lời mời
    await prisma.projectInvitation.delete({
      where: { id: invitationId },
    })

    revalidatePath("/dashboard/team")
    return true
  } catch (error) {
    console.error("Cancel invitation error:", error)
    throw new Error("Không thể hủy lời mời. Vui lòng thử lại.")
  }
}

// Gửi lại lời mời
export async function resendInvitation(invitationId: string) {
  const user = await requireAuth()

  try {
    // Kiểm tra lời mời có tồn tại không và người dùng có quyền gửi lại không
    const invitation = await prisma.projectInvitation.findFirst({
      where: {
        id: invitationId,
        project: {
          OR: [
            { ownerId: user.id as string },
            {
              members: {
                some: {
                  userId: user.id as string,
                  role: { in: [MemberRole.OWNER, MemberRole.ADMIN] },
                },
              },
            },
          ],
        },
      },
    })

    if (!invitation) {
      throw new Error("Lời mời không tồn tại hoặc bạn không có quyền gửi lại")
    }

    // Cập nhật thời gian gửi và hết hạn
    const updatedInvitation = await prisma.projectInvitation.update({
      where: { id: invitationId },
      data: {
        sentAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày
        status: InvitationStatus.PENDING,
      },
    })

    // Trong ứng dụng thực tế, bạn sẽ gửi email thông báo ở đây

    revalidatePath("/dashboard/team")
    return {
      id: updatedInvitation.id,
      email: updatedInvitation.receiverEmail,
      role: updatedInvitation.role,
      sentAt: updatedInvitation.sentAt.toISOString(),
      expiresAt: updatedInvitation.expiresAt.toISOString(),
    }
  } catch (error) {
    console.error("Resend invitation error:", error)
    throw new Error("Không thể gửi lại lời mời. Vui lòng thử lại.")
  }
}

// Hàm kiểm tra người dùng có quyền cập nhật vai trò không
async function checkRoleUpdatePermission(userId: string, targetUserId: string) {
  // Không cho phép cập nhật vai trò của chính mình
  if (userId === targetUserId) {
    return false
  }

  // Kiểm tra người dùng có phải là chủ sở hữu hoặc admin của bất kỳ dự án nào mà người dùng mục tiêu tham gia không
  const sharedProjects = await prisma.project.findMany({
    where: {
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
      members: {
        some: { userId: targetUserId },
      },
    },
  })

  return sharedProjects.length > 0
}

// Hàm kiểm tra người dùng có quyền xóa thành viên không
async function checkRemoveMemberPermission(userId: string, targetUserId: string) {
  // Không cho phép xóa chính mình
  if (userId === targetUserId) {
    return false
  }

  // Kiểm tra người dùng có phải là chủ sở hữu hoặc admin của bất kỳ dự án nào mà người dùng mục tiêu tham gia không
  const sharedProjects = await prisma.project.findMany({
    where: {
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
      members: {
        some: {
          userId: targetUserId,
          // Không cho phép xóa chủ sở hữu
          role: { not: MemberRole.OWNER },
        },
      },
    },
  })

  return sharedProjects.length > 0
}
