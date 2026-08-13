import Link from "next/link";
import { BookOpen, Menu, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";

interface HeaderProps {
  title?: string;
  backUrl?: string;
}

export function Header({ title, backUrl }: HeaderProps) {
  if (title) {
    return (
      <nav className="sticky top-0 z-50 w-full h-16 bg-[#FAF7F2]/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-[#E2D8CE] dark:border-slate-800 flex items-center px-4 md:px-8 gap-4">
        <Link href={backUrl || "/"}>
          <Button variant="ghost" size="icon" className="rounded-full text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <span className="text-lg font-medium text-slate-900 dark:text-slate-100 truncate flex-1">
          {title}
        </span>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 w-full h-16 bg-[#FAF7F2]/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-[#E2D8CE] dark:border-slate-800 flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-2">
        <BookOpen className="w-6 h-6 text-orange-600" />
        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">HanTravel</span>
      </div>
      <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
        <Link href="/" className="hover:text-orange-600 transition-colors text-orange-600 font-semibold">Bài học</Link>
        <Link href="/vocabulary" className="hover:text-orange-600 transition-colors">Từ vựng</Link>
        <a href="#" className="hover:text-orange-600 transition-colors">Sổ tay</a>
      </div>
      <div className="flex items-center gap-4">
        <Button className="hidden md:inline-flex bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6">
          Đăng nhập
        </Button>
        <Button variant="ghost" size="icon" className="md:hidden rounded-full text-slate-500">
          <Menu className="w-5 h-5" />
        </Button>
      </div>
    </nav>
  );
}
