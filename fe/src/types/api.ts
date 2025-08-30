// Hotel Booking System Types - Dựa trên Backend API đã test thành công
// Kế thừa từ cấu trúc hiện có và mở rộng

// Kế thừa AuthUser từ store/auth.ts
export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: 'super_admin' | 'hotel_admin';
  tenant_id?: number;
  full_name?: string;
}

// Authentication - Tương thích với API đã test
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_info?: AuthUser;
}

// Tenant - 3 records từ API test
export interface Tenant {
  id: number;
  name: string;
  description?: string;
  phone_number?: string;
  email?: string;
  address?: string;
  logo_url?: string;
  website_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted: number;
  deleted_at?: string;
  deleted_by?: number;
}

// Room - 3 records từ API test
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
  deleted: number;
  deleted_at?: string;
  deleted_by?: number;
}

// Facility - 1 record từ API test
export interface Facility {
  id: number;
  tenant_id: number;
  facility_name: string;
  category?: string;
  description?: string;
  location?: string;
  operating_hours?: string;
  capacity?: number;
  price_per_use?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted: number;
  deleted_at?: string;
  deleted_by?: number;
}

// Hotel Brand - 1 record từ API test
export interface HotelBrand {
  id: number;
  tenant_id: number;
  brand_name: string;
  logo_url?: string;
  description?: string;
  website_url?: string;
  contact_email?: string;
  contact_phone?: string;
  established_year?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted: number;
  deleted_at?: string;
  deleted_by?: number;
}

// Booking Request - 1 record từ API test
export interface BookingRequest {
  id: number;
  tenant_id: number;
  room_id?: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  check_in_date: string;
  check_out_date: string;
  guest_count: number;
  special_requests?: string;
  status: 'requested' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  total_amount?: number;
  booking_source?: string;
  created_at: string;
  updated_at: string;
  deleted: number;
  deleted_at?: string;
  deleted_by?: number;
}

// Service - 1 record từ API test
export interface Service {
  id: number;
  tenant_id: number;
  service_name: string;
  service_type?: string;
  description?: string;
  price_vnd?: number;
  duration_minutes?: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  deleted: number;
  deleted_at?: string;
  deleted_by?: number;
}

// Voucher - 0 records từ API test
export interface Voucher {
  id: number;
  tenant_id: number;
  voucher_code: string;
  voucher_name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  discount_percentage?: number;
  min_order_value?: number;
  max_discount_amount?: number;
  valid_from: string;
  valid_until: string;
  usage_limit?: number;
  used_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted: number;
  deleted_at?: string;
  deleted_by?: number;
}

// Customer - 1 record từ API test
export interface Customer {
  id: number;
  tenant_id: number;
  full_name?: string;
  phone_number?: string;
  email?: string;
  address?: string;
  date_of_birth?: string;
  id_number?: string;
  nationality?: string;
  loyalty_points: number;
  preferred_contact_method?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted: number;
  deleted_at?: string;
  deleted_by?: number;
}

// Promotion - Match với backend schema exactly
export interface Promotion {
  id: number;
  tenant_id: number;
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  banner_image?: string;
  status?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  deleted: number;
}

// Common Response Types - Tương thích với request.ts hiện có
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success?: boolean;
  status?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Pagination Parameters - Kế thừa từ cấu trúc hiện có
export interface PaginationParams {
  page?: number;
  size?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Tenant-scoped Parameters - Sử dụng buildTenantUrl từ endpoints.ts
export interface TenantParams extends PaginationParams {
  tenant_id?: number;
}

// Create/Update Request Types (loại bỏ readonly fields)
export type CreateRoomRequest = Omit<Room, 'id' | 'created_at' | 'updated_at' | 'deleted' | 'deleted_at' | 'deleted_by'>;
export type UpdateRoomRequest = Partial<CreateRoomRequest>;

export type CreateTenantRequest = Omit<Tenant, 'id' | 'created_at' | 'updated_at' | 'deleted' | 'deleted_at' | 'deleted_by'>;
export type UpdateTenantRequest = Partial<CreateTenantRequest>;

export type CreateFacilityRequest = Omit<Facility, 'id' | 'created_at' | 'updated_at' | 'deleted' | 'deleted_at' | 'deleted_by'>;
export type UpdateFacilityRequest = Partial<CreateFacilityRequest>;

export type CreateBookingRequest = Omit<BookingRequest, 'id' | 'created_at' | 'updated_at' | 'deleted' | 'deleted_at' | 'deleted_by'>;
export type UpdateBookingRequest = Partial<CreateBookingRequest>;

export type CreateServiceRequest = Omit<Service, 'id' | 'created_at' | 'updated_at' | 'deleted' | 'deleted_at' | 'deleted_by'>;
export type UpdateServiceRequest = Partial<CreateServiceRequest>;

export type CreateVoucherRequest = Omit<Voucher, 'id' | 'created_at' | 'updated_at' | 'deleted' | 'deleted_at' | 'deleted_by' | 'used_count'>;
export type UpdateVoucherRequest = Partial<CreateVoucherRequest>;

export type CreateCustomerRequest = Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'deleted' | 'deleted_at' | 'deleted_by' | 'loyalty_points'>;
export type UpdateCustomerRequest = Partial<CreateCustomerRequest>;

export type CreatePromotionRequest = {
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  banner_image?: string;
  status?: string;
};
export type UpdatePromotionRequest = Partial<CreatePromotionRequest>;

export type CreateHotelBrandRequest = Omit<HotelBrand, 'id' | 'created_at' | 'updated_at' | 'deleted' | 'deleted_at' | 'deleted_by'>;
export type UpdateHotelBrandRequest = Partial<CreateHotelBrandRequest>;

// Form Field Types để sử dụng trong Antd Forms
export interface RoomFormFields {
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
}

export interface BookingFormFields {
  room_id?: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  check_in_date: string;
  check_out_date: string;
  guest_count: number;
  special_requests?: string;
}

// Status Options cho Select Components
export const BOOKING_STATUS_OPTIONS = [
  { label: 'Requested', value: 'requested' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Checked In', value: 'checked_in' },
  { label: 'Checked Out', value: 'checked_out' },
  { label: 'Cancelled', value: 'cancelled' }
] as const;

export const ROOM_TYPE_OPTIONS = [
  { label: 'Standard', value: 'standard' },
  { label: 'Deluxe', value: 'deluxe' },
  { label: 'Suite', value: 'suite' },
  { label: 'Presidential', value: 'presidential' }
] as const;

export const DISCOUNT_TYPE_OPTIONS = [
  { label: 'Percentage', value: 'percentage' },
  { label: 'Fixed Amount', value: 'fixed_amount' }
] as const;
