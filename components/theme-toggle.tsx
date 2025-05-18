"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "@/lib/toast-utils"
import { useState, useEffect } from "react"




export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    toast.success(`Đã chuyển sang chế độ ${newTheme === "light" ? "sáng" : "tối"}`, {
      description: `Giao diện đã được cập nhật sang chế độ ${newTheme === "light" ? "sáng" : "tối"}.`,
    })
  };
  if (!isMounted) return null
  
  return (
    <div className="flex items-center space-x-2">
      <Switch id="theme-mode" checked={theme === "dark"} onCheckedChange={toggleTheme} />
      <Label htmlFor="theme-mode" className="cursor-pointer">
        {isMounted && (theme === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />)}
      </Label>
    </div>
  );
}