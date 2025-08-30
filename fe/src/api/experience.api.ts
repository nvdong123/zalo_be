import { request } from './request';
import { Experience } from '@/types';

export interface ExperienceCreate {
  type: string;
  images?: string[];
  title?: string;
  description?: string[];
  vr360_url?: string;
  video_url?: string;
}

export interface ExperienceUpdate {
  type?: string;
  images?: string[];
  title?: string;
  description?: string[];
  vr360_url?: string;
  video_url?: string;
}

/**
 * Get all experiences for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @returns A list of experiences.
 */
export const getExperiences = (tenantId: number) => {
  return request<Experience[]>('get', `/experiences`, { tenant_id: tenantId });
};

/**
 * Get experiences filtered by type for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @param type - The type of experience to filter by.
 * @returns A list of experiences filtered by type.
 */
export const getExperiencesByType = (tenantId: number, type: string) => {
  return request<Experience[]>('get', `/experiences`, { 
    tenant_id: tenantId,
    type 
  });
};

/**
 * Create a new experience for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @param data - The data for the new experience.
 * @returns The newly created experience.
 */
export const createExperience = (tenantId: number, data: ExperienceCreate) => {
  return request<Experience>('post', `/experiences`, { 
    tenant_id: tenantId,
    ...data 
  });
};

/**
 * Get a single experience by its ID for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @param experienceId - The ID of the experience.
 * @returns The experience data.
 */
export const getExperienceById = (tenantId: number, experienceId: number) => {
    return request<Experience>('get', `/experiences/${experienceId}`, { tenant_id: tenantId });
};

/**
 * Update an existing experience for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @param experienceId - The ID of the experience to update.
 * @param data - The new data for the experience.
 * @returns The updated experience.
 */
export const updateExperience = (tenantId: number, experienceId: number, data: ExperienceUpdate) => {
  return request<Experience>('put', `/experiences/${experienceId}`, {
    tenant_id: tenantId,
    ...data
  });
};

/**
 * Delete an experience for a specific tenant.
 * @param tenantId - The ID of the tenant.
 * @param experienceId - The ID of the experience to delete.
 */
export const deleteExperience = (tenantId: number, experienceId: number) => {
  return request('delete', `/experiences/${experienceId}`, { 
    tenant_id: tenantId
  });
};
