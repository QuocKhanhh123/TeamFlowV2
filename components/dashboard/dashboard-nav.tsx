"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, FolderKanban, Settings, Users } from "lucide-react"

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="grid items-start gap-2">
      <Link href="/dashboard">
        <Button variant={pathname === "/dashboard" ? "secondary" : "ghost"} className="w-full justify-start">
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Tổng quan
        </Button>
      </Link>
      <Link href="/dashboard/projects">
        <Button variant={pathname.includes("/projects") ? "secondary" : "ghost"} className="w-full justify-start">
          <FolderKanban className="mr-2 h-4 w-4" />
          Dự án
        </Button>
      </Link>
      <Link href="/dashboard/join-projects">
        <Button variant={pathname.includes("/join-projects") ? "secondary" : "ghost"} className="w-full justify-start">
          <Users className="mr-2 h-4 w-4" />
          Tham gia dự án
        </Button>
      </Link>
      <Link href="/dashboard/team">
        <Button variant={pathname.includes("/team") ? "secondary" : "ghost"} className="w-full justify-start">
          <Users className="mr-2 h-4 w-4" />
          Thành viên
        </Button>
      </Link>
      <Link href="/dashboard/settings">
        <Button variant={pathname.includes("/settings") ? "secondary" : "ghost"} className="w-full justify-start">
          <Settings className="mr-2 h-4 w-4" />
          Cài đặt
        </Button>
      </Link>
    </nav>
  )
}
