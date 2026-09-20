export interface WorkScheduleItem {
  id: number;
  staffId: number;
  workDate: string;
  startTime: string;
  endTime: string;
}

export interface PaginatedWorkSchedulesResponse {
  data: WorkScheduleItem[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface CreateWorkSchedulePayload {
  workDate: string;
  startTime: string;
  endTime: string;
}

export interface UpdateWorkSchedulePayload {
  workDate: string;
  startTime: string;
  endTime: string;
}
