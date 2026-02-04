import { IsNotEmpty, IsUUID, IsInt, Min } from 'class-validator';

/**
 * Order Item DTO
 * Represents a single item in an order
 */
export class OrderItemDto {
    @IsNotEmpty()
    @IsUUID()
    productId: string;

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
    id: string;
    productId: string;
    productName?: string; // Optional: populate from product
    quantity: number;
    unitPrice: number;
    subtotal: number;
    discountAmount: number;
    total: number;
}
