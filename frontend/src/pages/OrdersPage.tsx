import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Tag,
  Space,
  Button,
  Card,
  message,
  Spin,
  Dropdown,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  GiftOutlined,
  MoreOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { OrdersApi } from '../services';
import { handleApiError } from '../services/api';
import type { Order } from '../types/order.types';
import { OrderStatus } from '../types/order.types';
import {
  OrderDetail,
  OrderFilters,
  ApplyDiscountModal,
  UpdateStatusModal,
  CreateOrderModal,
} from '../components';

/**
 * Order Status color mapping for tags
 */
const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'default',
  CONFIRMED: 'blue',
  PREPARING: 'orange',
  READY: 'cyan',
  COMPLETED: 'green',
  CANCELLED: 'red',
};

/**
 * Orders Page Component
 * Displays paginated list of orders with filtering and actions
 */
function OrdersPage() {
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [searchText, setSearchText] = useState('');

  // Modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [discountModalVisible, setDiscountModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [createOrderVisible, setCreateOrderVisible] = useState(false);

  const queryClient = useQueryClient();

  // Fetch orders using React Query
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['orders', page, pageSize, statusFilter, dateRange],
    queryFn: () => OrdersApi.getOrders(
      page, 
      pageSize, 
      statusFilter,
      dateRange?.[0]?.toISOString(),
      dateRange?.[1]?.toISOString()
    ),
  });

  // Apply discount mutation
  const applyDiscountMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      OrdersApi.applyDiscount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setDiscountModalVisible(false);
      message.success('Discount applied successfully');
    },
    onError: (err) => {
      message.error(handleApiError(err));
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      OrdersApi.updateOrderStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setStatusModalVisible(false);
      message.success('Order status updated successfully');
    },
    onError: (err) => {
      message.error(handleApiError(err));
    },
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: (data: any) => OrdersApi.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setCreateOrderVisible(false);
      message.success('Order created successfully');
    },
    onError: (err) => {
      message.error(handleApiError(err));
    },
  });

  // Search filter (client-side for order number only)
  const displayOrders = searchText
    ? (data?.data || []).filter((order) =>
        order.orderNumber.toLowerCase().includes(searchText.toLowerCase())
      )
    : (data?.data || []);

  // Handle refetch
  const handleRefresh = async () => {
    try {
      await refetch();
      message.success('Orders refreshed');
    } catch (err) {
      message.error(handleApiError(err));
    }
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setStatusFilter(undefined);
    setDateRange(null);
    setSearchText('');
    setPage(1);
  };

  // Handle view details
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailVisible(true);
  };

  // Handle apply discount
  const handleApplyDiscountClick = (order: Order) => {
    setSelectedOrder(order);
    setDiscountModalVisible(true);
  };

  const handleApplyDiscount = async (data: any) => {
    if (selectedOrder) {
      await applyDiscountMutation.mutateAsync({
        id: selectedOrder.id,
        data,
      });
    }
  };

  // Handle update status
  const handleUpdateStatusClick = (order: Order) => {
    setSelectedOrder(order);
    setStatusModalVisible(true);
  };

  const handleUpdateStatus = async (data: any) => {
    if (selectedOrder) {
      await updateStatusMutation.mutateAsync({
        id: selectedOrder.id,
        data,
      });
    }
  };

  const handleRemoveDiscount = async (order: Order) => {
    try {
      await OrdersApi.removeDiscount(order.id);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      message.success('Discount removed successfully');
    } catch (err) {
      message.error(handleApiError(err));
    }
  };

  const handleCreateOrder = async (data: any) => {
    await createOrderMutation.mutateAsync(data);
  };

  // Table columns definition
  const columns: ColumnsType<Order> = [
    {
      title: 'Order Number',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 150,
      fixed: 'left',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: OrderStatus) => (
        <Tag color={STATUS_COLORS[status]}>{status}</Tag>
      ),
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      width: 80,
      align: 'center',
      render: (items: Order['items']) => items.length,
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      width: 120,
      align: 'right',
      render: (value: string) => `฿${parseFloat(value).toFixed(2)}`,
    },
    {
      title: 'Discount',
      dataIndex: 'discountAmount',
      key: 'discountAmount',
      width: 150,
      align: 'right',
      render: (value: string, record: Order) => {
        const amount = parseFloat(value);
        if (amount === 0) return '-';
        
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ color: '#ff4d4f' }}>-฿{amount.toFixed(2)}</span>
            {record.discountAppliedAt && (
              <span style={{ fontSize: 11, color: '#999' }}>
                {dayjs(record.discountAppliedAt).format('DD/MM HH:mm')}
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: 'Tax',
      dataIndex: 'tax',
      key: 'tax',
      width: 100,
      align: 'right',
      render: (value: string) => `฿${parseFloat(value).toFixed(2)}`,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 120,
      align: 'right',
      render: (value: string) => (
        <strong style={{ color: '#3f8600' }}>
          ฿{parseFloat(value).toFixed(2)}
        </strong>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 120,
      render: (value?: string) => value || '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_: unknown, record: Order) => {
        const canModify =
          record.status !== OrderStatus.COMPLETED &&
          record.status !== OrderStatus.CANCELLED;

        const hasDiscount = parseFloat(record.discountAmount) > 0;

        const menuItems: MenuProps['items'] = [
          {
            key: 'view',
            icon: <EyeOutlined />,
            label: 'View Details',
            onClick: () => handleViewDetails(record),
          },
          ...(canModify
            ? [
                {
                  key: 'status',
                  icon: <EditOutlined />,
                  label: 'Update Status',
                  onClick: () => handleUpdateStatusClick(record),
                },
                {
                  key: 'discount',
                  icon: <GiftOutlined />,
                  label: hasDiscount ? 'Change Discount' : 'Apply Discount',
                  onClick: () => handleApplyDiscountClick(record),
                },
                ...(hasDiscount ? [{
                  key: 'remove-discount',
                  icon: <GiftOutlined />,
                  label: 'Remove Discount',
                  danger: true,
                  onClick: () => handleRemoveDiscount(record),
                }] : []),
              ]
            : []),
        ];

        return (
          <Space size="small">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            >
              View
            </Button>
            {canModify && (
              <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                <Button type="text" icon={<MoreOutlined />} />
              </Dropdown>
            )}
          </Space>
        );
      },
    },
  ];

  if (isError) {
    message.error(handleApiError(error));
  }

  return (
    <div>
      <Card
        title={
          <Space>
            <span>Orders List</span>
            {(statusFilter || dateRange || searchText) && (
              <Tag color="blue">
                {[
                  statusFilter && 'Status',
                  dateRange && 'Date',
                  searchText && 'Search',
                ]
                  .filter(Boolean)
                  .join(' + ')}{' '}
                filtered
              </Tag>
            )}
          </Space>
        }
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateOrderVisible(true)}
            >
              New Order
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={isLoading}
            >
              Refresh
            </Button>
          </Space>
        }
      >
        {/* Filters */}
        <OrderFilters
          status={statusFilter}
          dateRange={dateRange}
          searchText={searchText}
          onStatusChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
          onDateRangeChange={(dates) => {
            setDateRange(dates);
            setPage(1);
          }}
          onSearchChange={(value) => {
            setSearchText(value);
            setPage(1);
          }}
          onClear={handleClearFilters}
        />

        {/* Orders Table */}
        <Spin spinning={isLoading}>
          <Table
            columns={columns}
            dataSource={displayOrders}
            rowKey="id"
            scroll={{ x: 1400 }}
            pagination={
              searchText
                ? false
                : {
                    position: ['bottomCenter'],
                    current: page,
                    pageSize: pageSize,
                    total: data?.total || 0,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    onChange: (newPage, newPageSize) => {
                      if (newPageSize !== pageSize) {
                        setPageSize(newPageSize);
                        setPage(1);
                      } else {
                        setPage(newPage);
                      }
                    },
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
                  }
            }
          />
        </Spin>
      </Card>

      {/* Order Detail Modal */}
      <OrderDetail
        order={selectedOrder}
        visible={detailVisible}
        onClose={() => {
          setDetailVisible(false);
          setSelectedOrder(null);
        }}
      />

      {/* Apply Discount Modal */}
      <ApplyDiscountModal
        visible={discountModalVisible}
        orderNumber={selectedOrder?.orderNumber || ''}
        currentTotal={selectedOrder?.total || '0'}
        onApply={handleApplyDiscount}
        onCancel={() => {
          setDiscountModalVisible(false);
          setSelectedOrder(null);
        }}
      />

      {/* Update Status Modal */}
      <UpdateStatusModal
        visible={statusModalVisible}
        orderNumber={selectedOrder?.orderNumber || ''}
        currentStatus={selectedOrder?.status || OrderStatus.PENDING}
        onUpdate={handleUpdateStatus}
        onCancel={() => {
          setStatusModalVisible(false);
          setSelectedOrder(null);
        }}
      />

      {/* Create Order Modal */}
      <CreateOrderModal
        visible={createOrderVisible}
        onSubmit={handleCreateOrder}
        onCancel={() => setCreateOrderVisible(false)}
      />
    </div>
  );
}

export default OrdersPage;
