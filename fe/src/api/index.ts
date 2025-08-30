// Export all API services
export { hotelBrandAPI } from './hotelBrand.api';
export { roomsAPI } from './rooms.api';
export { customersAPI } from './customers.api';
export { facilitiesAPI } from './facilities.api';
export { promotionsAPI } from './promotions.api';
export { vouchersAPI } from './vouchers.api';
export { bookingsAPI } from './bookings.api';
export { inventoryAPI } from './inventory.api';
export { reportsAPI } from './reports.api';

// Re-export create/update data types
export type { HotelBrandCreateData, HotelBrandUpdateData } from './hotelBrand.api';
export type { RoomCreateData, RoomUpdateData } from './rooms.api';
export type { CustomerCreateData, CustomerUpdateData } from './customers.api';
export type { FacilityCreateData, FacilityUpdateData } from './facilities.api';
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
