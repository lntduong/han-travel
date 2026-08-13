"use client";

import { useEffect, useState } from "react";
import { Lesson } from "@/types/lesson";
import { Header } from "@/components/Header";
import { VocabCard } from "@/components/VocabCard";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { match } from "pinyin-pro";
import { useAuth } from "@/contexts/AuthContext";
import { LockedState } from "@/components/LockedState";

interface VocabItem {
  word: string;
  meaning: string;
  category: string;
  lessonId: string;
}

export default function VocabularyPage() {
  const [vocabList, setVocabList] = useState<VocabItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  useEffect(() => {
    const fetchVocab = async () => {
      try {
        const response = await fetch('/api/lessons');
        const lessons: Lesson[] = await response.json();
        
        const allVocab: VocabItem[] = [];
        lessons.forEach(lesson => {
          if (lesson.vocabulary) {
            lesson.vocabulary.forEach(v => {
              // Tránh trùng lặp từ vựng
              if (!allVocab.find(item => item.word === v.word)) {
                allVocab.push({
                  ...v,
                  category: lesson.category || "Cơ bản",
                  lessonId: lesson.id
                });
              }
            });
          }
        });
        
        setVocabList(allVocab);
      } catch (error) {
        console.error("Failed to fetch vocab:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVocab();
  }, []);

  const categories = ["Tất cả", ...Array.from(new Set(vocabList.map(v => v.category)))];

  const filteredVocab = vocabList.filter(v => {
    const query = searchQuery.toLowerCase().replace(/\s+/g, '');
    let matchesSearch = false;

    if (!query) {
      matchesSearch = true;
    } else {
      const textMatch = v.word.toLowerCase().includes(query) ||
                        v.meaning.toLowerCase().includes(query);
      const pinyinMatch = match(v.word, query) !== null;
      matchesSearch = textMatch || pinyinMatch;
    }

    const matchesCategory = selectedCategory === "Tất cả" || v.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  if (isLoading || isAuthLoading) {
    return <div className="min-h-screen bg-[#FAF7F2] dark:bg-slate-950 flex items-center justify-center text-slate-500">Đang tải dữ liệu...</div>;
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 pb-24 flex flex-col">
      <Header />
      
      {!isAuthenticated ? (
        <LockedState />
      ) : (
        <>
          <section className="w-full max-w-5xl mx-auto px-4 pt-8 pb-4 md:pt-12 md:pb-8 text-center">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#1e293b] dark:text-slate-100 mb-4">
          Từ vựng Du lịch
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Tổng hợp tất cả các từ vựng cần thiết được trích xuất từ các đoạn hội thoại giao tiếp thực tế.
        </p>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto relative mt-8">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-slate-400" />
            <Input 
              type="text" 
              placeholder="Tìm kiếm từ vựng (Hỗ trợ Pinyin không dấu)..." 
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

      <section className="w-full max-w-6xl mx-auto px-4 mt-8">
        {filteredVocab.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            Không tìm thấy từ vựng nào phù hợp.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVocab.map((vocab, index) => (
              <div key={index} className="relative">
                <div className="absolute -top-3 left-4 z-10 inline-flex px-2 py-0.5 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400 text-[10px] font-bold rounded-md shadow-sm border border-orange-200/50 dark:border-orange-800/50">
                  {vocab.category}
                </div>
                <VocabCard word={vocab.word} meaning={vocab.meaning} />
              </div>
            ))}
          </div>
        )}
      </section>
        </>
      )}
    </main>
  );
}
