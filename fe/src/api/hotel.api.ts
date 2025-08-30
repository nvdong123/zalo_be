// API Services - Tích hợp với Backend đã test thành công
import { request } from './request';
import { buildTenantUrl, buildUrl, API_ENDPOINTS } from './endpoints';
import type { 
  Room, 
  Tenant, 
  Facility, 
  HotelBrand, 
  BookingRequest, 
  Service, 
  Voucher, 
  Customer, 
  CreateRoomRequest,
  UpdateRoomRequest,
  CreateBookingRequest,
  UpdateBookingRequest,
  CreateServiceRequest,
  UpdateServiceRequest,
  CreateVoucherRequest,
  UpdateVoucherRequest,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CreatePromotionRequest,
  UpdatePromotionRequest,
  CreateHotelBrandRequest,
  UpdateHotelBrandRequest,
  CreateTenantRequest,
  UpdateTenantRequest,
  TenantParams,
  LoginRequest,
  LoginResponse
} from '@/types/api';

// Authentication API - ✅ Đã test thành công
export const authApi = {
  login: (data: LoginRequest) => 
    request('post', API_ENDPOINTS.LOGIN, data),
    
  logout: () => 
    request('post', API_ENDPOINTS.LOGOUT),
};

export interface RoomCreate {
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
}

// Promotion interfaces
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
}

export interface PromotionCreate {
  tenant_id: number;
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  banner_image?: string;
  status?: string;
}

// API Functions
export const tenantApi = {
  // Get all tenants
  getAll: () => request<Tenant[]>('get', '/api/v1/tenants'),
  
  // Get tenant by ID
  getById: (id: number) => request<Tenant>('get', `/api/v1/tenants/${id}`),
  
  // Get tenant by domain
  getByDomain: (domain: string) => request<Tenant>('get', `/api/v1/tenants/domain/${domain}`),
  
  // Create tenant
  create: (data: CreateTenantRequest) => request<Tenant>('post', '/api/v1/tenants', data),
  
  // Update tenant
  update: (id: number, data: Partial<CreateTenantRequest>) => request<Tenant>('put', `/api/v1/tenants/${id}`, data),
  
  // Delete tenant
  delete: (id: number) => request<void>('delete', `/api/v1/tenants/${id}`)
};

export const roomApi = {
  // Get all rooms for a tenant - match backend pattern
  getAll: (tenantId: number) => request<Room[]>('get', `/api/v1/rooms?tenant_id=${tenantId}`),
  
  // Get room by ID
  getById: (id: number, tenantId: number) => request<Room>('get', `/api/v1/rooms/${id}?tenant_id=${tenantId}`),
  
  // Create room - match backend pattern
  create: (data: CreateRoomRequest, tenantId: number) => 
    request<Room>('post', `/api/v1/rooms?tenant_id=${tenantId}`, data),
  
  // Update room - match backend pattern
  update: (id: number, data: UpdateRoomRequest, tenantId: number) => 
    request<Room>('put', `/api/v1/rooms/${id}?tenant_id=${tenantId}`, data),
  
  // Delete room - match backend pattern
  delete: (id: number, tenantId: number) => 
    request<void>('delete', `/api/v1/rooms/${id}?tenant_id=${tenantId}`)
};

export const promotionApi = {
  // Get all promotions for a tenant - match backend pattern
  getAll: (tenantId: number) => request<Promotion[]>('get', `/api/v1/promotions?tenant_id=${tenantId}`),
  
  // Get promotion by ID
  getById: (id: number, tenantId: number) => request<Promotion>('get', `/api/v1/promotions/${id}?tenant_id=${tenantId}`),
  
  // Create promotion - match backend pattern
  create: (data: CreatePromotionRequest, tenantId: number) => 
    request<Promotion>('post', `/api/v1/promotions?tenant_id=${tenantId}`, data),
  
  // Update promotion - match backend pattern
  update: (id: number, data: UpdatePromotionRequest, tenantId: number) => 
    request<Promotion>('put', `/api/v1/promotions/${id}?tenant_id=${tenantId}`, data),
  
  // Delete promotion - match backend pattern
  delete: (id: number, tenantId: number) => 
    request<void>('delete', `/api/v1/promotions/${id}?tenant_id=${tenantId}`)
};
