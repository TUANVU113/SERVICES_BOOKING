"use client";

import React, { useState, useEffect } from "react";
import { Scissors, LogIn, Calendar, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { UserMenu } from "@/components/auth/UserMenu";

interface HeaderProps {
  onOpenBooking: () => void;
  onOpenMyBookings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenBooking, onOpenMyBookings }) => {
  const { isLoggedIn, openLoginModal } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 py-3 shadow-2xl"
          : "bg-gradient-to-b from-black/90 via-black/40 to-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-zinc-950 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Scissors className="w-6 h-6 transform -rotate-45" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-wider text-white block leading-none">
                GENTLEMAN
              </span>
              <span className="text-xs tracking-[0.25em] font-medium text-amber-400 block uppercase">
                Barber & Spa
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-300">
            <a href="#hero" className="hover:text-amber-400 transition-colors">
              Trang Chủ
            </a>
            <a href="#services" className="hover:text-amber-400 transition-colors">
              Dịch Vụ & Bảng Giá
            </a>
            <a href="#stylists" className="hover:text-amber-400 transition-colors">
              Đội Ngu Barber
            </a>
            <a href="#footer" className="hover:text-amber-400 transition-colors">
              Liên Hệ & Vị Trí
            </a>
          </nav>

          {/* Auth Button OR User Menu Greeting */}
          <div className="hidden md:flex items-center gap-4">
            {!isLoggedIn ? (
              <button
                onClick={openLoginModal}
                className="flex items-center gap-2 py-2.5 px-5 bg-zinc-900 hover:bg-zinc-800 border border-amber-500/30 text-amber-400 font-semibold rounded-xl transition-all shadow-md cursor-pointer hover:border-amber-400"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng Nhập</span>
              </button>
            ) : (
              <>
                <UserMenu />
                {onOpenMyBookings && (
                  <button
                    onClick={onOpenMyBookings}
                    className="flex items-center gap-2 py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-zinc-800 hover:border-amber-500/40 font-semibold rounded-xl text-xs transition-all cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Lịch Đặt Của Tôi</span>
                  </button>
                )}
              </>
            )}

            <button
              onClick={onOpenBooking}
              className="flex items-center gap-2 py-2.5 px-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer text-xs sm:text-sm"
            >
              <Calendar className="w-4 h-4" />
              <span>Đặt Lịch Ngay</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {isLoggedIn && <UserMenu />}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 text-zinc-300 hover:text-white rounded-xl bg-zinc-900 border border-zinc-800"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4 animate-fade-in shadow-2xl">
            <nav className="flex flex-col space-y-3 text-base font-medium text-zinc-300">
              <a
                href="#hero"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-amber-400 transition-colors py-1"
              >
                Trang Chủ
              </a>
              <a
                href="#services"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-amber-400 transition-colors py-1"
              >
                Dịch Vụ & Bảng Giá
              </a>
              <a
                href="#stylists"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-amber-400 transition-colors py-1"
              >
                Đội Ngũ Barber
              </a>
              <a
                href="#footer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-amber-400 transition-colors py-1"
              >
                Liên Hệ & Vị Trí
              </a>
            </nav>

            <div className="pt-3 border-t border-zinc-800 flex flex-col gap-3">
              {!isLoggedIn && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openLoginModal();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-800 text-amber-400 font-semibold rounded-xl border border-amber-500/30"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Đăng Nhập</span>
                </button>
              )}

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenBooking();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold rounded-xl"
              >
                <Calendar className="w-5 h-5" />
                <span>Đặt Lịch Cắt Tóc</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
