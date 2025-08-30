import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Form, Input, Switch, Space, Modal, message, Tag, Spin, Row, Col, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { tenantsAPI, TenantWithStats } from '@/api/tenants.api';

const TenantsManagementPage: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTenant, setEditingTenant] = useState<TenantWithStats | null>(null);
  const [form] = Form.useForm();
  const [tenants, setTenants] = useState<TenantWithStats[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<TenantWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // Load real tenants data from API
  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const data = await tenantsAPI.getAllWithStats();
      setTenants(data);
      setFilteredTenants(data);
    } catch (error) {
      console.error('Error loading tenants:', error);
      message.error('Không thể tải danh sách tenants');
    } finally {
      setLoading(false);
    }
  };

  // Filter tenants based on search text and status
  useEffect(() => {
    let filtered = tenants;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tenant => tenant.status === statusFilter);
    }

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(tenant => 
        tenant.name.toLowerCase().includes(searchText.toLowerCase()) ||
        tenant.domain.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredTenants(filtered);
  }, [tenants, searchText, statusFilter]);

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
  };

  const handleCreate = () => {
    setEditingTenant(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (tenant: TenantWithStats) => {
    setEditingTenant(tenant);
    // Transform status string to boolean for Switch component
    const formValues = {
      ...tenant,
      status: tenant.status === 'active'
    };
    form.setFieldsValue(formValues);
    setIsModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      // Transform form values to match backend schema
      const transformedValues = {
        ...values,
        status: values.status ? 'active' : 'inactive'
      };

      if (editingTenant) {
        // Update existing tenant via API
        await tenantsAPI.update(editingTenant.id, transformedValues);
        message.success('Cập nhật tenant thành công!');
      } else {
        // Create new tenant via API
        await tenantsAPI.create(transformedValues);
        message.success('Tạo tenant mới thành công!');
      }
      
      // Reload data
      await loadTenants();
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error saving tenant:', error);
      message.error('Có lỗi xảy ra khi lưu tenant');
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const tenant = tenants.find(t => t.id === id);
      if (tenant) {
        const newStatus = tenant.status === 'active' ? 'inactive' : 'active';
        await tenantsAPI.update(id, { status: newStatus });
        message.success('Cập nhật trạng thái thành công!');
        await loadTenants();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa tenant này không?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await tenantsAPI.delete(id);
          message.success('Xóa tenant thành công!');
          await loadTenants();
        } catch (error) {
          console.error('Error deleting tenant:', error);
          message.error('Có lỗi xảy ra khi xóa tenant');
        }
      },
    });
  };

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 80,
      render: (_: any, __: any, index: number) => {
        const { current = 1, pageSize = 10 } = pagination;
        return (current - 1) * pageSize + index + 1;
      },
    },
    {
      title: 'Tên khách sạn',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
        </Tag>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'domain',
      key: 'phone',
      render: (domain: string) => domain || '-',
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      render: (_: any, record: TenantWithStats) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button 
            danger
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button>
          <Switch
            checked={record.status === 'active'}
            onChange={() => handleToggleStatus(record.id)}
            size="small"
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="Quản lý khách sạn (Tenant)"
        extra={
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={loadTenants}
              loading={loading}
            >
              Làm mới
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              Tạo mới
            </Button>
          </Space>
        }
      >
        {/* Search and Filter Controls */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Input.Search
              placeholder="Tìm kiếm theo tên hoặc domain..."
              allowClear
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={handleStatusFilter}
              options={[
                { label: 'Tất cả', value: 'all' },
                { label: 'Hoạt động', value: 'active' },
                { label: 'Tạm dừng', value: 'inactive' },
              ]}
            />
          </Col>
          <Col xs={24} sm={24} md={10}>
            <Space>
              <span>Tổng cộng: <strong>{filteredTenants.length}</strong> khách sạn</span>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredTenants}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            total: filteredTenants.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} khách sạn`,
            onChange: (page, pageSize) => {
              setPagination({ current: page, pageSize: pageSize || 10 });
            },
          }}
        />
      </Card>

      <Modal
        title={editingTenant ? 'Chỉnh sửa khách sạn' : 'Tạo khách sạn mới'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="Tên khách sạn"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên khách sạn!' },
                  { min: 3, message: 'Tên khách sạn phải có ít nhất 3 ký tự!' }
                ]}
              >
                <Input placeholder="VD: Grand Hotel Saigon" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="domain"
                label="Domain/Website"
                rules={[
                  { required: true, message: 'Vui lòng nhập domain!' },
                ]}
              >
                <Input placeholder="VD: grandhotel.vn hoặc https://grandhotel.vn" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm dừng" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="subscription_plan_id"
                label="Gói dịch vụ"
              >
                <Select
                  placeholder="Chọn gói dịch vụ"
                  options={[
                    { label: 'Basic Plan', value: 1 },
                    { label: 'Pro Plan', value: 2 },
                    { label: 'Premium Plan', value: 3 },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingTenant ? 'Cập nhật' : 'Tạo mới'}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TenantsManagementPage;
