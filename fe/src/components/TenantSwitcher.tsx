import React from 'react';
import { Select, Space, Typography } from 'antd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { auth } from '@/store/auth';
import { useTenantScope } from '@/hooks/useTenantScope';
import http from '@/services/http';
import { API_ENDPOINTS, queryKeys } from '@/api/endpoints';
import type { Tenant, PaginatedResponse } from '@/types';

const { Text } = Typography;

interface TenantSwitcherProps {
  style?: React.CSSProperties;
  className?: string;
}

const TenantSwitcher: React.FC<TenantSwitcherProps> = ({ style, className }) => {
  const { isSuperAdmin, tenantId } = useTenantScope();
  const queryClient = useQueryClient();

  // Only show for super admin
  if (!isSuperAdmin) {
    return null;
  }

  // Fetch tenants list
  const { data: tenantsData, isLoading } = useQuery({
    queryKey: queryKeys.tenants,
    queryFn: async () => {
      const response = await http.get<PaginatedResponse<Tenant>>(
        `${API_ENDPOINTS.TENANTS}?page_size=100`
      );
      return response.data;
    },
  });

  const handleTenantChange = (newTenantId: number) => {
    // Update auth store with new tenant
    auth.set({ currentTenantId: newTenantId });
    
    // Invalidate all tenant-related queries to refetch data
    queryClient.invalidateQueries({
      predicate: (query: any) => {
        const key = query.queryKey;
        return Array.isArray(key) && key.length > 1 && typeof key[1] === 'number';
      },
    });
  };

  const tenantOptions = tenantsData?.items?.map((tenant: any) => ({
    value: tenant.id,
    label: tenant.name,
    disabled: tenant.status !== 'active',
  })) || [];

  return (
    <Space align="center" style={style} className={className}>
      <Text type="secondary">Khách sạn:</Text>
      <Select
        value={tenantId}
        placeholder="Chọn khách sạn"
        style={{ minWidth: 150 }}
        options={tenantOptions}
        onChange={handleTenantChange}
        loading={isLoading}
        showSearch
        optionFilterProp="label"
        notFoundContent={isLoading ? "Đang tải..." : "Không có dữ liệu"}
      />
    </Space>
  );
};

export default TenantSwitcher;
