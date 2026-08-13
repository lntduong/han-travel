"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import lessonsData from "@/data/lessons.json";

export default function AdminPage() {
  const [jsonText, setJsonText] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  // Tải dữ liệu JSON hiện tại khi mở trang
  useEffect(() => {
    setJsonText(JSON.stringify(lessonsData, null, 2));
  }, []);

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

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="icon" className="rounded-full">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Quản trị Dữ liệu Bài học (Git CMS)
            </h1>
          </div>
          
          <Button 
            onClick={handleSave} 
            disabled={status === "loading"}
            className="bg-orange-600 hover:bg-orange-700 text-white min-w-[120px]"
          >
            {status === "loading" ? "Đang lưu..." : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Lưu Hệ Thống
              </>
            )}
          </Button>
        </div>

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
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-[70vh]">
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
      </div>
    </main>
  );
}
