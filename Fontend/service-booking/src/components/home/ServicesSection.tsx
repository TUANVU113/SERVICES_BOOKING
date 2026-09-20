"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Clock,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { serviceApi } from "@/services/serviceApi";
import { ServiceItem } from "@/types/service";

interface ServicesSectionProps {
  onSelectService: (serviceName: string) => void;
  onViewDetail: (serviceId: number) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onSelectService,
  onViewDetail,
}) => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize] = useState<number>(6);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await serviceApi.getServices(page, pageSize);
      setServices(response.data || []);
      setPageNumber(response.pageNumber || page);
      setTotalCount(response.totalCount || 0);
      setTotalPages(response.totalPages || 1);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể kết nối tới danh sách dịch vụ API"
      );
    } finally {
      setIsLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchServices(pageNumber);
  }, [pageNumber, fetchServices]);

  return (
    <section id="services" className="py-24 bg-zinc-900 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>MEN'S SERVICES & MENU</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            BẢNG GIÁ DỊCH VỤ <span className="text-amber-400">GENTLEMAN</span>
          </h2>

          <p className="text-zinc-400 text-base">
            Dữ liệu dịch vụ được cập nhật trực tiếp từ hệ thống API máy chủ. Quý khách có thể xem thông tin chi tiết và đặt lịch ngay.
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-10 h-10 text-amber-400 animate-spin mx-auto" />
            <p className="text-sm text-zinc-400 font-medium">
              Đang tải danh sách dịch vụ từ máy chủ API...
            </p>
          </div>
        ) : error ? (
          <div className="p-8 rounded-3xl bg-rose-950/40 border border-rose-500/30 text-center max-w-xl mx-auto text-rose-300 space-y-3">
            <p className="text-sm font-semibold">{error}</p>
            <button
              onClick={() => fetchServices(pageNumber)}
              className="px-5 py-2.5 bg-rose-500 text-zinc-950 font-bold rounded-xl text-xs"
            >
              Thử tải lại
            </button>
          </div>
        ) : services.length === 0 ? (
          <div className="py-16 text-center text-zinc-400 text-sm">
            Hiện chưa có dịch vụ nào khả dụng trên hệ thống.
          </div>
        ) : (
          <>
            {/* Services Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="relative rounded-3xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 transition-all duration-300 p-6 flex flex-col justify-between group shadow-xl hover:shadow-amber-500/5"
                >
                  <div className="space-y-4">
                    {/* Header: Service Name & Active Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                          Dịch vụ #{service.id}
                        </span>
                        <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors mt-2">
                          {service.name}
                        </h3>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xl font-black text-amber-400">
                          {Number(service.price).toLocaleString("vi-VN")} đ
                        </div>
                        <span className="text-[11px] text-zinc-400 inline-flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          {service.durationMinutes} phút
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3 min-h-[36px]">
                      {service.description || "Dịch vụ chăm sóc tóc chuyên nghiệp chuẩn quý ông."}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-6 mt-6 border-t border-zinc-900 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => onViewDetail(service.id)}
                      className="py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold rounded-xl border border-zinc-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>Xem Chi Tiết</span>
                    </button>

                    <button
                      onClick={() => onSelectService(service.name)}
                      className="py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>ĐẶT LỊCH</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 0 && (
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400">
                <div>
                  Hiển thị trang <strong className="text-white">{pageNumber}</strong> / <strong className="text-white">{totalPages}</strong> (Tổng cộng {totalCount} dịch vụ)
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={pageNumber <= 1 || isLoading}
                    onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
                    className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Trang trước</span>
                  </button>

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
                    disabled={pageNumber >= totalPages || isLoading}
                    onClick={() => setPageNumber((prev) => Math.min(totalPages, prev + 1))}
                    className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>Trang sau</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </section>
  );
};
