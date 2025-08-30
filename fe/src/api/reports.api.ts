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

export interface ReportParams {
  start_date: string;
  end_date: string;
  timezone?: string;
}

export interface BookingReport {
  period: string;
  total_bookings: number;
  confirmed_bookings: number;
  cancelled_bookings: number;
  no_show_bookings: number;
  total_revenue: number;
  average_booking_value: number;
  occupancy_rate: number;
  booking_sources: {
    [key: string]: number;
  };
  daily_breakdown: Array<{
    date: string;
    bookings: number;
    revenue: number;
    occupancy_rate: number;
  }>;
}

export interface RevenueReport {
  period: string;
  total_revenue: number;
  room_revenue: number;
  service_revenue: number;
  promotion_discounts: number;
  voucher_discounts: number;
  payment_methods: {
    [key: string]: number;
  };
  monthly_breakdown: Array<{
    month: string;
    revenue: number;
    bookings: number;
  }>;
}

export interface OccupancyReport {
  period: string;
  total_rooms: number;
  available_room_nights: number;
  occupied_room_nights: number;
  overall_occupancy_rate: number;
  room_type_breakdown: Array<{
    room_type: string;
    total_rooms: number;
    occupied_nights: number;
    occupancy_rate: number;
  }>;
  daily_occupancy: Array<{
    date: string;
    available_rooms: number;
    occupied_rooms: number;
    occupancy_rate: number;
  }>;
}

export interface CustomerReport {
  period: string;
  total_customers: number;
  new_customers: number;
  returning_customers: number;
  customer_types: {
    [key: string]: number;
  };
  loyalty_points_issued: number;
  top_customers: Array<{
    customer_id: number;
    customer_name: string;
    total_bookings: number;
    total_spent: number;
  }>;
}

export interface InventoryReport {
  period: string;
  total_items: number;
  low_stock_items: number;
  out_of_stock_items: number;
  total_inventory_value: number;
  category_breakdown: Array<{
    category: string;
    item_count: number;
    total_value: number;
  }>;
  stock_movements: Array<{
    date: string;
    additions: number;
    reductions: number;
    adjustments: number;
  }>;
}

export interface FinancialReport {
  period: string;
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  profit_margin: number;
  revenue_by_month: Array<{
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
  expense_categories: {
    [key: string]: number;
  };
}

export const reportsAPI = {
  // Booking Reports
  getBookingReport: async (params: ReportParams): Promise<BookingReport> => {
    const tenantId = getCurrentTenantId();
    return request.get('/api/v1/reports/bookings', {
      params: { tenant_id: tenantId, ...params }
    });
  },

  // Revenue Reports
  getRevenueReport: async (params: ReportParams): Promise<RevenueReport> => {
    const tenantId = getCurrentTenantId();
    return request.get('/api/v1/reports/revenue', {
      params: { tenant_id: tenantId, ...params }
    });
  },

  // Occupancy Reports
  getOccupancyReport: async (params: ReportParams): Promise<OccupancyReport> => {
    const tenantId = getCurrentTenantId();
    return request.get('/api/v1/reports/occupancy', {
      params: { tenant_id: tenantId, ...params }
    });
  },

  // Customer Reports
  getCustomerReport: async (params: ReportParams): Promise<CustomerReport> => {
    const tenantId = getCurrentTenantId();
    return request.get('/api/v1/reports/customers', {
      params: { tenant_id: tenantId, ...params }
    });
  },

  // Inventory Reports
  getInventoryReport: async (params: ReportParams): Promise<InventoryReport> => {
    const tenantId = getCurrentTenantId();
    return request.get('/api/v1/reports/inventory', {
      params: { tenant_id: tenantId, ...params }
    });
  },

  // Financial Reports
  getFinancialReport: async (params: ReportParams): Promise<FinancialReport> => {
    const tenantId = getCurrentTenantId();
    return request.get('/api/v1/reports/financial', {
      params: { tenant_id: tenantId, ...params }
    });
  },

  // Dashboard Stats (for overview)
  getDashboardStats: async (params?: { period?: string }): Promise<{
    total_bookings: number;
    total_revenue: number;
    occupancy_rate: number;
    active_customers: number;
    pending_bookings: number;
    low_stock_alerts: number;
    recent_bookings: Array<{
      id: number;
      customer_name: string;
      room_name: string;
      check_in_date: string;
      total_amount: number;
    }>;
  }> => {
    const tenantId = getCurrentTenantId();
    return request.get('/api/v1/reports/dashboard', {
      params: { tenant_id: tenantId, ...params }
    });
  },

  // Export Reports
  exportBookingReport: async (params: ReportParams, format: 'pdf' | 'csv' | 'excel'): Promise<Blob> => {
    const tenantId = getCurrentTenantId();
    return request.get('/api/v1/reports/bookings/export', {
      params: { tenant_id: tenantId, format, ...params },
      responseType: 'blob'
    });
  },

  exportRevenueReport: async (params: ReportParams, format: 'pdf' | 'csv' | 'excel'): Promise<Blob> => {
    const tenantId = getCurrentTenantId();
    return request.get('/api/v1/reports/revenue/export', {
      params: { tenant_id: tenantId, format, ...params },
      responseType: 'blob'
    });
  },

  exportOccupancyReport: async (params: ReportParams, format: 'pdf' | 'csv' | 'excel'): Promise<Blob> => {
    const tenantId = getCurrentTenantId();
    return request.get('/api/v1/reports/occupancy/export', {
      params: { tenant_id: tenantId, format, ...params },
      responseType: 'blob'
    });
  },

  exportCustomerReport: async (params: ReportParams, format: 'pdf' | 'csv' | 'excel'): Promise<Blob> => {
    const tenantId = getCurrentTenantId();
    return request.get('/api/v1/reports/customers/export', {
      params: { tenant_id: tenantId, format, ...params },
      responseType: 'blob'
    });
  }
};
