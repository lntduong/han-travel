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
      // Sử dụng API mở của Google Translate (client=gtx) để không bị lỗi CORS/403
      const encodedText = encodeURIComponent(text);
      const url = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=${lang}&q=${encodedText}`;
      
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
