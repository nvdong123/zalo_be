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

export interface Voucher {
  id: number;
  tenant_id: number;
  voucher_code: string;
  voucher_name: string;
  voucher_type: 'percentage' | 'fixed_amount';
  description?: string;
  discount_percentage?: number;
  discount_amount?: number;
  min_booking_amount?: number;
  max_discount_amount?: number;
  start_date: string;
  end_date: string;
  usage_limit?: number;
  used_count: number;
  is_single_use: boolean;
  applicable_rooms?: string;
  customer_eligibility?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VoucherCreateData {
  voucher_code: string;
  voucher_name: string;
  voucher_type: 'percentage' | 'fixed_amount';
  description?: string;
  discount_percentage?: number;
  discount_amount?: number;
  min_booking_amount?: number;
  max_discount_amount?: number;
  start_date: string;
  end_date: string;
  usage_limit?: number;
  is_single_use?: boolean;
  applicable_rooms?: string;
  customer_eligibility?: string;
  is_active?: boolean;
}

export interface VoucherUpdateData extends Partial<VoucherCreateData> {}

export interface VoucherQueryParams {
  skip?: number;
  limit?: number;
  search?: string;
  voucher_type?: string;
  is_active?: boolean;
}

export const vouchersAPI = {
  // Get all vouchers with pagination
  getAll: async (params?: VoucherQueryParams): Promise<Voucher[]> => {
    const tenantId = getCurrentTenantId();
    return request.get('/api/v1/vouchers', { 
      params: { 
        tenant_id: tenantId,
        skip: params?.skip || 0,
        limit: params?.limit || 100,
        ...params 
      } 
    });
  },

  // Get voucher by ID
  getById: async (id: number): Promise<Voucher> => {
    const tenantId = getCurrentTenantId();
    return request.get(`/api/v1/vouchers/${id}`, {
      params: { tenant_id: tenantId }
    });
  },

  // Create new voucher
  create: async (data: VoucherCreateData): Promise<Voucher> => {
    const tenantId = getCurrentTenantId();
    return request.post('/api/v1/vouchers', data, {
      params: { tenant_id: tenantId }
    });
  },

  // Update voucher
  update: async (id: number, data: VoucherUpdateData): Promise<Voucher> => {
    const tenantId = getCurrentTenantId();
    return request.put(`/api/v1/vouchers/${id}`, data, {
      params: { tenant_id: tenantId }
    });
  },

  // Delete voucher (soft delete)
  delete: async (id: number): Promise<{ message: string }> => {
    const tenantId = getCurrentTenantId();
    return request.delete(`/api/v1/vouchers/${id}`, {
      params: { tenant_id: tenantId }
    });
  },

  // Validate voucher code
  validate: async (voucherCode: string): Promise<{ valid: boolean; voucher?: Voucher; message?: string }> => {
    const tenantId = getCurrentTenantId();
    return request.get(`/api/v1/vouchers/validate/${voucherCode}`, {
      params: { tenant_id: tenantId }
    });
  }
};
