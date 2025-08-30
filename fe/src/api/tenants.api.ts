import { request } from '../utils/request';
import { Tenant, PaginatedResponse, PaginationParams } from '../types';

export interface TenantCreateData {
  name: string;
  domain: string;
  status?: string;
  subscription_plan_id?: number;
  created_by?: string;
}

export interface TenantUpdateData {
  name?: string;
  domain?: string;
  status?: string;
  subscription_plan_id?: number;
  updated_by?: string;
}

export interface TenantStatistics {
  admin_users: number;
  rooms: number;
  facilities: number;
  services: number;
  customers: number;
  total_bookings: number;
  recent_bookings_30d: number;
}

export interface TenantWithStats {
  id: number;
  name: string;
  domain: string;
  status: string;
  subscription_plan_id: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  statistics: TenantStatistics;
}

export const tenantsAPI = {
  // Get all tenants with pagination
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Tenant>> => {
    return request.get('/api/v1/tenants', { params });
  },

  // Get tenants with detailed statistics (Super Admin only)
  getAllWithStats: async (params?: {
    skip?: number;
    limit?: number;
    status_filter?: 'active' | 'inactive' | 'all';
  }): Promise<TenantWithStats[]> => {
    return request.get('/api/v1/tenants/management', { params });
  },

  // Get tenant by ID
  getById: async (id: number): Promise<Tenant> => {
    return request.get(`/api/v1/tenants/${id}`);
  },

  // Create new tenant
  create: async (data: TenantCreateData): Promise<Tenant> => {
    return request.post('/api/v1/tenants/management', data);
  },

  // Update tenant
  update: async (id: number, data: TenantUpdateData): Promise<Tenant> => {
    return request.put(`/api/v1/tenants/management/${id}`, data);
  },

  // Delete tenant (soft delete)
  delete: async (id: number): Promise<{ message: string }> => {
    return request.delete(`/api/v1/tenants/management/${id}`);
  }
};
