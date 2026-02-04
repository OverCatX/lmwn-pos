import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../../../domain/order';
import { OrderItemResponseDto } from './order-item.dto';

/**
 * Order Response DTO
 * Returned when fetching order(s)
 */
export class OrderResponseDto {
    @ApiProperty({ description: 'Order unique identifier', example: '123e4567-e89b-12d3-a456-426614174000' })
    id: string;

    @ApiProperty({ description: 'Human-readable order number', example: 'ORD-20260204-0001' })
    orderNumber: string;

    @ApiProperty({
        description: 'Current order status',
        enum: OrderStatus,
        example: OrderStatus.PENDING,
    })
    status: OrderStatus;

    @ApiProperty({
        description: 'Array of order items',
        type: [OrderItemResponseDto],
    })
    items: OrderItemResponseDto[];

    @ApiProperty({ description: 'Subtotal before discount', example: 350.0 })
    subtotal: number;

    @ApiProperty({ description: 'Total discount amount applied', example: 35.0 })
    discountAmount: number;

    @ApiProperty({ description: 'Final total after discount', example: 315.0 })
    total: number;

    @ApiProperty({ description: 'Currency code', example: 'THB', default: 'THB' })
    currency: string;

    @ApiProperty({ description: 'Staff who created the order', example: 'staff-001' })
    createdBy: string;

    @ApiProperty({ description: 'Order creation timestamp', example: '2026-02-04T12:00:00.000Z' })
    createdAt: Date;

    @ApiProperty({ description: 'Order last update timestamp', example: '2026-02-04T12:30:00.000Z' })
    updatedAt: Date;

    @ApiProperty({
        description: 'Order completion timestamp',
        example: '2026-02-04T12:45:00.000Z',
        nullable: true,
    })
    completedAt: Date | null;
}

/**
 * Paginated Order Response DTO
 * Returned when fetching order list with pagination
 */
export class PaginatedOrderResponseDto {
    @ApiProperty({
        description: 'Array of orders',
        type: [OrderResponseDto],
    })
    data: OrderResponseDto[];

    @ApiProperty({ description: 'Total number of orders', example: 50 })
    total: number;

    @ApiProperty({ description: 'Current page number', example: 1 })
    page: number;

    @ApiProperty({ description: 'Number of items per page', example: 10 })
    limit: number;

    @ApiProperty({ description: 'Total number of pages', example: 5 })
    totalPages: number;
}
