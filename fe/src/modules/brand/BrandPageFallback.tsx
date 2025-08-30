import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const BrandPageFallback: React.FC = () => {
  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Title level={2}>Hotel Brand Management</Title>
        <p>This page is under development. Please check back later.</p>
      </Card>
    </div>
  );
};

export default BrandPageFallback;
