"use client";

import { useEffect, useState } from "react";
import { Lesson } from "@/types/lesson";
import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import { match } from "pinyin-pro";
import { useAuth } from "@/contexts/AuthContext";
import { LockedState } from "@/components/LockedState";

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
    const query = searchQuery.toLowerCase().replace(/\s+/g, '');
    let matchesSearch = false;

    if (!query) {
      matchesSearch = true;
    } else {
      // 1. Tìm kiếm văn bản thông thường (Tiếng Việt, Hán)
      const textMatch = lesson.title.toLowerCase().includes(query) ||
                        lesson.usage.toLowerCase().includes(query);
      
      // 2. Tìm kiếm bằng Pinyin không dấu (hoặc chữ cái đầu)
      const pinyinMatch = match(lesson.title, query) !== null;
      
      // 3. Tìm trong câu giao tiếp chính
      const sentenceMatch = lesson.mainSentence?.sentence ? match(lesson.mainSentence.sentence, query) !== null : false;

      matchesSearch = textMatch || pinyinMatch || sentenceMatch;
    }

    const matchesCategory = selectedCategory === "Tất cả" || lesson.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  if (isLoading || isAuthLoading) {
    return <div className="min-h-screen bg-[#FAF7F2] dark:bg-slate-950 flex items-center justify-center text-slate-500">Đang tải dữ liệu...</div>;
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 flex flex-col">
      {/* Navbar */}
      <Header />

      {!isAuthenticated ? (
        <LockedState />
      ) : (
        <>
          {/* Hero Section */}
      <section className="w-full max-w-5xl mx-auto px-4 pt-8 pb-4 md:pt-12 md:pb-8 text-center">

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
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat
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
      <section className="w-full max-w-6xl mx-auto px-4 pb-24">
        {filteredLessons.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            Không tìm thấy bài học nào phù hợp.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map((lesson) => (
              <Link href={`/lesson/${lesson.id}`} key={lesson.id} className="block group h-full">
                <Card className="h-full border-[#E2D8CE]/60 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 rounded-[1.5rem] bg-white dark:bg-slate-900 group-hover:-translate-y-1 overflow-hidden flex flex-col cursor-pointer">
                  <CardHeader className="p-6 md:p-8 flex-1">
                    <div className="mb-4 inline-flex self-start px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-full w-fit">
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
        </>
      )}

    </main>
  );
}
