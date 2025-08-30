import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, del } from '../../utils/request';
import { message } from 'antd';

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: 'super_admin' | 'hotel_admin';
  tenant_id?: number;
  tenant_name?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAdminUserRequest {
  username: string;
  email: string;
  password: string;
  role: 'super_admin' | 'hotel_admin';
  tenant_id?: number;
  status: string;
}

export interface AdminUsersQueryParams {
  page?: number;
  size?: number;
  search?: string;
  role?: 'super_admin' | 'hotel_admin';
  is_active?: boolean;
}

// Hook for fetching admin users
export function useAdminUsersQuery(params: AdminUsersQueryParams = {}) {
  const { page = 1, size = 10, ...filters } = params;
  const offset = (page - 1) * size;

  return useQuery({
    queryKey: ['admin-users', { offset, limit: size, ...filters }],
    queryFn: async (): Promise<{ data: AdminUser[]; total: number }> => {
      const queryParams = new URLSearchParams({
        offset: offset.toString(),
        limit: size.toString(),
      });

      // Add filters to query params
      if (filters.search) {
        queryParams.append('search', filters.search);
      }
      if (filters.role) {
        queryParams.append('role', filters.role);
      }
      if (filters.is_active !== undefined) {
        queryParams.append('is_active', filters.is_active.toString());
      }

      return get<{ data: AdminUser[]; total: number }>(`/api/v1/admin-users?${queryParams.toString()}`);
    },
  });
}

// Hook for fetching tenants for the dropdown
export function useTenantsListQuery() {
  return useQuery({
    queryKey: ['tenants-simple'],
    queryFn: async (): Promise<Array<{ id: number; name: string }>> => {
      const response = await get<Array<{ id: number; name: string; domain?: string }>>('/api/v1/tenants?limit=100&offset=0');
      // Transform response to match expected format
      return response.map(tenant => ({
        id: tenant.id,
        name: tenant.name || tenant.domain || `Tenant ${tenant.id}`
      }));
    },
  });
}

// Hook for creating an admin user
export function useCreateAdminUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAdminUserRequest) => {
      // Transform frontend data to backend format
      const backendData = {
        ...data,
        status: data.status || 'active'
      };
      return post<AdminUser>('/api/v1/admin-users/', backendData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      message.success('Admin user created successfully');
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to create admin user');
    },
  });
}

// Hook for updating an admin user
export function useUpdateAdminUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateAdminUserRequest> }) => {
      // Transform frontend data to backend format
      const backendData = { ...data };
      if ('status' in backendData) {
        // Keep status as is
      }
      return put<AdminUser>(`/api/v1/admin-users/${id}`, backendData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      message.success('Admin user updated successfully');
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to update admin user');
    },
  });
}

// Hook for deleting an admin user
export function useDeleteAdminUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => del(`/api/v1/admin-users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      message.success('Admin user deleted successfully');
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to delete admin user');
    },
  });
}
