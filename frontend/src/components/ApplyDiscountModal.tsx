import { useState } from 'react';
import { Modal, Form, Select, InputNumber, Input, message } from 'antd';
import { DiscountType } from '../types/order.types';
import type { ApplyDiscountRequest } from '../types/order.types';

interface ApplyDiscountModalProps {
  visible: boolean;
  orderNumber: string;
  currentTotal: string;
  onApply: (data: ApplyDiscountRequest) => Promise<void>;
  onCancel: () => void;
}

/**
 * Apply Discount Modal Component
 * Form for applying discounts to orders
 */
function ApplyDiscountModal({
  visible,
  orderNumber,
  currentTotal,
  onApply,
  onCancel,
}: ApplyDiscountModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [discountType, setDiscountType] = useState<DiscountType>(
    DiscountType.PERCENTAGE
  );

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await onApply({
        discountType: values.discountType,
        discountValue: values.discountValue,
        discountCode: values.discountCode,
      });

      form.resetFields();
      message.success('Discount applied successfully');
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
      title={`Apply Discount - ${orderNumber}`}
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Apply Discount"
    >
      <div style={{ marginBottom: 16 }}>
        <strong>Current Total:</strong> ฿{parseFloat(currentTotal).toFixed(2)}
      </div>

      <Form form={form} layout="vertical">
        <Form.Item
          name="discountType"
          label="Discount Type"
          initialValue={DiscountType.PERCENTAGE}
          rules={[{ required: true, message: 'Please select discount type' }]}
        >
          <Select
            onChange={(value) => setDiscountType(value)}
            options={[
              { label: 'Percentage (%)', value: DiscountType.PERCENTAGE },
              { label: 'Fixed Amount (฿)', value: DiscountType.FIXED_AMOUNT },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="discountValue"
          label={
            discountType === DiscountType.PERCENTAGE
              ? 'Discount Percentage'
              : 'Discount Amount'
          }
          rules={[
            { required: true, message: 'Please enter discount value' },
            {
              type: 'number',
              min: 0,
              message: 'Discount must be positive',
            },
            ...(discountType === DiscountType.PERCENTAGE
              ? [
                  {
                    type: 'number' as const,
                    max: 100,
                    message: 'Percentage cannot exceed 100%',
                  },
                ]
              : []),
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder={
              discountType === DiscountType.PERCENTAGE
                ? 'Enter percentage (e.g., 10)'
                : 'Enter amount (e.g., 50)'
            }
            min={0}
            max={discountType === DiscountType.PERCENTAGE ? 100 : undefined}
            precision={2}
            addonAfter={discountType === DiscountType.PERCENTAGE ? '%' : '฿'}
          />
        </Form.Item>

        <Form.Item
          name="discountCode"
          label="Discount Code (Optional)"
          rules={[{ max: 50, message: 'Code too long' }]}
        >
          <Input placeholder="e.g., PROMO2026" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ApplyDiscountModal;
