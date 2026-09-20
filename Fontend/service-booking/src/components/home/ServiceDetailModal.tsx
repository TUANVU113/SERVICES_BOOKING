"use client";

import React, { useEffect, useState } from "react";
import { X, Scissors, Clock, CheckCircle2, Loader2, Calendar } from "lucide-react";
import { serviceApi } from "@/services/serviceApi";
import { ServiceItem } from "@/types/service";

interface ServiceDetailModalProps {
  serviceId: number | null;
  onClose: () => void;
  onBookService: (serviceName: string) => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  serviceId,
  onClose,
  onBookService,
}) => {
  const [service, setService] = useState<ServiceItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (serviceId) {
      setIsLoading(true);
      setError(null);
      serviceApi
        .getServiceById(serviceId)
        .then((data) => {
          setService(data);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Không thể tải thông tin dịch vụ");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setService(null);
    }
  }, [serviceId]);

  if (!serviceId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-zinc-900 border border-amber-500/30 shadow-2xl text-white">
        
        {/* Header */}
        <div className="relative px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Scissors className="w-5 h-5 transform -rotate-45" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Chi Tiết Dịch Vụ #{serviceId}</h3>
              <p className="text-xs text-zinc-400">Gentleman Barber Service Details</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="py-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
              <p className="text-sm text-zinc-400">Đang tải chi tiết dịch vụ từ API...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-rose-400 text-sm space-y-2">
              <p>{error}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-zinc-800 text-white rounded-xl text-xs font-bold"
              >
                Đóng
              </button>
            </div>
          ) : service ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-2xl font-black text-white">{service.name}</h4>
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span className="flex items-center gap-1 text-zinc-300 bg-zinc-950 px-3 py-1 rounded-xl border border-zinc-800">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {service.durationMinutes} phút
                    </span>
                    {service.isActive ? (
                      <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-xl font-semibold">
                        Đang hoạt động
                      </span>
                    ) : (
                      <span className="text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-1 rounded-xl font-semibold">
                        Tạm ngưng
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-2xl font-black text-amber-400 text-right">
                  {Number(service.price).toLocaleString("vi-VN")} đ
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 leading-relaxed">
                <p className="font-semibold text-white mb-1">Mô tả dịch vụ:</p>
                {service.description || "Chăm sóc tạo kiểu chuẩn quý ông."}
              </div>

              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold uppercase text-zinc-400">Đặc quyền dịch vụ:</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Tư vấn tạo kiểu miễn phí</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Sản phẩm nhập khẩu cao cấp</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Không gian thư giãn sang trọng</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Bảo hành phồng nếp 30 ngày</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl text-sm transition-all"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onBookService(service.name);
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-extrabold rounded-xl shadow-lg shadow-amber-500/20 text-sm flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>ĐẶT LỊCH NGAY</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>

      </div>
    </div>
  );
};
