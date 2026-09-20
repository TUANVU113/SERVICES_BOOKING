import { LoginPayload, LoginResponse } from "@/types/auth";

export class ApiError extends Error {
  statusCode?: number;
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    try {
      // Call Next.js API Proxy Route (/api/auth/login) to bypass Browser CORS & SSL cert blocks
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: payload.email.trim(),
          password: payload.password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage =
          data?.message ||
          (response.status === 401
            ? "Email hoặc mật khẩu không chính xác"
            : `Đăng nhập thất bại (Mã lỗi: ${response.status})`);

        throw new ApiError(errorMessage, response.status);
      }

      if (!data || !data.token) {
        throw new ApiError("Phản hồi từ máy chủ không hợp lệ (Thiếu token)");
      }

      return {
        message: data.message || "Đăng nhập thành công",
        token: data.token,
        fullName: data.fullName || data.name || "Khách hàng",
      };
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định"
      );
    }
  },
};
