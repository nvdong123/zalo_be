import { useQuery } from '@tanstack/react-query';
import { dashboardAPI, type SuperAdminDashboardStats, type TenantDashboardStats } from '../../api/dashboard-backend.api';
import { authStore } from '../../stores/authStore';

// Dashboard stats based on actual backend endpoints
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardAPI.getDashboardStats(),
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // Refetch every 5 minutes
  });
}

// Super Admin specific stats
export function useSuperAdminStats() {
  return useQuery({
    queryKey: ['dashboard-super-admin-stats'],
    queryFn: () => dashboardAPI.getSuperAdminStats(),
    enabled: authStore.getRole() === 'SUPER_ADMIN',
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // Refetch every 5 minutes
  });
}

// Tenant Admin specific stats
export function useTenantStats() {
  return useQuery({
    queryKey: ['dashboard-tenant-stats'],
    queryFn: () => dashboardAPI.getTenantStats(),
    enabled: authStore.getRole() === 'HOTEL_ADMIN',
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // Refetch every 5 minutes
  });
}

// Legacy interface for backward compatibility
export interface DashboardStats {
  success: boolean;
  data: any;
}

// Export types
export type { SuperAdminDashboardStats, TenantDashboardStats };
