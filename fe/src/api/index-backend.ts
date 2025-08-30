// Export API services based on actual backend endpoints
export { hotelBrandAPI } from './hotelBrand.api';
export { roomsAPI } from './rooms-backend.api';
export { customersAPI } from './customers-backend.api';
export { facilitiesAPI } from './facilities-backend.api';
export { bookingRequestsAPI } from './booking-requests-backend.api';
export { dashboardAPI } from './dashboard-backend.api';

// Legacy exports (keep for backward compatibility)
export { promotionsAPI } from './promotions.api';
export { vouchersAPI } from './vouchers.api';
export { bookingsAPI } from './bookings.api';
export { inventoryAPI } from './inventory.api';
export { reportsAPI } from './reports.api';

// Re-export types from backend-aligned APIs
export type { HotelBrandData, HotelBrandCreateData, HotelBrandUpdateData } from './hotelBrand.api';
export type { Room, RoomCreateData, RoomUpdateData } from './rooms-backend.api';
export type { Customer, CustomerCreateData, CustomerUpdateData } from './customers-backend.api';
export type { Facility, FacilityCreateData, FacilityUpdateData } from './facilities-backend.api';
export type { BookingRequest, BookingRequestCreateData, BookingRequestUpdateData } from './booking-requests-backend.api';
export type { SuperAdminDashboardStats, TenantDashboardStats } from './dashboard-backend.api';

// Legacy type exports
export type { PromotionCreateData, PromotionUpdateData } from './promotions.api';
export type { VoucherCreateData, VoucherUpdateData } from './vouchers.api';
export type { BookingCreateData, BookingUpdateData } from './bookings.api';
export type { InventoryCreateData, InventoryUpdateData } from './inventory.api';
export type { 
  ReportParams, 
  BookingReport, 
  RevenueReport, 
  OccupancyReport, 
  CustomerReport, 
  InventoryReport, 
  FinancialReport 
} from './reports.api';
