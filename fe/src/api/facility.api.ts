import { request } from './request';

// Interface for Facility data based on backend schema
export interface Facility {
  id: number;
  tenant_id: number;
  facility_name: string;
  description?: string;
  type?: string; // restaurant, spa, gym, pool, etc.
  image_url?: string;
  video_url?: string;
  vr360_url?: string;
  gallery_url?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  deleted?: number;
  deleted_at?: string;
  deleted_by?: string;
}

export interface FacilityCreate {
  facility_name: string;
  description?: string;
  type?: string;
  image_url?: string;
  video_url?: string;
  vr360_url?: string;
  gallery_url?: string;
  created_by?: string;
  updated_by?: string;
}

export interface FacilityUpdate {
  facility_name?: string;
  description?: string;
  type?: string;
  image_url?: string;
  video_url?: string;
  vr360_url?: string;
  gallery_url?: string;
  updated_by?: string;
}

/**
 * Get all facilities for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @returns A list of facilities.
 */
export const getFacilities = (tenantId: number) => {
  return request<Facility[]>('get', `/facilities`, { tenant_id: tenantId });
};

/**
 * Create a new facility for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @param data - The data for the new facility.
 * @returns The newly created facility.
 */
export const createFacility = (tenantId: number, data: FacilityCreate) => {
  return request<Facility>('post', `/facilities`, { 
    tenant_id: tenantId,
    ...data 
  });
};

/**
 * Get a single facility by its ID for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @param facilityId - The ID of the facility.
 * @returns The facility data.
 */
export const getFacilityById = (tenantId: number, facilityId: number) => {
    return request<Facility>('get', `/facilities/${facilityId}`, { tenant_id: tenantId });
};

/**
 * Update an existing facility for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @param facilityId - The ID of the facility to update.
 * @param data - The new data for the facility.
 * @returns The updated facility.
 */
export const updateFacility = (tenantId: number, facilityId: number, data: FacilityUpdate) => {
  return request<Facility>('put', `/facilities/${facilityId}`, {
    tenant_id: tenantId,
    ...data
  });
};

/**
 * Delete a facility for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @param facilityId - The ID of the facility to delete.
 */
export const deleteFacility = (tenantId: number, facilityId: number) => {
  return request('delete', `/facilities/${facilityId}`, { 
    tenant_id: tenantId,
    deleted_by: 'admin'
  });
};
