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
  Segmented,
  Tabs,
  Tooltip as AntTooltip,
  Typography,
} from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  ReloadOutlined,
  BarChartOutlined,
  TableOutlined,
  QuestionCircleOutlined,
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

const { Text } = Typography;

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
  const [productViewMode, setProductViewMode] = useState<'chart' | 'table'>('chart');

  // Fetch daily sales summary
  const {
    data: dailySales,
    isLoading: isLoadingDaily,
    isError: isErrorDaily,
    error: errorDaily,
    refetch: refetchDaily,
  } = useQuery({
    queryKey: ['dailySales', selectedDate.format('YYYY-MM-DD')],
    queryFn: () => ReportsApi.getDailySalesSummary(selectedDate.format('YYYY-MM-DD')),
    retry: 1,
  });
  
  if (isErrorDaily) {
    message.error(`Daily sales error: ${handleApiError(errorDaily)}`);
  }

  // Fetch revenue report
  const {
    data: revenueReport,
    isLoading: isLoadingRevenue,
    isError: isErrorRevenue,
    error: errorRevenue,
    refetch: refetchRevenue,
  } = useQuery({
    queryKey: [
      'revenueReport',
      dateRange[0].format('YYYY-MM-DD'),
      dateRange[1].format('YYYY-MM-DD'),
    ],
    retry: 1,
    queryFn: () =>
      ReportsApi.getRevenueReport(
        dateRange[0].format('YYYY-MM-DD'),
        dateRange[1].format('YYYY-MM-DD')
      ),
  });

  if (isErrorRevenue) {
    message.error(`Revenue report error: ${handleApiError(errorRevenue)}`);
  }

  // Fetch product performance report
  const {
    data: productReport,
    isLoading: isLoadingProduct,
    isError: isErrorProduct,
    error: errorProduct,
    refetch: refetchProduct,
  } = useQuery({
    queryKey: [
      'productPerformance',
      dateRange[0].format('YYYY-MM-DD'),
      dateRange[1].format('YYYY-MM-DD'),
    ],
    retry: 1,
    queryFn: () =>
      ReportsApi.getProductPerformanceReport(
        dateRange[0].format('YYYY-MM-DD'),
        dateRange[1].format('YYYY-MM-DD')
      ),
  });

  if (isErrorProduct) {
    message.error(`Product performance error: ${handleApiError(errorProduct)}`);
  }

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
    category: string;
    quantitySold: number;
    revenue: number;
    orderCount: number;
    avgQuantityPerOrder: number;
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
      render: (value: number) => `฿${value.toFixed(2)}`,
    },
    {
      title: 'Orders',
      dataIndex: 'orderCount',
      key: 'orderCount',
      align: 'right',
    },
    {
      title: 'Avg Qty/Order',
      dataIndex: 'avgQuantityPerOrder',
      key: 'avgQuantityPerOrder',
      align: 'right',
      render: (value: number) => value.toFixed(2),
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
            {isErrorDaily ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#ff4d4f' }}>
                Failed to load daily sales data. Please check if backend is running.
              </div>
            ) : dailySales ? (
              <>
                <Row gutter={16}>
                  <Col span={6}>
                    <Statistic
                      title={
                        <Space>
                          Total Orders
                          <AntTooltip title="Total number of orders for this day">
                            <QuestionCircleOutlined style={{ color: '#999', fontSize: 12 }} />
                          </AntTooltip>
                        </Space>
                      }
                      value={dailySales.totalOrders}
                      prefix={<ShoppingCartOutlined />}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title={
                        <Space>
                          Total Revenue
                          <AntTooltip title="Net revenue (Subtotal + Tax - Discount)">
                            <QuestionCircleOutlined style={{ color: '#999', fontSize: 12 }} />
                          </AntTooltip>
                        </Space>
                      }
                      value={parseFloat(dailySales.totalRevenue).toFixed(2)}
                      prefix={<DollarOutlined />}
                      suffix="฿"
                    />
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      (Subtotal - Discount) + Tax
                    </Text>
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title={
                        <Space>
                          Total Discount
                          <AntTooltip title="Total manual discounts given to customers">
                            <QuestionCircleOutlined style={{ color: '#999', fontSize: 12 }} />
                          </AntTooltip>
                        </Space>
                      }
                      value={parseFloat(dailySales.totalDiscount).toFixed(2)}
                      // prefix={<PercentageOutlined />}
                      suffix="฿"
                      valueStyle={{ color: '#ff4d4f' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title={
                        <Space>
                          Avg Order Value
                          <AntTooltip title="Average revenue per order (Total Revenue / Orders)">
                            <QuestionCircleOutlined style={{ color: '#999', fontSize: 12 }} />
                          </AntTooltip>
                        </Space>
                      }
                      value={parseFloat(dailySales.averageOrderValue).toFixed(2)}
                      suffix="฿"
                    />
                  </Col>
                </Row>

                {/* Orders by Status */}
                <Row gutter={16} style={{ marginTop: 24 }}>
                  <Col span={24}>
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
                </Row>

                {/* Product Performance Analysis */}
                <div style={{ marginTop: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Space>
                      <h3 style={{ margin: 0 }}>Product Performance Analysis</h3>
                      <AntTooltip title="Analyze best and worst selling products to optimize inventory and promotions">
                        <QuestionCircleOutlined style={{ color: '#1890ff', fontSize: 14 }} />
                      </AntTooltip>
                    </Space>
                    <Segmented
                      value={productViewMode}
                      onChange={(value) => setProductViewMode(value as 'chart' | 'table')}
                      options={[
                        { label: 'Chart View', value: 'chart', icon: <BarChartOutlined /> },
                        { label: 'Table View', value: 'table', icon: <TableOutlined /> },
                      ]}
                    />
                  </div>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
                    Best Sellers = Keep stock ready | Slow Movers = Promote/Discount/Remove
                  </Text>

                  {productViewMode === 'chart' ? (
                    <Tabs
                      defaultActiveKey="top"
                      items={[
                        {
                          key: 'top',
                          label: 'Top 5 Best Sellers',
                          children: (
                            <ResponsiveContainer width="100%" height={350}>
                              <BarChart data={dailySales.topProducts}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="productName" angle={-45} textAnchor="end" height={100} />
                                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                                <Tooltip
                                  formatter={(value: number, name: string) =>
                                    name === 'Revenue' ? [`฿${value.toFixed(2)}`, name] : [value, name]
                                  }
                                />
                                <Legend />
                                <Bar yAxisId="left" dataKey="quantitySold" fill="#8884d8" name="Quantity Sold" />
                                <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Revenue" />
                              </BarChart>
                            </ResponsiveContainer>
                          ),
                        },
                        {
                          key: 'bottom',
                          label: 'Bottom 5 Slow Movers',
                          children: dailySales.bottomProducts && dailySales.bottomProducts.length > 0 ? (
                            <>
                              <Text type="warning" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
                                Underperforming products - Consider: Promotion / Price adjustment / Recipe change / Menu removal
                              </Text>
                              <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={dailySales.bottomProducts}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="productName" angle={-45} textAnchor="end" height={100} />
                                  <YAxis yAxisId="left" orientation="left" stroke="#ff4d4f" />
                                  <YAxis yAxisId="right" orientation="right" stroke="#faad14" />
                                  <Tooltip
                                  formatter={(value: number, name: string) => {
                                    if (name === 'Revenue') return [`฿${value.toFixed(2)}`, 'Revenue'];
                                    if (name === 'Quantity Sold') return [`${value} units`, 'Quantity'];
                                    return [value, name];
                                  }}
                                  />
                                <Legend />
                                <Bar yAxisId="left" dataKey="quantitySold" fill="#ff4d4f" name="Quantity Sold" />
                                <Bar yAxisId="right" dataKey="revenue" fill="#faad14" name="Revenue" />
                              </BarChart>
                            </ResponsiveContainer>
                            </>
                          ) : (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                              Not enough products to show underperformers
                            </div>
                          ),
                        },
                      ]}
                    />
                  ) : (
                    <Tabs
                      defaultActiveKey="top"
                      items={[
                        {
                          key: 'top',
                          label: 'Top 5 Best Sellers',
                          children: (
                            <>
                          <Text type="success" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
                            Best sellers - Keep stock ready and highlight in menu
                          </Text>
                              <Table
                                dataSource={dailySales.topProducts}
                                rowKey="productId"
                                pagination={false}
                                columns={[
                                  {
                                    title: 'Rank',
                                    key: 'rank',
                                    width: 60,
                                    align: 'center',
                                    render: (_: unknown, __: unknown, index: number) => (
                                      <span style={{ fontSize: 16, fontWeight: 'bold', color: index < 3 ? '#faad14' : '#666' }}>
                                        #{index + 1}
                                      </span>
                                    ),
                                  },
                                  {
                                    title: 'Product Name',
                                    dataIndex: 'productName',
                                    key: 'productName',
                                  },
                                  {
                                    title: 'Quantity Sold',
                                    dataIndex: 'quantitySold',
                                    key: 'quantitySold',
                                    align: 'right',
                                    render: (value: number) => <strong style={{ color: '#3f8600' }}>{value}</strong>,
                                  },
                                  {
                                    title: 'Revenue',
                                    dataIndex: 'revenue',
                                    key: 'revenue',
                                    align: 'right',
                                    render: (value: string) => (
                                      <strong style={{ color: '#1890ff' }}>฿{parseFloat(value).toFixed(2)}</strong>
                                    ),
                                  },
                                ]}
                              />
                            </>
                          ),
                        },
                        {
                          key: 'bottom',
                          label: 'Bottom 5 Slow Movers',
                          children: dailySales.bottomProducts && dailySales.bottomProducts.length > 0 ? (
                            <>
                              <Text type="warning" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
                                Slow moving products - Consider promotion, discount, or removal
                              </Text>
                              <Table
                                dataSource={dailySales.bottomProducts}
                                rowKey="productId"
                                pagination={false}
                                columns={[
                                  {
                                    title: 'Product Name',
                                    dataIndex: 'productName',
                                    key: 'productName',
                                    render: (text: string) => <span style={{ color: '#ff4d4f' }}>{text}</span>,
                                  },
                                  {
                                    title: 'Quantity Sold',
                                    dataIndex: 'quantitySold',
                                    key: 'quantitySold',
                                    align: 'right',
                                    render: (value: number) => <strong style={{ color: '#faad14' }}>{value}</strong>,
                                  },
                                  {
                                    title: 'Revenue',
                                    dataIndex: 'revenue',
                                    key: 'revenue',
                                    align: 'right',
                                    render: (value: string) => <span>฿{parseFloat(value).toFixed(2)}</span>,
                                  },
                                  {
                                    title: 'Recommended Action',
                                    key: 'action',
                                    render: () => (
                                      <span style={{ color: '#faad14', fontSize: 12 }}>
                                        Review pricing or promotion
                                      </span>
                                    ),
                                  },
                                ]}
                              />
                            </>
                          ) : (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                              Not enough products to show underperformers
                            </div>
                          ),
                        },
                      ]}
                    />
                  )}
                </div>
              </>
            ) : !isLoadingDaily ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                No data available for this date.
              </div>
            ) : null}
          </Spin>
        </Card>

        {/* Revenue Report */}
        <Card
          title={`Revenue Report - ${dateRange[0].format('DD MMM')} to ${dateRange[1].format('DD MMM YYYY')}`}
        >
          <Spin spinning={isLoadingRevenue}>
            {isErrorRevenue ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#ff4d4f' }}>
                Failed to load revenue report. Please check if backend is running.
              </div>
            ) : revenueReport ? (
              <>
                <Row gutter={16}>
                  <Col span={6}>
                    <Statistic
                      title={
                        <Space>
                          Total Orders
                          <AntTooltip title="Total orders in this date range">
                            <QuestionCircleOutlined style={{ color: '#999', fontSize: 12 }} />
                          </AntTooltip>
                        </Space>
                      }
                      value={revenueReport.totalOrders}
                      prefix={<ShoppingCartOutlined />}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title={
                        <Space>
                          Gross Revenue
                          <AntTooltip title="Total revenue before discount">
                            <QuestionCircleOutlined style={{ color: '#999', fontSize: 12 }} />
                          </AntTooltip>
                        </Space>
                      }
                      value={revenueReport.totalRevenue.toFixed(2)}
                      suffix="฿"
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title={
                        <Space>
                          Total Discount
                          <AntTooltip title="Total discounts given to customers">
                            <QuestionCircleOutlined style={{ color: '#999', fontSize: 12 }} />
                          </AntTooltip>
                        </Space>
                      }
                      value={revenueReport.totalDiscount.toFixed(2)}
                      suffix="฿"
                      valueStyle={{ color: '#ff4d4f' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title={
                        <Space>
                          Avg Daily Revenue
                          <AntTooltip title="Average revenue per day in this period">
                            <QuestionCircleOutlined style={{ color: '#999', fontSize: 12 }} />
                          </AntTooltip>
                        </Space>
                      }
                      value={revenueReport.averageDailyRevenue.toFixed(2)}
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

                {/* Discount Usage */}
                {revenueReport.discountUsage && revenueReport.discountUsage.length > 0 && (
                  <div style={{ marginTop: 24 }}>
                    <h3>Discount Usage</h3>
                    <Table
                      dataSource={revenueReport.discountUsage}
                      rowKey="discountType"
                      pagination={false}
                      columns={[
                        {
                          title: 'Discount Type',
                          dataIndex: 'discountType',
                          key: 'discountType',
                        },
                        {
                          title: 'Times Used',
                          dataIndex: 'usageCount',
                          key: 'usageCount',
                          align: 'right',
                        },
                        {
                          title: 'Total Amount',
                          dataIndex: 'totalDiscountAmount',
                          key: 'totalDiscountAmount',
                          align: 'right',
                          render: (value: number) => `฿${value.toFixed(2)}`,
                        },
                      ]}
                    />
                  </div>
                )}
              </>
            ) : !isLoadingRevenue ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                No data available for this date range.
              </div>
            ) : null}
          </Spin>
        </Card>

        {/* Product Performance */}
        <Card 
          title={
            <Space>
              Product Performance (Date Range)
                      <AntTooltip title="Analyze products in selected date range for inventory and promotion planning">
                <QuestionCircleOutlined style={{ color: '#1890ff', fontSize: 14 }} />
              </AntTooltip>
            </Space>
          }
        >
          <Spin spinning={isLoadingProduct}>
            {isErrorProduct ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#ff4d4f' }}>
                Failed to load product performance. Please check if backend is running.
              </div>
            ) : productReport ? (
              <>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 16 }}>
                  <strong>Avg Qty/Order</strong> = Average units per order (Higher value indicates popular items or frequently paired products)
                </Text>
                <Tabs
                  defaultActiveKey="top"
                  items={[
                    {
                      key: 'top',
                      label: 'Top 10 Best Sellers',
                      children: (
                        <>
                          <Text type="success" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
                            Highest revenue products - Maintain adequate stock at all times
                          </Text>
                          <Table
                            columns={productColumns}
                            dataSource={productReport.topProducts}
                            rowKey="productId"
                            pagination={false}
                          />
                        </>
                      ),
                    },
                    {
                      key: 'bottom',
                      label: 'Bottom 10 Slow Movers',
                      children: productReport.bottomProducts && productReport.bottomProducts.length > 0 ? (
                        <>
                          <Text type="warning" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
                            Low performing products - Consider promotion, price reduction, recipe adjustment, or menu removal
                          </Text>
                          <Table
                            columns={[
                              ...productColumns,
                              {
                                title: 'Recommended Action',
                                key: 'action',
                                render: (_, record: ProductPerformer) => {
                                  if (record.revenue < 100) return <Text type="danger">Consider removing</Text>;
                                  if (record.quantitySold < 5) return <Text type="warning">Run promotion</Text>;
                                  return <Text type="secondary">Monitor closely</Text>;
                                },
                              },
                            ]}
                            dataSource={productReport.bottomProducts}
                            rowKey="productId"
                            pagination={false}
                          />
                        </>
                      ) : (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                          Not enough products to show underperformers
                        </div>
                      ),
                    },
                    {
                      key: 'category',
                      label: 'By Category',
                      children: (
                        <>
                          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
                            <strong>% of Total</strong> = Revenue share by category (helps with menu planning)
                          </Text>
                          <Table
                            dataSource={productReport.categoryBreakdown}
                            rowKey="category"
                            pagination={false}
                            columns={[
                              {
                                title: 'Category',
                                dataIndex: 'category',
                                key: 'category',
                              },
                              {
                                title: 'Revenue',
                                dataIndex: 'revenue',
                                key: 'revenue',
                                align: 'right',
                                render: (value: number) => (
                                  <strong style={{ color: '#1890ff' }}>฿{value.toFixed(2)}</strong>
                                ),
                              },
                              {
                                title: '% of Total',
                                dataIndex: 'revenuePercentage',
                                key: 'revenuePercentage',
                                align: 'right',
                                render: (value: number) => (
                                  <strong style={{ color: value > 30 ? '#3f8600' : '#666' }}>
                                    {value.toFixed(2)}%
                                  </strong>
                                ),
                              },
                              {
                                title: 'Products',
                                dataIndex: 'productCount',
                                key: 'productCount',
                                align: 'right',
                              },
                            ]}
                          />
                        </>
                      ),
                    },
                  ]}
                />
              </>
            ) : !isLoadingProduct ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                No product data available.
              </div>
            ) : null}
          </Spin>
        </Card>
      </Space>
    </div>
  );
}

export default ReportsPage;
