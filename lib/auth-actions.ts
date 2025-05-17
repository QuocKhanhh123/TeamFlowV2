"use server"

import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import {
  hashPassword,
  comparePassword,
  createToken,
  setAuthCookie,
  removeAuthCookie,
  getCurrentUser,
} from "@/lib/auth-utils"

interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  name: string
  email: string
  password: string
}

export async function loginUser(data: LoginData) {
  try {
    // Tìm người dùng theo email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (!user) {
      throw new Error("Email hoặc mật khẩu không chính xác")
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await comparePassword(data.password, user.password)

    if (!isPasswordValid) {
      throw new Error("Email hoặc mật khẩu không chính xác")
    }

    // Cập nhật thời gian hoạt động cuối cùng
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() },
    })

    // Tạo và lưu token
    const token = await createToken(user)
    setAuthCookie(token)

    return { id: user.id, name: user.name, email: user.email }
  } catch (error) {
    console.error("Login error:", error)
    throw new Error("Đăng nhập thất bại. Vui lòng thử lại.")
  }
}

export async function registerUser(data: RegisterData) {
  try {
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      throw new Error("Email đã được sử dụng")
    }

    // Mã hóa mật khẩu
    const hashedPassword = await hashPassword(data.password)

    // Tạo người dùng mới
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
    })

    // Tạo và lưu token
    const token = await createToken(user)
    setAuthCookie(token)

    return { id: user.id, name: user.name, email: user.email }
  } catch (error) {
    console.error("Registration error:", error)
    throw new Error("Đăng ký thất bại. Vui lòng thử lại.")
  }
}

export async function logoutUser() {
  removeAuthCookie()
}

export async function getCurrentUserInfo() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id as string },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        lastActive: true,
      },
    })

    return dbUser
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

// Middleware để kiểm tra xác thực
export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return user
}
