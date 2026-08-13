"use client";

import { pinyin } from "pinyin-pro";

interface PinyinTextProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  inheritColor?: boolean; 
}

const toneColors = {
  0: "text-slate-500 dark:text-slate-400", 
  1: "text-red-500 dark:text-red-400",   
  2: "text-amber-500 dark:text-amber-400", 
  3: "text-emerald-500 dark:text-emerald-400", 
  4: "text-blue-500 dark:text-blue-400",  
};

export function PinyinText({ text, className = "", size = "md", inheritColor = false }: PinyinTextProps) {
  // Use pinyin-pro to parse text into an array of characters with their details
  const parsed = pinyin(text, { type: "all" });

  const speakChar = (char: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(char);
      utterance.lang = 'zh-TW'; // Traditional Chinese / Taiwan
      window.speechSynthesis.speak(utterance);
    }
  };

  const sizeClasses = {
    sm: { ruby: "text-sm", rt: "text-[10px]" },
    md: { ruby: "text-base", rt: "text-xs" },
    lg: { ruby: "text-xl md:text-2xl", rt: "text-sm md:text-base" },
    xl: { ruby: "text-3xl md:text-4xl", rt: "text-lg md:text-xl" },
  };

  return (
    <div className={`flex flex-wrap items-end ${className}`}>
      {parsed.map((item, index) => {
        const baseColor = inheritColor ? "" : "text-[#1e293b] dark:text-slate-200";
        
        // Non-Chinese characters (punctuation, numbers, English)
        if (!item.isZh) {
          return (
            <span key={index} className={`${sizeClasses[size].ruby} font-medium ${baseColor} pb-1`}>
              {item.origin}
            </span>
          );
        }

        // Apply tone colors only if not inheriting (to avoid bad contrast on colored backgrounds)
        const toneColor = toneColors[item.num as keyof typeof toneColors] || toneColors[0];
        const pinyinColor = inheritColor ? "opacity-90" : toneColor;

        return (
          <ruby 
            key={index} 
            onClick={(e) => {
              e.stopPropagation();
              speakChar(item.origin);
            }}
            className={`cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 rounded px-[2px] transition-colors ${sizeClasses[size].ruby} font-medium ${baseColor} text-center`}
            title="Bấm để nghe đọc chữ này"
          >
            {item.origin}
            <rt className={`${sizeClasses[size].rt} font-normal ${pinyinColor} mb-[2px]`}>
              {item.pinyin}
            </rt>
          </ruby>
        );
      })}
    </div>
  );
}
