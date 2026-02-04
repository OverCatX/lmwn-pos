import { Card, Space, Select, DatePicker, Input, Button } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import { OrderStatus } from '../types/order.types';

const { RangePicker } = DatePicker;

interface OrderFiltersProps {
  status?: string;
  dateRange?: [Dayjs, Dayjs] | null;
  searchText?: string;
  onStatusChange: (value?: string) => void;
  onDateRangeChange: (dates: [Dayjs, Dayjs] | null) => void;
  onSearchChange: (value: string) => void;
  onClear: () => void;
}

/**
 * Order Filters Component
 * Provides filtering controls for orders list
 */
function OrderFilters({
  status,
  dateRange,
  searchText,
  onStatusChange,
  onDateRangeChange,
  onSearchChange,
  onClear,
}: OrderFiltersProps) {
  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Space wrap>
        {/* Status Filter */}
        <Select
          style={{ width: 150 }}
          placeholder="Filter by status"
          allowClear
          value={status}
          onChange={onStatusChange}
          options={[
            { label: 'Pending', value: OrderStatus.PENDING },
            { label: 'Confirmed', value: OrderStatus.CONFIRMED },
            { label: 'Preparing', value: OrderStatus.PREPARING },
            { label: 'Ready', value: OrderStatus.READY },
            { label: 'Completed', value: OrderStatus.COMPLETED },
            { label: 'Cancelled', value: OrderStatus.CANCELLED },
          ]}
        />

        {/* Date Range Filter */}
        <RangePicker
          value={dateRange}
          onChange={(dates) => onDateRangeChange(dates as [Dayjs, Dayjs] | null)}
          format="DD/MM/YYYY"
          style={{ width: 260 }}
        />

        {/* Search by Order Number */}
        <Input
          placeholder="Search by order number"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ width: 220 }}
          allowClear
        />

        {/* Clear All Filters */}
        <Button icon={<ClearOutlined />} onClick={onClear}>
          Clear Filters
        </Button>
      </Space>
    </Card>
  );
}

export default OrderFilters;
