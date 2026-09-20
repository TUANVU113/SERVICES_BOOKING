import {
  WorkScheduleItem,
  PaginatedWorkSchedulesResponse,
  CreateWorkSchedulePayload,
  UpdateWorkSchedulePayload,
} from "@/types/workSchedule";

export class WorkScheduleApiError extends Error {
  statusCode?: number;
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "WorkScheduleApiError";
    this.statusCode = statusCode;
  }
}

export const workScheduleApi = {
  // 1. GET paginated work schedules for a staff member: GET /api/staffs/{staffId}/workschedules?pageNumber=1&pageSize=10
  getWorkSchedules: async (
    staffId: number,
    pageNumber: number = 1,
    pageSize: number = 10,
    token?: string
  ): Promise<PaginatedWorkSchedulesResponse> => {
    try {
      const headers: Record<string, string> = {
        Accept: "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `/api/staffs/${staffId}/workschedules?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        {
          method: "GET",
          headers,
          cache: "no-store",
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new WorkScheduleApiError(
          data?.message || `Không thể tải lịch làm việc của nhân viên #${staffId}`,
          response.status
        );
      }

      return data;
    } catch (error: unknown) {
      if (error instanceof WorkScheduleApiError) throw error;
      throw new WorkScheduleApiError(
        error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định"
      );
    }
  },

  // 2. GET single work schedule: GET /api/staffs/{staffId}/workschedules/{scheduleId}
  getWorkScheduleById: async (
    staffId: number,
    scheduleId: number,
    token?: string
  ): Promise<WorkScheduleItem> => {
    try {
      const headers: Record<string, string> = {
        Accept: "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/staffs/${staffId}/workschedules/${scheduleId}`, {
        method: "GET",
        headers,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new WorkScheduleApiError(
          data?.message || `Không thể tải chi tiết lịch làm việc #${scheduleId}`,
          response.status
        );
      }

      return data;
    } catch (error: unknown) {
      if (error instanceof WorkScheduleApiError) throw error;
      throw new WorkScheduleApiError(
        error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định"
      );
    }
  },

  // 3. POST create work schedule: POST /api/staffs/{staffId}/workschedules
  createWorkSchedule: async (
    staffId: number,
    payload: CreateWorkSchedulePayload,
    token: string
  ): Promise<{ message?: string; data?: WorkScheduleItem }> => {
    try {
      const response = await fetch(`/api/staffs/${staffId}/workschedules`, {
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
        throw new WorkScheduleApiError(
          data?.message || "Tạo lịch làm việc thất bại",
          response.status
        );
      }

      return data;
    } catch (error: unknown) {
      if (error instanceof WorkScheduleApiError) throw error;
      throw new WorkScheduleApiError(
        error instanceof Error ? error.message : "Lỗi kết nối tạo lịch làm việc"
      );
    }
  },

  // 4. PUT update work schedule: PUT /api/staffs/{staffId}/workschedules/{scheduleId}
  updateWorkSchedule: async (
    staffId: number,
    scheduleId: number,
    payload: UpdateWorkSchedulePayload,
    token: string
  ): Promise<{ message?: string }> => {
    try {
      const response = await fetch(`/api/staffs/${staffId}/workschedules/${scheduleId}`, {
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
        throw new WorkScheduleApiError(
          data?.message || `Cập nhật lịch làm việc #${scheduleId} thất bại`,
          response.status
        );
      }

      return data;
    } catch (error: unknown) {
      if (error instanceof WorkScheduleApiError) throw error;
      throw new WorkScheduleApiError(
        error instanceof Error ? error.message : "Lỗi kết nối cập nhật lịch làm việc"
      );
    }
  },

  // 5. DELETE work schedule: DELETE /api/staffs/{staffId}/workschedules/{scheduleId}
  deleteWorkSchedule: async (
    staffId: number,
    scheduleId: number,
    token: string
  ): Promise<{ message?: string }> => {
    try {
      const response = await fetch(`/api/staffs/${staffId}/workschedules/${scheduleId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new WorkScheduleApiError(
          data?.message || `Xóa lịch làm việc #${scheduleId} thất bại`,
          response.status
        );
      }

      return data;
    } catch (error: unknown) {
      if (error instanceof WorkScheduleApiError) throw error;
      throw new WorkScheduleApiError(
        error instanceof Error ? error.message : "Lỗi kết nối xóa lịch làm việc"
      );
    }
  },
};
