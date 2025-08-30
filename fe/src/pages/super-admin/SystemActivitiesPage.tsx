import React, { useState } from 'react';
import { Card, Timeline, Tag, DatePicker, Select, Input, Space, Button } from 'antd';
import { UserOutlined, SettingOutlined, DatabaseOutlined, SecurityScanOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;

interface Activity {
  id: number;
  type: 'user' | 'system' | 'security' | 'data';
  action: string;
  user: string;
  target: string;
  timestamp: string;
  details: string;
  ip?: string;
}

const SystemActivitiesPage: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');

  // Mock data
  const activities: Activity[] = [
    {
      id: 1,
      type: 'user',
      action: 'Đăng nhập',
      user: 'superadmin',
      target: 'Hệ thống',
      timestamp: '2025-08-28 10:30:25',
      details: 'Đăng nhập thành công từ IP 192.168.1.100',
      ip: '192.168.1.100',
    },
    {
      id: 2,
      type: 'data',
      action: 'Tạo mới',
      user: 'admin_grand',
      target: 'Tenant: Grand Hotel Saigon',
      timestamp: '2025-08-28 09:15:42',
      details: 'Tạo tenant mới với ID: 3',
    },
    {
      id: 3,
      type: 'system',
      action: 'Cập nhật cấu hình',
      user: 'superadmin',
      target: 'Cài đặt thanh toán',
      timestamp: '2025-08-28 08:45:18',
      details: 'Cập nhật API key cho VNPay',
    },
    {
      id: 4,
      type: 'security',
      action: 'Thay đổi mật khẩu',
      user: 'admin_luxury',
      target: 'Tài khoản admin',
      timestamp: '2025-08-27 16:22:35',
      details: 'Đổi mật khẩu thành công',
      ip: '203.162.4.191',
    },
    {
      id: 5,
      type: 'data',
      action: 'Xóa',
      user: 'admin_grand',
      target: 'Booking ID: 1024',
      timestamp: '2025-08-27 14:18:09',
      details: 'Hủy booking do khách hàng yêu cầu',
    },
    {
      id: 6,
      type: 'user',
      action: 'Tạo tài khoản',
      user: 'superadmin',
      target: 'Admin user: admin_new',
      timestamp: '2025-08-27 11:30:55',
      details: 'Tạo tài khoản admin mới cho Boutique Hotel',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <UserOutlined style={{ color: '#1890ff' }} />;
      case 'system':
        return <SettingOutlined style={{ color: '#722ed1' }} />;
      case 'data':
        return <DatabaseOutlined style={{ color: '#52c41a' }} />;
      case 'security':
        return <SecurityScanOutlined style={{ color: '#f5222d' }} />;
      default:
        return <UserOutlined />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user':
        return 'blue';
      case 'system':
        return 'purple';
      case 'data':
        return 'green';
      case 'security':
        return 'red';
      default:
        return 'default';
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesType = filterType === 'all' || activity.type === filterType;
    const matchesSearch = searchText === '' || 
      activity.action.toLowerCase().includes(searchText.toLowerCase()) ||
      activity.user.toLowerCase().includes(searchText.toLowerCase()) ||
      activity.target.toLowerCase().includes(searchText.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Lịch sử hoạt động hệ thống">
        <Space style={{ marginBottom: '16px', width: '100%' }} direction="vertical">
          <Space wrap>
            <Select
              value={filterType}
              onChange={setFilterType}
              style={{ width: 150 }}
              placeholder="Loại hoạt động"
            >
              <Option value="all">Tất cả</Option>
              <Option value="user">Người dùng</Option>
              <Option value="system">Hệ thống</Option>
              <Option value="data">Dữ liệu</Option>
              <Option value="security">Bảo mật</Option>
            </Select>
            
            <RangePicker 
              placeholder={['Từ ngày', 'Đến ngày']}
              style={{ width: 300 }}
            />
            
            <Search
              placeholder="Tìm kiếm hoạt động..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
            />
            
            <Button>Xuất báo cáo</Button>
          </Space>
        </Space>

        <Timeline mode="left">
          {filteredActivities.map((activity) => (
            <Timeline.Item
              key={activity.id}
              dot={getActivityIcon(activity.type)}
            >
              <Card size="small" style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '8px' }}>
                      <Tag color={getActivityColor(activity.type)}>
                        {activity.type.toUpperCase()}
                      </Tag>
                      <strong>{activity.action}</strong>
                    </div>
                    
                    <div style={{ marginBottom: '4px' }}>
                      <span style={{ color: '#666' }}>Người thực hiện:</span> {activity.user}
                    </div>
                    
                    <div style={{ marginBottom: '4px' }}>
                      <span style={{ color: '#666' }}>Đối tượng:</span> {activity.target}
                    </div>
                    
                    <div style={{ marginBottom: '8px', color: '#888' }}>
                      {activity.details}
                    </div>
                    
                    {activity.ip && (
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        IP: {activity.ip}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ textAlign: 'right', color: '#999', fontSize: '12px' }}>
                    {activity.timestamp}
                  </div>
                </div>
              </Card>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>
    </div>
  );
};

export default SystemActivitiesPage;
