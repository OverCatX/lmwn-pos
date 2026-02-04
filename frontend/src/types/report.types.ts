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
    bottomProducts: {
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
    totalRevenue: number;
    totalDiscount: number;
    averageDailyRevenue: number;
    dailyBreakdown: {
        date: string;
        orderCount: number;
        subtotal: number;
        discount: number;
        revenue: number;
    }[];
    discountUsage: {
        discountType: string;
        usageCount: number;
        totalDiscountAmount: number;
    }[];
    currency: string;
}

/**
 * Product Performance Report
 */
export interface ProductPerformanceReport {
    fromDate: string;
    toDate: string;
    topProducts: {
        productId: string;
        productName: string;
        category: string;
        quantitySold: number;
        revenue: number;
        orderCount: number;
        avgQuantityPerOrder: number;
    }[];
    bottomProducts: {
        productId: string;
        productName: string;
        category: string;
        quantitySold: number;
        revenue: number;
        orderCount: number;
        avgQuantityPerOrder: number;
    }[];
    categoryBreakdown: {
        category: string;
        revenue: number;
        revenuePercentage: number;
        productCount: number;
    }[];
    currency: string;
}
