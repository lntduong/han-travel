"use client";

import { useEffect, useState } from "react";
import { Lesson } from "@/types/lesson";
import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await fetch('/api/lessons');
        const data = await response.json();
        setLessons(data);
      } catch (error) {
        console.error("Failed to fetch lessons:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLessons();
  }, []);

  const categories = ["Tất cả", ...Array.from(new Set(lessons.map(l => l.category).filter(Boolean)))];

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          lesson.usage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Tất cả" || lesson.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return <div className="min-h-screen bg-[#FAF7F2] dark:bg-slate-950 flex items-center justify-center text-slate-500">Đang tải dữ liệu...</div>;
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full h-16 bg-[#FAF7F2]/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-[#E2D8CE] dark:border-slate-800 flex items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-orange-600" />
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">HanTravel</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link href="/" className="hover:text-orange-600 transition-colors text-orange-600 font-semibold">Bài học</Link>
          <a href="#" className="hover:text-orange-600 transition-colors">Từ vựng</a>
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

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 pt-16 pb-8 md:pt-24 md:pb-12 text-center">
        <span className="inline-block py-1.5 px-4 mb-6 rounded-full bg-orange-100/80 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 text-sm font-medium border border-orange-200/60 dark:border-orange-900/50">
          Dành cho người Việt du lịch Đài Loan
        </span>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[#1e293b] dark:text-slate-100 mb-6 leading-tight">
          Học tiếng Trung <br className="hidden md:block" /> giao tiếp thực tế
        </h1>
        
        {/* Search Bar */}
        <div className="max-w-xl mx-auto relative mt-8">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-slate-400" />
            <Input 
              type="text" 
              placeholder="Tìm kiếm chủ đề, bài học..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-6 rounded-full border-[#E2D8CE] shadow-sm bg-white focus-visible:ring-orange-500 text-base"
            />
          </div>
        </div>
        
        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat 
                  ? 'bg-orange-600 text-white shadow-md' 
                  : 'bg-white text-slate-600 hover:bg-orange-50 hover:text-orange-600 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Main Content (Lessons Grid) */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        {filteredLessons.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            Không tìm thấy bài học nào phù hợp.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map((lesson) => (
              <Link href={`/lesson/${lesson.id}`} key={lesson.id} className="block group h-full">
                <Card className="h-full border-[#E2D8CE]/60 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 rounded-[1.5rem] bg-white dark:bg-slate-900 group-hover:-translate-y-1 overflow-hidden flex flex-col cursor-pointer">
                  <div className="h-2 bg-gradient-to-r from-orange-300 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <CardHeader className="p-6 md:p-8 flex-1">
                    <div className="mb-4 inline-flex px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-full">
                      {lesson.category || "Cơ bản"}
                    </div>
                    <CardTitle className="text-2xl text-[#1e293b] dark:text-slate-100 font-bold group-hover:text-orange-600 transition-colors leading-snug">
                      {lesson.title}
                    </CardTitle>
                    <CardDescription className="text-base mt-4 text-slate-500 line-clamp-3">
                      {lesson.usage}
                    </CardDescription>
                  </CardHeader>
                  <div className="px-6 md:px-8 pb-6 md:pb-8 pt-0 mt-auto">
                    <span className="text-sm font-medium text-orange-600 flex items-center gap-1">
                      Học ngay <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-[#1e293b] text-slate-400 py-12 text-center text-sm">
        <p>© 2026 HanTravel - Học tiếng Trung Đài Loan.</p>
        <p className="mt-2">Giao diện lấy cảm hứng từ XieHanzi.</p>
      </footer>
    </main>
  );
}
