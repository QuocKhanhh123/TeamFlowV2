import type React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      <Link href="/dashboard" className="text-xl font-bold transition-colors hover:text-primary">
        TaskFlow
      </Link>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </nav>
  )
}
