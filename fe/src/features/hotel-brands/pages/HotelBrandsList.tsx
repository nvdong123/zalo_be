import React from 'react';
import { Card, Empty } from 'antd';

const HotelBrandsList: React.FC = () => {
  return (
    <Card title="Quản lý thương hiệu khách sạn">
      <Empty
        description="Module này sẽ được phát triển trong tương lai"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    </Card>
  );
};

export default HotelBrandsList;
