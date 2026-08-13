"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { login } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setPin(["", "", "", "", "", ""]);
      setError(false);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const val = value.slice(-1);
    const newPin = [...pin];
    newPin[index] = val;
    setPin(newPin);
    setError(false);

    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newPin.every(p => p !== "")) {
      verifyPin(newPin.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      const newPin = ["", "", "", "", "", ""];
      for (let i = 0; i < pasted.length; i++) {
        newPin[i] = pasted[i];
      }
      setPin(newPin);
      if (pasted.length === 6) {
        verifyPin(pasted);
      } else {
        inputRefs.current[pasted.length]?.focus();
      }
    }
  };

  const verifyPin = (pinStr: string) => {
    setIsVerifying(true);
    setTimeout(() => {
      const success = login(pinStr);
      if (success) {
        onClose();
      } else {
        setError(true);
        setPin(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
      setIsVerifying(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-sm p-6 relative overflow-hidden transition-all"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mt-4 mb-8">
          <div className="mx-auto w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Xác thực quyền truy cập</h2>
          <p className="text-sm text-slate-500 mt-2">Nhập mã PIN 6 số để mở khóa nội dung.</p>
        </div>

        <div className="flex justify-between gap-2 mb-8">
          {pin.map((v, i) => (
            <input
              key={i}
              ref={el => {
                inputRefs.current[i] = el;
              }}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={v}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              onPaste={handlePaste}
              className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 outline-none transition-all ${
                error 
                  ? 'border-red-400 bg-red-50 text-red-600' 
                  : v 
                    ? 'border-orange-500 text-orange-600 bg-orange-50 dark:bg-orange-900/20' 
                    : 'border-slate-200 focus:border-orange-400 dark:border-slate-700 bg-transparent dark:text-slate-100'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-center text-red-500 text-sm font-medium -mt-4 mb-4">Mã PIN không chính xác!</p>
        )}

        <div className="flex justify-center h-6">
          {isVerifying && <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />}
        </div>
      </div>
    </div>
  );
}
