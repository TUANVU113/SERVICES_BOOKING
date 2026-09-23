"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Scissors,
  Users,
  Plus,
  Edit2,
  Lock,
  Unlock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  Mail,
  UserCheck,
  Calendar,
  BookOpen,
  Filter,
  Ban,
  Clock3,
  CheckCheck,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { serviceApi } from "@/services/serviceApi";
import { staffApi } from "@/services/staffApi";
import { bookingApi } from "@/services/bookingApi";
import { ServiceItem, CreateServicePayload, UpdateServicePayload } from "@/types/service";
import { StaffItem, CreateStaffPayload, UpdateStaffPayload } from "@/types/staff";
import { BookingItem, BookingStatus } from "@/types/booking";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ServiceFormModal } from "@/components/admin/ServiceFormModal";
import { StaffFormModal } from "@/components/admin/StaffFormModal";
import { WorkScheduleModal } from "@/components/admin/WorkScheduleModal";
import { Toast } from "@/components/ui/Toast";

export default function AdminPage() {
  const router = useRouter();
  const { token, isLoggedIn, isAdmin, isLoading: isAuthLoading } = useAuth();

  // Tab state: "services" | "staffs" | "bookings"
  const [activeTab, setActiveTab] = useState<"services" | "staffs" | "bookings">("services");

  // ================= SERVICES STATE =================
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [servicesPage, setServicesPage] = useState<number>(1);
  const [servicesPageSize] = useState<number>(10);
  const [servicesTotalCount, setServicesTotalCount] = useState<number>(0);
  const [servicesTotalPages, setServicesTotalPages] = useState<number>(1);
  const [isLoadingServices, setIsLoadingServices] = useState<boolean>(true);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isSubmittingService, setIsSubmittingService] = useState<boolean>(false);

  // ================= STAFFS STATE =================
  const [staffs, setStaffs] = useState<StaffItem[]>([]);
  const [staffsPage, setStaffsPage] = useState<number>(1);
  const [staffsPageSize] = useState<number>(10);
  const [staffsTotalCount, setStaffsTotalCount] = useState<number>(0);
  const [staffsTotalPages, setStaffsTotalPages] = useState<number>(1);
  const [isLoadingStaffs, setIsLoadingStaffs] = useState<boolean>(true);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState<boolean>(false);
  const [editingStaff, setEditingStaff] = useState<StaffItem | null>(null);
  const [isSubmittingStaff, setIsSubmittingStaff] = useState<boolean>(false);

  // ================= WORK SCHEDULE STATE =================
  const [scheduleStaff, setScheduleStaff] = useState<StaffItem | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);

  // ================= BOOKINGS STATE =================
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [bookingsPage, setBookingsPage] = useState<number>(1);
  const [bookingsPageSize] = useState<number>(10);
  const [bookingsTotalCount, setBookingsTotalCount] = useState<number>(0);
  const [bookingsTotalPages, setBookingsTotalPages] = useState<number>(1);
  const [isLoadingBookings, setIsLoadingBookings] = useState<boolean>(true);
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>("");
  const [bookingDateFilter, setBookingDateFilter] = useState<string>("");

  // Cancel Admin Dialog State
  const [cancelingBooking, setCancelingBooking] = useState<BookingItem | null>(null);
  const [cancelReason, setCancelReason] = useState<string>("");
  const [isSubmittingCancel, setIsSubmittingCancel] = useState<boolean>(false);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // 1. Fetch Services List
  const loadServices = useCallback(async (page: number = 1) => {
    setIsLoadingServices(true);
    try {
      const result = await serviceApi.getServices(page, servicesPageSize);
      setServices(result.data || []);
      setServicesPage(result.pageNumber || page);
      setServicesTotalCount(result.totalCount || result.data?.length || 0);
      setServicesTotalPages(result.totalPages || 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể tải danh sách dịch vụ";
      setToast({ message: msg, type: "error" });
    } finally {
      setIsLoadingServices(false);
    }
  }, [servicesPageSize]);

  // 2. Fetch Staffs List
  const loadStaffs = useCallback(async (page: number = 1) => {
    setIsLoadingStaffs(true);
    try {
      const result = await staffApi.getStaffs(page, staffsPageSize, token || undefined);
      setStaffs(result.data || []);
      setStaffsPage(result.pageNumber || page);
      setStaffsTotalCount(result.totalCount || result.data?.length || 0);
      setStaffsTotalPages(result.totalPages || 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể tải danh sách nhân viên";
      setToast({ message: msg, type: "error" });
    } finally {
      setIsLoadingStaffs(false);
    }
  }, [staffsPageSize, token]);

  // 3. Fetch Bookings List (Admin)
  const loadBookings = useCallback(async (page: number = 1) => {
    setIsLoadingBookings(true);
    try {
      const result = await bookingApi.getBookings(
        page,
        bookingsPageSize,
        bookingStatusFilter || undefined,
        bookingDateFilter || undefined,
        token || undefined
      );
      setBookings(result.data || []);
      setBookingsPage(result.pageNumber || page);
      setBookingsTotalCount(result.totalCount || result.data?.length || 0);
      setBookingsTotalPages(result.totalPages || 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể tải danh sách lịch đặt";
      setToast({ message: msg, type: "error" });
    } finally {
      setIsLoadingBookings(false);
    }
  }, [bookingsPageSize, bookingStatusFilter, bookingDateFilter, token]);

  // Check auth & load active tab data
  useEffect(() => {
    if (!isAuthLoading) {
      if (!isLoggedIn || !isAdmin) {
        router.push("/");
        return;
      }
      if (activeTab === "services") {
        loadServices(servicesPage);
      } else if (activeTab === "staffs") {
        loadStaffs(staffsPage);
      } else if (activeTab === "bookings") {
        loadBookings(bookingsPage);
      }
    }
  }, [isAuthLoading, isLoggedIn, isAdmin, activeTab, servicesPage, staffsPage, bookingsPage, loadServices, loadStaffs, loadBookings, router]);

  // Real-time booking updates via SignalR custom DOM events
  useEffect(() => {
    const handleBookingCreated = (e: Event) => {
      const customEvent = e as CustomEvent<BookingItem>;
      const newBooking = customEvent.detail;
      console.log("⚡ [AdminPage] Live BookingCreated event:", newBooking);

      setBookings((prev) => {
        // Avoid duplicate booking
        if (prev.some((b) => b.id === newBooking.id)) return prev;
        return [newBooking, ...prev];
      });
      setBookingsTotalCount((prev) => prev + 1);
    };

    const handleBookingStatusChanged = (e: Event) => {
      const customEvent = e as CustomEvent<BookingItem>;
      const updatedBooking = customEvent.detail;
      console.log("⚡ [AdminPage] Live BookingStatusChanged event:", updatedBooking);

      setBookings((prev) =>
        prev.map((b) => (b.id === updatedBooking.id ? { ...b, status: updatedBooking.status } : b))
      );
    };

    window.addEventListener("booking:created", handleBookingCreated);
    window.addEventListener("booking:statusChanged", handleBookingStatusChanged);

    return () => {
      window.removeEventListener("booking:created", handleBookingCreated);
      window.removeEventListener("booking:statusChanged", handleBookingStatusChanged);
    };
  }, []);

  // Service Handlers
  const handleServiceSubmit = async (payload: CreateServicePayload | UpdateServicePayload) => {
    if (!token) return;
    setIsSubmittingService(true);
    try {
      if (editingService) {
        const res = await serviceApi.updateService(editingService.id, payload, token);
        setToast({ message: res.message || `Cập nhật dịch vụ #${editingService.id} thành công!`, type: "success" });
      } else {
        const res = await serviceApi.createService(payload, token);
        setToast({ message: res.message || "Tạo mới dịch vụ thành công!", type: "success" });
      }
      setIsServiceModalOpen(false);
      setEditingService(null);
      loadServices(servicesPage);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Thao tác dịch vụ thất bại";
      setToast({ message: msg, type: "error" });
    } finally {
      setIsSubmittingService(false);
    }
  };

  const handleLockService = async (id: number) => {
    if (!token || !confirm(`Bạn có chắc chắn muốn KHÓA dịch vụ #${id}?`)) return;
    try {
      const res = await serviceApi.lockService(id, token);
      setToast({ message: res.message || `Đã khóa dịch vụ #${id} thành công`, type: "success" });
      loadServices(servicesPage);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể khóa dịch vụ";
      setToast({ message: msg, type: "error" });
    }
  };

  const handleUnlockService = async (id: number) => {
    if (!token) return;
    try {
      const res = await serviceApi.unlockService(id, token);
      setToast({ message: res.message || `Đã mở khóa dịch vụ #${id} thành công`, type: "success" });
      loadServices(servicesPage);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể mở khóa dịch vụ";
      setToast({ message: msg, type: "error" });
    }
  };

  // Staff Handlers
  const handleStaffSubmit = async (payload: CreateStaffPayload | UpdateStaffPayload) => {
    if (!token) return;
    setIsSubmittingStaff(true);
    try {
      if (editingStaff) {
        const res = await staffApi.updateStaff(editingStaff.id, payload, token);
        setToast({ message: res.message || `Cập nhật nhân viên #${editingStaff.id} thành công!`, type: "success" });
      } else {
        const res = await staffApi.createStaff(payload, token);
        setToast({ message: res.message || "Tạo mới nhân viên thành công!", type: "success" });
      }
      setIsStaffModalOpen(false);
      setEditingStaff(null);
      loadStaffs(staffsPage);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Thao tác nhân viên thất bại";
      setToast({ message: msg, type: "error" });
    } finally {
      setIsSubmittingStaff(false);
    }
  };

  const handleLockStaff = async (id: number) => {
    if (!token || !confirm(`Bạn có chắc chắn muốn KHÓA nhân viên #${id}?`)) return;
    try {
      const res = await staffApi.lockStaff(id, token);
      setToast({ message: res.message || `Đã khóa nhân viên #${id} thành công`, type: "success" });
      loadStaffs(staffsPage);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể khóa nhân viên";
      setToast({ message: msg, type: "error" });
    }
  };

  const handleUnlockStaff = async (id: number) => {
    if (!token) return;
    try {
      const res = await staffApi.unlockStaff(id, token);
      setToast({ message: res.message || `Đã mở khóa nhân viên #${id} thành công`, type: "success" });
      loadStaffs(staffsPage);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể mở khóa nhân viên";
      setToast({ message: msg, type: "error" });
    }
  };

  // Booking Action Handlers (Confirm, Complete, Cancel)
  const handleConfirmBooking = async (id: number) => {
    if (!token) return;
    if (!confirm(`Bạn có chắc chắn muốn XÁC NHẬN lịch đặt #${id}?`)) return;
    try {
      const res = await bookingApi.confirmBooking(id, token);
      setToast({ message: res.message || `Đã xác nhận booking #${id}`, type: "success" });
      loadBookings(bookingsPage);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể xác nhận booking";
      setToast({ message: msg, type: "error" });
    }
  };

  const handleCompleteBooking = async (id: number) => {
    if (!token) return;
    if (!confirm(`Xác nhận HOÀN THÀNH dịch vụ cho booking #${id}?`)) return;
    try {
      const res = await bookingApi.completeBooking(id, token);
      setToast({ message: res.message || `Booking #${id} đã hoàn thành`, type: "success" });
      loadBookings(bookingsPage);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể hoàn thành booking";
      setToast({ message: msg, type: "error" });
    }
  };

  const handleConfirmCancelBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !cancelingBooking) return;
    if (!cancelReason.trim()) {
      setToast({ message: "Vui lòng nhập lý do hủy lịch", type: "error" });
      return;
    }
    setIsSubmittingCancel(true);
    try {
      const res = await bookingApi.cancelBooking(
        cancelingBooking.id,
        { cancellationReason: cancelReason.trim() },
        token
      );
      setToast({ message: res.message || `Đã hủy lịch đặt #${cancelingBooking.id}`, type: "success" });
      setCancelingBooking(null);
      setCancelReason("");
      loadBookings(bookingsPage);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể hủy booking";
      setToast({ message: msg, type: "error" });
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold">
            <Clock3 className="w-3.5 h-3.5" /> Pending (Chờ xác nhận)
          </span>
        );
      case "Confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed (Đã xác nhận)
          </span>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
            <CheckCheck className="w-3.5 h-3.5" /> Completed (Hoàn thành)
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-bold">
            <XCircle className="w-3.5 h-3.5" /> Cancelled (Đã hủy)
          </span>
        );
      default:
        return null;
    }
  };

  if (isAuthLoading || (!isLoggedIn || !isAdmin)) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-amber-400 animate-spin mx-auto" />
          <p className="text-sm text-zinc-400">Đang kiểm tra quyền truy cập Admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Admin Header */}
      <AdminHeader />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        
        {/* Navigation Tabs (Services, Staffs, Bookings) */}
        <div className="flex flex-wrap items-center gap-2 p-2 bg-zinc-900 rounded-2xl border border-zinc-800 w-fit">
          <button
            onClick={() => setActiveTab("services")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === "services"
                ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <Scissors className="w-4 h-4 transform -rotate-45" />
            <span>QUẢN LÝ DỊCH VỤ</span>
          </button>

          <button
            onClick={() => setActiveTab("staffs")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === "staffs"
                ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>QUẢN LÝ NHÂN VIÊN</span>
          </button>

          <button
            onClick={() => setActiveTab("bookings")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === "bookings"
                ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>QUẢN LÝ ĐẶT LỊCH (BOOKINGS)</span>
          </button>
        </div>

        {/* ================= TAB 1: SERVICES MANAGEMENT ================= */}
        {activeTab === "services" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
              <div>
                <h1 className="text-2xl font-black text-white flex items-center gap-2">
                  <Scissors className="w-6 h-6 text-amber-400 transform -rotate-45" />
                  DANH SÁCH DỊCH VỤ BARBER
                </h1>
                <p className="text-xs text-zinc-400 mt-1">
                  Tổng số dịch vụ: <strong className="text-amber-400">{servicesTotalCount}</strong> • Trang {servicesPage} / {servicesTotalPages}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => loadServices(servicesPage)}
                  className="p-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer"
                  title="Tải lại danh sách"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingServices ? "animate-spin text-amber-400" : ""}`} />
                </button>

                <button
                  onClick={() => {
                    setEditingService(null);
                    setIsServiceModalOpen(true);
                  }}
                  className="flex-1 sm:flex-initial py-3 px-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-extrabold rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                  <span>THÊM DỊCH VỤ MỚI</span>
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-950/80 border-b border-zinc-800 text-xs uppercase font-bold text-amber-400 tracking-wider">
                      <th className="py-4 px-4 text-center">ID</th>
                      <th className="py-4 px-6">Tên Dịch Vụ</th>
                      <th className="py-4 px-6">Mô Tả</th>
                      <th className="py-4 px-4 text-center">Thời Lượng</th>
                      <th className="py-4 px-6 text-right">Giá Dịch Vụ</th>
                      <th className="py-4 px-4 text-center">Trạng Thái</th>
                      <th className="py-4 px-6 text-center">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-sm">
                    {isLoadingServices ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-zinc-400">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                            <span>Đang tải dữ liệu dịch vụ từ máy chủ...</span>
                          </div>
                        </td>
                      </tr>
                    ) : services.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-zinc-400">
                          Chưa có dịch vụ nào trong hệ thống. Hãy bấm "Thêm Dịch Vụ Mới".
                        </td>
                      </tr>
                    ) : (
                      services.map((s) => (
                        <tr key={s.id} className="hover:bg-zinc-800/40 transition-colors group">
                          <td className="py-4 px-4 text-center font-mono font-bold text-zinc-400">
                            #{s.id}
                          </td>
                          <td className="py-4 px-6 font-bold text-white group-hover:text-amber-400 transition-colors">
                            {s.name}
                          </td>
                          <td className="py-4 px-6 text-zinc-300 max-w-xs truncate text-xs">
                            {s.description || <span className="italic text-zinc-500">Chưa có mô tả</span>}
                          </td>
                          <td className="py-4 px-4 text-center text-xs font-semibold text-zinc-300">
                            <span className="inline-flex items-center gap-1 bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800">
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              {s.durationMinutes} phút
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right font-mono font-extrabold text-amber-400 text-base">
                            {Number(s.price).toLocaleString("vi-VN")} đ
                          </td>
                          <td className="py-4 px-4 text-center">
                            {s.isActive ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Hoạt động
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-bold">
                                <XCircle className="w-3.5 h-3.5" />
                                Đã khóa
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingService(s);
                                  setIsServiceModalOpen(true);
                                }}
                                className="p-2 rounded-lg bg-zinc-800 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-400 border border-zinc-700 hover:border-amber-500/40 transition-all cursor-pointer"
                                title="Sửa thông tin dịch vụ"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              {s.isActive ? (
                                <button
                                  onClick={() => handleLockService(s.id)}
                                  className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all cursor-pointer"
                                  title="Khóa dịch vụ này"
                                >
                                  <Lock className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUnlockService(s.id)}
                                  className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer"
                                  title="Mở khóa dịch vụ này"
                                >
                                  <Unlock className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {servicesTotalPages > 0 && (
                <div className="px-6 py-4 bg-zinc-950/80 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
                  <div>
                    Hiển thị trang <span className="font-bold text-white">{servicesPage}</span> / <span className="font-bold text-white">{servicesTotalPages}</span> (Tổng số {servicesTotalCount} dịch vụ)
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={servicesPage <= 1 || isLoadingServices}
                      onClick={() => setServicesPage((prev) => Math.max(1, prev - 1))}
                      className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Trang trước</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: servicesTotalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => setServicesPage(p)}
                          className={`w-8 h-8 rounded-lg font-bold transition-all text-xs ${
                            p === servicesPage
                              ? "bg-amber-500 text-zinc-950"
                              : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>

                    <button
                      disabled={servicesPage >= servicesTotalPages || isLoadingServices}
                      onClick={() => setServicesPage((prev) => Math.min(servicesTotalPages, prev + 1))}
                      className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>Trang sau</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: STAFFS MANAGEMENT ================= */}
        {activeTab === "staffs" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
              <div>
                <h1 className="text-2xl font-black text-white flex items-center gap-2">
                  <Users className="w-6 h-6 text-amber-400" />
                  DANH SÁCH NHÂN VIÊN BARBER
                </h1>
                <p className="text-xs text-zinc-400 mt-1">
                  Tổng số nhân viên: <strong className="text-amber-400">{staffsTotalCount}</strong> • Trang {staffsPage} / {staffsTotalPages}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => loadStaffs(staffsPage)}
                  className="p-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer"
                  title="Tải lại danh sách"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingStaffs ? "animate-spin text-amber-400" : ""}`} />
                </button>

                <button
                  onClick={() => {
                    setEditingStaff(null);
                    setIsStaffModalOpen(true);
                  }}
                  className="flex-1 sm:flex-initial py-3 px-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-extrabold rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                  <span>THÊM NHÂN VIÊN MỚI</span>
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-950/80 border-b border-zinc-800 text-xs uppercase font-bold text-amber-400 tracking-wider">
                      <th className="py-4 px-4 text-center">ID</th>
                      <th className="py-4 px-6">Họ Và Tên</th>
                      <th className="py-4 px-6">Email Liên Hệ</th>
                      <th className="py-4 px-4 text-center">Trạng Thái</th>
                      <th className="py-4 px-6 text-center">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-sm">
                    {isLoadingStaffs ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-zinc-400">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                            <span>Đang tải danh sách nhân viên từ máy chủ...</span>
                          </div>
                        </td>
                      </tr>
                    ) : staffs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-zinc-400">
                          Chưa có nhân viên nào trong hệ thống. Hãy bấm "Thêm Nhân Viên Mới".
                        </td>
                      </tr>
                    ) : (
                      staffs.map((st) => (
                        <tr key={st.id} className="hover:bg-zinc-800/40 transition-colors group">
                          <td className="py-4 px-4 text-center font-mono font-bold text-zinc-400">
                            #{st.id}
                          </td>
                          <td className="py-4 px-6 font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xs font-bold">
                              {st.fullName ? st.fullName.charAt(0).toUpperCase() : "N"}
                            </div>
                            <span>{st.fullName}</span>
                          </td>
                          <td className="py-4 px-6 text-zinc-300 text-xs">
                            <span className="inline-flex items-center gap-1.5 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800 font-mono text-zinc-300">
                              <Mail className="w-3.5 h-3.5 text-amber-400" />
                              {st.email}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            {st.isActive ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                                <UserCheck className="w-3.5 h-3.5" />
                                Hoạt động
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-bold">
                                <XCircle className="w-3.5 h-3.5" />
                                Đã khóa
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                disabled={!st.isActive}
                                onClick={() => {
                                  if (st.isActive) {
                                    setScheduleStaff(st);
                                    setIsScheduleModalOpen(true);
                                  }
                                }}
                                className={`px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 text-xs font-bold ${
                                  st.isActive
                                    ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30 cursor-pointer"
                                    : "bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed opacity-40"
                                }`}
                                title={st.isActive ? "Quản lý lịch làm việc của nhân viên này" : "Nhân viên đã bị khóa - Không thể xếp lịch"}
                              >
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Lịch làm việc</span>
                              </button>

                              <button
                                onClick={() => {
                                  setEditingStaff(st);
                                  setIsStaffModalOpen(true);
                                }}
                                className="p-2 rounded-lg bg-zinc-800 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-400 border border-zinc-700 hover:border-amber-500/40 transition-all cursor-pointer"
                                title="Sửa thông tin nhân viên"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              {st.isActive ? (
                                <button
                                  onClick={() => handleLockStaff(st.id)}
                                  className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all cursor-pointer"
                                  title="Khóa nhân viên này"
                                >
                                  <Lock className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUnlockStaff(st.id)}
                                  className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer"
                                  title="Mở khóa nhân viên này"
                                >
                                  <Unlock className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {staffsTotalPages > 0 && (
                <div className="px-6 py-4 bg-zinc-950/80 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
                  <div>
                    Hiển thị trang <span className="font-bold text-white">{staffsPage}</span> / <span className="font-bold text-white">{staffsTotalPages}</span> (Tổng số {staffsTotalCount} nhân viên)
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={staffsPage <= 1 || isLoadingStaffs}
                      onClick={() => setStaffsPage((prev) => Math.max(1, prev - 1))}
                      className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Trang trước</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: staffsTotalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => setStaffsPage(p)}
                          className={`w-8 h-8 rounded-lg font-bold transition-all text-xs ${
                            p === staffsPage
                              ? "bg-amber-500 text-zinc-950"
                              : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>

                    <button
                      disabled={staffsPage >= staffsTotalPages || isLoadingStaffs}
                      onClick={() => setStaffsPage((prev) => Math.min(staffsTotalPages, prev + 1))}
                      className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>Trang sau</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: BOOKINGS MANAGEMENT (ADMIN) ================= */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
              <div>
                <h1 className="text-2xl font-black text-white flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-amber-400" />
                  QUẢN LÝ TẤT CẢ LỊCH ĐẶT (BOOKINGS)
                </h1>
                <p className="text-xs text-zinc-400 mt-1">
                  Tổng số lịch đặt: <strong className="text-amber-400">{bookingsTotalCount}</strong> • Trang {bookingsPage} / {bookingsTotalPages}
                </p>
              </div>

              <button
                onClick={() => loadBookings(bookingsPage)}
                className="p-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer"
                title="Tải lại danh sách"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingBookings ? "animate-spin text-amber-400" : ""}`} />
              </button>
            </div>

            {/* Filter Bar */}
            <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
              <div className="flex items-center gap-2 font-bold">
                <Filter className="w-4 h-4 text-amber-400" />
                <span>Bộ Lọc Lịch Đặt:</span>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <select
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                  className="py-2 px-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="Pending">Pending (Chờ xác nhận)</option>
                  <option value="Confirmed">Confirmed (Đã xác nhận)</option>
                  <option value="Completed">Completed (Hoàn thành)</option>
                  <option value="Cancelled">Cancelled (Đã hủy)</option>
                </select>

                <input
                  type="date"
                  value={bookingDateFilter}
                  onChange={(e) => setBookingDateFilter(e.target.value)}
                  className="py-2 px-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />

                {(bookingStatusFilter || bookingDateFilter) && (
                  <button
                    onClick={() => {
                      setBookingStatusFilter("");
                      setBookingDateFilter("");
                    }}
                    className="text-amber-400 hover:underline"
                  >
                    Xóa lọc
                  </button>
                )}
              </div>
            </div>

            {/* Bookings Table */}
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-950/80 border-b border-zinc-800 font-bold uppercase text-amber-400 tracking-wider">
                      <th className="py-4 px-4 text-center">Mã Booking</th>
                      <th className="py-4 px-4">Khách Hàng</th>
                      <th className="py-4 px-4">Dịch Vụ</th>
                      <th className="py-4 px-4">Thợ Phụ Trách</th>
                      <th className="py-4 px-4">Thời Gian Hẹn</th>
                      <th className="py-4 px-4 text-center">Trạng Thái</th>
                      <th className="py-4 px-6 text-center">Thao Tác Quản Lý</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                    {isLoadingBookings ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-zinc-400">
                          <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-2" />
                          <span>Đang tải danh sách lịch đặt...</span>
                        </td>
                      </tr>
                    ) : bookings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-zinc-500 italic">
                          Không có lịch đặt nào phù hợp với bộ lọc.
                        </td>
                      </tr>
                    ) : (
                      bookings.map((b) => {
                        const canCancel = b.status === "Pending";

                        return (
                          <tr key={b.id} className="hover:bg-zinc-800/40 transition-colors">
                            <td className="py-4 px-4 text-center font-mono font-bold text-amber-400">
                              {b.bookingCode || `#BK${b.id}`}
                            </td>
                            <td className="py-4 px-4 font-bold text-white">
                              {b.customerName || `Khách hàng #${b.customerId}`}
                            </td>
                            <td className="py-4 px-4 font-medium text-zinc-200">
                              {b.serviceName}
                            </td>
                            <td className="py-4 px-4 text-zinc-300">
                              {b.staffName}
                            </td>
                            <td className="py-4 px-4 font-mono text-zinc-300">
                              {b.startTime ? b.startTime.replace("T", " ") : ""}
                            </td>
                            <td className="py-4 px-4 text-center">
                              {getStatusBadge(b.status)}
                            </td>
                            <td className="py-4 px-6 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                {/* Confirm Button (Pending -> Confirmed) */}
                                {b.status === "Pending" && (
                                  <button
                                    onClick={() => handleConfirmBooking(b.id)}
                                    className="py-1.5 px-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold transition-all cursor-pointer"
                                    title="Xác nhận lịch đặt (Pending -> Confirmed)"
                                  >
                                    Xác nhận
                                  </button>
                                )}

                                {/* Complete Button (Confirmed -> Completed) */}
                                {b.status === "Confirmed" && (
                                  <button
                                    onClick={() => handleCompleteBooking(b.id)}
                                    className="py-1.5 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
                                    title="Hoàn thành dịch vụ (Confirmed -> Completed)"
                                  >
                                    Hoàn thành
                                  </button>
                                )}

                                {/* Cancel Button (Can only cancel when status === 'Pending') */}
                                <button
                                  disabled={!canCancel}
                                  onClick={() => {
                                    if (canCancel) {
                                      setCancelingBooking(b);
                                      setCancelReason("");
                                    }
                                  }}
                                  className={`py-1.5 px-3 rounded-lg border text-xs font-bold transition-all flex items-center gap-1 ${
                                    canCancel
                                      ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30 cursor-pointer"
                                      : "bg-zinc-950 border-zinc-800 text-zinc-600 opacity-40 cursor-not-allowed"
                                  }`}
                                  title={canCancel ? "Hủy lịch đặt này" : "Chỉ được phép hủy khi ở trạng thái Chờ xác nhận (Pending)"}
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                  <span>Hủy</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bookings Pagination */}
              {bookingsTotalPages > 0 && (
                <div className="px-6 py-4 bg-zinc-950/80 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
                  <div>
                    Hiển thị trang <span className="font-bold text-white">{bookingsPage}</span> / <span className="font-bold text-white">{bookingsTotalPages}</span> (Tổng số {bookingsTotalCount} lịch đặt)
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={bookingsPage <= 1 || isLoadingBookings}
                      onClick={() => setBookingsPage((prev) => Math.max(1, prev - 1))}
                      className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Trang trước</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: bookingsTotalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => setBookingsPage(p)}
                          className={`w-8 h-8 rounded-lg font-bold transition-all text-xs ${
                            p === bookingsPage
                              ? "bg-amber-500 text-zinc-950"
                              : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>

                    <button
                      disabled={bookingsPage >= bookingsTotalPages || isLoadingBookings}
                      onClick={() => setBookingsPage((prev) => Math.min(bookingsTotalPages, prev + 1))}
                      className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>Trang sau</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Service Create/Edit Modal */}
      <ServiceFormModal
        isOpen={isServiceModalOpen}
        onClose={() => {
          setIsServiceModalOpen(false);
          setEditingService(null);
        }}
        onSubmit={handleServiceSubmit}
        editingService={editingService}
        isSubmitting={isSubmittingService}
      />

      {/* Staff Create/Edit Modal */}
      <StaffFormModal
        isOpen={isStaffModalOpen}
        onClose={() => {
          setIsStaffModalOpen(false);
          setEditingStaff(null);
        }}
        onSubmit={handleStaffSubmit}
        editingStaff={editingStaff}
        isSubmitting={isSubmittingStaff}
        existingStaffs={staffs}
      />

      {/* Staff WorkSchedule Modal */}
      <WorkScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setScheduleStaff(null);
        }}
        staff={scheduleStaff}
        token={token}
        onShowToast={(msg, type) => setToast({ message: msg, type })}
      />

      {/* Admin Cancel Booking Reason Dialog */}
      {cancelingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-zinc-900 border border-rose-500/30 shadow-2xl text-white p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h4 className="text-base font-bold text-rose-400 flex items-center gap-2">
                <Ban className="w-5 h-5" />
                <span>Admin Hủy Booking #{cancelingBooking.id}</span>
              </h4>
              <button
                onClick={() => setCancelingBooking(null)}
                className="text-zinc-400 hover:text-white text-xs"
              >
                Đóng
              </button>
            </div>

            <form onSubmit={handleConfirmCancelBooking} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-300">
                  Lý Do Hủy Booking <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Ví dụ: Khách hàng đổi lịch, thợ cắt tóc bận đột xuất..."
                  className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelingBooking(null)}
                  className="py-2.5 px-4 bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs hover:bg-zinc-700"
                >
                  Hủy Thao Tác
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
    </div>
  );
}
