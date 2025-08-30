import { request } from './request';

// Interface for Room Stay data based on backend schema
export interface RoomStay {
  id: number;
  tenant_id: number;
  booking_request_id?: number;
  room_id?: number;
  customer_id?: number;
  checkin_date: string;
  checkout_date: string;
  actual_checkin?: string;
  actual_checkout?: string;
  status: string; // reserved, checked_in, checked_out, cancelled
  total_amount?: number;
  payment_status: string; // pending, paid, refunded
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  deleted?: number;
  deleted_at?: string;
  deleted_by?: string;
}

export interface RoomStayCreate {
  booking_request_id?: number;
  room_id?: number;
  customer_id?: number;
  checkin_date: string;
  checkout_date: string;
  actual_checkin?: string;
  actual_checkout?: string;
  status?: string;
  total_amount?: number;
  payment_status?: string;
  created_by?: string;
  updated_by?: string;
}

export interface RoomStayUpdate {
  booking_request_id?: number;
  room_id?: number;
  customer_id?: number;
  checkin_date?: string;
  checkout_date?: string;
  actual_checkin?: string;
  actual_checkout?: string;
  status?: string;
  total_amount?: number;
  payment_status?: string;
  updated_by?: string;
}

/**
 * Get all room stays for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @returns A list of room stays.
 */
export const getRoomStays = (tenantId: number) => {
  return request<RoomStay[]>('get', `/room-stays`, { tenant_id: tenantId });
};

/**
 * Create a new room stay for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @param data - The data for the new room stay.
 * @returns The newly created room stay.
 */
export const createRoomStay = (tenantId: number, data: RoomStayCreate) => {
  return request<RoomStay>('post', `/room-stays`, { 
    tenant_id: tenantId,
    ...data 
  });
};

/**
 * Get a single room stay by its ID for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @param stayId - The ID of the room stay.
 * @returns The room stay data.
 */
export const getRoomStayById = (tenantId: number, stayId: number) => {
    return request<RoomStay>('get', `/room-stays/${stayId}`, { tenant_id: tenantId });
};

/**
 * Update an existing room stay for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @param stayId - The ID of the room stay to update.
 * @param data - The new data for the room stay.
 * @returns The updated room stay.
 */
export const updateRoomStay = (tenantId: number, stayId: number, data: RoomStayUpdate) => {
  return request<RoomStay>('put', `/room-stays/${stayId}`, {
    tenant_id: tenantId,
    ...data
  });
};

/**
 * Delete a room stay for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @param stayId - The ID of the room stay to delete.
 */
export const deleteRoomStay = (tenantId: number, stayId: number) => {
  return request('delete', `/room-stays/${stayId}`, { 
    tenant_id: tenantId,
    deleted_by: 'admin'
  });
};
