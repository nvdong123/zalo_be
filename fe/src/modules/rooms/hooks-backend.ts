import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { roomsAPI, type Room, type RoomCreateData, type RoomUpdateData } from '../../api/rooms-backend.api';

// Query keys
export const roomsKeys = {
  all: ['rooms'] as const,
  lists: () => [...roomsKeys.all, 'list'] as const,
  list: (params: any) => [...roomsKeys.lists(), params] as const,
  details: () => [...roomsKeys.all, 'detail'] as const,
  detail: (id: number) => [...roomsKeys.details(), id] as const,
};

// Hooks for rooms based on actual backend API
export const useRooms = (params?: { 
  skip?: number; 
  limit?: number; 
}) => {
  return useQuery({
    queryKey: roomsKeys.list(params),
    queryFn: () => roomsAPI.getAll(params),
    staleTime: 30000, // 30 seconds
  });
};

export const useRoom = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: roomsKeys.detail(id),
    queryFn: () => roomsAPI.getById(id),
    enabled: enabled && !!id,
  });
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: RoomCreateData) => roomsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomsKeys.all });
      message.success('Phòng đã được tạo thành công!');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.detail || 'Có lỗi xảy ra khi tạo phòng');
    },
  });
};

export const useUpdateRoom = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & RoomUpdateData) => 
      roomsAPI.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: roomsKeys.all });
      queryClient.invalidateQueries({ queryKey: roomsKeys.detail(variables.id) });
      message.success('Phòng đã được cập nhật thành công!');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.detail || 'Có lỗi xảy ra khi cập nhật phòng');
    },
  });
};

export const useDeleteRoom = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => roomsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomsKeys.all });
      message.success('Phòng đã được xóa thành công!');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.detail || 'Có lỗi xảy ra khi xóa phòng');
    },
  });
};

// Legacy interface exports for compatibility
export interface CreateRoomRequest extends RoomCreateData {}
export interface RoomsQueryParams {
  skip?: number;
  limit?: number;
}

// Legacy hook for compatibility
export function useRoomsQuery(params: RoomsQueryParams = {}) {
  return useRooms(params);
}

// Export types for convenience
export type { Room, RoomCreateData, RoomUpdateData };
