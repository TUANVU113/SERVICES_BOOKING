"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { X, Scissors, Calendar, Clock, User as UserIcon, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Toast } from "@/components/ui/Toast";
import { serviceApi } from "@/services/serviceApi";
import { staffApi } from "@/services/staffApi";
import { bookingApi } from "@/services/bookingApi";
import { ServiceItem } from "@/types/service";
import { StaffItem } from "@/types/staff";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedService?: string;
}

// Generate time slots between 08:00 and 18:00 (30-minute intervals)
const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00"
];

// Helper YYYY-MM-DD
const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  preSelectedService,
}) => {
  const { user, isLoggedIn, token, openLoginModal } = useAuth();

  const todayStr = useMemo(() => getTodayDateString(), []);

  // Services & Staffs Data (Filtered Active Only)
  const [activeServices, setActiveServices] = useState<ServiceItem[]>([]);
  const [activeStaffs, setActiveStaffs] = useState<StaffItem[]>([]);

  // Selected State
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [bookingDate, setBookingDate] = useState<string>(todayStr);
  const [bookingTime, setBookingTime] = useState<string>("09:00");
  const [customerNote, setCustomerNote] = useState<string>("");

  // Available Slots state from API 4
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);

  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // 1. Fetch Active Services & Active Staffs
  useEffect(() => {
    if (isOpen) {
      setIsLoadingData(true);
      setErrorMsg(null);
      setIsSuccess(false);

      Promise.all([
        serviceApi.getServices(1, 100),
        staffApi.getStaffs(1, 100, token || undefined),
      ])
        .then(([servicesRes, staffsRes]) => {
          // Filter ONLY ACTIVE items
          const validServices = (servicesRes.data || []).filter((s) => s.isActive !== false);
          const validStaffs = (staffsRes.data || []).filter((st) => st.isActive !== false);

          setActiveServices(validServices);
          setActiveStaffs(validStaffs);

          // Pre-select service if passed or default to first
          let initialService = validServices[0] || null;
          if (preSelectedService) {
            const matched = validServices.find(
              (s) => s.name.toLowerCase() === preSelectedService.toLowerCase()
            );
            if (matched) initialService = matched;
          }

          if (initialService) setSelectedServiceId(initialService.id);
          if (validStaffs.length > 0) setSelectedStaffId(validStaffs[0].id);

          setBookingDate(todayStr);
        })
        .catch((err) => {
          setErrorMsg(err instanceof Error ? err.message : "Không thể tải danh sách dịch vụ và nhân viên");
        })
        .finally(() => {
          setIsLoadingData(false);
        });
    }
  }, [isOpen, preSelectedService, token, todayStr]);

  // 2. Fetch Available Slots whenever serviceId, staffId, or date changes
  const fetchAvailableSlots = useCallback(async () => {
    if (!selectedServiceId || !selectedStaffId || !bookingDate) return;
    setIsLoadingSlots(true);
    try {
      const res = await bookingApi.getAvailableSlots(
        selectedServiceId,
        selectedStaffId,
        bookingDate,
        token || undefined
      );
      setAvailableSlots(res.availableSlots || []);
      // If currently selected time is not in available slots, reset to first available slot
      if (res.availableSlots && res.availableSlots.length > 0) {
        if (!res.availableSlots.includes(bookingTime)) {
          setBookingTime(res.availableSlots[0]);
        }
      }
    } catch {
      // Fallback: assume all slots open if endpoint returns error
      setAvailableSlots(TIME_SLOTS);
    } finally {
      setIsLoadingSlots(false);
    }
  }, [selectedServiceId, selectedStaffId, bookingDate, bookingTime, token]);

  useEffect(() => {
    if (isOpen && selectedServiceId && selectedStaffId && bookingDate) {
      fetchAvailableSlots();
    }
  }, [isOpen, selectedServiceId, selectedStaffId, bookingDate, fetchAvailableSlots]);

  if (!isOpen) return null;

  // Helper check if time slot is in past for selected date
  const isSlotInPast = (slotStr: string): boolean => {
    if (!bookingDate) return false;
    const now = new Date();
    const [year, month, day] = bookingDate.split("-").map(Number);
    const [hours, minutes] = slotStr.split(":").map(Number);
    const slotDateTime = new Date(year, month - 1, day, hours, minutes, 0);
    return slotDateTime.getTime() < now.getTime();
  };

  // Handle Create Booking
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedServiceId) {
      setErrorMsg("Vui lòng chọn dịch vụ.");
      return;
    }
    if (!selectedStaffId) {
      setErrorMsg("Vui lòng chọn thợ cắt tóc.");
      return;
    }
    if (!bookingDate || bookingDate < todayStr) {
      setErrorMsg("Ngày đặt lịch không hợp lệ hoặc đã ở trong quá khứ.");
      return;
    }
    if (isSlotInPast(bookingTime)) {
      setErrorMsg("Khung giờ bạn chọn đã trôi qua trong quá khứ!");
      return;
    }

    setIsSubmitting(true);
    const startTimeIso = `${bookingDate}T${bookingTime.length === 5 ? `${bookingTime}:00` : bookingTime}`;

    try {
      const res = await bookingApi.createBooking(
        {
          serviceId: selectedServiceId,
          staffId: selectedStaffId,
          startTime: startTimeIso,
          customerNote: customerNote.trim() || undefined,
        },
        token || undefined
      );

      setIsSuccess(true);
      setToast({
        message: res.message || "Tạo lịch đặt hẹn thành công!",
        type: "success",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Tạo lịch đặt thất bại";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentServiceObj = activeServices.find((s) => s.id === selectedServiceId);
  const currentStaffObj = activeStaffs.find((st) => st.id === selectedStaffId);

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
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
                <p className="text-xs text-zinc-400">Gentleman Barber Online Booking</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          {isLoadingData ? (
            <div className="p-12 text-center space-y-3">
              <Loader2 className="w-10 h-10 text-amber-400 animate-spin mx-auto" />
              <p className="text-sm text-zinc-400">Đang tải danh sách dịch vụ & thợ cắt tóc...</p>
            </div>
          ) : isSuccess ? (
            <div className="p-8 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-white">ĐẶT LỊCH THÀNH CÔNG!</h3>
              <p className="text-sm text-zinc-300 max-w-md mx-auto">
                Cảm ơn <strong>{user?.fullName || "Quý khách"}</strong>. Lịch hẹn dịch vụ <strong>{currentServiceObj?.name}</strong> đã được gửi lên hệ thống.
              </p>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-left text-xs space-y-2 max-w-md mx-auto">
                <p>• <strong>Dịch vụ:</strong> {currentServiceObj?.name} ({Number(currentServiceObj?.price || 0).toLocaleString("vi-VN")} đ)</p>
                <p>• <strong>Thợ phụ trách:</strong> {currentStaffObj?.fullName}</p>
                <p>• <strong>Thời gian:</strong> {bookingTime} - Ngày {bookingDate}</p>
                {customerNote && <p>• <strong>Ghi chú:</strong> {customerNote}</p>}
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
                  <span>Bạn chưa đăng nhập? Đăng nhập ngay để quản lý lịch đặt dễ dàng.</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      openLoginModal();
                    }}
                    className="px-3 py-1 bg-amber-500 text-zinc-950 font-bold rounded-lg shrink-0 ml-2 cursor-pointer"
                  >
                    Đăng Nhập
                  </button>
                </div>
              )}

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Step 1: Select Active Service (Hide locked ones) */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  1. Chọn Dịch Vụ <span className="text-rose-500">*</span>
                </label>
                {activeServices.length === 0 ? (
                  <p className="text-xs text-rose-400 italic">Hiện không có dịch vụ nào đang hoạt động.</p>
                ) : (
                  <select
                    value={selectedServiceId || ""}
                    onChange={(e) => setSelectedServiceId(Number(e.target.value))}
                    className="w-full py-3 px-4 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {activeServices.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} - ({Number(s.price).toLocaleString("vi-VN")} đ • {s.durationMinutes} phút)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Step 2: Select Active Staff (Hide locked ones) */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  2. Chọn Barber Stylist Phụ Trách <span className="text-rose-500">*</span>
                </label>
                {activeStaffs.length === 0 ? (
                  <p className="text-xs text-rose-400 italic">Hiện chưa có nhân viên nào sẵn sàng phục vụ.</p>
                ) : (
                  <select
                    value={selectedStaffId || ""}
                    onChange={(e) => setSelectedStaffId(Number(e.target.value))}
                    className="w-full py-3 px-4 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {activeStaffs.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.fullName} ({st.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Step 3: Date Picker & Interactive Slots (08:00 to 18:00) */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    3. Chọn Ngày Hẹn <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full py-3 px-4 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[10px] text-zinc-500">Khóa chọn các ngày trong quá khứ</p>
                </div>

                {/* Slots grid from 08:00 to 18:00 with occupied / past slot dimming */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                      4. Chọn Khung Giờ Khả Dụng (08:00 - 18:00, bước 30p) <span className="text-rose-500">*</span>
                    </label>
                    {isLoadingSlots && (
                      <span className="text-[10px] text-amber-400 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Đang kiểm tra lịch trống...
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {TIME_SLOTS.map((t) => {
                      const isPast = isSlotInPast(t);
                      // Check if slot is returned as available by backend API 4
                      const isAvailableByApi = availableSlots.length === 0 || availableSlots.includes(t);
                      const isOptionDisabled = isPast || !isAvailableByApi;

                      let labelExtra = "";
                      if (isPast) labelExtra = "(Đã qua)";
                      else if (!isAvailableByApi) labelExtra = "(Bận)";

                      return (
                        <button
                          key={t}
                          type="button"
                          disabled={isOptionDisabled}
                          onClick={() => setBookingTime(t)}
                          className={`py-2 px-1 text-xs font-semibold rounded-xl border transition-all text-center flex flex-col items-center justify-center ${
                            bookingTime === t && !isOptionDisabled
                              ? "bg-amber-500 border-amber-500 text-zinc-950 font-bold shadow-md"
                              : isOptionDisabled
                              ? "bg-zinc-950/80 border-zinc-800/60 text-zinc-600 opacity-40 cursor-not-allowed"
                              : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:text-white hover:border-amber-500/50 cursor-pointer"
                          }`}
                        >
                          <span>{t}</span>
                          {labelExtra && <span className="text-[9px] opacity-75">{labelExtra}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Step 4: Customer Note */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Ghi Chú Yêu Cầu Dịch Vụ (Tùy chọn)
                </label>
                <textarea
                  rows={2}
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="Ví dụ: Uốn kiểu Pháp, cắt uốn xoăn xù nhẹ..."
                  className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || activeServices.length === 0 || activeStaffs.length === 0}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-extrabold text-base rounded-2xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>ĐANG XỬ LÝ ĐẶT LỊCH...</span>
                  </>
                ) : (
                  <span>XÁC NHẬN ĐẶT LỊCH NGAY</span>
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </>
  );
};
