import React from 'react';
import { Table, Button, Space, Tag, Popconfirm, Tooltip, Image } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Promotion } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';

interface PromotionsTableProps {
  data: Promotion[];
  loading?: boolean;
  onEdit: (promotion: Promotion) => void;
  onDelete: (id: number) => void;
  onView: (promotion: Promotion) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const PromotionsTable: React.FC<PromotionsTableProps> = ({
  data,
  loading,
  onEdit,
  onDelete,
  onView,
  canEdit = true,
  canDelete = true,
}) => {
  const columns: ColumnsType<Promotion> = [
    {
      title: 'Banner',
      dataIndex: 'banner_image',
      key: 'banner_image',
      width: 80,
      render: (bannerImage: string) => (
        <Image
          src={bannerImage}
          alt="Promotion"
          width={60}
          height={40}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA2MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yMCAyMEgxNlYxNkgyMFYyMFpNMzAgMjBIMjZWMTZIMzBWMjBaTTQwIDIwSDM2VjE2SDQwVjIwWiIgZmlsbD0iI0Q5RDlEOSIvPgo8L3N2Zz4K"
        />
      ),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Mã khuyến mãi',
      dataIndex: 'promo_code',
      key: 'promo_code',
      render: (code?: string) => code ? <Tag color="blue">{code}</Tag> : '-',
    },
    {
      title: 'Loại giảm giá',
      dataIndex: 'discount_type',
      key: 'discount_type',
      render: (type: string, record) => {
        const isPercentage = type === 'percentage';
        const value = isPercentage ? `${record.discount_value}%` : formatCurrency(record.discount_value);
        return (
          <Tag color={isPercentage ? 'green' : 'orange'}>
            {value}
          </Tag>
        );
      },
    },
    {
      title: 'Thời gian',
      key: 'duration',
      render: (_, record) => (
        <div>
          <div><strong>Từ:</strong> {formatDate(record.start_date)}</div>
          <div><strong>Đến:</strong> {formatDate(record.end_date)}</div>
        </div>
      ),
    },
    {
      title: 'Sử dụng',
      key: 'usage',
      render: (_, record) => (
        <div>
          <div>{record.used_count} / {record.usage_limit || '∞'}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.usage_limit 
              ? `${Math.round((record.used_count / record.usage_limit) * 100)}%`
              : 'Không giới hạn'
            }
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig: Record<string, { color: string; text: string }> = {
          draft: { color: 'default', text: 'Nháp' },
          active: { color: 'green', text: 'Đang hoạt động' },
          expired: { color: 'red', text: 'Đã hết hạn' },
          disabled: { color: 'orange', text: 'Đã tắt' },
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onView(record)}
              size="small"
            />
          </Tooltip>
          {canEdit && (
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => onEdit(record)}
                size="small"
              />
            </Tooltip>
          )}
          {canDelete && (
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa khuyến mãi này?"
              onConfirm={() => onDelete(record.id)}
              okText="Xóa"
              cancelText="Hủy"
              okType="danger"
            >
              <Tooltip title="Xóa">
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey="id"
      scroll={{ x: 1200 }}
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} của ${total} khuyến mãi`,
      }}
    />
  );
};

export default PromotionsTable;
