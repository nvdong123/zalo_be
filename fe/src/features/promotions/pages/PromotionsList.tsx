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
  DatePicker,
} from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useTenantScope } from '@/hooks/useTenantScope';
import { usePromotions, useDeletePromotion } from '../hooks';
import PromotionsTable from '../components/PromotionsTable';
import PromotionForm from './PromotionForm';
import type { Promotion } from '@/types';
import type { PromotionFilters } from '../api';
import { auth } from '@/store/auth';

const { Search } = Input;
const { Title } = Typography;
const { RangePicker } = DatePicker;

const PromotionsList: React.FC = () => {
  const { tenantId, hasSelectedTenant } = useTenantScope();
  const [filters, setFilters] = useState<PromotionFilters>({
    page: 1,
    page_size: 10,
  });
  const [showForm, setShowForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [viewingPromotion, setViewingPromotion] = useState<Promotion | null>(null);

  const { data: promotionsData, isLoading } = usePromotions(filters);
  const deletePromotionMutation = useDeletePromotion();
  const canManage = auth.isLoggedIn();

  // Show empty state if super admin hasn't selected tenant
  if (!hasSelectedTenant) {
    return (
      <Card>
        <Empty
          description="Vui lòng chọn khách sạn từ dropdown ở header để xem danh sách khuyến mãi"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, q: value, page: 1 }));
  };

  const handleFilterChange = (key: keyof PromotionFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleCreate = () => {
    setEditingPromotion(null);
    setShowForm(true);
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setShowForm(true);
  };

  const handleView = (promotion: Promotion) => {
    setViewingPromotion(promotion);
  };

  const handleDelete = (id: number) => {
    deletePromotionMutation.mutate(id);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPromotion(null);
  };

  const handleViewClose = () => {
    setViewingPromotion(null);
  };

  return (
    <div>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              Quản lý khuyến mãi
            </Title>
          </Col>
          <Col>
            {canManage && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                Thêm khuyến mãi
              </Button>
            )}
          </Col>
        </Row>

        {/* Filters */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Search
              placeholder="Tìm theo tiêu đề..."
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Trạng thái"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('status', value)}
              options={[
                { label: 'Nháp', value: 'draft' },
                { label: 'Đang hoạt động', value: 'active' },
                { label: 'Đã hết hạn', value: 'expired' },
                { label: 'Đã tắt', value: 'disabled' },
              ]}
            />
          </Col>
        </Row>

        <PromotionsTable
          data={promotionsData?.items || []}
          loading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          canEdit={canManage}
          canDelete={canManage}
        />
      </Card>

      {/* Create/Edit Form */}
      <PromotionForm
        open={showForm}
        promotion={editingPromotion}
        onClose={handleFormClose}
      />

      {/* View Details */}
      <Drawer
        title="Chi tiết khuyến mãi"
        placement="right"
        onClose={handleViewClose}
        open={!!viewingPromotion}
        width={600}
      >
        {viewingPromotion && (
          <div>
            <p><strong>Tiêu đề:</strong> {viewingPromotion.title}</p>
            <p><strong>Mã khuyến mãi:</strong> {viewingPromotion.promo_code || 'Không có'}</p>
            <p><strong>Loại giảm giá:</strong> {viewingPromotion.discount_type === 'percentage' ? 'Phần trăm' : 'Số tiền cố định'}</p>
            <p><strong>Giá trị giảm:</strong> {viewingPromotion.discount_type === 'percentage' ? `${viewingPromotion.discount_value}%` : `${viewingPromotion.discount_value.toLocaleString()} VND`}</p>
            <p><strong>Thời gian:</strong> {new Date(viewingPromotion.start_date).toLocaleDateString()} - {new Date(viewingPromotion.end_date).toLocaleDateString()}</p>
            <p><strong>Trạng thái:</strong> {viewingPromotion.status}</p>
            {viewingPromotion.description && (
              <p><strong>Mô tả:</strong> {viewingPromotion.description}</p>
            )}
            {viewingPromotion.terms_conditions && (
              <div>
                <strong>Điều khoản:</strong>
                <p style={{ whiteSpace: 'pre-wrap' }}>{viewingPromotion.terms_conditions}</p>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default PromotionsList;
