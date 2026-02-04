import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  Row,
  Col,
  Statistic,
  DatePicker,
  Space,
  Button,
  Table,
  message,
  Spin,
} from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  PercentageOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ReportsApi } from '../services';
import { handleApiError } from '../services/api';

const { RangePicker } = DatePicker;

/**
 * Colors for charts
 */
const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

/**
 * Reports Page Component
 * Displays various sales and performance reports
 */
function ReportsPage() {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(7, 'day'),
    dayjs(),
  ]);

  // Fetch daily sales summary
  const {
    data: dailySales,
    isLoading: isLoadingDaily,
    refetch: refetchDaily,
  } = useQuery({
    queryKey: ['dailySales', selectedDate.format('YYYY-MM-DD')],
    queryFn: () => ReportsApi.getDailySalesSummary(selectedDate.format('YYYY-MM-DD')),
  });

  // Fetch revenue report
  const {
    data: revenueReport,
    isLoading: isLoadingRevenue,
    refetch: refetchRevenue,
  } = useQuery({
    queryKey: [
      'revenueReport',
      dateRange[0].format('YYYY-MM-DD'),
      dateRange[1].format('YYYY-MM-DD'),
    ],
    queryFn: () =>
      ReportsApi.getRevenueReport(
        dateRange[0].format('YYYY-MM-DD'),
        dateRange[1].format('YYYY-MM-DD')
      ),
  });

  // Fetch product performance report
  const {
    data: productReport,
    isLoading: isLoadingProduct,
    refetch: refetchProduct,
  } = useQuery({
    queryKey: [
      'productPerformance',
      dateRange[0].format('YYYY-MM-DD'),
      dateRange[1].format('YYYY-MM-DD'),
    ],
    queryFn: () =>
      ReportsApi.getProductPerformanceReport(
        dateRange[0].format('YYYY-MM-DD'),
        dateRange[1].format('YYYY-MM-DD')
      ),
  });

  // Handle refresh all
  const handleRefreshAll = async () => {
    try {
      await Promise.all([refetchDaily(), refetchRevenue(), refetchProduct()]);
      message.success('Reports refreshed');
    } catch (err) {
      message.error(handleApiError(err));
    }
  };

  // Product performance table columns
  type ProductPerformer = {
    productId: string;
    productName: string;
    quantitySold: number;
    revenue: string;
    orderCount: number;
    percentageOfRevenue: string;
  };

  const productColumns: ColumnsType<ProductPerformer> = [
    {
      title: 'Rank',
      key: 'rank',
      width: 70,
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Quantity Sold',
      dataIndex: 'quantitySold',
      key: 'quantitySold',
      align: 'right',
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      align: 'right',
      render: (value: string) => `฿${parseFloat(value).toFixed(2)}`,
    },
    {
      title: 'Orders',
      dataIndex: 'orderCount',
      key: 'orderCount',
      align: 'right',
    },
    {
      title: '% of Revenue',
      dataIndex: 'percentageOfRevenue',
      key: 'percentageOfRevenue',
      align: 'right',
      render: (value: string) => `${parseFloat(value).toFixed(2)}%`,
    },
  ];

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header Controls */}
        <Card>
          <Space>
            <DatePicker
              value={selectedDate}
              onChange={(date) => date && setSelectedDate(date)}
              format="DD/MM/YYYY"
            />
            <RangePicker
              value={dateRange}
              onChange={(dates) => dates && setDateRange(dates as [Dayjs, Dayjs])}
              format="DD/MM/YYYY"
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefreshAll}
              loading={isLoadingDaily || isLoadingRevenue || isLoadingProduct}
            >
              Refresh All
            </Button>
          </Space>
        </Card>

        {/* Daily Sales Summary */}
        <Card title={`Daily Sales Summary - ${selectedDate.format('DD MMM YYYY')}`}>
          <Spin spinning={isLoadingDaily}>
            {dailySales && (
              <>
                <Row gutter={16}>
                  <Col span={6}>
                    <Statistic
                      title="Total Orders"
                      value={dailySales.totalOrders}
                      prefix={<ShoppingCartOutlined />}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Total Revenue"
                      value={parseFloat(dailySales.totalRevenue).toFixed(2)}
                      prefix={<DollarOutlined />}
                      suffix="฿"
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Total Discount"
                      value={parseFloat(dailySales.totalDiscount).toFixed(2)}
                      prefix={<PercentageOutlined />}
                      suffix="฿"
                      valueStyle={{ color: '#ff4d4f' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Avg Order Value"
                      value={parseFloat(dailySales.averageOrderValue).toFixed(2)}
                      suffix="฿"
                    />
                  </Col>
                </Row>

                {/* Orders by Status */}
                <Row gutter={16} style={{ marginTop: 24 }}>
                  <Col span={12}>
                    <h3>Orders by Status</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={dailySales.ordersByStatus}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={(entry) => `${entry.status}: ${entry.count}`}
                        >
                          {dailySales.ordersByStatus.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={CHART_COLORS[index % CHART_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Col>
                  <Col span={12}>
                    <h3>Top Products</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dailySales.topProducts}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="productName" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="quantitySold" fill="#8884d8" name="Quantity Sold" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Col>
                </Row>
              </>
            )}
          </Spin>
        </Card>

        {/* Revenue Report */}
        <Card
          title={`Revenue Report - ${dateRange[0].format('DD MMM')} to ${dateRange[1].format('DD MMM YYYY')}`}
        >
          <Spin spinning={isLoadingRevenue}>
            {revenueReport && (
              <>
                <Row gutter={16}>
                  <Col span={6}>
                    <Statistic
                      title="Total Orders"
                      value={revenueReport.totalOrders}
                      prefix={<ShoppingCartOutlined />}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Gross Revenue"
                      value={parseFloat(revenueReport.totalRevenue).toFixed(2)}
                      suffix="฿"
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Total Discount"
                      value={parseFloat(revenueReport.totalDiscount).toFixed(2)}
                      suffix="฿"
                      valueStyle={{ color: '#ff4d4f' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Net Revenue"
                      value={parseFloat(revenueReport.netRevenue).toFixed(2)}
                      prefix={<DollarOutlined />}
                      suffix="฿"
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Col>
                </Row>

                {/* Daily Revenue Trend */}
                <div style={{ marginTop: 24 }}>
                  <h3>Daily Revenue Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueReport.dailyBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => dayjs(value).format('DD/MM')}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(value) => dayjs(value).format('DD MMM YYYY')}
                        formatter={(value: number) => [`฿${value.toFixed(2)}`, '']}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#8884d8"
                        name="Revenue"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="discount"
                        stroke="#ff4d4f"
                        name="Discount"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Discount Summary */}
                <Row gutter={16} style={{ marginTop: 24 }}>
                  <Col span={8}>
                    <Statistic
                      title="Discount Rate"
                      value={parseFloat(
                        revenueReport.discountSummary.discountPercentage
                      ).toFixed(2)}
                      suffix="%"
                      valueStyle={{ color: '#ff4d4f' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Orders with Discount"
                      value={revenueReport.discountSummary.ordersWithDiscount}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Orders without Discount"
                      value={revenueReport.discountSummary.ordersWithoutDiscount}
                    />
                  </Col>
                </Row>
              </>
            )}
          </Spin>
        </Card>

        {/* Product Performance */}
        <Card title="Product Performance">
          <Spin spinning={isLoadingProduct}>
            {productReport && (
              <Table
                columns={productColumns}
                dataSource={productReport.topPerformers}
                rowKey="productId"
                pagination={false}
              />
            )}
          </Spin>
        </Card>
      </Space>
    </div>
  );
}

export default ReportsPage;
