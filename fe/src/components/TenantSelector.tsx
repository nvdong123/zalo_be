import React, { useEffect, useState } from 'react';
import { Select, Space, Typography, Card, Row, Col, Tag, Divider } from 'antd';
import { GlobalOutlined, ShopOutlined, UserOutlined } from '@ant-design/icons';
import { authStore } from '../stores/authStore';
import { tenantStore } from '../stores/tenantStore';
import { get } from '../utils/request';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const { Text } = Typography;

interface Tenant {
  id: number;
  name: string;
  domain?: string;
  status?: string;
}

const TenantSelector: React.FC = () => {
  const [selectedTenantId, setSelectedTenantId] = useState<number | undefined>();
  const queryClient = useQueryClient();

  // Only render for SUPER_ADMIN
  if (!authStore.isSuperAdmin()) {
    return null;
  }

  // Fetch tenants list
  const { data: tenants, isLoading } = useQuery({
    queryKey: ['tenants-list'],
    queryFn: async (): Promise<Tenant[]> => {
      return get<Tenant[]>('/api/v1/tenants?limit=100&offset=0');
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Update tenant store when tenants are loaded
  useEffect(() => {
    if (tenants && tenants.length > 0) {
      const tenantOptions = tenants.map(tenant => ({
        id: tenant.id,
        name: tenant.name,
        domain: tenant.domain,
      }));
      tenantStore.setAvailableTenants(tenantOptions);
    }
  }, [tenants]);

  // Initialize selected tenant from store
  useEffect(() => {
    const storedTenantId = tenantStore.getSelectedTenantId();
    setSelectedTenantId(storedTenantId || undefined);
  }, []);

  // Subscribe to tenant store changes
  useEffect(() => {
    const unsubscribe = tenantStore.subscribe(() => {
      const currentTenantId = tenantStore.getSelectedTenantId();
      setSelectedTenantId(currentTenantId || undefined);
    });
    return unsubscribe;
  }, []);

  const handleTenantChange = (tenantId: number) => {
    setSelectedTenantId(tenantId);
    tenantStore.setSelectedTenantId(tenantId);
    
    // Invalidate all queries to refetch data for new tenant
    queryClient.invalidateQueries();
  };

  const tenantOptions = (tenants || []).map(tenant => ({
    label: (
      <Space>
        <ShopOutlined />
        <Text strong>{tenant.name}</Text>
        {tenant.domain && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            @{tenant.domain}
          </Text>
        )}
        <Tag color={tenant.status === 'active' ? 'green' : 'orange'}>
          {tenant.status || 'active'}
        </Tag>
      </Space>
    ),
    value: tenant.id,
  }));

  const currentTenant = tenants?.find(t => t.id === selectedTenantId);

  return (
    <Card size="small" style={{ marginBottom: 16, background: '#f8f9fa' }}>
      <Row align="middle" justify="space-between">
        <Col>
          <Space>
            <GlobalOutlined style={{ color: '#1890ff', fontSize: 16 }} />
            <Text strong>Multi-Tenant SaaS Mode</Text>
          </Space>
        </Col>
        <Col>
          <Space>
            <Text type="secondary">Current Tenant:</Text>
            <Select
              placeholder="Select Hotel/Tenant"
              value={selectedTenantId}
              onChange={handleTenantChange}
              options={tenantOptions}
              loading={isLoading}
              style={{ minWidth: 250 }}
              showSearch
              filterOption={(input, option) => {
                if (!tenants) return false;
                const tenant = tenants.find(t => t.id === option?.value);
                return (
                  tenant?.name?.toLowerCase().includes(input.toLowerCase()) ||
                  tenant?.domain?.toLowerCase().includes(input.toLowerCase())
                ) || false;
              }}
            />
            {currentTenant && (
              <Space>
                <Divider type="vertical" />
                <Tag color="blue" icon={<UserOutlined />}>
                  ID: {currentTenant.id}
                </Tag>
              </Space>
            )}
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

export default TenantSelector;
