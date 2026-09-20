export interface ServiceItem {
  id: number;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  isActive: boolean;
}

export interface PaginatedServicesResponse {
  data: ServiceItem[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface CreateServicePayload {
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
}

export interface UpdateServicePayload {
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
}
