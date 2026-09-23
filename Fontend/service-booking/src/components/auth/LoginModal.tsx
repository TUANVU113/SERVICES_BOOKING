"use client";

import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, X, Scissors, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { validateLoginForm, ValidationErrors } from "@/utils/validation";
import { Toast } from "@/components/ui/Toast";

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, handleLoginSuccess } = useAuth();

  const [email, setEmail] = useState("user1@gmail.com");
  const [password, setPassword] = useState("123456");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    // 1. Client-side Validation (Check empty & valid email regex)
    const validation = validateLoginForm({ email, password });
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Clear client validation errors
    setErrors({});
    setIsSubmitting(true);

    try {
      // 2. Call Backend API POST https://localhost:7118/api/Auth/login
      const response = await authService.login({ email, password });

      // Show success toast
      setToastMessage({
        text: response.message || `Xin chào ${response.fullName}! Đăng nhập thành công.`,
        type: "success",
      });

      // 3. Save token to Cookie & Update Auth Context (hides Login button, shows user greeting)
      handleLoginSuccess(response, email);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Đã xảy ra lỗi không xác định khi kết nối tới máy chủ.";
      setApiError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = () => {
    setEmail("user1@gmail.com");
    setPassword("123456");
    setErrors({});
    setApiError(null);
  };

  return (
    <>
      {toastMessage && (
        <Toast
          message={toastMessage.text}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
        <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-zinc-900 border border-amber-500/30 shadow-2xl shadow-amber-500/10 text-white">
          {/* Top Decorative Amber Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="relative px-6 pt-8 pb-4 text-center border-b border-zinc-800">
            <button
              onClick={closeLoginModal}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-all"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center justify-center w-14 h-14 mb-3 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Scissors className="w-7 h-7" />
            </div>

            <h3 className="text-2xl font-bold tracking-tight text-white">
              Đăng Nhập Thành Viên
            </h3>
            <p className="mt-1 text-sm text-zinc-400">
              Tiệm Cắt Tóc Quý Ông - Gentleman Barber Shop
            </p>
          </div>

          {/* Body Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Server API Error Alert */}
            {apiError && (
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">{apiError}</div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Địa chỉ Email <span className="text-amber-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="user1@gmail.com"
                  className={`w-full py-3 pl-11 pr-4 bg-zinc-950/80 border rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 transition-all ${errors.email
                      ? "border-rose-500 focus:ring-rose-500/30"
                      : "border-zinc-800 focus:border-amber-500 focus:ring-amber-500/20"
                    }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-400 mt-1 pl-1 flex items-center gap-1">
                  <span>•</span> {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Mật khẩu <span className="text-amber-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password)
                      setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="••••••••"
                  className={`w-full py-3 pl-11 pr-11 bg-zinc-950/80 border rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 transition-all ${errors.password
                      ? "border-rose-500 focus:ring-rose-500/30"
                      : "border-zinc-800 focus:border-amber-500 focus:ring-amber-500/20"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-rose-400 mt-1 pl-1 flex items-center gap-1">
                  <span>•</span> {errors.password}
                </p>
              )}
            </div>


            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-xl shadow-lg shadow-amber-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-zinc-950" />
                  <span>Đang kết nối</span>
                </>
              ) : (
                <span>ĐĂNG NHẬP NGAY</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
