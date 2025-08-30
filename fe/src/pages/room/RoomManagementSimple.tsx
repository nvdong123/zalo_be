import React from 'react';
import { Card, Row, Col, Button, Space } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';

const RoomManagement: React.FC = () => {
  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <h2>Room Management</h2>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} />
              <Button type="primary" icon={<PlusOutlined />}>
                Add Room
              </Button>
            </Space>
          </Col>
        </Row>
        <p>Room management component - legacy version</p>
      </Card>
    </div>
  );
};

export default RoomManagement;
