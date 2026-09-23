"use client";

import React from "react";
import { CheckCircle, AlertCircle, Info, X, Calendar, User, Clock, RefreshCw } from "lucide-react";
import { BookingItem } from "@/types/booking";

export interface ToastMessage {
  id: string;
  type: "booking_created" | "status_changed" | "info" | "error";
  title: string;
  message?: string;
  booking?: BookingItem;
  createdAt: Date;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "Pending":
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">Chờ xác nhận</span>;
      case "Confirmed":
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Đã xác nhận</span>;
      case "Completed":
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">Hoàn thành</span>;
      case "Cancelled":
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500/20 text-red-400 border border-red-500/30">Đã hủy</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((toast) => {
        const isCreated = toast.type === "booking_created";
        const isStatusChanged = toast.type === "status_changed";

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex flex-col gap-2 p-4 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300 animate-slide-in ${
              isCreated
                ? "bg-zinc-900/95 border-amber-500/50 text-zinc-100 shadow-amber-500/10"
                : isStatusChanged
                ? "bg-zinc-900/95 border-blue-500/50 text-zinc-100 shadow-blue-500/10"
                : toast.type === "error"
                ? "bg-zinc-900/95 border-red-500/50 text-zinc-100"
                : "bg-zinc-900/95 border-zinc-700/50 text-zinc-100"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {isCreated && (
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                )}
                {isStatusChanged && (
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <RefreshCw className="w-5 h-5 animate-spin-slow" />
                  </div>
                )}
                {toast.type === "info" && (
                  <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300">
                    <Info className="w-5 h-5" />
                  </div>
                )}
                {toast.type === "error" && (
                  <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-sm text-zinc-100">{toast.title}</h4>
                  {toast.message && <p className="text-xs text-zinc-400 mt-0.5">{toast.message}</p>}
                </div>
              </div>

              <button
                onClick={() => onClose(toast.id)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded-lg hover:bg-zinc-800"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {toast.booking && (
              <div className="mt-1 pt-2 border-t border-zinc-800/80 text-xs text-zinc-300 space-y-1 bg-zinc-950/40 p-2.5 rounded-lg">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-amber-400 font-semibold">{toast.booking.bookingCode}</span>
                  {getStatusBadge(toast.booking.status)}
                </div>
                <div className="flex items-center justify-between text-zinc-400 pt-0.5">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-zinc-500" />
                    {toast.booking.customerName}
                  </span>
                  <span className="text-zinc-300 font-medium">{toast.booking.serviceName}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    {new Date(toast.booking.startTime).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(toast.booking.startTime).toLocaleDateString("vi-VN")}
                  </span>
                  <span className="text-zinc-500">Thợ: {toast.booking.staffName}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
