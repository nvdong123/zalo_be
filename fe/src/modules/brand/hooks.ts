import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { hotelBrandAPI, type HotelBrandCreateData, type HotelBrandUpdateData } from '../../api';

// Query keys
export const brandKeys = {
  all: ['hotel-brand'] as const,
  lists: () => [...brandKeys.all, 'list'] as const,
  list: (params: any) => [...brandKeys.lists(), params] as const,
  details: () => [...brandKeys.all, 'detail'] as const,
  detail: (id: number) => [...brandKeys.details(), id] as const,
};

// Hook for fetching hotel brands
export function useBrandsQuery(params?: { 
  skip?: number; 
  limit?: number; 
  search?: string; 
}) {
  return useQuery({
    queryKey: brandKeys.list(params),
    queryFn: () => hotelBrandAPI.getAll(params),
    staleTime: 60000, // 1 minute
  });
}

// Hook for fetching a single hotel brand
export function useBrandQuery(id: number) {
  return useQuery({
    queryKey: brandKeys.detail(id),
    queryFn: () => hotelBrandAPI.getById(id),
    enabled: !!id,
  });
}

// Hook for creating hotel brand
export function useCreateBrandMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: HotelBrandCreateData) => hotelBrandAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
      message.success('Thương hiệu khách sạn đã được tạo thành công!');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.detail || 'Có lỗi xảy ra khi tạo thương hiệu');
    },
  });
}

// Hook for updating hotel brand
export function useUpdateBrandMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & HotelBrandUpdateData) => 
      hotelBrandAPI.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
      queryClient.invalidateQueries({ queryKey: brandKeys.detail(variables.id) });
      message.success('Thương hiệu khách sạn đã được cập nhật thành công!');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.detail || 'Có lỗi xảy ra khi cập nhật thương hiệu');
    },
  });
}

// Hook for deleting hotel brand
export function useDeleteBrandMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => hotelBrandAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
      message.success('Thương hiệu khách sạn đã được xóa thành công!');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.detail || 'Có lỗi xảy ra khi xóa thương hiệu');
    },
  });
}

// Legacy interfaces for compatibility
export interface UpdateBrandRequest extends HotelBrandUpdateData {}

// Legacy function exports for compatibility
export { useBrandsQuery as useHotelBrandsQuery };
export { useBrandQuery as useHotelBrandQuery };
