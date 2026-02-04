/**
 * Daily Sales Summary
 */
export interface DailySalesSummary {
    date: string;
    totalOrders: number;
    totalRevenue: string;
    totalDiscount: string;
    totalTax: string;
    netRevenue: string;
    averageOrderValue: string;
    ordersByStatus: {
        status: string;
        count: number;
        percentage: string;
    }[];
    topProducts: {
        productId: string;
        productName: string;
        quantitySold: number;
        revenue: string;
    }[];
}

/**
 * Revenue Report
 */
export interface RevenueReport {
    fromDate: string;
    toDate: string;
    totalOrders: number;
    totalRevenue: string;
    totalDiscount: string;
    totalTax: string;
    netRevenue: string;
    averageOrderValue: string;
    dailyBreakdown: {
        date: string;
        orders: number;
        revenue: string;
        discount: string;
        netRevenue: string;
    }[];
    discountSummary: {
        totalDiscountGiven: string;
        discountPercentage: string;
        ordersWithDiscount: number;
        ordersWithoutDiscount: number;
    };
}

/**
 * Product Performance Report
 */
export interface ProductPerformanceReport {
    fromDate: string;
    toDate: string;
    totalProducts: number;
    topPerformers: {
        productId: string;
        productName: string;
        quantitySold: number;
        revenue: string;
        orderCount: number;
        percentageOfRevenue: string;
    }[];
}
