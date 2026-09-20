"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Scissors,
  Plus,
  Edit2,
  Lock,
  Unlock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { serviceApi } from "@/services/serviceApi";
import { ServiceItem, CreateServicePayload, UpdateServicePayload } from "@/types/service";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ServiceFormModal } from "@/components/admin/ServiceFormModal";
import { Toast } from "@/components/ui/Toast";

export default function AdminPage() {
  const router = useRouter();
  const { token, isLoggedIn, isAdmin, isLoading: isAuthLoading } = useAuth();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [isLoadingServices, setIsLoadingServices] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isSubmittingModal, setIsSubmittingModal] = useState<boolean>(false);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(
    null
  );

  // Fetch Services List with exact pageNumber and pageSize
  const loadServices = useCallback(async (page: number = 1) => {
    setIsLoadingServices(true);
    try {
      const result = await serviceApi.getServices(page, pageSize);
      setServices(result.data || []);
      setPageNumber(result.pageNumber || page);
      setTotalCount(result.totalCount || result.data?.length || 0);
      setTotalPages(result.totalPages || 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể tải danh sách dịch vụ";
      setToast({ message: msg, type: "error" });
    } finally {
      setIsLoadingServices(false);
    }
  }, [pageSize]);

  useEffect(() => {
    if (!isAuthLoading) {
      if (!isLoggedIn || !isAdmin) {
        router.push("/");
        return;
      }
      loadServices(pageNumber);
    }
  }, [isAuthLoading, isLoggedIn, isAdmin, pageNumber, loadServices, router]);

  // Handle Create or Update Submit
  const handleFormSubmit = async (payload: CreateServicePayload | UpdateServicePayload) => {
    if (!token) {
      setToast({ message: "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!", type: "error" });
      return;
    }

    setIsSubmittingModal(true);
    try {
      if (editingService) {
        // PUT Update Service
        const res = await serviceApi.updateService(editingService.id, payload, token);
        setToast({
          message: res.message || `Cập nhật dịch vụ #${editingService.id} thành công!`,
          type: "success",
        });
      } else {
        // POST Create Service
        const res = await serviceApi.createService(payload, token);
        setToast({
          message: res.message || "Tạo mới dịch vụ thành công!",
          type: "success",
        });
      }

      setIsModalOpen(false);
      setEditingService(null);
      loadServices(pageNumber);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Thao tác thất bại";
      setToast({ message: msg, type: "error" });
    } finally {
      setIsSubmittingModal(false);
    }
  };

  // Handle Lock Service (PATCH /api/services/{id}/lock)
  const handleLockService = async (id: number) => {
    if (!token) return;
    if (!confirm(`Bạn có chắc chắn muốn KHÓA dịch vụ #${id}?`)) return;

    try {
      const res = await serviceApi.lockService(id, token);
      setToast({
        message: res.message || `Đã khóa dịch vụ #${id} thành công`,
        type: "success",
      });
      loadServices(pageNumber);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể khóa dịch vụ";
      setToast({ message: msg, type: "error" });
    }
  };

  // Handle Unlock Service (PATCH /api/services/{id}/unlock)
  const handleUnlockService = async (id: number) => {
    if (!token) return;
    try {
      const res = await serviceApi.unlockService(id, token);
      setToast({
        message: res.message || `Đã mở khóa dịch vụ #${id} thành công`,
        type: "success",
      });
      loadServices(pageNumber);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể mở khóa dịch vụ";
      setToast({ message: msg, type: "error" });
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
        
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Scissors className="w-6 h-6 text-amber-400 transform -rotate-45" />
              QUẢN LÝ DANH SÁCH DỊCH VỤ
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Tổng số dịch vụ: <strong className="text-amber-400">{totalCount}</strong> • Trang {pageNumber} / {totalPages}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => loadServices(pageNumber)}
              className="p-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all"
              title="Tải lại danh sách"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingServices ? "animate-spin text-amber-400" : ""}`} />
            </button>

            <button
              onClick={() => {
                setEditingService(null);
                setIsModalOpen(true);
              }}
              className="flex-1 sm:flex-initial py-3 px-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-extrabold rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>THÊM DỊCH VỤ MỚI</span>
            </button>
          </div>
        </div>

        {/* Services Table */}
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
                    <tr
                      key={s.id}
                      className="hover:bg-zinc-800/40 transition-colors group"
                    >
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
                          {/* Edit Button */}
                          <button
                            onClick={() => {
                              setEditingService(s);
                              setIsModalOpen(true);
                            }}
                            className="p-2 rounded-lg bg-zinc-800 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-400 border border-zinc-700 hover:border-amber-500/40 transition-all cursor-pointer"
                            title="Sửa thông tin dịch vụ"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Lock / Unlock Toggle Button */}
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

          {/* Pagination Controls */}
          {totalPages > 0 && (
            <div className="px-6 py-4 bg-zinc-950/80 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
              <div>
                Hiển thị trang <span className="font-bold text-white">{pageNumber}</span> / <span className="font-bold text-white">{totalPages}</span> (Tổng số {totalCount} dịch vụ)
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={pageNumber <= 1 || isLoadingServices}
                  onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
                  className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Trang trước</span>
                </button>

                {/* Page Number Buttons */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPageNumber(p)}
                      className={`w-8 h-8 rounded-lg font-bold transition-all text-xs ${
                        p === pageNumber
                          ? "bg-amber-500 text-zinc-950"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <button
                  disabled={pageNumber >= totalPages || isLoadingServices}
                  onClick={() => setPageNumber((prev) => Math.min(totalPages, prev + 1))}
                  className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Trang sau</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

      </main>

      {/* Service Create/Edit Modal */}
      <ServiceFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingService(null);
        }}
        onSubmit={handleFormSubmit}
        editingService={editingService}
        isSubmitting={isSubmittingModal}
      />
    </div>
  );
}
