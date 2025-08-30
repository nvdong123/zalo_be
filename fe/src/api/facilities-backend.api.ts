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

// Interface based on backend FacilityRead schema
export interface Facility {
  id: number;
  tenant_id: number;
  facility_name: string;
  description?: string;
  type?: string;
  image_url?: string;
  video_url?: string;
  vr360_url?: string;
  gallery_url?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

// Interface based on backend FacilityCreateRequest schema
export interface FacilityCreateData {
  facility_name: string;
  description?: string;
  type?: string;
  image_url?: string;
  video_url?: string;
  vr360_url?: string;
  gallery_url?: string;
}

// Interface based on backend FacilityUpdateRequest schema
export interface FacilityUpdateData {
  facility_name?: string;
  description?: string;
  type?: string;
  image_url?: string;
  video_url?: string;
  vr360_url?: string;
  gallery_url?: string;
}

export interface FacilityQueryParams {
  skip?: number;
  limit?: number;
}

export const facilitiesAPI = {
  // Get all facilities with pagination
  getAll: async (params?: FacilityQueryParams): Promise<Facility[]> => {
    const tenantId = getCurrentTenantId();
    return request.get('/api/v1/facilities', { 
      params: { 
        tenant_id: tenantId,
        skip: params?.skip || 0,
        limit: params?.limit || 100
      } 
    });
  },

  // Get facility by ID
  getById: async (id: number): Promise<Facility> => {
    const tenantId = getCurrentTenantId();
    return request.get(`/api/v1/facilities/${id}`, {
      params: { tenant_id: tenantId }
    });
  },

  // Create new facility
  create: async (data: FacilityCreateData): Promise<Facility> => {
    const tenantId = getCurrentTenantId();
    return request.post('/api/v1/facilities', data, {
      params: { tenant_id: tenantId }
    });
  },

  // Update facility
  update: async (id: number, data: FacilityUpdateData): Promise<Facility> => {
    const tenantId = getCurrentTenantId();
    return request.put(`/api/v1/facilities/${id}`, data, {
      params: { tenant_id: tenantId }
    });
  },

  // Delete facility
  delete: async (id: number, deleted_by?: string): Promise<{ message: string }> => {
    const tenantId = getCurrentTenantId();
    return request.delete(`/api/v1/facilities/${id}`, {
      params: { tenant_id: tenantId, deleted_by }
    });
  }
};
