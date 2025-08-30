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

export interface HotelBrandData {
  id: number;
  tenant_id: number;
  hotel_name: string;
  slogan?: string;
  description?: string;
  logo_url?: string;
  banner_images?: string;
  intro_video_url?: string;
  vr360_url?: string;
  address?: string;
  district?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  phone_number?: string;
  email?: string;
  website_url?: string;
  zalo_oa_id?: string;
  facebook_url?: string;
  youtube_url?: string;
  tiktok_url?: string;
  instagram_url?: string;
  google_map_url?: string;
  latitude?: number;
  longitude?: number;
  primary_color?: string;
  secondary_color?: string;
  copyright_text?: string;
  terms_url?: string;
  privacy_url?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface HotelBrandCreateData {
  hotel_name: string;
  slogan?: string;
  description?: string;
  logo_url?: string;
  banner_images?: string;
  intro_video_url?: string;
  vr360_url?: string;
  address?: string;
  district?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  phone_number?: string;
  email?: string;
  website_url?: string;
  zalo_oa_id?: string;
  facebook_url?: string;
  youtube_url?: string;
  tiktok_url?: string;
  instagram_url?: string;
  google_map_url?: string;
  latitude?: number;
  longitude?: number;
  primary_color?: string;
  secondary_color?: string;
  copyright_text?: string;
  terms_url?: string;
  privacy_url?: string;
  created_by?: string;
}

export interface HotelBrandUpdateData {
  hotel_name?: string;
  slogan?: string;
  description?: string;
  logo_url?: string;
  banner_images?: string;
  intro_video_url?: string;
  vr360_url?: string;
  address?: string;
  district?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  phone_number?: string;
  email?: string;
  website_url?: string;
  zalo_oa_id?: string;
  facebook_url?: string;
  youtube_url?: string;
  tiktok_url?: string;
  instagram_url?: string;
  google_map_url?: string;
  latitude?: number;
  longitude?: number;
  primary_color?: string;
  secondary_color?: string;
  copyright_text?: string;
  terms_url?: string;
  privacy_url?: string;
  updated_by?: string;
}

export const hotelBrandAPI = {
  // Get all hotel brands with pagination
  getAll: async (params?: { skip?: number; limit?: number }): Promise<HotelBrandData[]> => {
    const tenantId = getCurrentTenantId();
    return request.get('/api/v1/hotel-brands', { 
      params: { 
        tenant_id: tenantId,
        skip: params?.skip || 0,
        limit: params?.limit || 100
      } 
    });
  },

  // Get hotel brand by ID
  getById: async (id: number): Promise<HotelBrandData> => {
    const tenantId = getCurrentTenantId();
    return request.get(`/api/v1/hotel-brands/${id}`, {
      params: { tenant_id: tenantId }
    });
  },

  // Create new hotel brand
  create: async (data: HotelBrandCreateData): Promise<HotelBrandData> => {
    const tenantId = getCurrentTenantId();
    return request.post('/api/v1/hotel-brands', data, {
      params: { tenant_id: tenantId }
    });
  },

  // Update hotel brand
  update: async (id: number, data: HotelBrandUpdateData): Promise<HotelBrandData> => {
    const tenantId = getCurrentTenantId();
    return request.put(`/api/v1/hotel-brands/${id}`, data, {
      params: { tenant_id: tenantId }
    });
  },

  // Delete hotel brand (soft delete)
  delete: async (id: number): Promise<{ message: string }> => {
    const tenantId = getCurrentTenantId();
    return request.delete(`/api/v1/hotel-brands/${id}`, {
      params: { tenant_id: tenantId }
    });
  }
};
