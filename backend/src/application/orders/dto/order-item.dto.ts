import { IsNotEmpty, IsUUID, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Order Item DTO
 * Represents a single item in an order
 */
export class OrderItemDto {
    @ApiProperty({
        description: 'Product unique identifier (UUID)',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsNotEmpty()
    @IsUUID()
    productId: string;

    @ApiProperty({
        description: 'Quantity of the product',
        example: 2,
        minimum: 1,
    })
    @IsNotEmpty()
    @IsInt()
    @Min(1, { message: 'Quantity must be at least 1' })
    quantity: number;
}

/**
 * Order Item Response DTO
 * Returned when fetching order details
 */
export class OrderItemResponseDto {
    @ApiProperty({ description: 'Order item unique identifier', example: '123e4567-e89b-12d3-a456-426614174000' })
    id: string;

    @ApiProperty({ description: 'Product unique identifier', example: '123e4567-e89b-12d3-a456-426614174000' })
    productId: string;

    @ApiProperty({ description: 'Product name', example: 'Pad Thai', required: false })
    productName?: string;

    @ApiProperty({ description: 'Quantity ordered', example: 2 })
    quantity: number;

    @ApiProperty({ description: 'Unit price at the time of order', example: 120.0 })
    unitPrice: number;

    @ApiProperty({ description: 'Subtotal (unitPrice * quantity)', example: 240.0 })
    subtotal: number;

    @ApiProperty({ description: 'Discount amount applied to this item', example: 0.0 })
    discountAmount: number;

    @ApiProperty({ description: 'Total after discount', example: 240.0 })
    total: number;
}
