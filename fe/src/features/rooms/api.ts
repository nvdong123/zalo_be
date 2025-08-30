import http from '@/services/http';
import { API_ENDPOINTS, buildTenantUrlWithParams } from '@/api/endpoints';
import type { Room, PaginatedResponse, SearchParams } from '@/types';

export interface RoomFilters extends SearchParams {
  room_type?: string;
  status?: string;
  min_price?: number;
  max_price?: number;
}

export interface CreateRoomRequest {
  room_name: string;
  room_type: 'standard' | 'deluxe' | 'suite' | 'family' | 'presidential';
  description?: string;
  price: number;
  capacity_adults: number;
  capacity_children: number;
  size_sqm?: number;
  view_type?: 'sea' | 'city' | 'garden' | 'mountain' | 'pool';
  has_balcony: boolean;
  has_kitchen: boolean;
  image_url?: string;
  amenities?: string[];
  status: 'available' | 'occupied' | 'maintenance' | 'out_of_order';
}

export interface UpdateRoomRequest extends Partial<CreateRoomRequest> {}

export const roomsApi = {
  list: async (params: RoomFilters = {}) => {
    const url = buildTenantUrlWithParams(API_ENDPOINTS.ROOMS, params);
    const response = await http.get<PaginatedResponse<Room>>(url);
    return response.data;
  },

  get: async (id: number) => {
    const response = await http.get<Room>(`${API_ENDPOINTS.ROOMS}/${id}`);
    return response.data;
  },

  create: async (data: CreateRoomRequest) => {
    const response = await http.post<Room>(API_ENDPOINTS.ROOMS, data);
    return response.data;
  },

  update: async (id: number, data: UpdateRoomRequest) => {
    const response = await http.put<Room>(`${API_ENDPOINTS.ROOMS}/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await http.delete(`${API_ENDPOINTS.ROOMS}/${id}`);
    return response.data;
  },
};
