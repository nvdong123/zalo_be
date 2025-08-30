// Base types
export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface Tenant extends BaseEntity {
  name: string;
  domain: string;
  status: string;
  subscription_plan_id?: number;
  created_by?: string;
  updated_by?: string;
  deleted?: number;
  deleted_at?: string;
  deleted_by?: string;
}

export interface AdminUser extends BaseEntity {
  username: string;
  email?: string;
  role: string;
  tenant_id?: number;
  status: string;
}

export interface HotelBrand extends BaseEntity {
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
  deleted?: number;
  deleted_at?: string;
  deleted_by?: string;
}

export interface Room extends BaseEntity {
  tenant_id: number;
  room_name: string;
  room_type: 'standard' | 'deluxe' | 'suite' | 'family' | 'presidential';
  description?: string;
  price: number;
  capacity_adults: number;
  capacity_children: number;
  size_sqm?: number;
  view_type?: 'sea' | 'city' | 'garden' | 'mountain' | 'pool';
  has_balcony: boolean;
  has_kitchen: boolean;
  image_url?: string;
  amenities?: string[];
  status: 'available' | 'occupied' | 'maintenance' | 'out_of_order';
}

export interface Facility extends BaseEntity {
  tenant_id: number;
  name: string;
  category: 'spa' | 'fitness' | 'business' | 'recreation' | 'dining' | 'other';
  description?: string;
  location?: string;
  operating_hours?: string;
  image_url?: string;
  phone?: string;
  is_chargeable: boolean;
  status: 'active' | 'inactive' | 'maintenance';
}

export interface Promotion extends BaseEntity {
  tenant_id: number;
  title: string;
  description?: string;
  promo_code?: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  min_stay_nights?: number;
  max_discount_amount?: number;
  start_date: string;
  end_date: string;
  banner_image?: string;
  terms_conditions?: string;
  status: 'draft' | 'active' | 'expired' | 'disabled';
  usage_limit?: number;
  used_count: number;
}

export interface Voucher extends BaseEntity {
  tenant_id: number;
  code: string;
  title: string;
  description?: string;
  value: number;
  value_type: 'percentage' | 'fixed_amount';
  min_order_value?: number;
  max_discount_amount?: number;
  valid_from: string;
  valid_until: string;
  usage_limit?: number;
  used_count: number;
  is_transferable: boolean;
  status: 'active' | 'expired' | 'disabled';
}

export interface Customer extends BaseEntity {
  tenant_id: number;
  full_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  nationality?: string;
  id_number?: string;
  passport_number?: string;
  address?: string;
  city?: string;
  country?: string;
  loyalty_points: number;
  total_spent: number;
  total_stays: number;
  last_stay_date?: string;
  status: 'active' | 'inactive' | 'blocked';
  notes?: string;
}

export interface RoomStay extends BaseEntity {
  tenant_id: number;
  customer_id: number;
  room_id: number;
  check_in_date: string;
  check_out_date: string;
  actual_check_in?: string;
  actual_check_out?: string;
  adults: number;
  children: number;
  total_amount: number;
  status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show';
  special_requests?: string;
  notes?: string;
}

export interface Service extends BaseEntity {
  tenant_id: number;
  name: string;
  category: 'room_service' | 'spa' | 'laundry' | 'transportation' | 'other';
  description?: string;
  price: number;
  duration_minutes?: number;
  is_available: boolean;
  image_url?: string;
}

export interface ServiceBooking extends BaseEntity {
  tenant_id: number;
  customer_id: number;
  service_id: number;
  room_stay_id?: number;
  booking_date: string;
  service_time: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
}

export interface BookingRequest extends BaseEntity {
  tenant_id: number;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children: number;
  room_type_preference?: string;
  total_amount?: number;
  special_requests?: string;
  status: 'pending' | 'confirmed' | 'declined' | 'cancelled';
  processed_by?: number;
  processed_at?: string;
  notes?: string;
}

export interface Game extends BaseEntity {
  tenant_id: number;
  name: string;
  category: 'quiz' | 'puzzle' | 'action' | 'strategy' | 'other';
  description?: string;
  thumbnail_url?: string;
  game_url?: string;
  points_reward: number;
  is_active: boolean;
  play_count: number;
}

export interface Experience extends BaseEntity {
  tenant_id: number;
  type: string;
  images?: string[];
  title?: string;
  description?: string[];
  vr360_url?: string;
  video_url?: string;
}

export interface AdminUser extends BaseEntity {
  username: string;
  email?: string;
  role: string;
  tenant_id?: number;
  status: string;
}

// API Response types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

// Form types
export interface PaginationParams {
  page?: number;
  page_size?: number;
}

export interface SearchParams extends PaginationParams {
  q?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Login types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: AdminUser;
}
