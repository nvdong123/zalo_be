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

export interface Facility {
  id: number;
  tenant_id: number;
  facility_name: string;
  facility_type: string;
  description?: string;
  location?: string;
  capacity?: number;
  operating_hours?: string;
  price_per_hour?: number;
  equipment_list?: string;
  maintenance_schedule?: string;
  is_available: boolean;
  booking_required: boolean;
  contact_person?: string;
  contact_phone?: string;
  image_urls?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FacilityCreateData {
  facility_name: string;
  facility_type: string;
  description?: string;
  location?: string;
  capacity?: number;
  operating_hours?: string;
  price_per_hour?: number;
  equipment_list?: string;
  maintenance_schedule?: string;
  is_available?: boolean;
  booking_required?: boolean;
  contact_person?: string;
  contact_phone?: string;
  image_urls?: string;
  notes?: string;
}

export interface FacilityUpdateData extends Partial<FacilityCreateData> {}

export interface FacilityQueryParams {
  skip?: number;
  limit?: number;
  search?: string;
  facility_type?: string;
  is_available?: boolean;
}

export const facilitiesAPI = {
  // Get all facilities with pagination
  getAll: async (params?: FacilityQueryParams): Promise<Facility[]> => {
    const tenantId = getCurrentTenantId();
    return request.get('/api/v1/facilities', { 
      params: { 
        tenant_id: tenantId,
        skip: params?.skip || 0,
        limit: params?.limit || 100,
        ...params 
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

  // Delete facility (soft delete)
  delete: async (id: number): Promise<{ message: string }> => {
    const tenantId = getCurrentTenantId();
    return request.delete(`/api/v1/facilities/${id}`, {
      params: { tenant_id: tenantId }
    });
  }
};
