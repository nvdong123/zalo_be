import React from 'react';
import { Card, Empty } from 'antd';

const FacilitiesList: React.FC = () => {
  return (
    <Card title="Quản lý tiện ích">
      <Empty
        description="Module này sẽ được phát triển trong tương lai"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    </Card>
  );
};

export default FacilitiesList;
