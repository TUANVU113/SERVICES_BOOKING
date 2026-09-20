"use client";

import React from "react";
import { Scissors, Calendar, Star, ShieldCheck, Clock, Award } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface HeroSectionProps {
  onOpenBooking: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenBooking }) => {
  const { isLoggedIn, user, openLoginModal } = useAuth();

  return (
    <section id="hero" className="relative min-h-screen pt-32 pb-20 flex items-center bg-zinc-950 overflow-hidden">
      {/* Background Glows & Pattern */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-600/10 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Subtle Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(circle, #f59e0b 1px, transparent 1px)`,
          backgroundSize: `32px 32px`,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-wider uppercase backdrop-blur-sm">
              <Scissors className="w-4 h-4 text-amber-400 transform -rotate-45" />
              <span>GENTLEMAN BARBER SHOP & STYLING</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
              ĐẲNG CẤP <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">
                PHONG CÁCH QUÝ ÔNG
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-lg text-zinc-300 max-w-2xl leading-relaxed">
              Trải nghiệm dịch vụ cắt tóc, cạo râu và chăm sóc da đầu chuyên nghiệp hàng đầu. Đội ngũ Master Barber đỉnh cao sẵn sàng định hình phong cách độc bản cho riêng bạn.
            </p>

            {/* Personalized greeting note if logged in */}
            {isLoggedIn && user && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                <span>
                  Chào mừng quý khách <strong>{user.fullName}</strong> trở lại với Gentleman Barber! Hãy chọn khung giờ lý tưởng cho bạn.
                </span>
              </div>
            )}

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={onOpenBooking}
                className="py-4 px-8 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-zinc-950 font-extrabold text-base rounded-2xl shadow-xl shadow-amber-500/25 active:scale-95 transition-all flex items-center gap-3 cursor-pointer"
              >
                <Calendar className="w-5 h-5" />
                <span>ĐẶT LỊCH CẮT TÓC NGAY</span>
              </button>

              {!isLoggedIn && (
                <button
                  onClick={openLoginModal}
                  className="py-4 px-6 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white font-bold text-base rounded-2xl border border-zinc-700 transition-all cursor-pointer"
                >
                  Đăng nhập tích điểm
                </button>
              )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-zinc-800/80">
              <div>
                <div className="text-3xl font-black text-amber-400">15.000+</div>
                <div className="text-xs text-zinc-400 mt-1 font-medium">Khách hàng hài lòng</div>
              </div>
              <div>
                <div className="text-3xl font-black text-amber-400">12+</div>
                <div className="text-xs text-zinc-400 mt-1 font-medium">Barber Stylists Pro</div>
              </div>
              <div>
                <div className="text-3xl font-black text-amber-400">4.9 ★</div>
                <div className="text-xs text-zinc-400 mt-1 font-medium">Đánh giá xuất sắc</div>
              </div>
            </div>
          </div>

          {/* Right Hero Image Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl overflow-hidden border border-amber-500/30 bg-zinc-900 shadow-2xl shadow-amber-500/10 group">
              <img
                src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1000&q=80"
                alt="Barber Shop Craftsmanship"
                className="w-full h-[480px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

              {/* Floating Highlight Card */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-zinc-900/90 backdrop-blur-md border border-zinc-800 flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Combo Cắt Tóc VIP 7 Bước</h4>
                    <p className="text-xs text-zinc-400">Rửa mặt • Cắt • Cạo • Gội • Sấy kiểu</p>
                  </div>
                </div>
                <span className="text-base font-extrabold text-amber-400">120K</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
