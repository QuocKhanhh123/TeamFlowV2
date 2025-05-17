"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { SearchIcon } from "lucide-react"

export function Search() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const router = useRouter()

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      // In a real app, this would search and navigate to results
      setOpen(false)
      router.push(`/dashboard/search?q=${encodeURIComponent(search)}`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-9 px-0 md:hidden">
          <SearchIcon className="h-4 w-4" />
          <span className="sr-only">Tìm kiếm</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tìm kiếm</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSearch} className="flex gap-2">
          <Input
            placeholder="Tìm kiếm dự án, công việc..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">Tìm</Button>
        </form>
      </DialogContent>
      <div className="relative hidden md:block">
        <form onSubmit={onSearch} className="relative">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm dự án, công việc..."
            className="w-[200px] pl-8 md:w-[300px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>
    </Dialog>
  )
}
