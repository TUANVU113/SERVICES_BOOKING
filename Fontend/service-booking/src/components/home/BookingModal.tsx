"use client";

import React, { useState, useEffect } from "react";
import { X, Scissors, Calendar, Clock, User as UserIcon, Phone, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { stylistsData } from "./StylistsSection";
import { Toast } from "@/components/ui/Toast";
import { serviceApi } from "@/services/serviceApi";
import { ServiceItem } from "@/types/service";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedService?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  preSelectedService,
}) => {
  const { user, isLoggedIn, openLoginModal } = useAuth();

  const [availableServices, setAvailableServices] = useState<ServiceItem[]>([]);
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedStylist, setSelectedStylist] = useState(stylistsData[0].name);
  const [bookingDate, setBookingDate] = useState("2026-09-20");
  const [bookingTime, setBookingTime] = useState("10:00");
  const [customerName, setCustomerName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState("0901234567");
  const [note, setNote] = useState("");

  const [isSuccess, setIsSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      serviceApi
        .getServices(1, 20)
        .then((res) => {
          if (res.data && res.data.length > 0) {
            setAvailableServices(res.data);
            if (preSelectedService) {
              setSelectedService(preSelectedService);
            } else {
              setSelectedService(res.data[0].name);
            }
          }
        })
        .catch(() => {
          // Fallback static list
          const fallback = [
            { id: 1, name: "Cắt tóc nam", description: "", durationMinutes: 30, price: 100000, isActive: true },
            { id: 2, name: "Uốn tóc Hàn Quốc", description: "", durationMinutes: 90, price: 350000, isActive: true },
            { id: 3, name: "Nhuộm tóc thời trang", description: "", durationMinutes: 60, price: 250000, isActive: true },
          ];
          setAvailableServices(fallback);
          setSelectedService(preSelectedService || fallback[0].name);
        });
    }
  }, [isOpen, preSelectedService]);

  if (!isOpen) return null;

  const availableTimes = [
    "09:00", "09:45", "10:30", "11:15", "13:30", "14:15", "15:00", "16:00", "17:00", "18:30"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim()) {
      alert("Vui lòng nhập họ tên và số điện thoại liên hệ");
      return;
    }

    setIsSuccess(true);
    setToastMessage(`Đặt lịch thành công cho ${customerName || user?.fullName}! Chúng tôi đã gửi xác nhận.`);
  };

  return (
    <>
      {toastMessage && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage(null)}
        />
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
        <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-zinc-900 border border-amber-500/30 shadow-2xl text-white">
          
          {/* Header */}
          <div className="sticky top-0 z-10 px-6 py-5 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Scissors className="w-5 h-5 transform -rotate-45" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Đặt Lịch Cắt Tóc Quý Ông</h3>
                <p className="text-xs text-zinc-400">Gentleman Barber Booking Service</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          {isSuccess ? (
            <div className="p-8 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-white">ĐẶT LỊCH THÀNH CÔNG!</h3>
              <p className="text-sm text-zinc-300 max-w-md mx-auto">
                Cảm ơn <strong>{customerName || user?.fullName}</strong>. Chúng tôi đã ghi nhận lịch hẹn dịch vụ <strong>{selectedService}</strong> vào lúc <strong>{bookingTime} - Ngày {bookingDate}</strong>.
              </p>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-left text-xs space-y-2 max-w-md mx-auto">
                <p>• <strong>Thợ cắt tóc:</strong> {selectedStylist}</p>
                <p>• <strong>Số điện thoại:</strong> {phone}</p>
                <p>• <strong>Địa điểm:</strong> 123 Đường Lê Lợi, Quận 1, TPHCM</p>
              </div>

              <button
                onClick={() => {
                  setIsSuccess(false);
                  onClose();
                }}
                className="mt-4 py-3 px-8 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl shadow-lg cursor-pointer"
              >
                Hoàn Tất & Quay Về Trang Chủ
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {!isLoggedIn && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-center justify-between">
                  <span>Bạn chưa đăng nhập? Đăng nhập ngay để tích điểm thưởng thành viên.</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      openLoginModal();
                    }}
                    className="px-3 py-1 bg-amber-500 text-zinc-950 font-bold rounded-lg shrink-0 ml-2"
                  >
                    Đăng Nhập
                  </button>
                </div>
              )}

              {/* Step 1: Choose Service */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  1. Chọn Dịch Vụ
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full py-3 px-4 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                >
                  {availableServices.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({Number(s.price).toLocaleString("vi-VN")} đ)
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Choose Stylist */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  2. Chọn Barber Stylist
                </label>
                <select
                  value={selectedStylist}
                  onChange={(e) => setSelectedStylist(e.target.value)}
                  className="w-full py-3 px-4 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                >
                  {stylistsData.map((st) => (
                    <option key={st.id} value={st.name}>
                      {st.name} ({st.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 3: Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    3. Chọn Ngày Cắt Tóc
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full py-3 px-4 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    4. Giờ Khung Giờ
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {availableTimes.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setBookingTime(t)}
                        className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                          bookingTime === t
                            ? "bg-amber-500 border-amber-500 text-zinc-950 font-bold"
                            : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 4: Contact Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-800">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Họ và Tên Khách Hàng *
                  </label>
                  <input
                    type="text"
                    value={customerName || user?.fullName || ""}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full py-3 px-4 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Số Điện Thoại Liên Hệ *
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0901234567"
                    className="w-full py-3 px-4 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Note */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Ghi chú cho Barber (Tùy chọn)
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Muốn cắt sát 2 bên fade thấp, xịt thêm dưỡng..."
                  className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-extrabold text-base rounded-2xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
              >
                XÁC NHẬN ĐẶT LỊCH
              </button>
            </form>
          )}

        </div>
      </div>
    </>
  );
};
