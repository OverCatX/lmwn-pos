import { useState } from 'react';
import { Modal, Form, Select, message, Alert } from 'antd';
import { OrderStatus, type UpdateOrderStatusRequest } from '../types/order.types';

interface UpdateStatusModalProps {
  visible: boolean;
  orderNumber: string;
  currentStatus: OrderStatus;
  onUpdate: (data: UpdateOrderStatusRequest) => Promise<void>;
  onCancel: () => void;
}

/**
 * Valid status transitions map
 */
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
  [OrderStatus.READY]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELLED]: [],
};

/**
 * Status labels for display
 */
const STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Pending',
  [OrderStatus.CONFIRMED]: 'Confirmed',
  [OrderStatus.PREPARING]: 'Preparing',
  [OrderStatus.READY]: 'Ready',
  [OrderStatus.COMPLETED]: 'Completed',
  [OrderStatus.CANCELLED]: 'Cancelled',
};

/**
 * Update Status Modal Component
 * Form for updating order status with validation
 */
function UpdateStatusModal({
  visible,
  orderNumber,
  currentStatus,
  onUpdate,
  onCancel,
}: UpdateStatusModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const validStatuses = VALID_TRANSITIONS[currentStatus];
  const canUpdate = validStatuses.length > 0;

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await onUpdate({
        status: values.status,
      });

      form.resetFields();
      message.success('Order status updated successfully');
    } catch (error) {
      // Error handled by parent component
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={`Update Status - ${orderNumber}`}
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Update Status"
      okButtonProps={{ disabled: !canUpdate }}
    >
      <div style={{ marginBottom: 16 }}>
        <strong>Current Status:</strong>{' '}
        <span style={{ color: '#1890ff' }}>{STATUS_LABELS[currentStatus]}</span>
      </div>

      {!canUpdate ? (
        <Alert
          message="Cannot Update Status"
          description={
            currentStatus === OrderStatus.COMPLETED
              ? 'Completed orders cannot be modified.'
              : 'Cancelled orders cannot be modified.'
          }
          type="warning"
          showIcon
        />
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item
            name="status"
            label="New Status"
            rules={[{ required: true, message: 'Please select new status' }]}
          >
            <Select
              placeholder="Select new status"
              options={validStatuses.map((status) => ({
                label: STATUS_LABELS[status],
                value: status,
              }))}
            />
          </Form.Item>

          <Alert
            message="Valid Transitions"
            description={
              <>
                From <strong>{STATUS_LABELS[currentStatus]}</strong> you can move
                to: <strong>{validStatuses.map((s) => STATUS_LABELS[s]).join(', ')}</strong>
              </>
            }
            type="info"
            showIcon
            style={{ marginTop: 8 }}
          />
        </Form>
      )}
    </Modal>
  );
}

export default UpdateStatusModal;
