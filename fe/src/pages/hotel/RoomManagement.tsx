import React, { useState } from 'react';
import { 
  Card, Table, Button, Modal, Form, Input, Select, Upload, Row, Col, 
  message, Space, Typography, Tag, Image, Popconfirm, InputNumber,
  Slider, DatePicker
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, 
  PictureOutlined, PlayCircleOutlined, GlobalOutlined, UploadOutlined,
  SearchOutlined, FilterOutlined, ClearOutlined, DownloadOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { request } from '../../api/request';
import { authStore } from '../../stores/authStore';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface Room {
  id: number;
  tenant_id?: number;
  room_type: string;
  room_name: string;
  description: string;
  price: number;
  capacity_adults: number;
  capacity_children: number;
  size_m2: number;
  view_type: string;
  has_balcony: boolean;
  image_url: string;
  video_url: string;
  vr360_url: string;
  booking_url: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  deleted?: number;
  deleted_at?: string;
  deleted_by?: string;
}

const RoomManagement: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  
  // Search and Filter states
  const [searchText, setSearchText] = useState('');
  const [filterRoomType, setFilterRoomType] = useState<string>('');
  const [filterViewType, setFilterViewType] = useState<string>('');
  const [filterHasBalcony, setFilterHasBalcony] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000000]);

  // Fetch rooms data
  const { data: roomsData, isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => {
      const tenantId = authStore.getTenantId();
      return request('get', `/rooms?tenant_id=${tenantId}`);
    },
  });

  const rooms = Array.isArray(roomsData) ? roomsData : [];
  
  // Filter and search logic
  const filteredRooms = rooms.filter((room: Room) => {
    // Search in room name, description, room type
    const matchesSearch = !searchText || 
      room.room_name.toLowerCase().includes(searchText.toLowerCase()) ||
      room.description?.toLowerCase().includes(searchText.toLowerCase()) ||
      room.room_type.toLowerCase().includes(searchText.toLowerCase());
    
    // Filter by room type
    const matchesRoomType = !filterRoomType || room.room_type === filterRoomType;
    
    // Filter by view type
    const matchesViewType = !filterViewType || room.view_type === filterViewType;
    
    // Filter by balcony
    const matchesBalcony = !filterHasBalcony || 
      (filterHasBalcony === 'true' && room.has_balcony) ||
      (filterHasBalcony === 'false' && !room.has_balcony);
    
    // Filter by price range
    const price = parseFloat(room.price.toString());
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
    
    return matchesSearch && matchesRoomType && matchesViewType && matchesBalcony && matchesPrice;
  });
  
  // Clear all filters
  const clearFilters = () => {
    setSearchText('');
    setFilterRoomType('');
    setFilterViewType('');
    setFilterHasBalcony('');
    setPriceRange([0, 100000000]);
  };
  
  // Export filtered data to CSV
  const exportToCSV = () => {
    const headers = ['ID', 'Tên phòng', 'Loại phòng', 'Giá', 'Sức chứa người lớn', 'Sức chứa trẻ em', 'Diện tích (m²)', 'Loại view', 'Ban công'];
    const csvContent = [
      headers.join(','),
      ...filteredRooms.map(room => [
        room.id,
        `"${room.room_name}"`,
        `"${room.room_type}"`,
        room.price,
        room.capacity_adults,
        room.capacity_children,
        room.size_m2,
        `"${room.view_type}"`,
        room.has_balcony ? 'Có' : 'Không'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rooms_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Đã xuất dữ liệu thành công');
  };

  // Create/Update room mutation
  const roomMutation = useMutation({
    mutationFn: (data: Partial<Room>) => {
      const tenantId = authStore.getTenantId();
      return editingRoom?.id 
        ? request('put', `/rooms/${editingRoom.id}?tenant_id=${tenantId}`, data)
        : request('post', `/rooms?tenant_id=${tenantId}`, data);
    },
    onSuccess: () => {
      message.success(editingRoom ? 'Cập nhật phòng thành công' : 'Tạo phòng thành công');
      setIsModalVisible(false);
      setEditingRoom(null);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
    onError: (error: any) => {
      message.error(error.message || 'Có lỗi xảy ra');
    },
  });

  // Delete room mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      const tenantId = authStore.getTenantId();
      return request('delete', `/rooms/${id}?tenant_id=${tenantId}`);
    },
    onSuccess: () => {
      message.success('Xóa phòng thành công');
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
    onError: (error: any) => {
      message.error(error.message || 'Có lỗi xảy ra');
    },
  });

  const handleAdd = () => {
    setEditingRoom(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    form.setFieldsValue(room);
    setIsModalVisible(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleSubmit = async (values: any) => {
    await roomMutation.mutateAsync({
      ...values,
      has_balcony: values.has_balcony === 'true',
    });
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      render: (_: any, __: any, index: number) => index + 1,
      width: 60,
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'image_url',
      key: 'image_url',
      width: 100,
      render: (url: string) => (
        url ? (
          <Image
            width={60}
            height={40}
            src={url}
            style={{ borderRadius: 4, objectFit: 'cover' }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
          />
        ) : (
          <div style={{ width: 60, height: 40, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PictureOutlined style={{ color: '#ccc' }} />
          </div>
        )
      ),
    },
    {
      title: 'Tên phòng',
      dataIndex: 'room_name',
      key: 'room_name',
      width: 150,
    },
    {
      title: 'Loại phòng',
      dataIndex: 'room_type',
      key: 'room_type',
      width: 120,
      render: (type: string) => (
        <Tag color="blue">{type}</Tag>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price: number) => (
        <Text strong style={{ color: '#f50' }}>
          {price?.toLocaleString()}đ
        </Text>
      ),
    },
    {
      title: 'Sức chứa',
      key: 'capacity',
      width: 100,
      render: (record: Room) => (
        <span>
          {record.capacity_adults}👥 {record.capacity_children}👶
        </span>
      ),
    },
    {
      title: 'Diện tích',
      dataIndex: 'size_m2',
      key: 'size_m2',
      width: 80,
      render: (size: number) => `${size}m²`,
    },
    {
      title: 'View',
      dataIndex: 'view_type',
      key: 'view_type',
      width: 100,
    },
    {
      title: 'Ban công',
      dataIndex: 'has_balcony',
      key: 'has_balcony',
      width: 80,
      render: (hasBalcony: boolean) => (
        <Tag color={hasBalcony ? 'green' : 'default'}>
          {hasBalcony ? 'Có' : 'Không'}
        </Tag>
      ),
    },
    {
      title: 'Media',
      key: 'media',
      width: 120,
      render: (record: Room) => (
        <Space>
          {record.image_url && <Tag color="blue" icon={<PictureOutlined />}>Ảnh</Tag>}
          {record.video_url && <Tag color="purple" icon={<PlayCircleOutlined />}>Video</Tag>}
          {record.vr360_url && <Tag color="orange" icon={<GlobalOutlined />}>VR360</Tag>}
        </Space>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (record: Room) => (
        <Space>
          <Button 
            type="primary" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Xác nhận xóa phòng này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Button 
              danger 
              size="small" 
              icon={<DeleteOutlined />}
              loading={deleteMutation.isPending}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Quản lý Phòng</Title>
          <Text type="secondary">Quản lý thông tin phòng nghỉ, giá cả, hình ảnh và đa phương tiện</Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large"
          onClick={handleAdd}
        >
          Thêm phòng mới
        </Button>
      </div>

      {/* Search and Filter Section */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Tìm kiếm phòng..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Loại phòng"
              style={{ width: '100%' }}
              value={filterRoomType}
              onChange={setFilterRoomType}
              allowClear
            >
              <Option value="Standard">Standard</Option>
              <Option value="Deluxe">Deluxe</Option>
              <Option value="Suite">Suite</Option>
              <Option value="Presidential">Presidential</Option>
              <Option value="standard">standard</Option>
              <Option value="deluxe">deluxe</Option>
              <Option value="suite">suite</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Loại view"
              style={{ width: '100%' }}
              value={filterViewType}
              onChange={setFilterViewType}
              allowClear
            >
              <Option value="City View">City View</Option>
              <Option value="Sea View">Sea View</Option>
              <Option value="Garden View">Garden View</Option>
              <Option value="Mountain View">Mountain View</Option>
              <Option value="Ocean View">Ocean View</Option>
              <Option value="Panoramic View">Panoramic View</Option>
              <Option value="city_view">city_view</Option>
              <Option value="street_view">street_view</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Ban công"
              style={{ width: '100%' }}
              value={filterHasBalcony}
              onChange={setFilterHasBalcony}
              allowClear
            >
              <Option value="true">Có ban công</Option>
              <Option value="false">Không ban công</Option>
            </Select>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <div>
              <Text>Khoảng giá: {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} VNĐ</Text>
              <Slider
                range
                min={0}
                max={100000000}
                step={1000000}
                value={priceRange}
                onChange={setPriceRange}
                tooltip={{
                  formatter: (value) => `${value?.toLocaleString()} VNĐ`
                }}
              />
            </div>
          </Col>
          <Col xs={24} md={12} lg={4}>
            <Space>
              <Button
                icon={<DownloadOutlined />}
                onClick={exportToCSV}
                disabled={filteredRooms.length === 0}
              >
                Xuất Excel
              </Button>
              <Button
                icon={<ClearOutlined />}
                onClick={clearFilters}
              >
                Xóa bộ lọc
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card>
        {/* Statistics */}
        <div style={{ marginBottom: 16, padding: '12px 16px', backgroundColor: '#f5f5f5', borderRadius: 6 }}>
          <Row gutter={24}>
            <Col span={6}>
              <Text strong>Tổng phòng: </Text>
              <Text>{rooms.length}</Text>
            </Col>
            <Col span={6}>
              <Text strong>Hiển thị: </Text>
              <Text>{filteredRooms.length}</Text>
            </Col>
            <Col span={6}>
              <Text strong>Có ban công: </Text>
              <Text>{filteredRooms.filter(r => r.has_balcony).length}</Text>
            </Col>
            <Col span={6}>
              <Text strong>Giá trung bình: </Text>
              <Text>
                {filteredRooms.length > 0 
                  ? Math.round(filteredRooms.reduce((sum, r) => sum + parseFloat(r.price.toString()), 0) / filteredRooms.length).toLocaleString()
                  : 0
                } VNĐ
              </Text>
            </Col>
          </Row>
        </div>
        
        <Table
          columns={columns}
          dataSource={filteredRooms}
          loading={isLoading}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} trong ${total} phòng`,
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingRoom ? 'Chỉnh sửa phòng' : 'Thêm phòng mới'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingRoom(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={roomMutation.isPending}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tên phòng"
                name="room_name"
                rules={[{ required: true, message: 'Vui lòng nhập tên phòng' }]}
              >
                <Input placeholder="VD: Phòng Deluxe King" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Loại phòng"
                name="room_type"
                rules={[{ required: true, message: 'Vui lòng chọn loại phòng' }]}
              >
                <Select placeholder="Chọn loại phòng">
                  <Option value="Standard">Standard</Option>
                  <Option value="Deluxe">Deluxe</Option>
                  <Option value="Suite">Suite</Option>
                  <Option value="Presidential">Presidential</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Mô tả"
            name="description"
          >
            <TextArea rows={3} placeholder="Mô tả chi tiết về phòng" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Giá (VNĐ)"
                name="price"
                rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  placeholder="1,000,000"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Người lớn"
                name="capacity_adults"
                rules={[{ required: true, message: 'Vui lòng nhập số người lớn' }]}
              >
                <InputNumber min={1} max={10} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Trẻ em"
                name="capacity_children"
              >
                <InputNumber min={0} max={5} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Diện tích (m²)"
                name="size_m2"
              >
                <InputNumber min={10} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="View"
                name="view_type"
              >
                <Select placeholder="Chọn view">
                  <Option value="City">City View</Option>
                  <Option value="Ocean">Ocean View</Option>
                  <Option value="Garden">Garden View</Option>
                  <Option value="Mountain">Mountain View</Option>
                  <Option value="Pool">Pool View</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Ban công"
                name="has_balcony"
              >
                <Select placeholder="Có ban công?">
                  <Option value="true">Có</Option>
                  <Option value="false">Không</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Media Upload Section */}
          <Title level={5}>Đa phương tiện</Title>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Hình ảnh phòng"
                name="image_url"
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Upload
                    name="file"
                    action="https://zalominiapp.vtlink.vn/api/v1/upload/image"
                    data={{ folder: 'rooms' }}
                    headers={{
                      'Authorization': `Bearer ${authStore.getToken()}`
                    }}
                    showUploadList={false}
                    onChange={(info) => {
                      if (info.file.status === 'done' && info.file.response?.success) {
                        const imageUrl = `https://zalominiapp.vtlink.vn${info.file.response.data.url}`;
                        form.setFieldsValue({ image_url: imageUrl });
                      }
                    }}
                  >
                    <Button icon={<PictureOutlined />} style={{ width: '100%' }}>
                      Tải lên ảnh
                    </Button>
                  </Upload>
                  <Input placeholder="Hoặc nhập URL" />
                </Space>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Video giới thiệu"
                name="video_url"
              >
                <Input placeholder="Nhập URL video (YouTube, Vimeo, etc.)" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="VR 360° Link"
                name="vr360_url"
              >
                <Input placeholder="Nhập URL tour VR 360°" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Booking URL (Liên kết đặt phòng)"
            name="booking_url"
          >
            <Input placeholder="URL để đặt phòng (tùy chọn)" />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={roomMutation.isPending}
              >
                {editingRoom ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default RoomManagement;
