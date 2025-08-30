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

// Interface for Super Admin Dashboard Stats
export interface SuperAdminDashboardStats {
  success: boolean;
  data: {
    system_overview: {
      total_tenants: number;
      active_tenants: number;
      inactive_tenants: number;
      total_rooms: number;
      total_facilities: number;
      total_customers: number;
      total_admins: number;
    };
    bookings: {
      total: number;
      pending: number;
      processed: number;
    };
    growth: {
      new_tenants_week: number;
      new_customers_week: number;
    };
  };
}

// Interface for Tenant Dashboard Stats  
export interface TenantDashboardStats {
  success: boolean;
  data: {
    tenant_overview: {
      total_rooms: number;
      total_facilities: number;
      total_customers: number;
      total_bookings: number;
    };
    bookings: {
      pending: number;
      confirmed: number;
      completed: number;
    };
    recent_activity: {
      new_customers_week: number;
      new_bookings_week: number;
    };
  };
}

export const dashboardAPI = {
  // Get Super Admin dashboard stats (system-wide)
  getSuperAdminStats: async (): Promise<SuperAdminDashboardStats> => {
    return request.get('/api/v1/dashboard/super-admin/stats');
  },

  // Get Tenant Admin dashboard stats (tenant-specific)
  getTenantStats: async (): Promise<TenantDashboardStats> => {
    return request.get('/api/v1/dashboard/tenant/stats');
  },

  // Get dashboard stats based on user role
  getDashboardStats: async (): Promise<SuperAdminDashboardStats | TenantDashboardStats> => {
    const role = authStore.getRole();
    if (role === 'SUPER_ADMIN') {
      return dashboardAPI.getSuperAdminStats();
    } else {
      return dashboardAPI.getTenantStats();
    }
  }
};
