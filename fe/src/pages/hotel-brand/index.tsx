import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Popconfirm,
  message,
  Modal,
  Form,
  Input,
  Row,
  Col,
  Tag,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useHotelBrands } from '@/hooks/useAPI';
import { hotelBrandAPI, HotelBrandCreateData, HotelBrandUpdateData } from '@/api/hotelBrand.api';
import { HotelBrand } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const { TextArea } = Input;

const HotelBrandPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBrand, setEditingBrand] = useState<HotelBrand | null>(null);
  const [form] = Form.useForm();

  const queryClient = useQueryClient();
  
  // Fetch hotel brands
  const { data: hotelBrands, isLoading } = useHotelBrands({
    page: currentPage,
    page_size: pageSize,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: HotelBrandCreateData) => hotelBrandAPI.create(data),
    onSuccess: () => {
      message.success('Tạo thương hiệu khách sạn thành công!');
      setIsModalVisible(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['hotel-brands'] });
    },
    onError: (error: any) => {
      message.error(error.message || 'Có lỗi xảy ra khi tạo thương hiệu khách sạn');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: HotelBrandUpdateData }) =>
      hotelBrandAPI.update(id, data),
    onSuccess: () => {
      message.success('Cập nhật thương hiệu khách sạn thành công!');
      setIsModalVisible(false);
      setEditingBrand(null);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['hotel-brands'] });
    },
    onError: (error: any) => {
      message.error(error.message || 'Có lỗi xảy ra khi cập nhật thương hiệu khách sạn');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => hotelBrandAPI.delete(id),
    onSuccess: () => {
      message.success('Xóa thương hiệu khách sạn thành công!');
      queryClient.invalidateQueries({ queryKey: ['hotel-brands'] });
    },
    onError: (error: any) => {
      message.error(error.message || 'Có lỗi xảy ra khi xóa thương hiệu khách sạn');
    },
  });

  const handleCreate = () => {
    setEditingBrand(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (record: HotelBrand) => {
    setEditingBrand(record);
    setIsModalVisible(true);
    form.setFieldsValue(record);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingBrand) {
        // Update
        updateMutation.mutate({
          id: editingBrand.id,
          data: values,
        });
      } else {
        // Create
        createMutation.mutate({
          ...values,
          tenant_id: 1, // TODO: Get from tenant context
        });
      }
    } catch (error) {
      console.error('Form validation error:', error);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Tên khách sạn',
      dataIndex: 'hotel_name',
      key: 'hotel_name',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Slogan',
      dataIndex: 'slogan',
      key: 'slogan',
      render: (text: string) => text || '-',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      render: (text: string) => text || '-',
    },
    {
      title: 'Điện thoại',
      dataIndex: 'phone_number',
      key: 'phone_number',
      render: (text: string) => text || '-',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text: string) => text || '-',
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 150,
      render: (_: any, record: HotelBrand) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa thương hiệu này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="Quản lý thương hiệu khách sạn"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Thêm mới
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={hotelBrands?.items || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: hotelBrands?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} mục`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size || 10);
            },
          }}
        />
      </Card>

      <Modal
        title={editingBrand ? 'Cập nhật thương hiệu khách sạn' : 'Thêm thương hiệu khách sạn'}
        open={isModalVisible}
        onOk={handleModalSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingBrand(null);
          form.resetFields();
        }}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          name="hotelBrandForm"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="hotel_name"
                label="Tên khách sạn"
                rules={[{ required: true, message: 'Vui lòng nhập tên khách sạn' }]}
              >
                <Input placeholder="Nhập tên khách sạn" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="slogan"
                label="Slogan"
              >
                <Input placeholder="Nhập slogan" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea rows={3} placeholder="Nhập mô tả về khách sạn" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="address"
                label="Địa chỉ"
              >
                <Input placeholder="Nhập địa chỉ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone_number"
                label="Số điện thoại"
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
              >
                <Input placeholder="Nhập email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="website_url"
                label="Website"
              >
                <Input placeholder="Nhập website" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default HotelBrandPage;
