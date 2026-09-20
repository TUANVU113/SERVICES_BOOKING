import {
  StaffItem,
  PaginatedStaffsResponse,
  CreateStaffPayload,
  UpdateStaffPayload,
} from "@/types/staff";

export class StaffApiError extends Error {
  statusCode?: number;
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "StaffApiError";
    this.statusCode = statusCode;
  }
}

export const staffApi = {
  // 1. GET paginated staffs: GET /api/staffs?pageNumber=1&pageSize=10
  getStaffs: async (
    pageNumber: number = 1,
    pageSize: number = 10,
    token?: string
  ): Promise<PaginatedStaffsResponse> => {
    try {
      const headers: Record<string, string> = {
        Accept: "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `/api/staffs?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        {
          method: "GET",
          headers,
          cache: "no-store",
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new StaffApiError(
          data?.message || "Không thể tải danh sách nhân viên",
          response.status
        );
      }

      return data;
    } catch (error: unknown) {
      if (error instanceof StaffApiError) throw error;
      throw new StaffApiError(
        error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định"
      );
    }
  },

  // 2. GET single staff detail: GET /api/staffs/{id}
  getStaffById: async (id: number, token?: string): Promise<StaffItem> => {
    try {
      const headers: Record<string, string> = {
        Accept: "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/staffs/${id}`, {
        method: "GET",
        headers,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new StaffApiError(
          data?.message || `Không thể tải chi tiết nhân viên #${id}`,
          response.status
        );
      }

      return data;
    } catch (error: unknown) {
      if (error instanceof StaffApiError) throw error;
      throw new StaffApiError(
        error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định"
      );
    }
  },

  // 3. POST create staff (Admin only): POST /api/staffs
  createStaff: async (
    payload: CreateStaffPayload,
    token: string
  ): Promise<{ message?: string; data?: StaffItem; id?: number }> => {
    try {
      const response = await fetch("/api/staffs", {
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
        throw new StaffApiError(
          data?.message || "Tạo mới nhân viên thất bại",
          response.status
        );
      }

      return data;
    } catch (error: unknown) {
      if (error instanceof StaffApiError) throw error;
      throw new StaffApiError(
        error instanceof Error ? error.message : "Lỗi kết nối tạo nhân viên"
      );
    }
  },

  // 4. PUT update staff (Admin only): PUT /api/staffs/{id}
  updateStaff: async (
    id: number,
    payload: UpdateStaffPayload,
    token: string
  ): Promise<{ message?: string }> => {
    try {
      const response = await fetch(`/api/staffs/${id}`, {
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
        throw new StaffApiError(
          data?.message || `Cập nhật thông tin nhân viên #${id} thất bại`,
          response.status
        );
      }

      return data;
    } catch (error: unknown) {
      if (error instanceof StaffApiError) throw error;
      throw new StaffApiError(
        error instanceof Error ? error.message : "Lỗi kết nối cập nhật nhân viên"
      );
    }
  },

  // 5. PATCH lock staff (Admin only): PATCH /api/staffs/{id}/lock
  lockStaff: async (id: number, token: string): Promise<{ message?: string }> => {
    try {
      const response = await fetch(`/api/staffs/${id}/lock`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new StaffApiError(
          data?.message || `Khóa nhân viên #${id} thất bại`,
          response.status
        );
      }

      return data;
    } catch (error: unknown) {
      if (error instanceof StaffApiError) throw error;
      throw new StaffApiError(
        error instanceof Error ? error.message : "Lỗi kết nối khóa nhân viên"
      );
    }
  },

  // 6. PATCH unlock staff (Admin only): PATCH /api/staffs/{id}/unlock
  unlockStaff: async (id: number, token: string): Promise<{ message?: string }> => {
    try {
      const response = await fetch(`/api/staffs/${id}/unlock`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new StaffApiError(
          data?.message || `Mở khóa nhân viên #${id} thất bại`,
          response.status
        );
      }

      return data;
    } catch (error: unknown) {
      if (error instanceof StaffApiError) throw error;
      throw new StaffApiError(
        error instanceof Error ? error.message : "Lỗi kết nối mở khóa nhân viên"
      );
    }
  },
};
