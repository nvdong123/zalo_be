import http from '@/services/http';
import { API_ENDPOINTS, buildTenantUrlWithParams } from '@/api/endpoints';
import type { Promotion, PaginatedResponse, SearchParams } from '@/types';

export interface PromotionFilters extends SearchParams {
  status?: string;
  start_date?: string;
  end_date?: string;
}

export interface CreatePromotionRequest {
  title: string;
  description?: string;
  promo_code?: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  min_stay_nights?: number;
  max_discount_amount?: number;
  start_date: string;
  end_date: string;
  banner_image?: string;
  terms_conditions?: string;
  status: 'draft' | 'active' | 'expired' | 'disabled';
  usage_limit?: number;
}

export interface UpdatePromotionRequest extends Partial<CreatePromotionRequest> {}

export const promotionsApi = {
  list: async (params: PromotionFilters = {}) => {
    const url = buildTenantUrlWithParams(API_ENDPOINTS.PROMOTIONS, params);
    const response = await http.get<PaginatedResponse<Promotion>>(url);
    return response.data;
  },

  get: async (id: number) => {
    const response = await http.get<Promotion>(`${API_ENDPOINTS.PROMOTIONS}/${id}`);
    return response.data;
  },

  create: async (data: CreatePromotionRequest) => {
    const response = await http.post<Promotion>(API_ENDPOINTS.PROMOTIONS, data);
    return response.data;
  },

  update: async (id: number, data: UpdatePromotionRequest) => {
    const response = await http.put<Promotion>(`${API_ENDPOINTS.PROMOTIONS}/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await http.delete(`${API_ENDPOINTS.PROMOTIONS}/${id}`);
    return response.data;
  },
};
