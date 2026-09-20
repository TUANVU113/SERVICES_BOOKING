import {
  ServiceItem,
  PaginatedServicesResponse,
  CreateServicePayload,
  UpdateServicePayload,
} from "@/types/service";

export class ServiceApiError extends Error {
  statusCode?: number;
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "ServiceApiError";
    this.statusCode = statusCode;
  }
}

export const serviceApi = {
  // 1. GET paginated services: GET /api/services?pageNumber=1&pageSize=10
  getServices: async (
    pageNumber: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedServicesResponse> => {
    try {
      const response = await fetch(
        `/api/services?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new ServiceApiError(
          data?.message || "Không thể tải danh sách dịch vụ",
          response.status
        );
      }

      return data;
    } catch (error: unknown) {
      if (error instanceof ServiceApiError) throw error;
      throw new ServiceApiError(
        error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định"
      );
    }
  },

  // 2. GET single service detail: GET /api/services/{id}
  getServiceById: async (id: number): Promise<ServiceItem> => {
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new ServiceApiError(
          data?.message || `Không thể tải dịch vụ #${id}`,
          response.status
        );
      }

      return data;
    } catch (error: unknown) {
      if (error instanceof ServiceApiError) throw error;
      throw new ServiceApiError(
        error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định"
      );
    }
  },

  // 3. POST create service (Admin only): POST /api/services
  createService: async (
    payload: CreateServicePayload,
    token: string
  ): Promise<{ message?: string; data?: ServiceItem }> => {
    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new ServiceApiError(
          data?.message || "Tạo dịch vụ mới thất bại",
          response.status
        );
      }

      return data;
    } catch (error: unknown) {
      if (error instanceof ServiceApiError) throw error;
      throw new ServiceApiError(
        error instanceof Error ? error.message : "Lỗi kết nối tạo dịch vụ"
      );
    }
  },

  // 4. PUT update service (Admin only): PUT /api/services/{id}
  updateService: async (
    id: number,
    payload: UpdateServicePayload,
    token: string
  ): Promise<{ message?: string }> => {
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new ServiceApiError(
          data?.message || `Cập nhật dịch vụ #${id} thất bại`,
          response.status
        );
      }

      return data;
    } catch (error: unknown) {
      if (error instanceof ServiceApiError) throw error;
      throw new ServiceApiError(
        error instanceof Error ? error.message : "Lỗi kết nối cập nhật dịch vụ"
      );
    }
  },

  // 5. PATCH lock service (Admin only): PATCH /api/services/{id}/lock
  lockService: async (id: number, token: string): Promise<{ message?: string }> => {
    try {
      const response = await fetch(`/api/services/${id}/lock`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new ServiceApiError(
          data?.message || `Khóa dịch vụ #${id} thất bại`,
          response.status
        );
      }

      return data;
    } catch (error: unknown) {
      if (error instanceof ServiceApiError) throw error;
      throw new ServiceApiError(
        error instanceof Error ? error.message : "Lỗi kết nối khóa dịch vụ"
      );
    }
  },

  // 6. PATCH unlock service (Admin only): PATCH /api/services/{id}/unlock
  unlockService: async (id: number, token: string): Promise<{ message?: string }> => {
    try {
      const response = await fetch(`/api/services/${id}/unlock`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new ServiceApiError(
          data?.message || `Mở khóa dịch vụ #${id} thất bại`,
          response.status
        );
      }

      return data;
    } catch (error: unknown) {
      if (error instanceof ServiceApiError) throw error;
      throw new ServiceApiError(
        error instanceof Error ? error.message : "Lỗi kết nối mở khóa dịch vụ"
      );
    }
  },
};
