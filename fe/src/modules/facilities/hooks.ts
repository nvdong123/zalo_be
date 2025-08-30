import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { facilitiesAPI, type FacilityCreateData, type FacilityUpdateData } from '../../api';

// Define Facility interface for backward compatibility
export interface Facility {
  id: number;
  tenant_id: number;
  facility_name: string;
  description?: string;
  category: 'spa' | 'gym' | 'pool' | 'restaurant' | 'conference' | 'parking' | 'other';
  location?: string;
  capacity?: number;
  is_available: boolean;
  booking_required: boolean;
  hourly_rate?: number;
  daily_rate?: number;
  amenities?: string;
  images?: string;
  operating_hours?: string;
  contact_info?: string;
  created_at: string;
  updated_at: string;
}

// Query keys
export const facilitiesKeys = {
  all: ['facilities'] as const,
  lists: () => [...facilitiesKeys.all, 'list'] as const,
  list: (params: any) => [...facilitiesKeys.lists(), params] as const,
  details: () => [...facilitiesKeys.all, 'detail'] as const,
  detail: (id: number) => [...facilitiesKeys.details(), id] as const,
};

// Hooks for facilities
export const useFacilities = (params?: { 
  skip?: number; 
  limit?: number; 
  search?: string; 
  category?: string;
  is_available?: boolean;
}) => {
  return useQuery({
    queryKey: facilitiesKeys.list(params),
    queryFn: () => facilitiesAPI.getAll(params),
    staleTime: 60000, // 1 minute
  });
};

export const useFacility = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: facilitiesKeys.detail(id),
    queryFn: () => facilitiesAPI.getById(id),
    enabled: enabled && !!id,
  });
};

export const useCreateFacility = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: FacilityCreateData) => facilitiesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.all });
      message.success('Tiện ích đã được tạo thành công!');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.detail || 'Có lỗi xảy ra khi tạo tiện ích');
    },
  });
};

export const useUpdateFacility = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & FacilityUpdateData) => 
      facilitiesAPI.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.all });
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.detail(variables.id) });
      message.success('Tiện ích đã được cập nhật thành công!');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.detail || 'Có lỗi xảy ra khi cập nhật tiện ích');
    },
  });
};

export const useDeleteFacility = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => facilitiesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: facilitiesKeys.all });
      message.success('Tiện ích đã được xóa thành công!');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.detail || 'Có lỗi xảy ra khi xóa tiện ích');
    },
  });
};

// Legacy interface exports for compatibility
export interface CreateFacilityRequest extends FacilityCreateData {}
export interface FacilitiesQueryParams {
  skip?: number;
  limit?: number;
  search?: string;
  category?: string;
  is_available?: boolean;
}

// Legacy function exports for compatibility
export { useFacilities as useFacilitiesQuery };
export { useFacility as useFacilityQuery };
export { useCreateFacility as useCreateFacilityMutation };
export { useUpdateFacility as useUpdateFacilityMutation };
export { useDeleteFacility as useDeleteFacilityMutation };
