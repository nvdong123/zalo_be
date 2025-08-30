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

// Interface based on backend RoomRead schema
export interface Room {
  id: number;
  tenant_id: number;
  room_type: string;
  room_name: string;
  description?: string;
  price?: number;
  capacity_adults?: number;
  capacity_children?: number;
  size_m2?: number;
  view_type?: string;
  has_balcony?: boolean;
  image_url?: string;
  video_url?: string;
  vr360_url?: string;
  gallery_url?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

// Interface based on backend RoomCreateRequest schema
export interface RoomCreateData {
  room_type: string;
  room_name: string;
  description?: string;
  price?: number;
  capacity_adults?: number;
  capacity_children?: number;
  size_m2?: number;
  view_type?: string;
  has_balcony?: boolean;
  image_url?: string;
  video_url?: string;
  vr360_url?: string;
  gallery_url?: string;
}

export interface RoomUpdateData {
  room_type?: string;
  room_name?: string;
  description?: string;
  price?: number;
  capacity_adults?: number;
  capacity_children?: number;
  size_m2?: number;
  view_type?: string;
  has_balcony?: boolean;
  image_url?: string;
  video_url?: string;
  vr360_url?: string;
  gallery_url?: string;
  updated_by?: string;
}

export interface RoomQueryParams {
  skip?: number;
  limit?: number;
}

export const roomsAPI = {
  // Get all rooms with pagination  
  getAll: async (params?: RoomQueryParams): Promise<Room[]> => {
    const tenantId = getCurrentTenantId();
    return request.get('/api/v1/rooms', { 
      params: { 
        tenant_id: tenantId,
        skip: params?.skip || 0,
        limit: params?.limit || 100
      } 
    });
  },

  // Get room by ID
  getById: async (id: number): Promise<Room> => {
    const tenantId = getCurrentTenantId();
    return request.get(`/api/v1/rooms/${id}`, {
      params: { tenant_id: tenantId }
    });
  },

  // Create new room
  create: async (data: RoomCreateData): Promise<Room> => {
    const tenantId = getCurrentTenantId();
    return request.post('/api/v1/rooms', data, {
      params: { tenant_id: tenantId }
    });
  },

  // Update room
  update: async (id: number, data: RoomUpdateData): Promise<Room> => {
    const tenantId = getCurrentTenantId();
    return request.put(`/api/v1/rooms/${id}`, data, {
      params: { tenant_id: tenantId }
    });
  },

  // Delete room
  delete: async (id: number, deleted_by?: string): Promise<{ message: string }> => {
    const tenantId = getCurrentTenantId();
    return request.delete(`/api/v1/rooms/${id}`, {
      params: { tenant_id: tenantId, deleted_by }
    });
  }
};
