import { ApiProperty } from '@nestjs/swagger';

export class DailyRevenueDto {
    @ApiProperty({ description: 'Date', example: '2026-02-04' })
    date: string;

    @ApiProperty({ description: 'Number of orders', example: 50 })
    orderCount: number;

    @ApiProperty({ description: 'Subtotal (before discount)', example: 15000.0 })
    subtotal: number;

    @ApiProperty({ description: 'Total discount', example: 1500.0 })
    discount: number;

    @ApiProperty({ description: 'Revenue (after discount)', example: 13500.0 })
    revenue: number;
}

export class DiscountUsageDto {
    @ApiProperty({ description: 'Discount type', example: 'PERCENTAGE' })
    discountType: string;

    @ApiProperty({ description: 'Number of times used', example: 25 })
    usageCount: number;

    @ApiProperty({ description: 'Total discount amount', example: 5000.0 })
    totalDiscountAmount: number;
}

export class RevenueReportDto {
    @ApiProperty({ description: 'Start date', example: '2026-02-01' })
    fromDate: string;

    @ApiProperty({ description: 'End date', example: '2026-02-07' })
    toDate: string;

    @ApiProperty({ description: 'Total orders in period', example: 350 })
    totalOrders: number;

    @ApiProperty({ description: 'Total revenue (after discount)', example: 94500.0 })
    totalRevenue: number;

    @ApiProperty({ description: 'Total discount amount', example: 10500.0 })
    totalDiscount: number;

    @ApiProperty({ description: 'Average daily revenue', example: 13500.0 })
    averageDailyRevenue: number;

    @ApiProperty({ description: 'Daily revenue breakdown', type: [DailyRevenueDto] })
    dailyBreakdown: DailyRevenueDto[];

    @ApiProperty({ description: 'Discount usage summary', type: [DiscountUsageDto] })
    discountUsage: DiscountUsageDto[];

    @ApiProperty({ description: 'Currency code', example: 'THB', default: 'THB' })
    currency: string;
}
