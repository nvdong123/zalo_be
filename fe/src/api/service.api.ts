import { request } from './request';

// Interface for Service data based on backend schema
export interface Service {
  id: number;
  tenant_id: number;
  service_name: string;
  description?: string;
  price?: number;
  category?: string;
  duration_minutes?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  deleted?: number;
  deleted_at?: string;
  deleted_by?: string;
}

export interface ServiceCreate {
  service_name: string;
  description?: string;
  price?: number;
  category?: string;
  duration_minutes?: number;
  is_active?: boolean;
  created_by?: string;
  updated_by?: string;
}

export interface ServiceUpdate {
  service_name?: string;
  description?: string;
  price?: number;
  category?: string;
  duration_minutes?: number;
  is_active?: boolean;
  updated_by?: string;
}

/**
 * Get all services for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @returns A list of services.
 */
export const getServices = (tenantId: number) => {
  return request<Service[]>('get', `/services`, { tenant_id: tenantId });
};

/**
 * Create a new service for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @param data - The data for the new service.
 * @returns The newly created service.
 */
export const createService = (tenantId: number, data: ServiceCreate) => {
  return request<Service>('post', `/services`, { 
    tenant_id: tenantId,
    ...data 
  });
};

/**
 * Get a single service by its ID for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @param serviceId - The ID of the service.
 * @returns The service data.
 */
export const getServiceById = (tenantId: number, serviceId: number) => {
    return request<Service>('get', `/services/${serviceId}`, { tenant_id: tenantId });
};

/**
 * Update an existing service for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @param serviceId - The ID of the service to update.
 * @param data - The new data for the service.
 * @returns The updated service.
 */
export const updateService = (tenantId: number, serviceId: number, data: ServiceUpdate) => {
  return request<Service>('put', `/services/${serviceId}`, {
    tenant_id: tenantId,
    ...data
  });
};

/**
 * Delete a service for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @param serviceId - The ID of the service to delete.
 */
export const deleteService = (tenantId: number, serviceId: number) => {
  return request('delete', `/services/${serviceId}`, { 
    tenant_id: tenantId,
    deleted_by: 'admin'
  });
};
