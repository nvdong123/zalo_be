import { request } from './request';
import type { 
  Room,
  Tenant, 
  Facility,
  HotelBrand,
  BookingRequest,
  Service,
  Voucher,
  Customer,
  Promotion,
  CreateRoomRequest,
  CreateTenantRequest,
  LoginRequest,
  LoginResponse
} from '@/types/api';

// Authentication API - Đã test thành công
export const authApi = {
  login: (data: LoginRequest) => 
    request<LoginResponse>('post', '/auth/login', data),
    
  logout: () => 
    request('post', '/auth/logout'),
};

// Tenant API - 3 records đã test
export const tenantApi = {
  getAll: () => 
    request<Tenant[]>('get', '/tenants'),
    
  getById: (id: number) => 
    request<Tenant>('get', `/tenants/${id}`),
    
  create: (data: CreateTenantRequest) => 
    request<Tenant>('post', '/tenants', data),
    
  update: (id: number, data: Partial<CreateTenantRequest>) => 
    request<Tenant>('put', `/tenants/${id}`, data),
    
  delete: (id: number) => 
    request('delete', `/tenants/${id}`)
};

// Room API - 3 records đã test
export const roomApi = {
  getAll: (tenantId: number) => 
    request<Room[]>('get', '/rooms', { tenant_id: tenantId }),
    
  getById: (id: number, tenantId: number) => 
    request<Room>('get', `/rooms/${id}`, { tenant_id: tenantId }),
    
  create: (data: CreateRoomRequest, tenantId: number) => 
    request<Room>('post', '/rooms', { ...data, tenant_id: tenantId }),
    
  update: (id: number, data: Partial<CreateRoomRequest>, tenantId: number) => 
    request<Room>('put', `/rooms/${id}`, data, { params: { tenant_id: tenantId } }),
    
  delete: (id: number, tenantId: number) => 
    request('delete', `/rooms/${id}`, { tenant_id: tenantId })
};

// Facility API - 1 record đã test
export const facilityApi = {
  getAll: (tenantId: number) => 
    request<Facility[]>('get', '/facilities', { tenant_id: tenantId }),
    
  getById: (id: number, tenantId: number) => 
    request<Facility>('get', `/facilities/${id}`, { tenant_id: tenantId })
};

// Hotel Brand API - 1 record đã test
export const hotelBrandApi = {
  getAll: (tenantId: number) => 
    request<HotelBrand[]>('get', '/hotel-brands', { tenant_id: tenantId })
};

// Booking Request API - 1 record đã test
export const bookingRequestApi = {
  getAll: (tenantId: number) => 
    request<BookingRequest[]>('get', '/booking-requests', { tenant_id: tenantId })
};

// Service API - 1 record đã test  
export const serviceApi = {
  getAll: (tenantId: number) => 
    request<Service[]>('get', '/services', { tenant_id: tenantId })
};

// Customer API - 1 record đã test
export const customerApi = {
  getAll: (tenantId: number) => 
    request<Customer[]>('get', '/customers', { tenant_id: tenantId })
};

// Voucher API - 0 records đã test
export const voucherApi = {
  getAll: (tenantId: number) => 
    request<Voucher[]>('get', '/vouchers', { tenant_id: tenantId })
};

// Promotion API - Cần restart server
export const promotionApi = {
  getAll: (tenantId: number) => 
    request<Promotion[]>('get', '/promotions', { tenant_id: tenantId })
};
