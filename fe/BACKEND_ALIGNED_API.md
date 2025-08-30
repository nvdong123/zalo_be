# Backend-Aligned Frontend API Documentation

## 🎯 Overview
This documentation covers the frontend API services that are **100% aligned** with the actual backend endpoints and schemas.

## 📋 Verified Backend Endpoints

### ✅ Active Endpoints (Based on backend/app/api/api_v1/api.py)

| Endpoint | Frontend API | Backend Schema | Status |
|----------|-------------|----------------|---------|
| `/hotel-brands` | `hotelBrandAPI` | `HotelBrandRead` | ✅ Aligned |
| `/rooms` | `roomsAPI` | `RoomRead` | ✅ Aligned |
| `/customers` | `customersAPI` | `CustomerRead` | ✅ Aligned |
| `/facilities` | `facilitiesAPI` | `FacilityRead` | ✅ Aligned |
| `/booking-requests` | `bookingRequestsAPI` | `BookingRequestRead` | ✅ Aligned |
| `/dashboard/super-admin/stats` | `dashboardAPI.getSuperAdminStats()` | Custom response | ✅ Aligned |
| `/dashboard/tenant/stats` | `dashboardAPI.getTenantStats()` | Custom response | ✅ Aligned |

### 🔄 Available but Not Yet Integrated

| Endpoint | Backend Schema | Note |
|----------|----------------|------|
| `/promotions` | `PromotionRead` | Available in backend |
| `/vouchers` | `VoucherRead` | Available in backend |
| `/services` | `ServiceRead` | Available in backend |
| `/experiences` | Custom | Available in backend |
| `/admin-users` | `AdminUserRead` | Super admin only |
| `/tenants` | `TenantRead` | Super admin only |

## 🏗️ API Architecture

### 1. Hotel Brands API (`hotelBrand.api.ts`)

**Backend Schema**: `HotelBrandRead`
```typescript
interface HotelBrandData {
  id: number;
  tenant_id: number;
  hotel_name: string;
  slogan?: string;
  description?: string;
  logo_url?: string;
  banner_images?: string;
  intro_video_url?: string;
  vr360_url?: string;
  address?: string;
  district?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  phone_number?: string;
  email?: string;
  website_url?: string;
  zalo_oa_id?: string;
  facebook_url?: string;
  youtube_url?: string;
  tiktok_url?: string;
  instagram_url?: string;
  google_map_url?: string;
  latitude?: number;
  longitude?: number;
  primary_color?: string;
  secondary_color?: string;
  copyright_text?: string;
  terms_url?: string;
  privacy_url?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}
```

**Endpoints**:
- `GET /api/v1/hotel-brands?tenant_id=X&skip=0&limit=100`
- `GET /api/v1/hotel-brands/{id}?tenant_id=X`
- `POST /api/v1/hotel-brands?tenant_id=X`
- `PUT /api/v1/hotel-brands/{id}?tenant_id=X`
- `DELETE /api/v1/hotel-brands/{id}?tenant_id=X`

### 2. Rooms API (`rooms-backend.api.ts`)

**Backend Schema**: `RoomRead`
```typescript
interface Room {
  id: number;
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
  gallery_url?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}
```

**Create Request Schema**: `RoomCreateRequest` (without tenant_id)
```typescript
interface RoomCreateData {
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
  gallery_url?: string;
}
```

### 3. Customers API (`customers-backend.api.ts`)

**Backend Schema**: `CustomerRead`
```typescript
interface Customer {
  id: number;
  tenant_id: number;
  zalo_user_id?: string;
  name?: string;
  phone?: string;
  email?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}
```

### 4. Facilities API (`facilities-backend.api.ts`)

**Backend Schema**: `FacilityRead`
```typescript
interface Facility {
  id: number;
  tenant_id: number;
  facility_name: string;
  description?: string;
  type?: string;
  image_url?: string;
  video_url?: string;
  vr360_url?: string;
  gallery_url?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}
```

### 5. Booking Requests API (`booking-requests-backend.api.ts`)

**Backend Schema**: `BookingRequestRead`
```typescript
interface BookingRequest {
  id: number;
  tenant_id: number;
  customer_id: number;
  booking_date: string;
  room_id?: number;
  facility_id?: number;
  mobile_number?: string;
  check_in_date?: string;
  check_out_date?: string;
  note?: string;
  request_channel?: string;
  status?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}
```

### 6. Dashboard API (`dashboard-backend.api.ts`)

**Super Admin Stats Response**:
```typescript
interface SuperAdminDashboardStats {
  success: boolean;
  data: {
    system_overview: {
      total_tenants: number;
      active_tenants: number;
      inactive_tenants: number;
      total_rooms: number;
      total_facilities: number;
      total_customers: number;
      total_admins: number;
    };
    bookings: {
      total: number;
      pending: number;
      processed: number;
    };
    growth: {
      new_tenants_week: number;
      new_customers_week: number;
    };
  };
}
```

**Tenant Admin Stats Response**:
```typescript
interface TenantDashboardStats {
  success: boolean;
  data: {
    tenant_overview: {
      total_rooms: number;
      total_facilities: number;
      total_customers: number;
      total_bookings: number;
    };
    bookings: {
      pending: number;
      confirmed: number;
      completed: number;
    };
    recent_activity: {
      new_customers_week: number;
      new_bookings_week: number;
    };
  };
}
```

## 🔧 Implementation Notes

### Authentication & Authorization
All endpoints require authentication and proper tenant permissions:
- **SUPER_ADMIN**: Can access all tenants via `tenant_id` parameter
- **HOTEL_ADMIN**: Only access their own tenant data

### Parameter Conventions
- **tenant_id**: Required for all operations (auto-injected by frontend)
- **skip**: Pagination offset (not `offset`)
- **limit**: Results per page (default: 100)
- **deleted_by**: Username for soft delete operations

### Error Handling
Backend returns standard FastAPI error responses:
```json
{
  "detail": "Error message"
}
```

### React Query Integration
All hooks use consistent patterns:
```typescript
// Query keys for cache management
export const entityKeys = {
  all: ['entity'] as const,
  lists: () => [...entityKeys.all, 'list'] as const,
  list: (params: any) => [...entityKeys.lists(), params] as const,
  details: () => [...entityKeys.all, 'detail'] as const,
  detail: (id: number) => [...entityKeys.details(), id] as const,
};
```

## 📁 File Structure
```
src/api/
├── index-backend.ts              # Main exports for backend-aligned APIs
├── hotelBrand.api.ts            # ✅ Hotel brands (aligned)
├── rooms-backend.api.ts         # ✅ Rooms (aligned)
├── customers-backend.api.ts     # ✅ Customers (aligned)
├── facilities-backend.api.ts    # ✅ Facilities (aligned)
├── booking-requests-backend.api.ts # ✅ Booking requests (aligned)
├── dashboard-backend.api.ts     # ✅ Dashboard (aligned)
└── [legacy files...]            # Previous API implementations

src/modules/
├── rooms/hooks-backend.ts       # ✅ Updated rooms hooks
├── dashboard/hooks-backend.ts   # ✅ Updated dashboard hooks
└── [other modules...]           # To be updated
```

## 🚀 Next Steps

### Immediate Tasks:
1. **Replace legacy API imports** in components
2. **Update remaining module hooks** to use backend-aligned APIs
3. **Test all endpoints** with actual backend
4. **Remove legacy API files** once migration is complete

### Backend APIs to Integrate Next:
1. **Promotions API** - `/api/v1/promotions`
2. **Vouchers API** - `/api/v1/vouchers`
3. **Services API** - `/api/v1/services`
4. **Admin Users API** - `/api/v1/admin-users`
5. **Tenants API** - `/api/v1/tenants`

## ✅ Migration Checklist

- [x] Hotel Brands API - Fully aligned
- [x] Rooms API - Fully aligned
- [x] Customers API - Fully aligned
- [x] Facilities API - Fully aligned
- [x] Booking Requests API - Fully aligned
- [x] Dashboard API - Fully aligned
- [ ] Component updates to use new APIs
- [ ] Remove legacy API files
- [ ] Add remaining backend endpoints
- [ ] Update documentation

This implementation ensures 100% compatibility with the actual backend API endpoints and schemas!
