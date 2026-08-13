"use client";

import { Volume2, Snail } from "lucide-react";
import { PinyinText } from "./PinyinText";
import { useTTS } from "@/hooks/useTTS";

interface VocabCardProps {
  word: string;
  meaning: string;
}

export function VocabCard({ word, meaning }: VocabCardProps) {
  const { speak } = useTTS();

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-[#E2D8CE]/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex justify-between items-start gap-4">
        <PinyinText text={word} size="lg" />
        <div className="flex flex-col gap-1 items-center justify-center shrink-0">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              speak(word);
            }}
            className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors"
            title="Nghe tốc độ thường"
          >
            <Volume2 className="w-5 h-5" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              speak(word, "zh-TW", true);
            }}
            className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
            title="Nghe chậm"
          >
            <Snail className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        <p className="text-slate-600 dark:text-slate-300 font-medium text-lg">{meaning}</p>
      </div>
    </div>
  );
}
