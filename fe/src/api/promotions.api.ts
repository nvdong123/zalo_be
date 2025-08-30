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

export interface Promotion {
  id: number;
  tenant_id: number;
  promotion_name: string;
  promotion_type: 'percentage' | 'fixed_amount' | 'buy_one_get_one';
  description?: string;
  discount_percentage?: number;
  discount_amount?: number;
  min_booking_amount?: number;
  max_discount_amount?: number;
  start_date: string;
  end_date: string;
  terms_conditions?: string;
  applicable_rooms?: string;
  customer_eligibility?: string;
  usage_limit?: number;
  used_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PromotionCreateData {
  promotion_name: string;
  promotion_type: 'percentage' | 'fixed_amount' | 'buy_one_get_one';
  description?: string;
  discount_percentage?: number;
  discount_amount?: number;
  min_booking_amount?: number;
  max_discount_amount?: number;
  start_date: string;
  end_date: string;
  terms_conditions?: string;
  applicable_rooms?: string;
  customer_eligibility?: string;
  usage_limit?: number;
  is_active?: boolean;
}

export interface PromotionUpdateData extends Partial<PromotionCreateData> {}

export interface PromotionQueryParams {
  skip?: number;
  limit?: number;
  search?: string;
  promotion_type?: string;
  is_active?: boolean;
}

export const promotionsAPI = {
  // Get all promotions with pagination
  getAll: async (params?: PromotionQueryParams): Promise<Promotion[]> => {
    const tenantId = getCurrentTenantId();
    return request.get('/api/v1/promotions', { 
      params: { 
        tenant_id: tenantId,
        skip: params?.skip || 0,
        limit: params?.limit || 100,
        ...params 
      } 
    });
  },

  // Get promotion by ID
  getById: async (id: number): Promise<Promotion> => {
    const tenantId = getCurrentTenantId();
    return request.get(`/api/v1/promotions/${id}`, {
      params: { tenant_id: tenantId }
    });
  },

  // Create new promotion
  create: async (data: PromotionCreateData): Promise<Promotion> => {
    const tenantId = getCurrentTenantId();
    return request.post('/api/v1/promotions', data, {
      params: { tenant_id: tenantId }
    });
  },

  // Update promotion
  update: async (id: number, data: PromotionUpdateData): Promise<Promotion> => {
    const tenantId = getCurrentTenantId();
    return request.put(`/api/v1/promotions/${id}`, data, {
      params: { tenant_id: tenantId }
    });
  },

  // Delete promotion (soft delete)
  delete: async (id: number): Promise<{ message: string }> => {
    const tenantId = getCurrentTenantId();
    return request.delete(`/api/v1/promotions/${id}`, {
      params: { tenant_id: tenantId }
    });
  }
};
