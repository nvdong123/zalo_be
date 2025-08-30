import React, { useState } from 'react';
import {
  Card,
  Button,
  Space,
  Input,
  Select,
  Row,
  Col,
  Drawer,
  Empty,
  Typography,
} from 'antd';
import { PlusOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { useTenantScope } from '@/hooks/useTenantScope';
import { useRooms } from '../hooks';
import RoomsTable from '../components/RoomsTable';
import RoomForm from './RoomForm';
import type { Room } from '@/types';
import type { RoomFilters } from '../api';
import { auth } from '@/store/auth';

const { Search } = Input;
const { Title } = Typography;

const RoomsList: React.FC = () => {
  const { tenantId, hasSelectedTenant } = useTenantScope();
  const [filters, setFilters] = useState<RoomFilters>({
    page: 1,
    page_size: 10,
  });
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null);

  const { data: roomsData, isLoading } = useRooms(filters);
  const canManage = auth.isLoggedIn();

  // Show empty state if super admin hasn't selected tenant
  if (!hasSelectedTenant) {
    return (
      <Card>
        <Empty
          description="Vui lòng chọn khách sạn từ dropdown ở header để xem danh sách phòng"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, q: value, page: 1 }));
  };

  const handleFilterChange = (key: keyof RoomFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleCreate = () => {
    setEditingRoom(null);
    setShowForm(true);
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setShowForm(true);
  };

  const handleView = (room: Room) => {
    setViewingRoom(room);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingRoom(null);
  };

  const handleViewClose = () => {
    setViewingRoom(null);
  };

  return (
    <div>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              Quản lý phòng
            </Title>
          </Col>
          <Col>
            {canManage && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                Thêm phòng
              </Button>
            )}
          </Col>
        </Row>

        {/* Filters */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Search
              placeholder="Tìm theo tên phòng..."
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Loại phòng"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('room_type', value)}
              options={[
                { label: 'Tiêu chuẩn', value: 'standard' },
                { label: 'Cao cấp', value: 'deluxe' },
                { label: 'Suite', value: 'suite' },
                { label: 'Gia đình', value: 'family' },
                { label: 'Tổng thống', value: 'presidential' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Trạng thái"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('status', value)}
              options={[
                { label: 'Có sẵn', value: 'available' },
                { label: 'Đã thuê', value: 'occupied' },
                { label: 'Bảo trì', value: 'maintenance' },
                { label: 'Hỏng hóc', value: 'out_of_order' },
              ]}
            />
          </Col>
        </Row>

        <RoomsTable
          data={roomsData?.items || []}
          loading={isLoading}
          onEdit={handleEdit}
          onDelete={() => {}} // Will implement with delete hook
          onView={handleView}
          canEdit={canManage}
          canDelete={canManage}
        />
      </Card>

      {/* Create/Edit Form */}
      <RoomForm
        open={showForm}
        room={editingRoom}
        onClose={handleFormClose}
      />

      {/* View Details */}
      <Drawer
        title="Chi tiết phòng"
        placement="right"
        onClose={handleViewClose}
        open={!!viewingRoom}
        width={600}
      >
        {viewingRoom && (
          <div>
            {/* Room details content */}
            <p><strong>Tên phòng:</strong> {viewingRoom.room_name}</p>
            <p><strong>Loại phòng:</strong> {viewingRoom.room_type}</p>
            <p><strong>Giá:</strong> {viewingRoom.price.toLocaleString()} VND</p>
            <p><strong>Sức chứa:</strong> {viewingRoom.capacity_adults} người lớn, {viewingRoom.capacity_children} trẻ em</p>
            {viewingRoom.description && (
              <p><strong>Mô tả:</strong> {viewingRoom.description}</p>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default RoomsList;
