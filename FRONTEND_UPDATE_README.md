# Hotel Management System - Frontend Update

## 📋 Tổng quan

Đã cập nhật frontend để phù hợp với database schema mới của hệ thống quản lý khách sạn SaaS (multi-tenant). 

## 🆕 Các tính năng mới

### 1. Interfaces TypeScript mới
- **Tenant Management**: Quản lý các tenant (khách sạn)
- **Room Management**: Quản lý phòng với đầy đủ thông tin (amenities, features)
- **Facility Management**: Quản lý tiện ích chung (spa, gym, pool, etc.)
- **Hotel Brand**: Quản lý thương hiệu khách sạn với thông tin chi tiết
- **Customer Management**: Quản lý khách hàng và tích hợp Zalo
- **Booking System**: Hệ thống đặt phòng với workflow hoàn chỉnh
- **Promotion & Voucher**: Hệ thống khuyến mãi và voucher
- **Service & Room Stay**: Quản lý dịch vụ và lưu trú
- **Game System**: Hệ thống mini game tích hợp

### 2. API Client mới
Tất cả entities đều có API client đầy đủ với các operations:
- CRUD operations (Create, Read, Update, Delete)
- Search và filter với pagination
- Specific endpoints cho từng business logic

### 3. Pages Management mới
- **Hotel Dashboard**: Dashboard tổng quan với thống kê
- **Tenant Management**: Quản lý tenant
- **Room New Management**: Quản lý phòng với tính năng mới
- **Booking Management**: Quản lý đặt phòng

## 📁 Cấu trúc file mới

### Interfaces
```
src/interface/
├── tenant/tenant.ts          # Tenant interfaces
├── room/room.ts              # Room interfaces  
├── facility/facility.ts      # Facility interfaces
├── hotel/hotel.ts            # Hotel Brand interfaces
├── customer/customer.ts      # Customer interfaces
├── booking/types.ts          # Booking interfaces
├── promotion/promotion.ts    # Promotion & Voucher interfaces
├── service/service.ts        # Service & Room Stay interfaces
├── game/game.ts              # Game interfaces
└── index.ts                  # Export all interfaces
```

### API Clients
```
src/api/
├── tenantApi.ts              # Tenant API
├── roomNewApi.ts             # Room API
├── facilityNewApi.ts         # Facility API
├── hotelBrandApi.ts          # Hotel Brand API
├── customerNewApi.ts         # Customer API
├── bookingNewApi.ts          # Booking API
├── promotionNewApi.ts        # Promotion API
├── serviceNewApi.ts          # Service API
├── gameNewApi.ts             # Game API
└── api.ts                    # Export all APIs
```

### Pages
```
src/pages/
├── hotel-dashboard/          # Dashboard tổng quan
├── tenant-management/        # Quản lý tenant
├── room-new-management/      # Quản lý phòng mới
└── booking-new-management/   # Quản lý đặt phòng
```

## 🔧 Cách sử dụng

### 1. Import interfaces
```typescript
import type { 
  Tenant, 
  Room, 
  BookingRequest,
  Customer 
} from '@/interface';
```

### 2. Sử dụng API
```typescript
import { tenantApi, roomNewApi, bookingNewApi } from '@/api/api';

// Get tenants with pagination
const tenants = await tenantApi.getTenants({ page: 1, size: 10 });

// Create booking
const booking = await bookingNewApi.createBookingRequest({
  tenant_id: 1,
  customer_id: 1,
  room_id: 1,
  booking_date: '2025-08-05',
  status: 'requested'
});
```

### 3. Routing
Các route mới đã được thêm vào:
- `/dashboard` - Hotel Dashboard
- `/tenant-management` - Quản lý Tenant  
- `/room-new-management` - Quản lý Phòng Mới
- `/booking-new-management` - Quản lý Đặt Phòng

## 🏗️ Database Schema Support

Hỗ trợ đầy đủ 16 bảng trong database:
1. `tbl_tenants` - Multi-tenant architecture
2. `tbl_rooms` - Phòng với đầy đủ thông tin
3. `tbl_room_amenities` - Tiện nghi phòng
4. `tbl_room_features` - Đặc điểm phòng  
5. `tbl_facilities` - Tiện ích chung
6. `tbl_facility_features` - Đặc điểm tiện ích
7. `tbl_hotel_brands` - Thương hiệu khách sạn
8. `tbl_booking_requests` - Yêu cầu đặt phòng
9. `tbl_promotions` - Chương trình khuyến mãi
10. `tbl_vouchers` - Voucher
11. `tbl_customer_vouchers` - Voucher của khách hàng
12. `tbl_room_stays` - Lưu trú
13. `tbl_services` - Dịch vụ
14. `tbl_service_bookings` - Đặt dịch vụ
15. `tbl_customers` - Khách hàng
16. `tbl_games` - Game/Mini game

## 🎨 UI Components

Sử dụng Ant Design với:
- Tables với pagination, search, filter
- Forms với validation
- Modals cho create/edit
- Status tags và progress indicators
- Responsive design

## 🔄 Next Steps

1. **Backend Integration**: Đảm bảo backend APIs match với frontend interfaces
2. **Authentication**: Tích hợp authentication cho multi-tenant
3. **Real-time**: Thêm real-time updates cho booking status
4. **Mobile**: Tối ưu cho mobile devices
5. **Testing**: Viết unit tests cho components và APIs

## 📝 Lưu ý

- Tất cả components đều hỗ trợ tiếng Việt
- API responses sử dụng cấu trúc consistent với `status`, `result`, `message`
- Pagination sử dụng pattern chuẩn với `page`, `size`, `total`
- Soft delete được hỗ trợ với `deleted` flag
- Multi-tenant được handle thông qua `tenant_id`

## 🐛 Troubleshooting

Nếu gặp lỗi TypeScript:
1. Kiểm tra import paths
2. Đảm bảo interfaces được export đúng cách
3. Kiểm tra API response types match với interfaces
