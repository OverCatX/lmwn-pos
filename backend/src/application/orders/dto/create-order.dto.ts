import {
    IsNotEmpty,
    IsArray,
    ArrayMinSize,
    ValidateNested,
    IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { OrderItemDto } from './order-item.dto';

/**
 * Create Order DTO
 * Used when creating a new order
 */
export class CreateOrderDto {
    @ApiProperty({
        description: 'Array of order items',
        type: [OrderItemDto],
        example: [
            { productId: '123e4567-e89b-12d3-a456-426614174000', quantity: 2 },
            { productId: '123e4567-e89b-12d3-a456-426614174001', quantity: 1 },
        ],
    })
    @IsNotEmpty({ message: 'Items cannot be empty' })
    @IsArray()
    @ArrayMinSize(1, { message: 'Order must have at least 1 item' })
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];

    @ApiProperty({
        description: 'Staff ID or name who created the order',
        example: 'staff-001',
    })
    @IsNotEmpty()
    @IsString()
    createdBy: string;
}
