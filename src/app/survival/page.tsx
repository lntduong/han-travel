"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTTS } from "@/hooks/useTTS";
import { Header } from "@/components/Header";
import { PinyinText } from "@/components/PinyinText";
import { Button } from "@/components/ui/button";
import { Volume2, Trash2, Send, Loader2, Search } from "lucide-react";

interface NotebookItem {
  id: string;
  vi: string;
  zh: string;
  timestamp: number;
}

export default function SurvivalPage() {
  const { isAuthenticated } = useAuth();
  const { speak, isSpeaking } = useTTS();
  const [items, setItems] = useState<NotebookItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load data
  useEffect(() => {
    fetch("/api/notebook")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setItems(data.sort((a, b) => b.timestamp - a.timestamp));
        }
      })
      .catch((err) => console.error("Error loading notebook:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const saveToGitHub = async (newItems: NotebookItem[]) => {
    if (!isAuthenticated) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/notebook/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItems),
      });
      if (!res.ok) throw new Error("Failed to save to GitHub");
    } catch (error) {
      console.error(error);
      alert("Có lỗi khi lưu đồng bộ lên GitHub.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTranslateAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !isAuthenticated) return;

    setIsTranslating(true);
    try {
      const res = await fetch(`/api/translate?text=${encodeURIComponent(inputText)}`);
      const data = await res.json();

      if (data.translation) {
        const newItem: NotebookItem = {
          id: Date.now().toString(),
          vi: inputText.trim(),
          zh: data.translation,
          timestamp: Date.now(),
        };

        const updatedItems = [newItem, ...items];
        setItems(updatedItems);
        setInputText("");
        
        // Phát âm luôn khi dịch xong
        speak(newItem.zh);

        // Lưu lên GitHub
        await saveToGitHub(updatedItems);
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi khi dịch thuật.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAuthenticated) return;
    if (confirm("Bạn có chắc muốn xoá câu này không?")) {
      const updatedItems = items.filter(i => i.id !== id);
      setItems(updatedItems);
      await saveToGitHub(updatedItems);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1EA] dark:bg-slate-900 pb-24">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-6 md:py-8 space-y-6">
        
        {/* Input Form */}
        <form onSubmit={handleTranslateAndSave} className="relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Nhập câu tiếng Việt (VD: Xin hỏi nhà vệ sinh ở đâu?)"
            className="w-full pl-4 pr-32 py-4 rounded-2xl border border-[#E2D8CE] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm transition-all placeholder:text-slate-400"
            disabled={!isAuthenticated || isTranslating}
          />
          <div className="absolute right-2 top-2 bottom-2">
            {isAuthenticated ? (
              <Button 
                type="submit" 
                disabled={isTranslating || !inputText.trim()}
                className="h-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl px-4"
              >
                {isTranslating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span className="hidden sm:inline mr-2 font-semibold">Dịch & Lưu</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button 
                type="button"
                disabled
                className="h-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-xl"
              >
                Cần Đăng nhập
              </Button>
            )}
          </div>
        </form>

        {isSaving && (
          <div className="text-sm text-orange-600 dark:text-orange-400 flex items-center justify-center gap-2 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            Đang đồng bộ lên Cloud...
          </div>
        )}

        {/* Khung tìm kiếm */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm câu đã lưu..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E2D8CE] dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-slate-400 text-sm"
          />
        </div>

        {/* List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : (() => {
            const filteredItems = items.filter(item => 
              item.vi.toLowerCase().includes(searchTerm.toLowerCase()) || 
              item.zh.includes(searchTerm)
            );
            
            if (items.length === 0) {
              return (
                <div className="text-center py-12 text-slate-500">
                  <p>Chưa có câu nào trong sổ tay.</p>
                  <p className="text-sm mt-1">Hãy dịch câu đầu tiên của bạn nhé!</p>
                </div>
              );
            }
            
            if (filteredItems.length === 0) {
              return (
                <div className="text-center py-12 text-slate-500">
                  <p>Không tìm thấy kết quả phù hợp với "{searchTerm}"</p>
                </div>
              );
            }

            return filteredItems.map((item) => (
              <div 
                key={item.id} 
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-[#E2D8CE] dark:border-slate-700 transition-all hover:shadow-md group relative"
              >
                <div className="pr-12 space-y-4">
                  {/* Chinese & Pinyin */}
                  <div className="pt-2">
                    <PinyinText text={item.zh} size="xl" />
                  </div>
                  
                  {/* Vietnamese */}
                  <div className="text-slate-600 dark:text-slate-400 font-medium pb-1 border-b border-dashed border-slate-200 dark:border-slate-700">
                    {item.vi}
                  </div>
                </div>

                {/* Actions */}
                <div className="absolute right-4 top-4 bottom-4 flex flex-col justify-between items-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => speak(item.zh)}
                    className="w-10 h-10 rounded-full text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10"
                  >
                    <Volume2 className="w-5 h-5" />
                  </Button>

                  {isAuthenticated && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                      className="w-8 h-8 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ));
          })()}
        </div>
      </main>
    </div>
  );
}
