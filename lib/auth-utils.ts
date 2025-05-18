import { compare, hash } from "bcryptjs"
import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import type { User } from "@prisma/client"
import { redirect } from "next/navigation"

// Hàm mã hóa mật khẩu
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12)
}

// Hàm so sánh mật khẩu
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword)
}

// Tạo JWT token
export async function createToken(user: Partial<User>): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")

  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret)

  return token
}

// Xác thực JWT token
export async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch (error) {
    return null
  }
}

// Lưu token vào cookie
export async function setAuthCookie(token: string) {
  const cookiesInstance = await cookies()
  cookiesInstance.set({
    name: "auth_token",
    value: token,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

// Xóa token khỏi cookie
export async function removeAuthCookie() {
  const cookiesInstance = await cookies()
  cookiesInstance.delete("auth_token")
}

// Lấy token từ cookie
export async function getAuthToken(): Promise<string | undefined> {
  const cookiesInstance = await cookies()
  return cookiesInstance.get("auth_token")?.value
}

// Lấy thông tin người dùng hiện tại từ token
export async function getCurrentUser() {
  const token = await getAuthToken()

  if (!token) {
    return null
  }

  const payload = await verifyToken(token)
  return payload
}

// Middleware để kiểm tra xác thực
export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return user
}
