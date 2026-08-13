"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import lessonsData from "@/data/lessons.json";
import { useAuth } from "@/contexts/AuthContext";
import { LockedState } from "@/components/LockedState";
import { Header } from "@/components/Header";
import { useWebPush } from "@/hooks/useWebPush";
import { Bell, BellOff, Loader2 } from "lucide-react";

export default function AdminPage() {
  const [jsonText, setJsonText] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"editAll" | "addNew">("editAll");
  const [newLessonJson, setNewLessonJson] = useState("");
  
  const { isSupported, isSubscribed, subscribe, unsubscribe } = useWebPush();
  const [isPushLoading, setIsPushLoading] = useState(false);

  const handleTogglePush = async () => {
    setIsPushLoading(true);
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
    setIsPushLoading(false);
  };

  // Tải dữ liệu JSON hiện tại khi mở trang
  useEffect(() => {
    setJsonText(JSON.stringify(lessonsData, null, 2));
  }, []);

  const handleAppendNewLesson = () => {
    try {
      if (!newLessonJson.trim()) throw new Error("Vui lòng nhập JSON bài học mới.");
      const newLesson = JSON.parse(newLessonJson);
      
      if (!newLesson.id || !newLesson.title) {
        throw new Error("JSON thiếu trường bắt buộc: 'id' hoặc 'title'.");
      }

      const currentData = JSON.parse(jsonText);
      currentData.push(newLesson);
      
      setJsonText(JSON.stringify(currentData, null, 2));
      setNewLessonJson("");
      setMode("editAll");
      
      setStatus("success");
      setMessage("Đã thêm bài học vào danh sách. Vui lòng bấm 'Lưu Hệ Thống' để lưu lên máy chủ.");
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 5000);
    } catch (e: any) {
      setStatus("error");
      setMessage("Lỗi JSON: " + e.message);
    }
  };

  const handleSave = async () => {
    try {
      setStatus("loading");
      setMessage("Đang kiểm tra và lưu lên GitHub...");

      // 1. Validate JSON syntax
      let parsedData;
      try {
        parsedData = JSON.parse(jsonText);
      } catch (e: any) {
        throw new Error("Lỗi cú pháp JSON: " + e.message);
      }

      if (!Array.isArray(parsedData)) {
        throw new Error("Dữ liệu JSON phải là một mảng (Array) bắt đầu bằng dấu ngoặc vuông [ ].");
      }

      // 2. Gửi API
      const response = await fetch("/api/admin/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Lỗi không xác định từ Server.");
      }

      setStatus("success");
      setMessage(result.message || "Lưu thành công! Vercel đang bắt đầu deploy lại.");
      
      // Auto reset status sau 5s
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 5000);

    } catch (error: any) {
      setStatus("error");
      setMessage(error.message);
    }
  };

  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <div className="min-h-screen bg-[#FAF7F2] dark:bg-slate-950 flex items-center justify-center text-slate-500">Đang tải...</div>;
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 flex flex-col">
      <Header />
      
      {!isAuthenticated ? (
        <LockedState />
      ) : (
        <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-8 w-full">
          
          {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start md:items-center gap-3 md:gap-4">
            <Link href="/" className="shrink-0 mt-0.5 md:mt-0">
              <Button variant="outline" size="icon" className="rounded-full shadow-sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
              Quản trị Dữ liệu Bài học
            </h1>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={status === "loading"}
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6 shadow-sm min-w-[140px]"
            >
              {status === "loading" ? "Đang lưu..." : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Lưu Hệ Thống
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Cài đặt Thông báo */}
        {isSupported && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between mt-2 mb-4">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                {isSubscribed ? <Bell className="w-5 h-5 text-orange-500" /> : <BellOff className="w-5 h-5 text-slate-400" />}
                Nhắc nhở từ vựng Sổ tay
              </h3>
              <p className="text-sm text-slate-500 mt-1">Gửi 1 câu ngẫu nhiên lúc 8h, 12h, 20h mỗi ngày.</p>
            </div>
            <Button
              onClick={handleTogglePush}
              disabled={isPushLoading}
              variant={isSubscribed ? "default" : "outline"}
              className={isSubscribed ? "bg-orange-600 hover:bg-orange-700 text-white" : ""}
            >
              {isPushLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isSubscribed ? "Đang Bật" : "Đã Tắt")}
            </Button>
          </div>
        )}

        {/* Thông báo trạng thái */}
        {status === "error" && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold">Đã có lỗi xảy ra</h3>
              <p className="text-sm mt-1">{message}</p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold">Thành công!</h3>
              <p className="text-sm mt-1">{message}</p>
            </div>
          </div>
        )}

        {/* Trình soạn thảo JSON */}
        <div className="inline-flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl mb-2 w-full sm:w-auto">
          <button 
            onClick={() => setMode("editAll")}
            className={`flex-1 sm:flex-none px-4 py-2.5 text-sm font-semibold rounded-lg transition-all ${mode === "editAll" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"}`}
          >
            Chỉnh sửa toàn bộ
          </button>
          <button 
            onClick={() => setMode("addNew")}
            className={`flex-1 sm:flex-none px-4 py-2.5 text-sm font-semibold rounded-lg transition-all ${mode === "addNew" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"}`}
          >
            + Thêm bài mới nhanh
          </button>
        </div>

        {mode === "editAll" ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-[65vh]">
            <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700 rounded-t-2xl flex justify-between items-center text-sm font-medium text-slate-500">
              <span>src/data/lessons.json</span>
              <span className="text-xs">Chỉ chấp nhận dữ liệu Array JSON</span>
            </div>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="flex-1 w-full p-4 bg-transparent resize-none outline-none font-mono text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-orange-500/50 rounded-b-2xl transition-all"
              spellCheck="false"
              placeholder="Paste array JSON của bạn vào đây..."
            />
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-[65vh]">
            <div className="bg-orange-50 dark:bg-slate-800 px-4 py-2 border-b border-orange-100 dark:border-slate-700 rounded-t-2xl flex justify-between items-center text-sm font-medium text-orange-600 dark:text-orange-400">
              <span>Thêm 1 bài học mới</span>
              <span className="text-xs">Chỉ dán (paste) Object JSON của 1 bài học</span>
            </div>
            <textarea
              value={newLessonJson}
              onChange={(e) => setNewLessonJson(e.target.value)}
              className="flex-1 w-full p-4 bg-transparent resize-none outline-none font-mono text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-orange-500/50 transition-all"
              spellCheck="false"
              placeholder="{\n  &quot;id&quot;: &quot;lesson-new&quot;,\n  &quot;title&quot;: &quot;Tiêu đề bài học...&quot;\n  ...\n}"
            />
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-950/50 rounded-b-2xl">
              <Button onClick={handleAppendNewLesson} className="bg-orange-600 hover:bg-orange-700 text-white">
                Thêm vào danh sách hiện tại
              </Button>
            </div>
          </div>
        )}
      </div>
      )}
    </main>
  );
}
