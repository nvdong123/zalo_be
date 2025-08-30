import { request } from './request';

// Interface for Booking Request data based on backend schema
export interface BookingRequest {
  id: number;
  tenant_id: number;
  customer_id: number;
  room_id?: number;
  facility_id?: number;
  mobile_number?: string;
  booking_date: string;
  check_in_date?: string;
  check_out_date?: string;
  note?: string;
  request_channel?: string; // zalo_chat | external_link
  status: string; // requested, confirmed, cancelled, completed
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  deleted?: number;
  deleted_at?: string;
  deleted_by?: string;
}

export interface BookingRequestCreate {
  customer_id: number;
  room_id?: number;
  facility_id?: number;
  mobile_number?: string;
  booking_date: string;
  check_in_date?: string;
  check_out_date?: string;
  note?: string;
  request_channel?: string;
  status?: string;
  created_by?: string;
  updated_by?: string;
}

export interface BookingRequestUpdate {
  customer_id?: number;
  room_id?: number;
  facility_id?: number;
  mobile_number?: string;
  booking_date?: string;
  check_in_date?: string;
  check_out_date?: string;
  note?: string;
  request_channel?: string;
  status?: string;
  updated_by?: string;
}

/**
 * Get all booking requests for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @returns A list of booking requests.
 */
export const getBookingRequests = (tenantId: number) => {
  return request<BookingRequest[]>('get', `/booking-requests`, { tenant_id: tenantId });
};

/**
 * Create a new booking request for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @param data - The data for the new booking request.
 * @returns The newly created booking request.
 */
export const createBookingRequest = (tenantId: number, data: BookingRequestCreate) => {
  return request<BookingRequest>('post', `/booking-requests`, { 
    tenant_id: tenantId,
    ...data 
  });
};

/**
 * Get a single booking request by its ID for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @param bookingId - The ID of the booking request.
 * @returns The booking request data.
 */
export const getBookingRequestById = (tenantId: number, bookingId: number) => {
    return request<BookingRequest>('get', `/booking-requests/${bookingId}`, { tenant_id: tenantId });
};

/**
 * Update an existing booking request for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @param bookingId - The ID of the booking request to update.
 * @param data - The new data for the booking request.
 * @returns The updated booking request.
 */
export const updateBookingRequest = (tenantId: number, bookingId: number, data: BookingRequestUpdate) => {
  return request<BookingRequest>('put', `/booking-requests/${bookingId}`, {
    tenant_id: tenantId,
    ...data
  });
};

/**
 * Delete a booking request for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @param bookingId - The ID of the booking request to delete.
 */
export const deleteBookingRequest = (tenantId: number, bookingId: number) => {
  return request('delete', `/booking-requests/${bookingId}`, { 
    tenant_id: tenantId,
    deleted_by: 'admin'
  });
};
