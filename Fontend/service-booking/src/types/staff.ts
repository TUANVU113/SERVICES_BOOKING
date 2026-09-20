export interface StaffItem {
  id: number;
  fullName: string;
  email: string;
  isActive: boolean;
}

export interface PaginatedStaffsResponse {
  data: StaffItem[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface CreateStaffPayload {
  fullName: string;
  email: string;
}

export interface UpdateStaffPayload {
  fullName: string;
  email: string;
}
