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

export interface Booking {
  id: number;
  tenant_id: number;
  customer_id: number;
  room_id: number;
  booking_date: string;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  adults: number;
  children: number;
  room_rate: number;
  total_amount: number;
  discount_amount?: number;
  final_amount: number;
  booking_status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  payment_method?: string;
  special_requests?: string;
  promotion_id?: number;
  voucher_id?: number;
  booking_source: 'website' | 'zalo' | 'phone' | 'walk_in';
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Related data
  customer?: {
    id: number;
    full_name: string;
    phone_number?: string;
    email?: string;
  };
  room?: {
    id: number;
    room_name: string;
    room_type: string;
    room_number?: string;
  };
}

export interface BookingCreateData {
  customer_id: number;
  room_id: number;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children?: number;
  room_rate: number;
  discount_amount?: number;
  booking_status?: 'pending' | 'confirmed';
  payment_method?: string;
  special_requests?: string;
  promotion_id?: number;
  voucher_id?: number;
  booking_source?: 'website' | 'zalo' | 'phone' | 'walk_in';
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  notes?: string;
}

export interface BookingUpdateData {
  customer_id?: number;
  room_id?: number;
  check_in_date?: string;
  check_out_date?: string;
  adults?: number;
  children?: number;
  room_rate?: number;
  discount_amount?: number;
  booking_status?: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  payment_status?: 'pending' | 'paid' | 'refunded';
  payment_method?: string;
  special_requests?: string;
  promotion_id?: number;
  voucher_id?: number;
  booking_source?: 'website' | 'zalo' | 'phone' | 'walk_in';
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  notes?: string;
}

export interface BookingQueryParams {
  skip?: number;
  limit?: number;
  search?: string;
  booking_status?: string;
  payment_status?: string;
  check_in_date?: string;
  check_out_date?: string;
  customer_id?: number;
  room_id?: number;
}

export const bookingsAPI = {
  // Get all bookings with pagination
  getAll: async (params?: BookingQueryParams): Promise<Booking[]> => {
    const tenantId = getCurrentTenantId();
    return request.get('/api/v1/bookings', { 
      params: { 
        tenant_id: tenantId,
        skip: params?.skip || 0,
        limit: params?.limit || 100,
        ...params 
      } 
    });
  },

  // Get booking by ID
  getById: async (id: number): Promise<Booking> => {
    const tenantId = getCurrentTenantId();
    return request.get(`/api/v1/bookings/${id}`, {
      params: { tenant_id: tenantId }
    });
  },

  // Create new booking
  create: async (data: BookingCreateData): Promise<Booking> => {
    const tenantId = getCurrentTenantId();
    return request.post('/api/v1/bookings', data, {
      params: { tenant_id: tenantId }
    });
  },

  // Update booking
  update: async (id: number, data: BookingUpdateData): Promise<Booking> => {
    const tenantId = getCurrentTenantId();
    return request.put(`/api/v1/bookings/${id}`, data, {
      params: { tenant_id: tenantId }
    });
  },

  // Cancel booking
  cancel: async (id: number, reason?: string): Promise<Booking> => {
    const tenantId = getCurrentTenantId();
    return request.put(`/api/v1/bookings/${id}/cancel`, 
      { cancellation_reason: reason },
      { params: { tenant_id: tenantId } }
    );
  },

  // Check-in booking
  checkIn: async (id: number): Promise<Booking> => {
    const tenantId = getCurrentTenantId();
    return request.put(`/api/v1/bookings/${id}/check-in`, {}, {
      params: { tenant_id: tenantId }
    });
  },

  // Check-out booking
  checkOut: async (id: number): Promise<Booking> => {
    const tenantId = getCurrentTenantId();
    return request.put(`/api/v1/bookings/${id}/check-out`, {}, {
      params: { tenant_id: tenantId }
    });
  },

  // Get booking statistics
  getStats: async (params?: { start_date?: string; end_date?: string }): Promise<{
    total_bookings: number;
    confirmed_bookings: number;
    cancelled_bookings: number;
    total_revenue: number;
    average_booking_value: number;
  }> => {
    const tenantId = getCurrentTenantId();
    return request.get('/api/v1/bookings/stats', {
      params: { tenant_id: tenantId, ...params }
    });
  }
};
