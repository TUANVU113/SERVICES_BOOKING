export type BookingStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";

export interface BookingItem {
  id: number;
  bookingCode: string;
  customerId: number;
  customerName: string;
  serviceId: number;
  serviceName: string;
  staffId: number;
  staffName: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  customerNote?: string | null;
  cancellationReason?: string | null;
  createdAt: string;
}

export interface PaginatedBookingsResponse {
  data: BookingItem[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface CreateBookingPayload {
  serviceId: number;
  staffId: number;
  startTime: string; // YYYY-MM-DDTHH:mm:ss
  customerNote?: string;
}

export interface AvailableSlotsResponse {
  date: string;
  serviceId: number;
  staffId: number;
  availableSlots: string[];
}

export interface CancelBookingPayload {
  cancellationReason: string;
}
