import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  message, 
  Select, 
  Tag,
  Row,
  Col
} from 'antd';
import { 
  PlusOutlined,
  ReloadOutlined 
} from '@ant-design/icons';
import { promotionApi, tenantApi } from '@/api/backend.api';
import type { Promotion, Tenant } from '@/types/api';
import dayjs from 'dayjs';

const { Option } = Select;

const PromotionManagement: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<number | null>(null);

  // Load promotions - only getAll is available
  const loadPromotions = async (tenantId?: number) => {
    if (!tenantId && !selectedTenant) return;
    
    setLoading(true);
    try {
      const response = await promotionApi.getAll(tenantId || selectedTenant!);
      // API response is direct array, no .success/.data wrapper
      setPromotions((response as unknown as Promotion[]) || []);
    } catch (error) {
      console.error('Load promotions error:', error);
      message.error('Failed to load promotions');
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '-',
    },
    {
      title: 'Period',
      key: 'period',
      render: (record: Promotion) => {
        const startDate = record.start_date ? new Date(record.start_date).toLocaleDateString() : '-';
        const endDate = record.end_date ? new Date(record.end_date).toLocaleDateString() : '-';
        return `${startDate} - ${endDate}`;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status ? status.toUpperCase() : 'INACTIVE'}
        </Tag>
      ),
    },
    {
      title: 'Valid Until',
      dataIndex: 'end_date',
      key: 'end_date',
      render: (date: string) => date ? dayjs(date).format('MMM DD, YYYY') : '-',
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <h2>Promotion Management</h2>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => loadPromotions()} 
              />
              <Button 
                type="primary"
                icon={<PlusOutlined />}
                disabled
              >
                Add Promotion
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={promotions}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
          }}
        />
      </Card>
    </div>
  );
};

export default PromotionManagement;
