"use client";

import React, { useState, useEffect } from "react";
import { X, User, Mail, Save, Loader2, AlertCircle } from "lucide-react";
import { StaffItem, CreateStaffPayload, UpdateStaffPayload } from "@/types/staff";

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateStaffPayload | UpdateStaffPayload) => void;
  editingStaff: StaffItem | null;
  isSubmitting: boolean;
  existingStaffs?: StaffItem[];
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const StaffFormModal: React.FC<StaffFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingStaff,
  isSubmitting,
  existingStaffs = [],
}) => {
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const [errors, setErrors] = useState<{ fullName?: string; email?: string }>({});

  useEffect(() => {
    if (editingStaff) {
      setFullName(editingStaff.fullName || "");
      setEmail(editingStaff.email || "");
    } else {
      setFullName("");
      setEmail("");
    }
    setErrors({});
  }, [editingStaff, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: { fullName?: string; email?: string } = {};

    // 1. Validate Full Name
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      newErrors.fullName = "Họ và tên nhân viên là bắt buộc";
    }

    // 2. Validate Email format
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      newErrors.email = "Địa chỉ Email là bắt buộc";
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      newErrors.email = "Định dạng Email không hợp lệ (Ví dụ: nhanvien@gmail.com)";
    } else {
      // 3. Check for duplicate email against existing staff list
      const isDuplicate = existingStaffs.some(
        (s) =>
          s.email.toLowerCase() === trimmedEmail.toLowerCase() &&
          s.id !== editingStaff?.id
      );
      if (isDuplicate) {
        newErrors.email = "Email này đã tồn tại trong hệ thống. Vui lòng sử dụng email khác.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    onSubmit({
      fullName: fullName.trim(),
      email: email.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-zinc-900 border border-amber-500/30 shadow-2xl text-white">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {editingStaff ? `Chỉnh Sửa Nhân Viên #${editingStaff.id}` : "Thêm Nhân Viên Mới"}
              </h3>
              <p className="text-xs text-zinc-400">
                {editingStaff
                  ? "Cập nhật thông tin chi tiết nhân viên"
                  : "Điền đầy đủ họ tên và email để thêm nhân viên"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
              Họ Và Tên Nhân Viên <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                }}
                placeholder="Ví dụ: Hoàng Văn Nam"
                className={`w-full py-3 pl-10 pr-4 bg-zinc-950 border rounded-xl text-white text-sm focus:outline-none transition-all ${
                  errors.fullName
                    ? "border-rose-500 focus:border-rose-500"
                    : "border-zinc-800 focus:border-amber-500"
                }`}
              />
            </div>
            {errors.fullName && (
              <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.fullName}</span>
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
              Địa Chỉ Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="Ví dụ: nhanvien6@gmail.com"
                className={`w-full py-3 pl-10 pr-4 bg-zinc-950 border rounded-xl text-white text-sm focus:outline-none transition-all ${
                  errors.email
                    ? "border-rose-500 focus:border-rose-500"
                    : "border-zinc-800 focus:border-amber-500"
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-zinc-800 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-extrabold rounded-xl shadow-lg shadow-amber-500/20 text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{editingStaff ? "LƯU THAY ĐỔI" : "TẠO NHÂN VIÊN"}</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
