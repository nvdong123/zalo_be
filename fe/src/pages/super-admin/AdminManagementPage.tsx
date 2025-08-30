import React, { useState } from 'react';
import { Card, Button, Table, Form, Input, Select, Space, Modal, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, UserOutlined } from '@ant-design/icons';

const { Option } = Select;

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: 'super_admin' | 'hotel_admin';
  tenant_name?: string;
  status: 'active' | 'inactive';
  created_at: string;
}

const AdminManagementPage: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [form] = Form.useForm();

  // Mock data
  const [admins, setAdmins] = useState<AdminUser[]>([
    {
      id: 1,
      username: 'superadmin',
      email: 'superadmin@hotelsaas.com',
      role: 'super_admin',
      status: 'active',
      created_at: '2025-01-01',
    },
    {
      id: 2,
      username: 'admin_grand',
      email: 'admin@grandhotel.vn',
      role: 'hotel_admin',
      tenant_name: 'Grand Hotel Saigon',
      status: 'active',
      created_at: '2025-01-15',
    },
    {
      id: 3,
      username: 'admin_luxury',
      email: 'admin@luxury-resort.com',
      role: 'hotel_admin',
      tenant_name: 'Luxury Resort Chain',
      status: 'active',
      created_at: '2025-01-10',
    },
  ]);

  const handleCreate = () => {
    setEditingAdmin(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (admin: AdminUser) => {
    setEditingAdmin(admin);
    form.setFieldsValue(admin);
    setIsModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    if (editingAdmin) {
      // Update
      setAdmins(prev => prev.map(a => 
        a.id === editingAdmin.id ? { ...a, ...values } : a
      ));
      message.success('Cập nhật admin thành công!');
    } else {
      // Create
      const newAdmin: AdminUser = {
        id: Date.now(),
        ...values,
        created_at: new Date().toISOString().split('T')[0],
        status: 'active',
      };
      setAdmins(prev => [...prev, newAdmin]);
      message.success('Tạo admin mới thành công!');
    }
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'super_admin' ? 'purple' : 'blue'}>
          {role === 'super_admin' ? 'Super Admin' : 'Hotel Admin'}
        </Tag>
      ),
    },
    {
      title: 'Khách sạn',
      dataIndex: 'tenant_name',
      key: 'tenant_name',
      render: (name: string) => name || '-',
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
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: AdminUser) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="Quản lý Admin Users"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Tạo admin mới
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={admins}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>

      <Modal
        title={editingAdmin ? 'Chỉnh sửa admin' : 'Tạo admin mới'}
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
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Vui lòng nhập username!' }]}
          >
            <Input placeholder="VD: admin_hotel1" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input placeholder="VD: admin@hotel.com" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <Select placeholder="Chọn vai trò">
              <Option value="super_admin">Super Admin</Option>
              <Option value="hotel_admin">Hotel Admin</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="tenant_name"
            label="Khách sạn (chỉ cho Hotel Admin)"
          >
            <Select placeholder="Chọn khách sạn" allowClear>
              <Option value="Grand Hotel Saigon">Grand Hotel Saigon</Option>
              <Option value="Luxury Resort Chain">Luxury Resort Chain</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            initialValue="active"
          >
            <Select>
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Tạm dừng</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingAdmin ? 'Cập nhật' : 'Tạo mới'}
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

export default AdminManagementPage;
