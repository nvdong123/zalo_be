import { request } from '../utils/request';
import { authStore } from '../stores/authStore';
import { tenantStore } from '../stores/tenantStore';

// Helper to get current tenant ID
const getCurrentTenantId = (): number => {
  const role = authStore.getRole();
  if (role === 'SUPER_ADMIN') {
    return tenantStore.getSelectedTenantId() || 1;
  } else if (role === 'HOTEL_ADMIN') {
    return authStore.getTenantId() || 1;
  }
  return 1;
};

// Interface based on backend BookingRequestRead schema
export interface BookingRequest {
  id: number;
  tenant_id: number;
  customer_id: number;
  booking_date: string;
  room_id?: number;
  facility_id?: number;
  mobile_number?: string;
  check_in_date?: string;
  check_out_date?: string;
  note?: string;
  request_channel?: string;
  status?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

// Interface based on backend BookingRequestCreateRequest schema
export interface BookingRequestCreateData {
  customer_id: number;
  booking_date: string;
  room_id?: number;
  facility_id?: number;
  mobile_number?: string;
  check_in_date?: string;
  check_out_date?: string;
  note?: string;
  request_channel?: string;
  status?: string;
}

// Interface based on backend BookingRequestUpdateRequest schema
export interface BookingRequestUpdateData {
  customer_id?: number;
  booking_date?: string;
  room_id?: number;
  facility_id?: number;
  mobile_number?: string;
  check_in_date?: string;
  check_out_date?: string;
  note?: string;
  request_channel?: string;
  status?: string;
}

export interface BookingRequestQueryParams {
  skip?: number;
  limit?: number;
}

export const bookingRequestsAPI = {
  // Get all booking requests with pagination
  getAll: async (params?: BookingRequestQueryParams): Promise<BookingRequest[]> => {
    const tenantId = getCurrentTenantId();
    return request.get('/api/v1/booking-requests', { 
      params: { 
        tenant_id: tenantId,
        skip: params?.skip || 0,
        limit: params?.limit || 100
      } 
    });
  },

  // Get booking request by ID
  getById: async (id: number): Promise<BookingRequest> => {
    const tenantId = getCurrentTenantId();
    return request.get(`/api/v1/booking-requests/${id}`, {
      params: { tenant_id: tenantId }
    });
  },

  // Create new booking request
  create: async (data: BookingRequestCreateData): Promise<BookingRequest> => {
    const tenantId = getCurrentTenantId();
    return request.post('/api/v1/booking-requests', data, {
      params: { tenant_id: tenantId }
    });
  },

  // Update booking request
  update: async (id: number, data: BookingRequestUpdateData): Promise<BookingRequest> => {
    const tenantId = getCurrentTenantId();
    return request.put(`/api/v1/booking-requests/${id}`, data, {
      params: { tenant_id: tenantId }
    });
  },

  // Delete booking request
  delete: async (id: number, deleted_by?: string): Promise<{ message: string }> => {
    const tenantId = getCurrentTenantId();
    return request.delete(`/api/v1/booking-requests/${id}`, {
      params: { tenant_id: tenantId, deleted_by }
    });
  }
};
