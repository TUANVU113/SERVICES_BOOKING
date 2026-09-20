"use client";

import React from "react";
import { Star, Award, Scissors } from "lucide-react";

export const stylistsData = [
  {
    id: "alex-tran",
    name: "Master Barber Alex Trần",
    role: "Giám Đốc Sáng Tạo / Founder",
    experience: "10 năm kinh nghiệm",
    specialty: "Undercut, Classic Fade, Tattoo Hair Art",
    rating: 5.0,
    reviews: 1240,
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "david-nguyen",
    name: "Senior Stylist David Nguyễn",
    role: "Chuyên Gia Uốn / Colorist",
    experience: "7 năm kinh nghiệm",
    specialty: "Texture Perm, Mullet, Dye Khói",
    rating: 4.9,
    reviews: 890,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "hung-barber",
    name: "Stylist Hùng Barber",
    role: "Chuyên Gia Cạo Râu & Sidepart",
    experience: "5 năm kinh nghiệm",
    specialty: "Sidepart 7/3, Pompadour, Cạo râu cổ điển",
    rating: 4.9,
    reviews: 670,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
  },
];

export const StylistsSection: React.FC = () => {
  return (
    <section id="stylists" className="py-24 bg-zinc-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Scissors className="w-4 h-4 transform -rotate-45" />
            <span>TOP MASTER BARBERS</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            ĐỘI NGŨ <span className="text-amber-400">BARBER PRO</span>
          </h2>

          <p className="text-zinc-400 text-base">
            Những nghệ nhân tay kéo tài hoa được đào tạo chuyên sâu, sẵn sàng giúp quý khách kiến tạo phong cách ấn tượng nhất.
          </p>
        </div>

        {/* Stylists Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stylistsData.map((stylist) => (
            <div
              key={stylist.id}
              className="group relative bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-amber-500/50 transition-all duration-300 flex flex-col items-center text-center shadow-xl"
            >
              {/* Avatar Container */}
              <div className="relative w-36 h-36 mb-6">
                <img
                  src={stylist.avatar}
                  alt={stylist.name}
                  className="w-full h-full object-cover rounded-full border-2 border-amber-400/40 p-1 group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute bottom-1 right-1 p-2 rounded-full bg-amber-500 text-zinc-950 shadow-md">
                  <Award className="w-4 h-4" />
                </span>
              </div>

              {/* Name & Role */}
              <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                {stylist.name}
              </h3>
              <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider mt-1">
                {stylist.role}
              </p>

              {/* Rating */}
              <div className="flex items-center justify-center gap-1 my-3 text-amber-400 text-sm font-bold bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{stylist.rating}</span>
                <span className="text-zinc-400 text-xs font-normal">({stylist.reviews} đánh giá)</span>
              </div>

              <p className="text-xs text-zinc-400 font-medium">
                {stylist.experience} • {stylist.specialty}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
