"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Calendar,
  Clock,
  Scissors,
  User,
  Ban,
  CheckCircle2,
  Clock3,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Filter,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { bookingApi } from "@/services/bookingApi";
import { BookingItem, BookingStatus } from "@/types/booking";
import { Toast } from "@/components/ui/Toast";

interface UserBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserBookingsModal: React.FC<UserBookingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { token, isLoggedIn } = useAuth();

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize] = useState<number>(5);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");

  // Cancel Modal State
  const [cancelingBooking, setCancelingBooking] = useState<BookingItem | null>(null);
  const [cancellationReason, setCancellationReason] = useState<string>("");
  const [isSubmittingCancel, setIsSubmittingCancel] = useState<boolean>(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const loadBookings = useCallback(
    async (page: number = 1) => {
      if (!isLoggedIn || !token) return;
      setIsLoading(true);
      try {
        const res = await bookingApi.getBookings(
          page,
          pageSize,
          statusFilter || undefined,
          dateFilter || undefined,
          token
        );
        setBookings(res.data || []);
        setPageNumber(res.pageNumber || page);
        setTotalCount(res.totalCount || 0);
        setTotalPages(res.totalPages || 1);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Không thể tải danh sách lịch đặt";
        setToast({ message: msg, type: "error" });
      } finally {
        setIsLoading(false);
      }
    },
    [isLoggedIn, token, pageSize, statusFilter, dateFilter]
  );

  useEffect(() => {
    if (isOpen && isLoggedIn && token) {
      loadBookings(1);
    }
  }, [isOpen, isLoggedIn, token, loadBookings]);

  // Listen to SignalR real-time status updates for customer bookings
  useEffect(() => {
    const handleBookingStatusChanged = (e: Event) => {
      const customEvent = e as CustomEvent<BookingItem>;
      const updatedBooking = customEvent.detail;
      setBookings((prev) =>
        prev.map((b) => (b.id === updatedBooking.id ? { ...b, status: updatedBooking.status } : b))
      );
    };

    window.addEventListener("booking:statusChanged", handleBookingStatusChanged);
    return () => {
      window.removeEventListener("booking:statusChanged", handleBookingStatusChanged);
    };
  }, []);

  if (!isOpen) return null;

  // Handle Cancel Submit
  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    setCancelError(null);

    if (!cancellationReason.trim()) {
      setCancelError("Vui lòng nhập lý do hủy lịch.");
      return;
    }

    if (!cancelingBooking || cancelingBooking.status !== "Pending") {
      setCancelError("Chỉ có thể hủy lịch khi đang ở trạng thái Chờ xác nhận (Pending)!");
      return;
    }

    setIsSubmittingCancel(true);
    try {
      const res = await bookingApi.cancelBooking(
        cancelingBooking.id,
        { cancellationReason: cancellationReason.trim() },
        token || undefined
      );

      setToast({ message: res.message || `Đã hủy lịch đặt #${cancelingBooking.id} thành công`, type: "success" });
      setCancelingBooking(null);
      setCancellationReason("");
      loadBookings(pageNumber);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Hủy lịch thất bại";
      setCancelError(msg);
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-bold">
            <Clock3 className="w-3 h-3" /> Chờ xác nhận
          </span>
        );
      case "Confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[11px] font-bold">
            <CheckCircle2 className="w-3 h-3" /> Đã xác nhận
          </span>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
            <CheckCircle2 className="w-3 h-3" /> Hoàn thành
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[11px] font-bold">
            <XCircle className="w-3 h-3" /> Đã hủy
          </span>
        );
      default:
        return null;
    }
  };

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
        <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-zinc-900 border border-amber-500/30 shadow-2xl text-white flex flex-col">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Lịch Sử Đặt Hẹn Của Tôi</h3>
                <p className="text-xs text-zinc-400">Xem và quản lý các lịch cắt tóc đã đặt</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Bar */}
          <div className="p-4 bg-zinc-950/80 border-b border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 w-full sm:w-auto text-xs text-zinc-400">
              <Filter className="w-4 h-4 text-amber-400" />
              <span className="font-bold">Lọc theo:</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-1.5 px-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="Pending">Chờ xác nhận (Pending)</option>
                <option value="Confirmed">Đã xác nhận (Confirmed)</option>
                <option value="Completed">Hoàn thành (Completed)</option>
                <option value="Cancelled">Đã hủy (Cancelled)</option>
              </select>

              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="py-1.5 px-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />

              {(statusFilter || dateFilter) && (
                <button
                  onClick={() => {
                    setStatusFilter("");
                    setDateFilter("");
                  }}
                  className="text-xs text-amber-400 hover:underline"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>

          {/* Bookings List */}
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {isLoading ? (
              <div className="py-12 text-center text-zinc-400 space-y-2">
                <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
                <p className="text-xs">Đang tải danh sách đặt hẹn của bạn...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 italic text-sm">
                Bạn chưa có lịch đặt hẹn nào phù hợp với bộ lọc.
              </div>
            ) : (
              bookings.map((b) => {
                const canCancel = b.status === "Pending";

                return (
                  <div
                    key={b.id}
                    className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-amber-400 text-sm">
                          {b.bookingCode || `#BK${b.id}`}
                        </span>
                        {getStatusBadge(b.status)}
                      </div>

                      <div className="text-xs text-zinc-400 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Hẹn lúc: <strong className="text-white">{b.startTime ? b.startTime.replace("T", " ") : ""}</strong></span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2 text-zinc-300">
                        <Scissors className="w-4 h-4 text-amber-400 shrink-0 transform -rotate-45" />
                        <span>Dịch vụ: <strong className="text-white">{b.serviceName}</strong></span>
                      </div>

                      <div className="flex items-center gap-2 text-zinc-300">
                        <User className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Thợ phụ trách: <strong className="text-white">{b.staffName}</strong></span>
                      </div>
                    </div>

                    {b.customerNote && (
                      <p className="text-xs text-zinc-400 italic bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800">
                        Ghi chú: "{b.customerNote}"
                      </p>
                    )}

                    {b.cancellationReason && (
                      <p className="text-xs text-rose-300 bg-rose-950/30 p-2.5 rounded-xl border border-rose-500/20">
                        Lý do hủy: {b.cancellationReason}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="pt-2 flex items-center justify-end">
                      <button
                        disabled={!canCancel}
                        onClick={() => {
                          if (canCancel) {
                            setCancelingBooking(b);
                            setCancellationReason("");
                            setCancelError(null);
                          }
                        }}
                        className={`py-2 px-4 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                          canCancel
                            ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 cursor-pointer"
                            : "bg-zinc-900 border border-zinc-800 text-zinc-600 opacity-40 cursor-not-allowed"
                        }`}
                        title={canCancel ? "Hủy lịch hẹn này" : "Chỉ có thể hủy khi lịch đang ở trạng thái Chờ xác nhận (Pending)"}
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Hủy Đặt Lịch</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <div className="px-6 py-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 shrink-0">
              <div>
                Trang <span className="font-bold text-white">{pageNumber}</span> / <span className="font-bold text-white">{totalPages}</span> (Tổng số {totalCount} lịch đặt)
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={pageNumber <= 1 || isLoading}
                  onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  disabled={pageNumber >= totalPages || isLoading}
                  onClick={() => setPageNumber((prev) => Math.min(totalPages, prev + 1))}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Cancellation Reason Modal */}
      {cancelingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-zinc-900 border border-rose-500/30 shadow-2xl text-white p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h4 className="text-base font-bold text-rose-400 flex items-center gap-2">
                <Ban className="w-5 h-5" />
                <span>Xác Nhận Hủy Booking #{cancelingBooking.id}</span>
              </h4>
              <button
                onClick={() => setCancelingBooking(null)}
                className="text-zinc-400 hover:text-white text-xs"
              >
                Đóng
              </button>
            </div>

            {cancelError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{cancelError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmCancel} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-300">
                  Lý Do Hủy Lịch <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Ví dụ: Khách bận đột xuất, thay đổi kế hoạch..."
                  className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelingBooking(null)}
                  className="py-2.5 px-4 bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs hover:bg-zinc-700"
                >
                  Quay Lại
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingCancel}
                  className="py-2.5 px-5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl text-xs shadow-lg shadow-rose-500/20 flex items-center gap-1.5"
                >
                  {isSubmittingCancel ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <span>Xác Nhận Hủy</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
