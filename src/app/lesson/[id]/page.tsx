"use client";

import { useEffect, useState } from "react";
import { Lesson } from "@/types/lesson";
import { useTTS } from "@/hooks/useTTS";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, Info, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Header } from "@/components/Header";
import { PinyinText } from "@/components/PinyinText";
import { VocabCard } from "@/components/VocabCard";
import { useAuth } from "@/contexts/AuthContext";
import { LockedState } from "@/components/LockedState";

export default function LessonDetail() {
  const params = useParams();
  const id = params.id as string;
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { speak } = useTTS();

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const response = await fetch(`/api/lessons/${id}`);
        if (response.ok) {
          const data = await response.json();
          setLesson(data);
        }
      } catch (error) {
        console.error("Failed to fetch lesson:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchLesson();
    }
  }, [id]);

  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  if (isLoading || isAuthLoading) {
    return <div className="min-h-screen bg-[#FAF7F2] dark:bg-slate-950 flex items-center justify-center text-slate-500">Đang tải bài học...</div>;
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] dark:bg-slate-950 flex flex-col items-center justify-center text-slate-500 gap-4">
        <p>Không tìm thấy bài học!</p>
        <Link href="/">
          <Button variant="outline">Quay lại trang chủ</Button>
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 flex flex-col">
      {/* Navbar with Back Button */}
      <Header title={lesson.title} backUrl="/" />

      {!isAuthenticated ? (
        <LockedState />
      ) : (
        <>
          {/* Main Content */}
          <section className="w-full max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-12">
        <Card className="overflow-visible border-[#E2D8CE]/50 dark:border-slate-800 shadow-sm rounded-[2rem] bg-white dark:bg-slate-900 pt-0 relative">
          <CardHeader className="pt-8 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-start gap-4">
              <CardTitle className="text-3xl md:text-4xl text-[#1e293b] dark:text-slate-100 font-bold leading-tight">
                {lesson.title}
              </CardTitle>
              <div className="inline-flex px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-full shrink-0">
                {lesson.category || "Cơ bản"}
              </div>
            </div>
            <CardDescription className="text-lg mt-4 text-slate-500">
              {lesson.usage}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 md:p-8 space-y-10">
            {/* Câu giao tiếp chính */}
            <div className="bg-[#FAF7F2] dark:bg-slate-950/50 p-6 md:p-8 rounded-3xl border border-[#E2D8CE]/60 dark:border-slate-800/80">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-3">
                  <PinyinText text={lesson.mainSentence.sentence} size="lg" />
                  <div className="text-xl text-[#1e293b] dark:text-slate-300 font-medium pt-2">
                    {lesson.mainSentence.translation}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 shadow-sm hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 dark:hover:bg-slate-800 transition-all shrink-0"
                  onClick={() => speak(lesson.mainSentence.sentence)}
                >
                  <Volume2 className="w-7 h-7" />
                </Button>
              </div>
            </div>

            {/* Lưu ý */}
            {lesson.note && (
              <div className="flex items-start gap-3 bg-blue-50/80 dark:bg-blue-950/30 p-5 rounded-2xl text-blue-900 dark:text-blue-300 text-base">
                <Info className="w-6 h-6 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                <p className="leading-relaxed">{lesson.note}</p>
              </div>
            )}

            {/* Hội thoại */}
            {lesson.dialogues && lesson.dialogues.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold text-[#1e293b] dark:text-slate-100 mb-6 px-2">Đoạn hội thoại thực tế</h3>
                <div className="space-y-4 pt-6 pb-2 px-2 md:px-6 bg-slate-50/50 dark:bg-slate-900/20 rounded-3xl">
                  {lesson.dialogues.map((dialogue, index) => {
                    const isSelf = dialogue.speaker.includes("Bạn");

                    return (
                      <div key={index} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} mb-6`}>
                        <span className="text-sm font-medium text-slate-400 mb-2 px-2">
                          {dialogue.speaker}
                        </span>

                        <div className={`relative max-w-[95%] md:max-w-[85%] rounded-3xl p-5 md:p-6 shadow-sm transition-transform hover:-translate-y-0.5 ${isSelf
                            ? 'bg-[#E86C3F] text-white rounded-tr-sm'
                            : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-tl-sm text-[#1e293b] dark:text-slate-100 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)]'
                          }`}>
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1 flex-1">
                              <PinyinText 
                                text={dialogue.sentence} 
                                size="md" 
                                inheritColor={isSelf} 
                                className={isSelf ? "text-white" : ""}
                              />
                              <p className={`mt-2 pt-2 border-t text-sm font-medium ${isSelf ? 'border-orange-400/40 text-white' : 'border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}>
                                {dialogue.translation}
                              </p>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-10 w-10 shrink-0 rounded-full hover:bg-black/10 transition-colors ${isSelf ? 'text-white' : 'text-slate-400 hover:text-slate-600'}`}
                              onClick={() => speak(dialogue.sentence)}
                            >
                              <Volume2 className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Từ vựng trong bài */}
            {lesson.vocabulary && lesson.vocabulary.length > 0 && (
              <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold text-[#1e293b] dark:text-slate-100 mb-6 px-2">Từ vựng trong bài</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lesson.vocabulary.map((vocab, index) => (
                    <VocabCard key={index} word={vocab.word} meaning={vocab.meaning} />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
        </>
      )}

    </main>
  );
}
