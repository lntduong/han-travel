"use client";

import { useState, useEffect, useCallback } from "react";

export function useTTS() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const updateVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    
    // Some browsers need this event to load voices
    window.speechSynthesis.onvoiceschanged = updateVoices;
    updateVoices();

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback((text: string, lang = "zh-TW") => {
    if (!window.speechSynthesis) return;
    
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    
    // Try to find a specific voice for the language (preferably Taiwan Mandarin)
    const voice = voices.find(v => v.lang === "zh-TW" || v.lang.includes("zh-"));
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.rate = 0.85; // slightly slower for language learning
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  }, [voices]);

  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return { speak, stop, isSpeaking };
}
