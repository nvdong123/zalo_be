import { request } from '../utils/request';
import { AdminUser, PaginatedResponse, PaginationParams } from '../types';

export interface AdminUserCreateData {
  username: string;
  email?: string;
  role: string;
  tenant_id?: number;
  status?: string;
  password: string;
}

export interface AdminUserUpdateData {
  username?: string;
  email?: string;
  role?: string;
  tenant_id?: number;
  status?: string;
  password?: string;
}

export const adminUsersAPI = {
  // Get all admin users with pagination
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<AdminUser>> => {
    return request.get('/api/v1/admin-users/', { params });
  },

  // Get admin user by ID
  getById: async (id: number): Promise<AdminUser> => {
    return request.get(`/api/v1/admin-users/${id}`);
  },

  // Create new admin user
  create: async (data: AdminUserCreateData): Promise<AdminUser> => {
    return request.post('/api/v1/admin-users/', data);
  },

  // Update admin user
  update: async (id: number, data: AdminUserUpdateData): Promise<AdminUser> => {
    return request.put(`/api/v1/admin-users/${id}`, data);
  },

  // Delete admin user (soft delete)
  delete: async (id: number): Promise<{ message: string }> => {
    return request.delete(`/api/v1/admin-users/${id}`);
  }
};
