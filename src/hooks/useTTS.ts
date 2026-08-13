"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Dọn dẹp audio khi component bị huỷ
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const speak = useCallback((text: string, lang = "zh-TW") => {
    if (!text) return;

    // Dừng âm thanh cũ nếu đang phát
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    try {
      // Sử dụng Google Translate TTS API ngầm (client=tw-ob giúp bypass CORS/Blocks)
      const encodedText = encodeURIComponent(text);
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodedText}`;
      
      const audio = new Audio(url);
      audioRef.current = audio;
      
      setIsSpeaking(true);
      
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => setIsSpeaking(false);
      
      // Bắt đầu phát
      audio.play().catch(error => {
        console.error("Lỗi phát âm thanh Google TTS:", error);
        setIsSpeaking(false);
      });
    } catch (error) {
      console.error("Lỗi khởi tạo âm thanh:", error);
      setIsSpeaking(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
  }, []);

  return { speak, stop, isSpeaking };
}
