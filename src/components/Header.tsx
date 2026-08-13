"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { Menu, ArrowLeft, LogOut, X } from "lucide-react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image src="/logo.png" alt="HanTravel Logo" width={28} height={28} className="rounded-md" />
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">HanTravel</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link 
            href="/" 
            className={`hover:text-orange-600 dark:hover:text-orange-400 transition-colors ${pathname === "/" ? "text-orange-600 dark:text-orange-400 font-bold" : ""}`}
          >
            Bài học
          </Link>
          <Link 
            href="/vocabulary" 
            className={`hover:text-orange-600 dark:hover:text-orange-400 transition-colors ${pathname === "/vocabulary" ? "text-orange-600 dark:text-orange-400 font-bold" : ""}`}
          >
            Từ vựng
          </Link>
          <Link 
            href="/survival" 
            className={`hover:text-orange-600 dark:hover:text-orange-400 transition-colors ${pathname === "/survival" ? "text-orange-600 dark:text-orange-400 font-bold" : ""}`}
          >
            Sổ tay
          </Link>
          <Link 
            href="/admin" 
            className={`hover:text-orange-600 dark:hover:text-orange-400 transition-colors ${pathname === "/admin" ? "text-orange-600 dark:text-orange-400 font-bold" : ""}`}
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
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden rounded-full text-slate-500"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="fixed top-16 left-0 w-full bg-[#FAF7F2] dark:bg-slate-950 border-b border-[#E2D8CE] dark:border-slate-800 shadow-xl p-4 flex flex-col gap-3 z-40 md:hidden animate-in slide-in-from-top-2">
          <Link 
            href="/" 
            className={`p-4 rounded-xl font-medium transition-colors ${pathname === "/" ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            📖 Bài học
          </Link>
          
          <Link 
            href="/vocabulary" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={`p-4 rounded-xl font-medium transition-colors ${pathname === "/vocabulary" ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
          >
            📚 Từ vựng
          </Link>
          
          <Link 
            href="/survival" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={`p-4 rounded-xl font-medium transition-colors ${pathname === "/survival" ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
          >
            🎒 Sổ tay
          </Link>
          
          <div className="h-px bg-[#E2D8CE] dark:bg-slate-800 my-2" />
          
          <Link 
            href="/admin" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={`p-4 rounded-xl font-medium transition-colors ${pathname === "/admin" ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
          >
            ⚙️ Quản lý
          </Link>
          
          {isAuthenticated ? (
            <Button 
              onClick={() => { logout(); setIsMobileMenuOpen(false); }} 
              variant="outline" 
              className="w-full justify-start rounded-xl px-4 py-6 text-slate-700 dark:text-slate-300 border-[#E2D8CE] dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Đăng xuất
            </Button>
          ) : (
            <Button 
              onClick={() => { setIsMobileMenuOpen(false); setIsLoginModalOpen(true); }}
              className="w-full justify-center bg-orange-600 hover:bg-orange-700 text-white rounded-xl py-6 text-base shadow-sm"
            >
              Đăng nhập bằng mã PIN
            </Button>
          )}
        </div>
      )}

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
}
