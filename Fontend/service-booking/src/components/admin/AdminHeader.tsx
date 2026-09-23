"use client";

import React from "react";
import Link from "next/link";
import { Scissors, ShieldCheck, Home, LogOut, Radio } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSignalR } from "@/context/SignalRContext";

export const AdminHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const { isConnected, connectionState } = useSignalR();

  return (
    <header className="bg-zinc-950 border-b border-zinc-800 py-4 px-6 sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500 text-zinc-950 font-bold">
            <Scissors className="w-5 h-5 transform -rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-white tracking-wider leading-none">
                GENTLEMAN BARBER
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-extrabold uppercase">
                ADMIN PANEL
              </span>
            </div>
            <p className="text-xs text-zinc-400">Trang quản trị hệ thống dịch vụ</p>
          </div>
        </div>

        {/* Right User & Controls */}
        <div className="flex items-center gap-4">
          {/* SignalR Connection Status Indicator */}
          <div
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isConnected
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : connectionState === "Reconnecting"
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : "bg-zinc-900 border-zinc-800 text-zinc-500"
            }`}
            title={`Trạng thái SignalR: ${connectionState}`}
          >
            <Radio className={`w-3.5 h-3.5 ${isConnected ? "animate-pulse text-emerald-400" : ""}`} />
            <span>
              {isConnected
                ? "Real-time đang bật"
                : connectionState === "Reconnecting"
                ? "Đang kết nối lại..."
                : "Real-time ngoại tuyến"}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="text-zinc-300">Quản trị viên:</span>
            <span className="font-bold text-white">{user?.fullName || "Admin"}</span>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 py-2 px-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-xl text-xs font-semibold transition-all"
          >
            <Home className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Trang Chủ</span>
          </Link>

          <button
            onClick={logout}
            className="flex items-center gap-2 py-2 px-3.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng Xuất</span>
          </button>
        </div>

      </div>
    </header>
  );
};
