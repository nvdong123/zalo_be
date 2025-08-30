import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { queryKeys } from '@/api/endpoints';
import { useTenantScope } from '@/hooks/useTenantScope';
import { roomsApi, type RoomFilters, type CreateRoomRequest, type UpdateRoomRequest } from './api';

export function useRooms(params: RoomFilters = {}) {
  const { tenantId } = useTenantScope();

  return useQuery({
    queryKey: queryKeys.rooms(tenantId!, params),
    queryFn: () => roomsApi.list(params),
    enabled: !!tenantId,
  });
}

export function useRoom(id: number) {
  const { tenantId } = useTenantScope();

  return useQuery({
    queryKey: queryKeys.room(tenantId!, id),
    queryFn: () => roomsApi.get(id),
    enabled: !!tenantId && !!id,
  });
}

export function useCreateRoom() {
  const { tenantId } = useTenantScope();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: roomsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.rooms(tenantId!),
      });
      message.success('Tạo phòng thành công');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.detail || 'Tạo phòng thất bại');
    },
  });
}

export function useUpdateRoom() {
  const { tenantId } = useTenantScope();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRoomRequest }) =>
      roomsApi.update(id, data),
    onSuccess: (_: any, { id }: { id: number }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.rooms(tenantId!),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.room(tenantId!, id),
      });
      message.success('Cập nhật phòng thành công');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.detail || 'Cập nhật phòng thất bại');
    },
  });
}

export function useDeleteRoom() {
  const { tenantId } = useTenantScope();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: roomsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.rooms(tenantId!),
      });
      message.success('Xóa phòng thành công');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.detail || 'Xóa phòng thất bại');
    },
  });
}
