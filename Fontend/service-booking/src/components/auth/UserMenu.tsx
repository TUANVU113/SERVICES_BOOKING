"use client";

import React, { useState, useRef, useEffect } from "react";
import { User as UserIcon, LogOut, Calendar, ChevronDown, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 py-2 px-3.5 bg-zinc-900/90 hover:bg-zinc-800 border border-amber-500/40 rounded-full transition-all text-white shadow-lg cursor-pointer"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-zinc-950 font-bold text-sm">
          {user.fullName ? user.fullName.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
        </div>

        <div className="text-left hidden sm:block">
          <span className="text-xs text-amber-400 font-medium block leading-none mb-0.5">
            Xin chào,
          </span>
          <span className="text-sm font-semibold text-white block leading-tight">
            {user.fullName}
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-amber-400" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 py-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 text-white animate-fade-in backdrop-blur-xl">
          <div className="px-4 py-3 border-b border-zinc-800/80">
            <p className="text-xs text-zinc-400">Tài khoản thành viên</p>
            <p className="text-sm font-bold text-amber-400 truncate mt-0.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              {user.fullName}
            </p>
          </div>

          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                alert("Tính năng đang được phát triển!");
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors"
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              Lịch sử đặt cắt tóc
            </button>
          </div>

          <div className="border-t border-zinc-800/80 pt-1 mt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors font-medium cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
