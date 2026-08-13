"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { LoginModal } from "./LoginModal";

import { usePathname } from "next/navigation";

interface HeaderProps {
  title?: string;
  backUrl?: string;
}

export function Header({ title, backUrl }: HeaderProps) {
  const { isAuthenticated, logout } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const pathname = usePathname();

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
    <>
      <nav className="sticky top-0 z-50 w-full h-16 bg-[#FAF7F2]/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-[#E2D8CE] dark:border-slate-800 flex items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="HanTravel Logo" width={28} height={28} className="rounded-md" />
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">HanTravel</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link 
            href="/" 
            className={`transition-colors hover:text-orange-600 ${pathname === "/" ? "text-orange-600 font-semibold" : ""}`}
          >
            Bài học
          </Link>
          <Link 
            href="/vocabulary" 
            className={`transition-colors hover:text-orange-600 ${pathname === "/vocabulary" ? "text-orange-600 font-semibold" : ""}`}
          >
            Từ vựng
          </Link>
          <Link 
            href="/admin" 
            className={`transition-colors hover:text-orange-600 ${pathname === "/admin" ? "text-orange-600 font-semibold" : ""}`}
          >
            Quản lý
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Button 
              onClick={logout} 
              variant="outline" 
              className="hidden md:inline-flex rounded-full px-4 text-slate-600 border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Đăng xuất
            </Button>
          ) : (
            <Button 
              onClick={() => setIsLoginModalOpen(true)}
              className="hidden md:inline-flex bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6"
            >
              Đăng nhập
            </Button>
          )}
          <Button variant="ghost" size="icon" className="md:hidden rounded-full text-slate-500">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </nav>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
}
