"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteProject, getProject } from "@/lib/project-actions"
import { toast } from "@/lib/toast-utils"

interface DeleteProjectButtonProps {
  projectId: string
}

export function DeleteProjectButton({ projectId }: DeleteProjectButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDeleteProject = async () => {
    setIsDeleting(true)
    try {
      const project = await getProject(projectId)
      await deleteProject(projectId)
      toast.success(`Xóa dự án ${project.name} thành công`)
      router.push("/dashboard/projects")
    } catch (error) {
      console.error("Failed to delete project:", error)
      toast.error("Không thể xóa dự án. Vui lòng thử lại sau.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="icon">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bạn có chắc chắn muốn xóa dự án này?</AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này không thể hoàn tác.
            <br />
            Dự án này sẽ bị xóa vĩnh viễn khỏi hệ thống cùng với tất cả dữ liệu liên quan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDeleteProject}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? "Đang xóa..." : "Xóa dự án"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
