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

export interface Room {
  id: number;
  tenant_id: number;
  room_name: string;
  room_type: string;
  room_number?: string;
  floor?: number;
  capacity: number;
  price_per_night: number;
  description?: string;
  amenities?: string;
  area_sqm?: number;
  bed_type?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoomCreateData {
  room_name: string;
  room_type: string;
  room_number?: string;
  floor?: number;
  capacity: number;
  price_per_night: number;
  description?: string;
  amenities?: string;
  area_sqm?: number;
  bed_type?: string;
  is_available?: boolean;
}

export interface RoomUpdateData extends Partial<RoomCreateData> {}

export interface RoomQueryParams {
  skip?: number;
  limit?: number;
  search?: string;
  room_type?: string;
  is_available?: boolean;
}

export const roomsAPI = {
  // Get all rooms with pagination
  getAll: async (params?: RoomQueryParams): Promise<Room[]> => {
    const tenantId = getCurrentTenantId();
    return request.get('/api/v1/rooms', { 
      params: { 
        tenant_id: tenantId,
        skip: params?.skip || 0,
        limit: params?.limit || 100,
        ...params 
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

  // Delete room (soft delete)
  delete: async (id: number): Promise<{ message: string }> => {
    const tenantId = getCurrentTenantId();
    return request.delete(`/api/v1/rooms/${id}`, {
      params: { tenant_id: tenantId }
    });
  }
};
