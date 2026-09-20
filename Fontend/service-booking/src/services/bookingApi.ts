import {
  BookingItem,
  PaginatedBookingsResponse,
  CreateBookingPayload,
  AvailableSlotsResponse,
  CancelBookingPayload,
} from "@/types/booking";

export class BookingApiError extends Error {
  statusCode?: number;
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "BookingApiError";
    this.statusCode = statusCode;
  }
}

export const bookingApi = {
  // 1. GET paginated bookings: GET /api/bookings?pageNumber=1&pageSize=10&status=Pending&date=2026-09-25
  getBookings: async (
    pageNumber: number = 1,
    pageSize: number = 10,
    status?: string,
    date?: string,
    token?: string
  ): Promise<PaginatedBookingsResponse> => {
    try {
      const headers: Record<string, string> = {
        Accept: "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      let url = `/api/bookings?pageNumber=${pageNumber}&pageSize=${pageSize}`;
      if (status) url += `&status=${encodeURIComponent(status)}`;
      if (date) url += `&date=${encodeURIComponent(date)}`;

      const response = await fetch(url, {
        method: "GET",
        headers,
        cache: "no-store",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new BookingApiError(
          data?.message || "Không thể tải danh sách lịch đặt",
          response.status
        );
      }

      return data;
    } catch (error: unknown) {
      if (error instanceof BookingApiError) throw error;
      throw new BookingApiError(
        error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định"
      );
    }
  },

  // 2. GET single booking detail: GET /api/bookings/{id}
  getBookingById: async (id: number, token?: string): Promise<BookingItem> => {
    try {
      const headers: Record<string, string> = {
        Accept: "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/bookings/${id}`, {
        method: "GET",
        headers,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new BookingApiError(
          data?.message || `Không thể tải chi tiết lịch đặt #${id}`,
          response.status
        );
      }

      return data;
    } catch (error: unknown) {
      if (error instanceof BookingApiError) throw error;
      throw new BookingApiError(
        error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định"
      );
    }
  },

  // 3. GET available slots: GET /api/bookings/available-slots?serviceId=1&staffId=1&date=2026-09-25
  getAvailableSlots: async (
    serviceId: number,
    staffId: number,
    date: string,
    token?: string
  ): Promise<AvailableSlotsResponse> => {
    try {
      const headers: Record<string, string> = {
        Accept: "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `/api/bookings/available-slots?serviceId=${serviceId}&staffId=${staffId}&date=${encodeURIComponent(date)}`,
        {
          method: "GET",
          headers,
          cache: "no-store",
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new BookingApiError(
          data?.message || "Không thể lấy danh sách khung giờ còn trống",
          response.status
        );
      }

      return data;
    } catch (error: unknown) {
      if (error instanceof BookingApiError) throw error;
      throw new BookingApiError(
        error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định"
      );
    }
  },

  // 4. POST create booking: POST /api/bookings
  createBooking: async (
    payload: CreateBookingPayload,
    token?: string
  ): Promise<{ message?: string; data?: BookingItem }> => {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new BookingApiError(
          data?.message || "Tạo lịch đặt thất bại",
          response.status
        );
      }

      return data;
    } catch (error: unknown) {
      if (error instanceof BookingApiError) throw error;
      throw new BookingApiError(
        error instanceof Error ? error.message : "Lỗi kết nối tạo lịch đặt"
      );
    }
  },

  // 5. PATCH confirm booking (Admin): PATCH /api/bookings/{id}/confirm
  confirmBooking: async (id: number, token: string): Promise<{ message?: string }> => {
    try {
      const response = await fetch(`/api/bookings/${id}/confirm`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new BookingApiError(
          data?.message || `Xác nhận lịch đặt #${id} thất bại`,
          response.status
        );
      }

      return data;
    } catch (error: unknown) {
      if (error instanceof BookingApiError) throw error;
      throw new BookingApiError(
        error instanceof Error ? error.message : "Lỗi kết nối xác nhận lịch đặt"
      );
    }
  },

  // 6. PATCH complete booking (Admin): PATCH /api/bookings/{id}/complete
  completeBooking: async (id: number, token: string): Promise<{ message?: string }> => {
    try {
      const response = await fetch(`/api/bookings/${id}/complete`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new BookingApiError(
          data?.message || `Hoàn thành lịch đặt #${id} thất bại`,
          response.status
        );
      }

      return data;
    } catch (error: unknown) {
      if (error instanceof BookingApiError) throw error;
      throw new BookingApiError(
        error instanceof Error ? error.message : "Lỗi kết nối hoàn thành lịch đặt"
      );
    }
  },

  // 7. PATCH cancel booking: PATCH /api/bookings/{id}/cancel
  cancelBooking: async (
    id: number,
    payload: CancelBookingPayload,
    token?: string
  ): Promise<{ message?: string }> => {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/bookings/${id}/cancel`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new BookingApiError(
          data?.message || `Hủy lịch đặt #${id} thất bại`,
          response.status
        );
      }

      return data;
    } catch (error: unknown) {
      if (error instanceof BookingApiError) throw error;
      throw new BookingApiError(
        error instanceof Error ? error.message : "Lỗi kết nối hủy lịch đặt"
      );
    }
  },
};
