"use client";

import React from "react";
import { Scissors, MapPin, Phone, Mail, Clock, Shield } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer id="footer" className="bg-zinc-950 border-t border-zinc-800 text-zinc-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Col 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500 text-zinc-950 font-bold">
                <Scissors className="w-5 h-5 transform -rotate-45" />
              </div>
              <span className="text-xl font-black text-white tracking-wider">
                GENTLEMAN BARBER
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Thương hiệu tiệm cắt tóc quý ông đẳng cấp tại Việt Nam. Định hình phong cách, chăm sóc tận tâm và mang đến trải nghiệm đỉnh cao.
            </p>
            <div className="text-xs text-amber-400 font-semibold flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              <span>Cam kết 100% Khách hàng hài lòng</span>
            </div>
          </div>

          {/* Col 2: Hours */}
          <div className="space-y-3">
            <h4 className="text-base font-bold text-white uppercase tracking-wider">
              Thời Gian Mở Cửa
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Thứ 2 - Chủ Nhật: 08:00 - 18:00</span>
              </li>
              <li className="text-amber-400 font-medium pt-1">
                * Phục vụ xuyên suốt các ngày lễ lớn trong năm
              </li>
            </ul>
          </div>

          {/* Col 3: Contact */}
          <div className="space-y-3">
            <h4 className="text-base font-bold text-white uppercase tracking-wider">
              Liên Hệ & Vị Trí
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>14 Văn Chung Phường 13 Tân Bình  TPHCM</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Hotline: 0394057627</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Email: tuanvu27102004@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-base font-bold text-white uppercase tracking-wider">
              Hệ Thống & Bảo Mật
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Tích hợp hệ thống quản lý lịch hẹn thông minh
            </p>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-zinc-900 text-center text-xs text-zinc-400">
          © 2026 Gentleman Barber Shop.Thiết kế và phát triển bởi VuDaiCaXaHoiDen.
        </div>
      </div>
    </footer>
  );
};
