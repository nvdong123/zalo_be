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

export interface Customer {
  id: number;
  tenant_id: number;
  zalo_id?: string;
  full_name: string;
  phone_number?: string;
  email?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  city?: string;
  country?: string;
  id_card_number?: string;
  passport_number?: string;
  nationality?: string;
  loyalty_points: number;
  customer_type: 'regular' | 'vip' | 'premium';
  notes?: string;
  last_booking_date?: string;
  total_bookings: number;
  total_spent: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerCreateData {
  zalo_id?: string;
  full_name: string;
  phone_number?: string;
  email?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  city?: string;
  country?: string;
  id_card_number?: string;
  passport_number?: string;
  nationality?: string;
  customer_type?: 'regular' | 'vip' | 'premium';
  notes?: string;
}

export interface CustomerUpdateData extends Partial<CustomerCreateData> {}

export interface CustomerQueryParams {
  skip?: number;
  limit?: number;
  search?: string;
  customer_type?: string;
  is_active?: boolean;
}

export const customersAPI = {
  // Get all customers with pagination
  getAll: async (params?: CustomerQueryParams): Promise<Customer[]> => {
    const tenantId = getCurrentTenantId();
    return request.get('/api/v1/customers', { 
      params: { 
        tenant_id: tenantId,
        skip: params?.skip || 0,
        limit: params?.limit || 100,
        ...params 
      } 
    });
  },

  // Get customer by ID
  getById: async (id: number): Promise<Customer> => {
    const tenantId = getCurrentTenantId();
    return request.get(`/api/v1/customers/${id}`, {
      params: { tenant_id: tenantId }
    });
  },

  // Create new customer
  create: async (data: CustomerCreateData): Promise<Customer> => {
    const tenantId = getCurrentTenantId();
    return request.post('/api/v1/customers', data, {
      params: { tenant_id: tenantId }
    });
  },

  // Update customer
  update: async (id: number, data: CustomerUpdateData): Promise<Customer> => {
    const tenantId = getCurrentTenantId();
    return request.put(`/api/v1/customers/${id}`, data, {
      params: { tenant_id: tenantId }
    });
  },

  // Delete customer (soft delete)
  delete: async (id: number): Promise<{ message: string }> => {
    const tenantId = getCurrentTenantId();
    return request.delete(`/api/v1/customers/${id}`, {
      params: { tenant_id: tenantId }
    });
  }
};
