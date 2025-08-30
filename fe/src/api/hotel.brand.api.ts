import { request } from '../utils/request';

// Interface for Hotel Brand data based on backend schema
export interface HotelBrand {
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
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  deleted?: number;
  deleted_at?: string;
  deleted_by?: string;
}

export interface HotelBrandCreate {
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
}

export interface HotelBrandUpdate {
    hotel_name?: string;
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
}

/**
 * Get all hotel brands for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @returns A list of hotel brands.
 */
export const getHotelBrands = (tenantId: number) => {
  return request<HotelBrand[]>('get', `/hotel-brands`, { tenant_id: tenantId });
};

/**
 * Create a new hotel brand for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @param data - The data for the new hotel brand.
 * @returns The newly created hotel brand.
 */
export const createHotelBrand = (tenantId: number, data: HotelBrandCreate) => {
  return request<HotelBrand>('post', `/hotel-brands`, { 
    tenant_id: tenantId,
    ...data 
  });
};

/**
 * Get a single hotel brand by its ID for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @param brandId - The ID of the hotel brand.
 * @returns The hotel brand data.
 */
export const getHotelBrandById = (tenantId: number, brandId: number) => {
    return request<HotelBrand>('get', `/hotel-brands/${brandId}`, { tenant_id: tenantId });
};

/**
 * Update an existing hotel brand for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @param brandId - The ID of the hotel brand to update.
 * @param data - The new data for the hotel brand.
 * @returns The updated hotel brand.
 */
export const updateHotelBrand = (tenantId: number, brandId: number, data: HotelBrandUpdate) => {
  return request<HotelBrand>('put', `/hotel-brands/${brandId}`, {
    tenant_id: tenantId,
    ...data
  });
};

/**
 * Delete a hotel brand for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @param brandId - The ID of the hotel brand to delete.
 */
export const deleteHotelBrand = (tenantId: number, brandId: number) => {
  return request('delete', `/hotel-brands/${brandId}`, { 
    tenant_id: tenantId,
    deleted_by: 'admin' // You may want to get this from current user
  });
};
