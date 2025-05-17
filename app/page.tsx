import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link className="flex items-center justify-center" href="/">
          <span className="font-bold text-xl">TaskFlow</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
            Đăng nhập
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/register">
            Đăng ký
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Quản lý dự án hiệu quả với TaskFlow
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Nền tảng quản lý dự án và công việc giúp bạn theo dõi, phân công và hoàn thành công việc một cách hiệu
                  quả.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/register">
                  <Button className="px-8">
                    Bắt đầu ngay
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="px-8">
                    Đăng nhập
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Quản lý dự án</h3>
                <p className="text-muted-foreground">Tạo và quản lý nhiều dự án cùng lúc với giao diện trực quan.</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Theo dõi công việc</h3>
                <p className="text-muted-foreground">Tạo, phân công và cập nhật trạng thái công việc dễ dàng.</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Cộng tác hiệu quả</h3>
                <p className="text-muted-foreground">Bình luận và trao đổi trực tiếp trên từng công việc.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full border-t px-4 md:px-6">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} TaskFlow. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
