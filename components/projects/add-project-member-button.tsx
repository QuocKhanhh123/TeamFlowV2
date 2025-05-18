"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { UserPlus } from "lucide-react"
import { addProjectMember, getAvailableUsers } from "@/lib/project-actions"
import { toast } from "@/lib/toast-utils"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  userId: z.string({
    required_error: "Vui lòng chọn thành viên",
  }),
  role: z.enum(["ADMIN", "MEMBER"], {
    required_error: "Vui lòng chọn vai trò",
  }),
})

interface User {
  id: string
  name: string
  email: string
}

interface AddProjectMemberButtonProps {
  projectId: string
  onMemberAdded: (member: any) => void
}

export function AddProjectMemberButton({ projectId, onMemberAdded }: AddProjectMemberButtonProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "MEMBER",
    },
  })

  useEffect(() => {
    const fetchAvailableUsers = async () => {
      try {
        const users = await getAvailableUsers(projectId)
        setAvailableUsers(users)
      } catch (error) {
        console.error("Failed to fetch available users:", error)
        toast.error("Lỗi", {
          description: "Không thể lấy danh sách người dùng. Vui lòng thử lại sau.",
        })
      }
    }

    if (open) {
      fetchAvailableUsers()
    }
  }, [projectId, open])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const newMember = await addProjectMember(projectId, values.userId, values.role)
      setOpen(false)
      form.reset()
      onMemberAdded(newMember)
      toast.success("Thêm thành viên thành công", {
        description: "Thành viên đã được thêm vào dự án.",
      })
    } catch (error) {
      console.error(error)
      toast.error("Lỗi", {
        description: "Không thể thêm thành viên. Vui lòng thử lại sau.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = availableUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Thêm thành viên
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thêm thành viên vào dự án</DialogTitle>
          <DialogDescription>Chọn người dùng và vai trò để thêm vào dự án.</DialogDescription>
        </DialogHeader>
        <div className="mb-4">
          <Input
            placeholder="Tìm kiếm người dùng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Người dùng</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn người dùng" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredUsers.length === 0 ? (
                        <div className="p-2 text-center text-sm text-muted-foreground">
                          Không tìm thấy người dùng nào
                        </div>
                      ) : (
                        filteredUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vai trò</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                      <SelectItem value="MEMBER">Thành viên</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading || filteredUsers.length === 0}>
                {isLoading ? "Đang thêm..." : "Thêm thành viên"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
