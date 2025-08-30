import React, { useState } from 'react';
import { 
  Card, Table, Button, Modal, Form, Input, Select, Row, Col, 
  message, Space, Typography, Tag, Switch, Popconfirm, InputNumber
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  TrophyOutlined, GiftOutlined, PlayCircleOutlined,
  SearchOutlined, ClearOutlined, DownloadOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { request } from '../../api/request';
import { authStore } from '../../stores/authStore';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface Game {
  id: number;
  tenant_id?: number;
  game_name: string;
  description: string;
  game_type: string;
  reward_type: string;
  reward_value: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

const GameManagement: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  
  // Search and filter states
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterRewardType, setFilterRewardType] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);

  // Fetch games data
  const { data: gamesData, isLoading } = useQuery({
    queryKey: ['games'],
    queryFn: () => {
      const tenantId = authStore.getTenantId();
      return request('get', `/games?tenant_id=${tenantId}`);
    },
  });

  const games = Array.isArray(gamesData) ? gamesData : [];
  
  // Filter and search logic
  const filteredGames = games.filter((game: Game) => {
    // Search in game name and description
    const matchesSearch = !searchText || 
      game.game_name.toLowerCase().includes(searchText.toLowerCase()) ||
      game.description?.toLowerCase().includes(searchText.toLowerCase());
    
    // Filter by game type
    const matchesType = !filterType || game.game_type === filterType;
    
    // Filter by reward type
    const matchesRewardType = !filterRewardType || game.reward_type === filterRewardType;
    
    // Filter by active status
    const matchesActive = filterActive === undefined || game.is_active === filterActive;
    
    return matchesSearch && matchesType && matchesRewardType && matchesActive;
  });
  
  // Clear all filters
  const clearFilters = () => {
    setSearchText('');
    setFilterType('');
    setFilterRewardType('');
    setFilterActive(undefined);
  };
  
  // Export filtered data to CSV
  const exportToCSV = () => {
    const headers = ['ID', 'Tên game', 'Loại game', 'Mô tả', 'Loại phần thưởng', 'Giá trị phần thưởng', 'Trạng thái'];
    const csvContent = [
      headers.join(','),
      ...filteredGames.map(game => [
        game.id,
        `"${game.game_name}"`,
        `"${game.game_type}"`,
        `"${game.description || ''}"`,
        `"${game.reward_type}"`,
        game.reward_value,
        `"${game.is_active ? 'Hoạt động' : 'Tạm dừng'}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `games_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Đã xuất dữ liệu thành công');
  };

  // Create/Update game mutation
  const gameMutation = useMutation({
    mutationFn: (data: Partial<Game>) => {
      const tenantId = authStore.getTenantId();
      return editingGame?.id 
        ? request('put', `/games/${editingGame.id}?tenant_id=${tenantId}`, data)
        : request('post', `/games?tenant_id=${tenantId}`, data);
    },
    onSuccess: () => {
      message.success(editingGame ? 'Cập nhật game thành công' : 'Tạo game thành công');
      setIsModalVisible(false);
      setEditingGame(null);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
    onError: (error: any) => {
      message.error(error.message || 'Có lỗi xảy ra');
    },
  });

  // Delete game mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      const tenantId = authStore.getTenantId();
      return request('delete', `/games/${id}?tenant_id=${tenantId}`);
    },
    onSuccess: () => {
      message.success('Xóa game thành công');
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
    onError: (error: any) => {
      message.error(error.message || 'Có lỗi xảy ra');
    },
  });

  const handleAdd = () => {
    setEditingGame(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (game: Game) => {
    setEditingGame(game);
    form.setFieldsValue(game);
    setIsModalVisible(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleSubmit = async (values: any) => {
    await gameMutation.mutateAsync(values);
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      render: (_: any, __: any, index: number) => index + 1,
      width: 60,
    },
    {
      title: 'Tên game',
      dataIndex: 'game_name',
      key: 'game_name',
      width: 200,
      render: (game_name: string, record: Game) => (
        <div>
          <Text strong>{game_name}</Text>
          {record.description && (
            <>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.description.length > 50 
                  ? `${record.description.substring(0, 50)}...` 
                  : record.description}
              </Text>
            </>
          )}
        </div>
      ),
    },
    {
      title: 'Loại game',
      dataIndex: 'game_type',
      key: 'game_type',
      width: 120,
      render: (type: string) => {
        const typeMap: { [key: string]: { label: string; color: string } } = {
          'spin_wheel': { label: 'Vòng quay', color: 'blue' },
          'lucky_draw': { label: 'Rút thăm', color: 'green' },
          'quiz': { label: 'Đố vui', color: 'orange' },
          'scratch_card': { label: 'Cào thẻ', color: 'purple' },
          'memory_game': { label: 'Trí nhớ', color: 'cyan' },
          'puzzle': { label: 'Ghép hình', color: 'magenta' },
        };
        const typeInfo = typeMap[type] || { label: type, color: 'default' };
        return <Tag color={typeInfo.color}>{typeInfo.label}</Tag>;
      },
    },
    {
      title: 'Phần thưởng',
      key: 'reward',
      width: 150,
      render: (record: Game) => {
        const rewardTypeMap: { [key: string]: { label: string; icon: React.ReactNode } } = {
          'discount': { label: 'Giảm giá', icon: <GiftOutlined /> },
          'points': { label: 'Điểm thưởng', icon: <TrophyOutlined /> },
          'voucher': { label: 'Voucher', icon: <GiftOutlined /> },
          'free_service': { label: 'Dịch vụ miễn phí', icon: <PlayCircleOutlined /> },
        };
        const rewardInfo = rewardTypeMap[record.reward_type] || { label: record.reward_type, icon: <GiftOutlined /> };
        
        return (
          <div>
            <Tag color="gold" icon={rewardInfo.icon}>
              {rewardInfo.label}
            </Tag>
            <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
              {record.reward_type === 'points' 
                ? `${record.reward_value} điểm`
                : record.reward_type === 'discount'
                ? `${record.reward_value}%`
                : `${record.reward_value.toLocaleString()}đ`
              }
            </div>
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (is_active: boolean) => (
        <Tag color={is_active ? 'green' : 'red'}>
          {is_active ? 'Hoạt động' : 'Tạm dừng'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (record: Game) => (
        <Space>
          <Button 
            type="primary" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Xác nhận xóa game này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Button 
              danger 
              size="small" 
              icon={<DeleteOutlined />}
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
          <Title level={2} style={{ margin: 0 }}>Quản lý Game</Title>
          <Text type="secondary">Quản lý các trò chơi tương tác và phần thưởng</Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large"
          onClick={handleAdd}
        >
          Tạo game mới
        </Button>
      </div>

      {/* Search and Filter */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={6} lg={6}>
            <Input
              placeholder="Tìm kiếm game..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={6}>
            <Select
              placeholder="Loại game"
              style={{ width: '100%' }}
              value={filterType}
              onChange={setFilterType}
              allowClear
            >
              <Option value="spin_wheel">Vòng quay</Option>
              <Option value="lucky_draw">Rút thăm</Option>
              <Option value="quiz">Đố vui</Option>
              <Option value="scratch_card">Cào thẻ</Option>
              <Option value="memory_game">Trí nhớ</Option>
              <Option value="puzzle">Ghép hình</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6} lg={6}>
            <Select
              placeholder="Loại phần thưởng"
              style={{ width: '100%' }}
              value={filterRewardType}
              onChange={setFilterRewardType}
              allowClear
            >
              <Option value="discount">Giảm giá</Option>
              <Option value="points">Điểm thưởng</Option>
              <Option value="voucher">Voucher</Option>
              <Option value="free_service">Dịch vụ miễn phí</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6} lg={6}>
            <Space>
              <Select
                placeholder="Trạng thái"
                style={{ width: 120 }}
                value={filterActive}
                onChange={setFilterActive}
                allowClear
              >
                <Option value={true}>Hoạt động</Option>
                <Option value={false}>Tạm dừng</Option>
              </Select>
              <Button
                icon={<DownloadOutlined />}
                onClick={exportToCSV}
                disabled={filteredGames.length === 0}
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
              <Text strong>Tổng games: </Text>
              <Text>{games.length}</Text>
            </Col>
            <Col span={6}>
              <Text strong>Hiển thị: </Text>
              <Text>{filteredGames.length}</Text>
            </Col>
            <Col span={6}>
              <Text strong>Đang hoạt động: </Text>
              <Text>{filteredGames.filter(g => g.is_active).length}</Text>
            </Col>
            <Col span={6}>
              <Text strong>Tạm dừng: </Text>
              <Text>{filteredGames.filter(g => !g.is_active).length}</Text>
            </Col>
          </Row>
        </div>
        
        <Table
          columns={columns}
          dataSource={filteredGames}
          loading={isLoading}
          rowKey="id"
          scroll={{ x: 1100 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} trong ${total} games`,
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingGame ? 'Chỉnh sửa game' : 'Tạo game mới'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingGame(null);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={gameMutation.isPending}
          initialValues={{
            is_active: true,
            game_type: 'spin_wheel',
            reward_type: 'points',
            reward_value: 100,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tên game"
                name="game_name"
                rules={[{ required: true, message: 'Vui lòng nhập tên game' }]}
              >
                <Input placeholder="VD: Vòng quay may mắn" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Loại game"
                name="game_type"
                rules={[{ required: true, message: 'Vui lòng chọn loại game' }]}
              >
                <Select placeholder="Chọn loại game">
                  <Option value="spin_wheel">Vòng quay</Option>
                  <Option value="lucky_draw">Rút thăm</Option>
                  <Option value="quiz">Đố vui</Option>
                  <Option value="scratch_card">Cào thẻ</Option>
                  <Option value="memory_game">Trí nhớ</Option>
                  <Option value="puzzle">Ghép hình</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Mô tả"
            name="description"
          >
            <TextArea rows={3} placeholder="Mô tả chi tiết về game" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Loại phần thưởng"
                name="reward_type"
                rules={[{ required: true, message: 'Vui lòng chọn loại phần thưởng' }]}
              >
                <Select placeholder="Chọn loại phần thưởng">
                  <Option value="discount">Giảm giá (%)</Option>
                  <Option value="points">Điểm thưởng</Option>
                  <Option value="voucher">Voucher (VNĐ)</Option>
                  <Option value="free_service">Dịch vụ miễn phí (VNĐ)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Giá trị phần thưởng"
                name="reward_value"
                rules={[{ required: true, message: 'Vui lòng nhập giá trị phần thưởng' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="VD: 100"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Trạng thái"
            name="is_active"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Hoạt động" 
              unCheckedChildren="Tạm dừng"
            />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={gameMutation.isPending}
              >
                {editingGame ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default GameManagement;
