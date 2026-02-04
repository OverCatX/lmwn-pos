import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../../../domain/order';

export class TopProductDto {
    @ApiProperty({ description: 'Product unique identifier', example: '123e4567-e89b-12d3-a456-426614174000' })
    productId: string;

    @ApiProperty({ description: 'Product name', example: 'Pad Thai' })
    productName: string;

    @ApiProperty({ description: 'Total quantity sold', example: 25 })
    quantitySold: number;

    @ApiProperty({ description: 'Total revenue from this product', example: 3000.0 })
    revenue: number;
}

export class OrdersByStatusDto {
    @ApiProperty({ description: 'Order status', enum: OrderStatus, example: OrderStatus.COMPLETED })
    status: OrderStatus;

    @ApiProperty({ description: 'Number of orders with this status', example: 15 })
    count: number;

    @ApiProperty({ description: 'Percentage of total orders', example: 30.0 })
    percentage: number;
}

export class DailySalesSummaryDto {
    @ApiProperty({ description: 'Report date', example: '2026-02-04' })
    date: string;

    @ApiProperty({ description: 'Total number of orders', example: 50 })
    totalOrders: number;

    @ApiProperty({ description: 'Total revenue (before discount)', example: 15000.0 })
    totalSubtotal: number;

    @ApiProperty({ description: 'Total discount amount', example: 1500.0 })
    totalDiscount: number;

    @ApiProperty({ description: 'Total revenue (after discount)', example: 13500.0 })
    totalRevenue: number;

    @ApiProperty({ description: 'Average order value', example: 270.0 })
    averageOrderValue: number;

    @ApiProperty({ description: 'Orders breakdown by status', type: [OrdersByStatusDto] })
    ordersByStatus: OrdersByStatusDto[];

    @ApiProperty({ description: 'Top 5 selling products', type: [TopProductDto] })
    topProducts: TopProductDto[];

    @ApiProperty({ description: 'Currency code', example: 'THB', default: 'THB' })
    currency: string;
}
