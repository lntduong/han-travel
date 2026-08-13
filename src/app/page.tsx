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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLessons.map((lesson, index) => {
              const wordCount = lesson.vocabulary?.length || 0;
              const estTime = Math.max(3, Math.ceil(wordCount * 0.5 + (lesson.dialogues?.length || 0) * 0.5));
              const displayIndex = (index + 1).toString().padStart(2, '0');

              return (
                <Link href={`/lesson/${lesson.id}`} key={lesson.id} className="block group h-full">
                  <Card className="relative h-full border border-[#E2D8CE]/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl bg-white dark:bg-slate-900 group-hover:-translate-y-1 overflow-hidden flex flex-col cursor-pointer p-5">
                    {/* Background number */}
                    <div className="absolute -bottom-2 right-0 text-[110px] font-bold text-slate-50 dark:text-slate-800/30 leading-none select-none z-0 font-serif tracking-tighter">
                      {displayIndex}
                    </div>

                    <div className="relative z-10 flex flex-col h-full">
                      {/* Top row */}
                      <div className="flex justify-between items-center mb-4">
                        <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
                          {lesson.category || `BÀI ${displayIndex}`}
                        </div>
                        <span className="text-slate-400 group-hover:translate-x-1 transition-transform">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                        </span>
                      </div>

                      {/* Titles */}
                      <h3 className="text-lg text-slate-800 dark:text-slate-100 font-bold leading-snug mb-1">
                        {lesson.title}
                      </h3>
                      <div className="text-[13px] text-slate-500 dark:text-slate-400 mb-6 font-medium">
                        {lesson.mainSentence?.sentence || lesson.usage.substring(0, 50) + "..."}
                      </div>

                      {/* Bottom info */}
                      <div className="mt-auto flex flex-col gap-4">
                        <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            {wordCount} từ
                          </span>
                          <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            ~{estTime} phút
                          </span>
                        </div>
                        <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold w-fit hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                          <svg className="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
                          Luyện tập
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>
        </>
      )}

    </main>
  );
}
