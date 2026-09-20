"use client";

import React, { useState, useEffect } from "react";
import { X, Scissors, Loader2, AlertCircle } from "lucide-react";
import { ServiceItem, CreateServicePayload, UpdateServicePayload } from "@/types/service";

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateServicePayload | UpdateServicePayload) => Promise<void>;
  editingService?: ServiceItem | null;
  isSubmitting: boolean;
}

export const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingService,
  isSubmitting,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [price, setPrice] = useState<number>(100000);

  const [errors, setErrors] = useState<{
    name?: string;
    durationMinutes?: string;
    price?: string;
  }>({});

  useEffect(() => {
    if (editingService) {
      setName(editingService.name);
      setDescription(editingService.description || "");
      setDurationMinutes(editingService.durationMinutes);
      setPrice(editingService.price);
    } else {
      setName("");
      setDescription("");
      setDurationMinutes(30);
      setPrice(100000);
    }
    setErrors({});
  }, [editingService, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: { name?: string; durationMinutes?: string; price?: string } = {};

    // 1. Tên bắt buộc
    if (!name.trim()) {
      newErrors.name = "Tên dịch vụ không được bỏ trống";
    }

    // 2. Giá không được âm
    if (price === undefined || price === null || isNaN(price)) {
      newErrors.price = "Vui lòng nhập giá dịch vụ";
    } else if (price < 0) {
      newErrors.price = "Giá dịch vụ không được là số âm (phải >= 0)";
    }

    // 3. Thời lượng lớn hơn 0
    if (
      durationMinutes === undefined ||
      durationMinutes === null ||
      isNaN(durationMinutes)
    ) {
      newErrors.durationMinutes = "Vui lòng nhập thời lượng dịch vụ";
    } else if (durationMinutes <= 0) {
      newErrors.durationMinutes = "Thời lượng thực hiện phải lớn hơn 0 phút";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      durationMinutes: Number(durationMinutes),
      price: Number(price),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-zinc-900 border border-amber-500/30 shadow-2xl text-white">
        
        {/* Modal Header */}
        <div className="relative px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Scissors className="w-5 h-5 transform -rotate-45" />
            </div>
            <h3 className="text-xl font-bold text-white">
              {editingService ? `Chỉnh Sửa Dịch Vụ #${editingService.id}` : "Tạo Dịch Vụ Mới"}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmitForm} className="p-6 space-y-5">
          {/* Service Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Tên dịch vụ <span className="text-amber-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="Ví dụ: Nhuộm tóc cao cấp"
              className={`w-full py-3 px-4 bg-zinc-950 border rounded-xl text-white text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.name
                  ? "border-rose-500 focus:ring-rose-500/30"
                  : "border-zinc-800 focus:border-amber-500 focus:ring-amber-500/20"
              }`}
            />
            {errors.name && (
              <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Mô tả dịch vụ
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập chi tiết các bước dịch vụ..."
              className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>

          {/* Grid Price & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Price */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Giá dịch vụ (VNĐ) <span className="text-amber-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                value={price}
                onChange={(e) => {
                  setPrice(Number(e.target.value));
                  if (errors.price) setErrors((prev) => ({ ...prev, price: undefined }));
                }}
                placeholder="250000"
                className={`w-full py-3 px-4 bg-zinc-950 border rounded-xl text-white text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.price
                    ? "border-rose-500 focus:ring-rose-500/30"
                    : "border-zinc-800 focus:border-amber-500 focus:ring-amber-500/20"
                }`}
              />
              {errors.price && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.price}
                </p>
              )}
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Thời lượng (Phút) <span className="text-amber-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={durationMinutes}
                onChange={(e) => {
                  setDurationMinutes(Number(e.target.value));
                  if (errors.durationMinutes)
                    setErrors((prev) => ({ ...prev, durationMinutes: undefined }));
                }}
                placeholder="60"
                className={`w-full py-3 px-4 bg-zinc-950 border rounded-xl text-white text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.durationMinutes
                    ? "border-rose-500 focus:ring-rose-500/30"
                    : "border-zinc-800 focus:border-amber-500 focus:ring-amber-500/20"
                }`}
              />
              {errors.durationMinutes && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.durationMinutes}
                </p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl transition-all cursor-pointer"
            >
              HỦY BỎ
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-extrabold rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>{editingService ? "CẬP NHẬT DỊCH VỤ" : "TẠO DỊCH VỤ MỚI"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
