"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = "success",
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const isSuccess = type === "success";

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl backdrop-blur-md border border-white/10 transition-all duration-300 animate-slide-up ${
        isSuccess
          ? "bg-emerald-950/90 text-emerald-200 border-emerald-500/40"
          : "bg-rose-950/90 text-rose-200 border-rose-500/40"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
      ) : (
        <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />
      )}
      <span className="text-sm font-medium pr-2">{message}</span>
      <button
        onClick={onClose}
        className="p-1 text-white/60 hover:text-white rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
