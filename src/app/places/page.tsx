"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { VocabCard } from "@/components/VocabCard";
import { Button } from "@/components/ui/button";
import { Trash2, Send, Loader2, MapPin } from "lucide-react";

interface PlaceItem {
  id: string;
  vi: string;
  zh: string;
  category: string;
  timestamp: number;
}

const CATEGORIES = ["Tất cả", "Thành phố", "Chợ đêm", "Điểm du lịch", "Nhà ga", "Khu mua sắm"];

export default function PlacesPage() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<PlaceItem[]>([]);
  const [viText, setViText] = useState("");
  const [zhText, setZhText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Thành phố");
  const [filterCategory, setFilterCategory] = useState("Tất cả");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load data
  useEffect(() => {
    fetch("/api/places")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setItems(data.sort((a, b) => b.timestamp - a.timestamp));
        }
      })
      .catch((err) => console.error("Error loading places:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const saveToGitHub = async (newItems: PlaceItem[]) => {
    if (!isAuthenticated) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/places/save", {
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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viText.trim() || !zhText.trim() || !isAuthenticated) return;

    const newItem: PlaceItem = {
      id: Date.now().toString(),
      vi: viText.trim(),
      zh: zhText.trim(),
      category: selectedCategory,
      timestamp: Date.now(),
    };

    const updatedItems = [newItem, ...items];
    setItems(updatedItems);
    setViText("");
    setZhText("");
    
    await saveToGitHub(updatedItems);
  };

  const handleDelete = async (id: string) => {
    if (!isAuthenticated) return;
    if (confirm("Bạn có chắc muốn xoá địa danh này không?")) {
      const updatedItems = items.filter(i => i.id !== id);
      setItems(updatedItems);
      await saveToGitHub(updatedItems);
    }
  };

  const filteredItems = items.filter(item => filterCategory === "Tất cả" || item.category === filterCategory);

  return (
    <div className="min-h-screen bg-[#F5F1EA] dark:bg-slate-900 pb-24">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-6 md:py-8 space-y-8">
        
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-orange-500 mb-4">
            <MapPin className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            Cẩm nang Địa danh
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Tra cứu nhanh và nghe phát âm chuẩn tên các thành phố, chợ đêm, ga tàu nổi tiếng tại Đài Loan.
          </p>
        </div>

        {/* Filter Categories */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filterCategory === cat
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-orange-50 hover:text-orange-600 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Input Form for Admin */}
        {isAuthenticated && (
          <form onSubmit={handleAdd} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-[#E2D8CE] dark:border-slate-700 space-y-4">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Thêm địa danh mới</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                value={zhText}
                onChange={(e) => setZhText(e.target.value)}
                placeholder="Tiếng Trung (VD: 台北)"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="text"
                value={viText}
                onChange={(e) => setViText(e.target.value)}
                placeholder="Tiếng Việt (VD: Đài Bắc)"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none cursor-pointer"
                >
                  {CATEGORIES.filter(c => c !== "Tất cả").map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
            <div className="flex justify-end items-center gap-4 pt-2">
              {isSaving && <span className="text-sm text-orange-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Đang lưu...</span>}
              <Button type="submit" disabled={isSaving || !viText || !zhText} className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl">
                <Send className="w-4 h-4 mr-2" /> Thêm địa danh
              </Button>
            </div>
          </form>
        )}

        {/* List of places */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
            <p className="mt-4 text-slate-500">Đang tải danh sách địa danh...</p>
          </div>
        ) : (
          <>
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 text-slate-500 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <p>Không có địa danh nào trong danh mục này.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.map((item) => (
                  <VocabCard 
                    key={item.id}
                    word={item.zh}
                    meaning={item.vi}
                    actionButtons={
                      isAuthenticated ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                          className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="Xoá địa danh"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : undefined
                    }
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
