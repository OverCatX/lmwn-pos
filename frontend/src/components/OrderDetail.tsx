import { Modal, Descriptions, Table, Tag, Timeline } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { Order, OrderItem, OrderStatus } from '../types/order.types';

interface OrderDetailProps {
  order: Order | null;
  visible: boolean;
  onClose: () => void;
}

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
 * Order Detail Modal Component
 * Displays comprehensive order information including items and history
 */
function OrderDetail({ order, visible, onClose }: OrderDetailProps) {
  if (!order) {
    return null;
  }

  // Order items table columns
  const itemColumns: ColumnsType<OrderItem> = [
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName',
      render: (name?: string, record?: OrderItem) => name || `Product ${record?.productId.slice(0, 8)}`,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      width: 100,
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right',
      width: 120,
      render: (value: string) => `฿${parseFloat(value).toFixed(2)}`,
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      align: 'right',
      width: 120,
      render: (value: string) => `฿${parseFloat(value).toFixed(2)}`,
    },
    {
      title: 'Discount',
      dataIndex: 'discountAmount',
      key: 'discountAmount',
      align: 'right',
      width: 120,
      render: (value: string) => {
        const amount = parseFloat(value);
        return amount > 0 ? (
          <span style={{ color: '#ff4d4f' }}>-฿{amount.toFixed(2)}</span>
        ) : (
          '-'
        );
      },
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      align: 'right',
      width: 120,
      render: (value: string) => (
        <strong>฿{parseFloat(value).toFixed(2)}</strong>
      ),
    },
  ];

  return (
    <Modal
      title={`Order Details - ${order.orderNumber}`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
    >
      {/* Order Summary */}
      <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
        <Descriptions.Item label="Order Number" span={1}>
          <strong>{order.orderNumber}</strong>
        </Descriptions.Item>
        <Descriptions.Item label="Status" span={1}>
          <Tag color={STATUS_COLORS[order.status]}>{order.status}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Created At" span={1}>
          {dayjs(order.createdAt).format('DD/MM/YYYY HH:mm:ss')}
        </Descriptions.Item>
        <Descriptions.Item label="Created By" span={1}>
          {order.createdBy || '-'}
        </Descriptions.Item>
        {order.completedAt && (
          <Descriptions.Item label="Completed At" span={2}>
            {dayjs(order.completedAt).format('DD/MM/YYYY HH:mm:ss')}
          </Descriptions.Item>
        )}
      </Descriptions>

      {/* Order Items */}
      <h3 style={{ marginTop: 24, marginBottom: 16 }}>Order Items</h3>
      <Table
        columns={itemColumns}
        dataSource={order.items}
        rowKey="id"
        pagination={false}
        size="small"
      />

      {/* Financial Summary */}
      <Descriptions
        bordered
        column={1}
        style={{ marginTop: 24 }}
        contentStyle={{ textAlign: 'right', fontWeight: 500 }}
      >
        <Descriptions.Item label="Subtotal">
          ฿{parseFloat(order.subtotal).toFixed(2)}
        </Descriptions.Item>
        {parseFloat(order.discountAmount) > 0 && (
          <Descriptions.Item
            label={
              <span>
                Discount
                {order.discountAppliedAt && (
                  <div style={{ fontSize: 11, color: '#999', fontWeight: 'normal' }}>
                    Applied: {dayjs(order.discountAppliedAt).format('DD/MM/YYYY HH:mm')}
                  </div>
                )}
              </span>
            }
            contentStyle={{ color: '#ff4d4f', textAlign: 'right', fontWeight: 500 }}
          >
            -฿{parseFloat(order.discountAmount).toFixed(2)}
          </Descriptions.Item>
        )}
        <Descriptions.Item label="Tax (7%)">
          ฿{parseFloat(order.tax).toFixed(2)}
        </Descriptions.Item>
        <Descriptions.Item
          label="Total"
          contentStyle={{
            fontSize: 18,
            color: '#3f8600',
            textAlign: 'right',
            fontWeight: 'bold',
          }}
        >
          ฿{parseFloat(order.total).toFixed(2)}
        </Descriptions.Item>
      </Descriptions>

      {/* Order History Timeline */}
      <h3 style={{ marginTop: 24, marginBottom: 16 }}>Order Timeline</h3>
      <Timeline
        items={[
          {
            color: 'green',
            children: (
              <>
                <strong>Order Created</strong>
                <br />
                {dayjs(order.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                <br />
                <span style={{ color: '#888' }}>
                  {order.items.length} items • ฿{parseFloat(order.total).toFixed(2)}
                </span>
              </>
            ),
          },
          ...(order.status !== 'PENDING'
            ? [
                {
                  color: 'blue',
                  children: (
                    <>
                      <strong>Status: {order.status}</strong>
                      <br />
                      {dayjs(order.updatedAt).format('DD/MM/YYYY HH:mm:ss')}
                    </>
                  ),
                },
              ]
            : []),
          ...(order.completedAt
            ? [
                {
                  color: 'green',
                  children: (
                    <>
                      <strong>Order Completed</strong>
                      <br />
                      {dayjs(order.completedAt).format('DD/MM/YYYY HH:mm:ss')}
                    </>
                  ),
                },
              ]
            : []),
        ]}
      />
    </Modal>
  );
}

export default OrderDetail;
