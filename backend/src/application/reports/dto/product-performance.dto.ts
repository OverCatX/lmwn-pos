import { ApiProperty } from '@nestjs/swagger';

export class ProductPerformanceItemDto {
    @ApiProperty({ description: 'Product unique identifier', example: '123e4567-e89b-12d3-a456-426614174000' })
    productId: string;

    @ApiProperty({ description: 'Product name', example: 'Pad Thai' })
    productName: string;

    @ApiProperty({ description: 'Product category', example: 'Main Course' })
    category: string;

    @ApiProperty({ description: 'Total quantity sold', example: 150 })
    quantitySold: number;

    @ApiProperty({ description: 'Total revenue from this product', example: 18000.0 })
    revenue: number;

    @ApiProperty({ description: 'Number of orders containing this product', example: 120 })
    orderCount: number;

    @ApiProperty({ description: 'Average quantity per order', example: 1.25 })
    avgQuantityPerOrder: number;
}

export class CategoryBreakdownDto {
    @ApiProperty({ description: 'Category name', example: 'Main Course' })
    category: string;

    @ApiProperty({ description: 'Total revenue from this category', example: 45000.0 })
    revenue: number;

    @ApiProperty({ description: 'Percentage of total revenue', example: 47.5 })
    revenuePercentage: number;

    @ApiProperty({ description: 'Number of products in this category', example: 8 })
    productCount: number;
}

export class ProductPerformanceDto {
    @ApiProperty({ description: 'Start date', example: '2026-02-01' })
    fromDate: string;

    @ApiProperty({ description: 'End date', example: '2026-02-07' })
    toDate: string;

    @ApiProperty({ description: 'Top 10 best selling products', type: [ProductPerformanceItemDto] })
    topProducts: ProductPerformanceItemDto[];

    @ApiProperty({ description: 'Bottom 10 products (least sold)', type: [ProductPerformanceItemDto] })
    bottomProducts: ProductPerformanceItemDto[];

    @ApiProperty({ description: 'Revenue breakdown by category', type: [CategoryBreakdownDto] })
    categoryBreakdown: CategoryBreakdownDto[];

    @ApiProperty({ description: 'Currency code', example: 'THB', default: 'THB' })
    currency: string;
}
