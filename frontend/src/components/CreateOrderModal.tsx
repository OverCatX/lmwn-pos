import { useState } from 'react';
import { Modal, Form, Select, InputNumber, Button, Table, message, Space } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import { ProductsApi } from '../services';
import { handleApiError } from '../services/api';
import type { CreateOrderRequest } from '../types/order.types';

interface CreateOrderModalProps {
  visible: boolean;
  onSubmit: (data: CreateOrderRequest) => Promise<void>;
  onCancel: () => void;
}

interface OrderItemForm {
  key: string;
  productId: string;
  productName?: string;
  price?: string;
  quantity: number;
}

/**
 * Create Order Modal Component
 * Form for creating new orders with product selection
 */
function CreateOrderModal({ visible, onSubmit, onCancel }: CreateOrderModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<OrderItemForm[]>([]);

  // Fetch products for selection
  const { data: productsData } = useQuery({
    queryKey: ['products', 1, 100],
    queryFn: () => ProductsApi.getProducts(1, 100, undefined, true),
    enabled: visible,
  });

  const products = productsData?.data || [];

  const handleAddItem = () => {
    const values = form.getFieldsValue();
    if (!values.productId || !values.quantity) {
      message.warning('Please select product and quantity');
      return;
    }

    const product = products.find(p => p.id === values.productId);
    if (!product) return;

    const newItem: OrderItemForm = {
      key: Date.now().toString(),
      productId: values.productId,
      productName: product.name,
      price: product.price,
      quantity: values.quantity,
    };

    setItems([...items, newItem]);
    form.resetFields(['productId', 'quantity']);
  };

  const handleRemoveItem = (key: string) => {
    setItems(items.filter(item => item.key !== key));
  };

  const handleQuantityChange = (key: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setItems(items.map(item => 
      item.key === key ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      message.warning('Please add at least one item');
      return;
    }

    try {
      setLoading(true);
      const orderData: CreateOrderRequest = {
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        createdBy: 'Staff-WebUI', // Default staff identifier
      };

      await onSubmit(orderData);
      setItems([]);
      form.resetFields();
      message.success('Order created successfully');
    } catch (error) {
      message.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setItems([]);
    form.resetFields();
    onCancel();
  };

  // Calculate totals (tax on net amount per Thailand VAT law)
  const TAX_RATE = 0.07;
  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat(item.price || '0');
    return sum + (price * item.quantity);
  }, 0);
  const tax = subtotal * TAX_RATE; // Note: Backend will recalculate if discount applied
  const total = subtotal + tax;

  // Items table columns
  const columns: ColumnsType<OrderItemForm> = [
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      align: 'right',
      render: (value: string) => `฿${parseFloat(value).toFixed(2)}`,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 150,
      align: 'center',
      render: (value: number, record) => (
        <InputNumber
          min={1}
          max={100}
          precision={0}
          value={value}
          onChange={(newValue) => handleQuantityChange(record.key, newValue || 1)}
          style={{ width: 80 }}
        />
      ),
    },
    {
      title: 'Subtotal',
      key: 'subtotal',
      width: 120,
      align: 'right',
      render: (_, record) => {
        const total = parseFloat(record.price || '0') * record.quantity;
        return `฿${total.toFixed(2)}`;
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.key)}
        />
      ),
    },
  ];

  return (
    <Modal
      title="Create New Order"
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Create Order"
      width={800}
      okButtonProps={{ disabled: items.length === 0 }}
    >
      {/* Add Item Form */}
      <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item
          name="productId"
          label="Product"
          style={{ width: 300 }}
        >
          <Select
            placeholder="Select product"
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={products.map(p => ({
              label: `${p.name} - ฿${parseFloat(p.price).toFixed(2)}`,
              value: p.id,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="quantity"
          label="Quantity"
          initialValue={1}
        >
          <InputNumber min={1} max={100} precision={0} style={{ width: 100 }} />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddItem}
          >
            Add
          </Button>
        </Form.Item>
      </Form>

      {/* Items Table */}
      <Table
        columns={columns}
        dataSource={items}
        pagination={false}
        size="small"
        locale={{ emptyText: 'No items added' }}
      />

      {/* Order Summary */}
      {items.length > 0 && (
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Space direction="vertical" size={4} style={{ alignItems: 'flex-end' }}>
            <div>
              <strong>Subtotal:</strong> <span style={{ fontSize: 14 }}>฿{subtotal.toFixed(2)}</span>
            </div>
            <div>
              <strong>Tax (7%):</strong> <span style={{ fontSize: 14 }}>฿{tax.toFixed(2)}</span>
            </div>
            <div style={{ borderTop: '1px solid #d9d9d9', paddingTop: 8, marginTop: 4 }}>
              <strong>Total:</strong> <span style={{ fontSize: 18, color: '#3f8600', fontWeight: 'bold' }}>฿{total.toFixed(2)}</span>
            </div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              (Discounts can be applied after order creation)
            </div>
          </Space>
        </div>
      )}
    </Modal>
  );
}

export default CreateOrderModal;
