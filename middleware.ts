import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth-utils"

// Danh sách các đường dẫn không cần xác thực
const publicPaths = ["/", "/login", "/register"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Kiểm tra xem đường dẫn có cần xác thực không
  const isPublicPath = publicPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))

  // Lấy token từ cookie
  const token = request.cookies.get("auth_token")?.value

  // Nếu không có token và đường dẫn cần xác thực, chuyển hướng đến trang đăng nhập
  if (!token && !isPublicPath) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  // Nếu có token, xác thực token
  if (token) {
    const payload = await verifyToken(token)

    // Nếu token không hợp lệ và đường dẫn cần xác thực, chuyển hướng đến trang đăng nhập
    if (!payload && !isPublicPath) {
      const url = new URL("/login", request.url)
      url.searchParams.set("callbackUrl", encodeURI(request.url))
      return NextResponse.redirect(url)
    }

    // Nếu token hợp lệ và đang ở trang đăng nhập hoặc đăng ký, chuyển hướng đến trang dashboard
    if (payload && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

// Chỉ áp dụng middleware cho các đường dẫn sau
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
