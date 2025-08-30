import { auth } from '@/store/auth';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/v1/auth/login',
  REFRESH: '/api/v1/auth/refresh',
  LOGOUT: '/api/v1/auth/logout',
  
  // Admin endpoints - match backend exactly
  TENANTS: '/api/v1/tenants',
  ADMIN_USERS: '/api/v1/admin-users',
  
  // Hotel management endpoints - match backend exactly
  HOTEL_BRANDS: '/api/v1/hotel-brands',
  ROOMS: '/api/v1/rooms',
  FACILITIES: '/api/v1/facilities',
  PROMOTIONS: '/api/v1/promotions',
  VOUCHERS: '/api/v1/vouchers',
  CUSTOMERS: '/api/v1/customers',
  ROOM_STAYS: '/api/v1/room-stays',
  SERVICES: '/api/v1/services',
  SERVICE_BOOKINGS: '/api/v1/service-bookings',
  BOOKING_REQUESTS: '/api/v1/booking-requests',
  GAMES: '/api/v1/games',
  EXPERIENCES: '/api/v1/experiences',
} as const;

// Helper function to build URL with tenant_id parameter
export function buildTenantUrl(endpoint: string, tenantId?: number): string {
  const effectiveTenantId = tenantId || auth.tenantId();
  
  if (!effectiveTenantId) {
    return endpoint;
  }
  
  const separator = endpoint.includes('?') ? '&' : '?';
  return `${endpoint}${separator}tenant_id=${effectiveTenantId}`;
}

// Helper function to build URL with query parameters
export function buildUrl(endpoint: string, params: Record<string, any> = {}): string {
  const url = new URL(endpoint, 'http://localhost'); // Base doesn't matter, we only need the pathname and search
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, String(value));
    }
  });
  
  return url.pathname + url.search;
}

// Helper function to build tenant-aware URL with query parameters
export function buildTenantUrlWithParams(
  endpoint: string, 
  params: Record<string, any> = {},
  tenantId?: number
): string {
  const effectiveTenantId = tenantId || auth.tenantId();
  
  const allParams = effectiveTenantId 
    ? { ...params, tenant_id: effectiveTenantId }
    : params;
    
  return buildUrl(endpoint, allParams);
}

// React Query key factories
export const queryKeys = {
  // Auth
  auth: ['auth'] as const,
  
  // Tenants
  tenants: ['tenants'] as const,
  tenant: (id: number) => ['tenants', id] as const,
  
  // Admin Users
  adminUsers: (tenantId?: number) => ['admin-users', tenantId] as const,
  adminUser: (id: number) => ['admin-users', id] as const,
  
  // Hotel Brands
  hotelBrands: (tenantId: number) => ['hotel-brands', tenantId] as const,
  hotelBrand: (tenantId: number, id: number) => ['hotel-brands', tenantId, id] as const,
  
  // Rooms
  rooms: (tenantId: number, params?: any) => ['rooms', tenantId, params] as const,
  room: (tenantId: number, id: number) => ['rooms', tenantId, id] as const,
  
  // Facilities
  facilities: (tenantId: number, params?: any) => ['facilities', tenantId, params] as const,
  facility: (tenantId: number, id: number) => ['facilities', tenantId, id] as const,
  
  // Promotions
  promotions: (tenantId: number, params?: any) => ['promotions', tenantId, params] as const,
  promotion: (tenantId: number, id: number) => ['promotions', tenantId, id] as const,
  
  // Vouchers
  vouchers: (tenantId: number, params?: any) => ['vouchers', tenantId, params] as const,
  voucher: (tenantId: number, id: number) => ['vouchers', tenantId, id] as const,
  
  // Customers
  customers: (tenantId: number, params?: any) => ['customers', tenantId, params] as const,
  customer: (tenantId: number, id: number) => ['customers', tenantId, id] as const,
  
  // Room Stays
  roomStays: (tenantId: number, params?: any) => ['room-stays', tenantId, params] as const,
  roomStay: (tenantId: number, id: number) => ['room-stays', tenantId, id] as const,
  
  // Services
  services: (tenantId: number, params?: any) => ['services', tenantId, params] as const,
  service: (tenantId: number, id: number) => ['services', tenantId, id] as const,
  
  // Service Bookings
  serviceBookings: (tenantId: number, params?: any) => ['service-bookings', tenantId, params] as const,
  serviceBooking: (tenantId: number, id: number) => ['service-bookings', tenantId, id] as const,
  
  // Booking Requests
  bookingRequests: (tenantId: number, params?: any) => ['booking-requests', tenantId, params] as const,
  bookingRequest: (tenantId: number, id: number) => ['booking-requests', tenantId, id] as const,
  
  // Games
  games: (tenantId: number, params?: any) => ['games', tenantId, params] as const,
  game: (tenantId: number, id: number) => ['games', tenantId, id] as const,
} as const;
