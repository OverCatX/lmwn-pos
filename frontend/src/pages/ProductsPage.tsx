import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  Tag,
  Card,
  Button,
  message,
  Spin,
  Input,
  Select,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { ProductsApi } from '../services';
import { handleApiError } from '../services/api';
import type { Product } from '../types/product.types';

/**
 * Products Page Component
 * Display products catalog (read-only for staff reference)
 */
function ProductsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState('');

  // Fetch products
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['products', page, pageSize, categoryFilter, true], // isActive = true
    queryFn: () => ProductsApi.getProducts(page, pageSize, categoryFilter, true),
  });

  // Filter by search text (client-side)
  const filteredProducts = data?.data.filter((product) =>
    searchText
      ? product.name.toLowerCase().includes(searchText.toLowerCase())
      : true
  ) || [];

  const handleRefresh = async () => {
    try {
      await refetch();
      message.success('Products refreshed');
    } catch (err) {
      message.error(handleApiError(err));
    }
  };

  // Table columns
  const columns: ColumnsType<Product> = [
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text?: string) => text || '-',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (text?: string) => text || '-',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      align: 'right',
      render: (value: string) => (
        <strong style={{ color: '#3f8600' }}>
          ฿{parseFloat(value).toFixed(2)}
        </strong>
      ),
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      width: 100,
      align: 'center',
      render: (value: number) => (
        <Tag color={value > 10 ? 'green' : value > 0 ? 'orange' : 'red'}>
          {value}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      align: 'center',
      render: (value: boolean) => (
        <Tag color={value ? 'green' : 'default'}>
          {value ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
  ];

  if (isError) {
    message.error(handleApiError(error));
  }

  return (
    <div>
      <Card
        title="Products Catalog"
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={isLoading}
          >
            Refresh
          </Button>
        }
      >
        {/* Filters */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
          <Input
            placeholder="Search products..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Select
            style={{ width: 200 }}
            placeholder="Filter by category"
            allowClear
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              { label: 'Beverages', value: 'Beverages' },
              { label: 'Main Course', value: 'Main Course' },
              { label: 'Appetizers', value: 'Appetizers' },
              { label: 'Desserts', value: 'Desserts' },
            ]}
          />
        </div>

        <Spin spinning={isLoading}>
          <Table
            columns={columns}
            dataSource={filteredProducts}
            rowKey="id"
            pagination={{
              current: page,
              pageSize: pageSize,
              total: filteredProducts.length,
              showSizeChanger: true,
              pageSizeOptions: [20, 50, 100],
              showTotal: (total) => `Total ${total} products`,
              onChange: (newPage, newPageSize) => {
                setPage(newPage);
                setPageSize(newPageSize);
              },
            }}
          />
        </Spin>
      </Card>
    </div>
  );
}

export default ProductsPage;
