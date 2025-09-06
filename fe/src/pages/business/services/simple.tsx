import React, { useState } from 'react';
import { Table, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const ServicesPageSimple: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Service Name', dataIndex: 'service_name', key: 'service_name', width: 200 },
    { title: 'Type', dataIndex: 'type', key: 'type', width: 120 },
    { title: 'Price', dataIndex: 'price', key: 'price', width: 100 },
  ];

  const mockData = [
    {
      id: 1,
      service_name: 'Spa Service',
      type: 'spa',
      price: 100
    }
  ];

  return (
    <div>
      <h1>Services Management</h1>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        style={{ marginBottom: 16 }}
        onClick={() => message.info('Add service clicked')}
      >
        Add Service
      </Button>
      <Table
        columns={columns}
        dataSource={mockData}
        rowKey="id"
        loading={loading}
        bordered
      />
    </div>
  );
};

export default ServicesPageSimple;
