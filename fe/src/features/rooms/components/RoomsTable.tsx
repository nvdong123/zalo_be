import React from 'react';
import { Table, Button, Space, Tag, Popconfirm, Tooltip, Image } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Room } from '@/types';
import { formatCurrency } from '@/utils/format';

interface RoomsTableProps {
  data: Room[];
  loading?: boolean;
  onEdit: (room: Room) => void;
  onDelete: (id: number) => void;
  onView: (room: Room) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const RoomsTable: React.FC<RoomsTableProps> = ({
  data,
  loading,
  onEdit,
  onDelete,
  onView,
  canEdit = true,
  canDelete = true,
}) => {
  const columns: ColumnsType<Room> = [
    {
      title: 'Hình ảnh',
      dataIndex: 'image_url',
      key: 'image_url',
      width: 80,
      render: (imageUrl: string) => (
        <Image
          src={imageUrl}
          alt="Room"
          width={60}
          height={40}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA2MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yMCAyMEgxNlYxNkgyMFYyMFpNMzAgMjBIMjZWMTZIMzBWMjBaTTQwIDIwSDM2VjE2SDQwVjIwWiIgZmlsbD0iI0Q5RDlEOSIvPgo8L3N2Zz4K"
        />
      ),
    },
    {
      title: 'Tên phòng',
      dataIndex: 'room_name',
      key: 'room_name',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Loại phòng',
      dataIndex: 'room_type',
      key: 'room_type',
      render: (type: string) => {
        const typeLabels: Record<string, string> = {
          standard: 'Tiêu chuẩn',
          deluxe: 'Cao cấp',
          suite: 'Suite',
          family: 'Gia đình',
          presidential: 'Tổng thống',
        };
        return <Tag color="blue">{typeLabels[type] || type}</Tag>;
      },
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => <strong>{formatCurrency(price)}</strong>,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Sức chứa',
      key: 'capacity',
      render: (_, record) => (
        <span>
          {record.capacity_adults} người lớn
          {record.capacity_children > 0 && `, ${record.capacity_children} trẻ em`}
        </span>
      ),
    },
    {
      title: 'Diện tích',
      dataIndex: 'size_sqm',
      key: 'size_sqm',
      render: (size?: number) => size ? `${size}m²` : '-',
    },
    {
      title: 'View',
      dataIndex: 'view_type',
      key: 'view_type',
      render: (viewType?: string) => {
        if (!viewType) return '-';
        const viewLabels: Record<string, string> = {
          sea: 'Biển',
          city: 'Thành phố',
          garden: 'Vườn',
          mountain: 'Núi',
          pool: 'Hồ bơi',
        };
        return <Tag>{viewLabels[viewType] || viewType}</Tag>;
      },
    },
    {
      title: 'Tiện ích',
      key: 'features',
      render: (_, record) => (
        <Space size={4}>
          {record.has_balcony && <Tag>Ban công</Tag>}
          {record.has_kitchen && <Tag>Bếp</Tag>}
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig: Record<string, { color: string; text: string }> = {
          available: { color: 'green', text: 'Có sẵn' },
          occupied: { color: 'red', text: 'Đã thuê' },
          maintenance: { color: 'orange', text: 'Bảo trì' },
          out_of_order: { color: 'red', text: 'Hỏng hóc' },
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
              title="Bạn có chắc chắn muốn xóa phòng này?"
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
          `${range[0]}-${range[1]} của ${total} phòng`,
      }}
    />
  );
};

export default RoomsTable;
