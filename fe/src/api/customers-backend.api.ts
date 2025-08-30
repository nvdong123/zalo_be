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

// Interface based on backend CustomerRead schema
export interface Customer {
  id: number;
  tenant_id: number;
  zalo_user_id?: string;
  name?: string;
  phone?: string;
  email?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

// Interface based on backend CustomerCreateRequest schema
export interface CustomerCreateData {
  zalo_user_id?: string;
  name?: string;
  phone?: string;
  email?: string;
}

// Interface based on backend CustomerUpdateRequest schema
export interface CustomerUpdateData {
  zalo_user_id?: string;
  name?: string;
  phone?: string;
  email?: string;
}

export interface CustomerQueryParams {
  skip?: number;
  limit?: number;
}

export const customersAPI = {
  // Get all customers with pagination
  getAll: async (params?: CustomerQueryParams): Promise<Customer[]> => {
    const tenantId = getCurrentTenantId();
    return request.get('/api/v1/customers', { 
      params: { 
        tenant_id: tenantId,
        skip: params?.skip || 0,
        limit: params?.limit || 100
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

  // Delete customer
  delete: async (id: number, deleted_by?: string): Promise<{ message: string }> => {
    const tenantId = getCurrentTenantId();
    return request.delete(`/api/v1/customers/${id}`, {
      params: { tenant_id: tenantId, deleted_by }
    });
  }
};
