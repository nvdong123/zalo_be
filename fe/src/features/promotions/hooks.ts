import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { queryKeys } from '@/api/endpoints';
import { useTenantScope } from '@/hooks/useTenantScope';
import { promotionsApi, type PromotionFilters, type CreatePromotionRequest, type UpdatePromotionRequest } from './api';

export function usePromotions(params: PromotionFilters = {}) {
  const { tenantId } = useTenantScope();

  return useQuery({
    queryKey: queryKeys.promotions(tenantId!, params),
    queryFn: () => promotionsApi.list(params),
    enabled: !!tenantId,
  });
}

export function usePromotion(id: number) {
  const { tenantId } = useTenantScope();

  return useQuery({
    queryKey: queryKeys.promotion(tenantId!, id),
    queryFn: () => promotionsApi.get(id),
    enabled: !!tenantId && !!id,
  });
}

export function useCreatePromotion() {
  const { tenantId } = useTenantScope();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: promotionsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.promotions(tenantId!),
      });
      message.success('Tạo khuyến mãi thành công');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.detail || 'Tạo khuyến mãi thất bại');
    },
  });
}

export function useUpdatePromotion() {
  const { tenantId } = useTenantScope();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePromotionRequest }) =>
      promotionsApi.update(id, data),
    onSuccess: (_: any, variables: any) => {
      const { id } = variables;
      queryClient.invalidateQueries({
        queryKey: queryKeys.promotions(tenantId!),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.promotion(tenantId!, id),
      });
      message.success('Cập nhật khuyến mãi thành công');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.detail || 'Cập nhật khuyến mãi thất bại');
    },
  });
}

export function useDeletePromotion() {
  const { tenantId } = useTenantScope();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: promotionsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.promotions(tenantId!),
      });
      message.success('Xóa khuyến mãi thành công');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.detail || 'Xóa khuyến mãi thất bại');
    },
  });
}
