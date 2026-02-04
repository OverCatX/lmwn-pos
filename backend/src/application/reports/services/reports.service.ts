import { Injectable, Inject, BadRequestException, Logger } from '@nestjs/common';
import Decimal from 'decimal.js';
import { IOrderRepository, OrderStatus } from '../../../domain/order';
import {
    DailySalesSummaryDto,
    RevenueReportDto,
    ProductPerformanceDto,
    TopProductDto,
    OrdersByStatusDto,
    DailyRevenueDto,
    DiscountUsageDto,
    ProductPerformanceItemDto,
    CategoryBreakdownDto,
} from '../dto';

type DecimalValue = ReturnType<typeof Decimal>;

// Constants
const DEFAULT_CURRENCY = 'THB';
const TOP_PRODUCTS_LIMIT = 5;
const TOP_BOTTOM_PRODUCTS_LIMIT = 10;
const DECIMAL_PLACES = 2;
const PLACEHOLDER_CATEGORY = 'Uncategorized';
const PLACEHOLDER_DISCOUNT_TYPE = 'MANUAL';

interface DiscountAggregation {
    discountType: string;
    usageCount: number;
    totalDiscountAmount: number;
}

@Injectable()
export class ReportsService {
    private readonly logger = new Logger(ReportsService.name);

    constructor(
        @Inject('IOrderRepository')
        private readonly orderRepository: IOrderRepository,
    ) { }

    /**
     * Get daily sales summary for a specific date
     * @param dateStr - Date in YYYY-MM-DD format (defaults to today)
     * @returns Daily sales summary with revenue, orders, and top products
     */
    async getDailySalesSummary(dateStr?: string): Promise<DailySalesSummaryDto> {
        const startTime = Date.now();
        const targetDate = dateStr ? new Date(dateStr) : new Date();

        this.logger.log(`Generating daily sales summary for ${this.formatDate(targetDate)}`);

        try {
            const { startOfDay, endOfDay } = this.getDateRange(targetDate, targetDate);

            const orders = await this.orderRepository.findByDateRange(
                startOfDay,
                endOfDay,
            );

            this.logger.debug(`Found ${orders.length} orders for ${this.formatDate(targetDate)}`);

            if (orders.length === 0) {
                this.logger.warn(`No orders found for ${this.formatDate(targetDate)}`);
                return {
                    date: this.formatDate(targetDate),
                    totalOrders: 0,
                    totalSubtotal: 0,
                    totalTax: 0,
                    totalDiscount: 0,
                    totalRevenue: 0,
                    averageOrderValue: 0,
                    ordersByStatus: [],
                    topProducts: [],
                    bottomProducts: [],
                    currency: DEFAULT_CURRENCY,
                };
            }

            // Calculate totals with Decimal for precision
            let totalSubtotal = new Decimal(0);
            let totalTax = new Decimal(0);
            let totalDiscount = new Decimal(0);
            let totalRevenue = new Decimal(0);

            const statusCounts = new Map<string, number>();
            const productStats = new Map<
                string,
                { name: string; quantity: number; revenue: DecimalValue }
            >();

            for (const order of orders) {
                const subtotal = order.getSubtotal();
                const tax = order.getTax();
                const discount = order.getDiscountAmount();
                const total = order.getTotal();

                totalSubtotal = totalSubtotal.plus(subtotal.toNumber());
                totalTax = totalTax.plus(tax.toNumber());
                totalDiscount = totalDiscount.plus(discount.toNumber());
                totalRevenue = totalRevenue.plus(total.toNumber());

                // Count orders by status
                const status = order.getStatus();
                statusCounts.set(status, (statusCounts.get(status) || 0) + 1);

                // Aggregate product stats
                for (const item of order.getItems()) {
                    const productId = item.getProductId();
                    const existing = productStats.get(productId);
                    const itemSubtotal = item.calculateSubtotal();
                    const itemRevenue = new Decimal(itemSubtotal.toNumber());

                    if (existing) {
                        existing.quantity += item.getQuantity().toNumber();
                        existing.revenue = existing.revenue.plus(itemRevenue);
                    } else {
                        productStats.set(productId, {
                            name: item.getProductName(),
                            quantity: item.getQuantity().toNumber(),
                            revenue: itemRevenue,
                        });
                    }
                }
            }

            const averageOrderValue = totalRevenue.dividedBy(orders.length);

            // Build orders by status
            const ordersByStatus: OrdersByStatusDto[] = Array.from(
                statusCounts.entries(),
            ).map(([status, count]) => ({
                status: status as OrderStatus,
                count,
                percentage: this.calculatePercentage(count, orders.length),
            }));

            // Build product lists
            const allProducts = Array.from(productStats.entries())
                .map(([productId, stats]) => ({
                    productId,
                    productName: stats.name,
                    quantitySold: stats.quantity,
                    revenue: this.toDecimal(stats.revenue),
                }))
                .sort((a, b) => b.revenue - a.revenue);

            const topProducts: TopProductDto[] = allProducts.slice(0, TOP_PRODUCTS_LIMIT);
            const bottomProducts: TopProductDto[] = allProducts.slice(-TOP_PRODUCTS_LIMIT).reverse();

            const duration = Date.now() - startTime;
            this.logger.log(
                `Daily sales summary generated in ${duration}ms - ` +
                `${orders.length} orders, ${this.toDecimal(totalRevenue)} ${DEFAULT_CURRENCY}`,
            );

            return {
                date: this.formatDate(targetDate),
                totalOrders: orders.length,
                totalSubtotal: this.toDecimal(totalSubtotal),
                totalTax: this.toDecimal(totalTax),
                totalDiscount: this.toDecimal(totalDiscount),
                totalRevenue: this.toDecimal(totalRevenue),
                averageOrderValue: this.toDecimal(averageOrderValue),
                ordersByStatus,
                topProducts,
                bottomProducts,
                currency: DEFAULT_CURRENCY,
            };
        } catch (error) {
            this.logger.error(
                `Failed to generate daily sales summary for ${this.formatDate(targetDate)}`,
                error instanceof Error ? error.stack : String(error),
            );
            throw error;
        }
    }

    /**
     * Get revenue report for a date range
     * @param fromDateStr - Start date in YYYY-MM-DD format
     * @param toDateStr - End date in YYYY-MM-DD format
     * @returns Revenue report with daily breakdown and discount usage
     */
    async getRevenueReport(
        fromDateStr: string,
        toDateStr: string,
    ): Promise<RevenueReportDto> {
        const startTime = Date.now();
        this.logger.log(`Generating revenue report from ${fromDateStr} to ${toDateStr}`);

        try {
            const fromDate = new Date(fromDateStr);
            const toDate = new Date(toDateStr);
            this.validateDateRange(fromDate, toDate);

            const { startOfDay, endOfDay } = this.getDateRange(fromDate, toDate);
            const orders = await this.orderRepository.findByDateRange(startOfDay, endOfDay);

            this.logger.debug(`Found ${orders.length} orders in date range`);

            if (orders.length === 0) {
                this.logger.warn(`No orders found from ${fromDateStr} to ${toDateStr}`);
                return {
                    fromDate: fromDateStr,
                    toDate: toDateStr,
                    totalOrders: 0,
                    totalRevenue: 0,
                    totalDiscount: 0,
                    averageDailyRevenue: 0,
                    dailyBreakdown: [],
                    discountUsage: [],
                    currency: DEFAULT_CURRENCY,
                };
            }

            // Calculate totals
            let totalRevenue = new Decimal(0);
            let totalDiscount = new Decimal(0);

            // Group by date
            const dailyStats = new Map<
                string,
                {
                    orderCount: number;
                    subtotal: DecimalValue;
                    discount: DecimalValue;
                    revenue: DecimalValue;
                }
            >();

            // Track discount usage
            const discountStats = new Map<string, DiscountAggregation>();

            for (const order of orders) {
                const orderDate = new Date(order.getCreatedAt());
                const dateKey = this.formatDate(orderDate);

                const subtotal = new Decimal(order.getSubtotal().toNumber());
                const discount = new Decimal(order.getDiscountAmount().toNumber());
                const revenue = new Decimal(order.getTotal().toNumber());

                totalRevenue = totalRevenue.plus(revenue);
                totalDiscount = totalDiscount.plus(discount);

                // Daily aggregation
                const existing = dailyStats.get(dateKey);
                if (existing) {
                    existing.orderCount++;
                    existing.subtotal = existing.subtotal.plus(subtotal);
                    existing.discount = existing.discount.plus(discount);
                    existing.revenue = existing.revenue.plus(revenue);
                } else {
                    dailyStats.set(dateKey, {
                        orderCount: 1,
                        subtotal,
                        discount,
                        revenue,
                    });
                }

                // Discount aggregation (if discount > 0)
                if (discount.greaterThan(0)) {
                    const discountType = PLACEHOLDER_DISCOUNT_TYPE;
                    const existing = discountStats.get(discountType);
                    if (existing) {
                        existing.usageCount++;
                        existing.totalDiscountAmount += discount.toNumber();
                    } else {
                        discountStats.set(discountType, {
                            discountType,
                            usageCount: 1,
                            totalDiscountAmount: discount.toNumber(),
                        });
                    }
                }
            }

            const daysDiff = this.calculateDaysDiff(fromDate, toDate);
            const averageDailyRevenue = totalRevenue.dividedBy(daysDiff);

            // Build daily breakdown
            const dailyBreakdown: DailyRevenueDto[] = Array.from(
                dailyStats.entries(),
            )
                .map(([date, stats]) => ({
                    date,
                    orderCount: stats.orderCount,
                    subtotal: this.toDecimal(stats.subtotal),
                    discount: this.toDecimal(stats.discount),
                    revenue: this.toDecimal(stats.revenue),
                }))
                .sort((a, b) => a.date.localeCompare(b.date));

            // Build discount usage
            const discountUsage: DiscountUsageDto[] = Array.from(
                discountStats.values(),
            ).map((stat) => ({
                ...stat,
                totalDiscountAmount: this.toDecimal(new Decimal(stat.totalDiscountAmount)),
            }));

            const duration = Date.now() - startTime;
            this.logger.log(
                `Revenue report generated in ${duration}ms - ` +
                `${orders.length} orders, ${this.toDecimal(totalRevenue)} ${DEFAULT_CURRENCY}`,
            );

            return {
                fromDate: fromDateStr,
                toDate: toDateStr,
                totalOrders: orders.length,
                totalRevenue: this.toDecimal(totalRevenue),
                totalDiscount: this.toDecimal(totalDiscount),
                averageDailyRevenue: this.toDecimal(averageDailyRevenue),
                dailyBreakdown,
                discountUsage,
                currency: DEFAULT_CURRENCY,
            };
        } catch (error) {
            this.logger.error(
                `Failed to generate revenue report from ${fromDateStr} to ${toDateStr}`,
                error instanceof Error ? error.stack : String(error),
            );
            throw error;
        }
    }

    /**
     * Get product performance report for a date range
     * @param fromDateStr - Start date in YYYY-MM-DD format
     * @param toDateStr - End date in YYYY-MM-DD format
     * @returns Product performance with top/bottom products and category breakdown
     */
    async getProductPerformanceReport(
        fromDateStr: string,
        toDateStr: string,
    ): Promise<ProductPerformanceDto> {
        const startTime = Date.now();
        this.logger.log(`Generating product performance report from ${fromDateStr} to ${toDateStr}`);

        try {
            const fromDate = new Date(fromDateStr);
            const toDate = new Date(toDateStr);
            this.validateDateRange(fromDate, toDate);

            const { startOfDay, endOfDay } = this.getDateRange(fromDate, toDate);
            const orders = await this.orderRepository.findByDateRange(startOfDay, endOfDay);

            this.logger.debug(`Found ${orders.length} orders for product analysis`);

            if (orders.length === 0) {
                this.logger.warn(`No orders found for product performance from ${fromDateStr} to ${toDateStr}`);
                return {
                    fromDate: fromDateStr,
                    toDate: toDateStr,
                    topProducts: [],
                    bottomProducts: [],
                    categoryBreakdown: [],
                    currency: DEFAULT_CURRENCY,
                };
            }

            // Aggregate product performance
            const productStats = new Map<
                string,
                {
                    name: string;
                    category: string;
                    quantitySold: number;
                    revenue: DecimalValue;
                    orderIds: Set<string>;
                }
            >();

            const categoryStats = new Map<string, DecimalValue>();
            let totalRevenue = new Decimal(0);

            for (const order of orders) {
                for (const item of order.getItems()) {
                    const productId = item.getProductId();
                    const itemSubtotal = item.calculateSubtotal();
                    const itemRevenue = new Decimal(itemSubtotal.toNumber());
                    totalRevenue = totalRevenue.plus(itemRevenue);

                    const existing = productStats.get(productId);
                    if (existing) {
                        existing.quantitySold += item.getQuantity().toNumber();
                        existing.revenue = existing.revenue.plus(itemRevenue);
                        existing.orderIds.add(order.getId());
                    } else {
                        const category = PLACEHOLDER_CATEGORY;
                        productStats.set(productId, {
                            name: item.getProductName(),
                            category,
                            quantitySold: item.getQuantity().toNumber(),
                            revenue: itemRevenue,
                            orderIds: new Set([order.getId()]),
                        });

                        const catRevenue = categoryStats.get(category) || new Decimal(0);
                        categoryStats.set(category, catRevenue.plus(itemRevenue));
                    }
                }
            }

            // Build product performance items
            const productPerformanceItems: ProductPerformanceItemDto[] = Array.from(
                productStats.entries(),
            ).map(([productId, stats]) => ({
                productId,
                productName: stats.name,
                category: stats.category,
                quantitySold: stats.quantitySold,
                revenue: this.toDecimal(stats.revenue),
                orderCount: stats.orderIds.size,
                avgQuantityPerOrder: this.toDecimal(
                    new Decimal(stats.quantitySold).dividedBy(stats.orderIds.size),
                ),
            }));

            // Sort and get top/bottom
            const sortedByRevenue = [...productPerformanceItems].sort(
                (a, b) => b.revenue - a.revenue,
            );
            const topProducts = sortedByRevenue.slice(0, TOP_BOTTOM_PRODUCTS_LIMIT);
            const bottomProducts = sortedByRevenue
                .slice(-TOP_BOTTOM_PRODUCTS_LIMIT)
                .reverse();

            // Build category breakdown
            const categoryBreakdown: CategoryBreakdownDto[] = Array.from(
                categoryStats.entries(),
            )
                .map(([category, revenue]) => {
                    const productsInCategory = Array.from(productStats.values()).filter(
                        (p) => p.category === category,
                    ).length;

                    return {
                        category,
                        revenue: this.toDecimal(revenue),
                        revenuePercentage: this.calculatePercentage(
                            revenue.toNumber(),
                            totalRevenue.toNumber(),
                        ),
                        productCount: productsInCategory,
                    };
                })
                .sort((a, b) => b.revenue - a.revenue);

            const duration = Date.now() - startTime;
            this.logger.log(
                `Product performance report generated in ${duration}ms - ` +
                `${productStats.size} unique products analyzed`,
            );

            return {
                fromDate: fromDateStr,
                toDate: toDateStr,
                topProducts,
                bottomProducts,
                categoryBreakdown,
                currency: DEFAULT_CURRENCY,
            };
        } catch (error) {
            this.logger.error(
                `Failed to generate product performance report from ${fromDateStr} to ${toDateStr}`,
                error instanceof Error ? error.stack : String(error),
            );
            throw error;
        }
    }

    // Helper Methods

    /**
     * Validate that fromDate is not after toDate
     * @throws BadRequestException if date range is invalid
     */
    private validateDateRange(fromDate: Date, toDate: Date): void {
        if (fromDate > toDate) {
            this.logger.warn(
                `Invalid date range: ${fromDate.toISOString()} > ${toDate.toISOString()}`,
            );
            throw new BadRequestException(
                `From date (${this.formatDate(fromDate)}) must be before or equal to date (${this.formatDate(toDate)})`,
            );
        }
    }

    /**
     * Get date range with time set to start/end of day
     * @param fromDate - Start date
     * @param toDate - End date
     * @returns Object with startOfDay (00:00:00) and endOfDay (23:59:59)
     */
    private getDateRange(
        fromDate: Date,
        toDate: Date,
    ): { startOfDay: Date; endOfDay: Date } {
        const startOfDay = new Date(fromDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(toDate);
        endOfDay.setHours(23, 59, 59, 999);
        return { startOfDay, endOfDay };
    }

    /**
     * Format date to YYYY-MM-DD string
     */
    private formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    /**
     * Convert Decimal value to number with fixed decimal places
     * @param value - Decimal value to convert
     * @returns Number rounded to DECIMAL_PLACES
     */
    private toDecimal(value: DecimalValue): number {
        return value.toDecimalPlaces(DECIMAL_PLACES).toNumber();
    }

    /**
     * Calculate percentage with precision
     * @param value - Numerator value
     * @param total - Denominator value
     * @returns Percentage rounded to DECIMAL_PLACES
     */
    private calculatePercentage(value: number, total: number): number {
        if (total === 0) {
            this.logger.warn('calculatePercentage: total is 0, returning 0');
            return 0;
        }
        return new Decimal(value)
            .dividedBy(total)
            .times(100)
            .toDecimalPlaces(DECIMAL_PLACES)
            .toNumber();
    }

    /**
     * Calculate number of days between two dates (inclusive)
     */
    private calculateDaysDiff(fromDate: Date, toDate: Date): number {
        return (
            Math.ceil(
                (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24),
            ) + 1
        );
    }

    /**
     * Get placeholder product name from ID
     * @todo Replace with actual product name lookup
     */
    private getProductNamePlaceholder(productId: string): string {
        return `Product ${productId.substring(0, 8)}`;
    }
}
